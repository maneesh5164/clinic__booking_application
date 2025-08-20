import express from 'express';
import { pool } from './db.js';
import { authMiddleware, requireRole, signToken, hashPassword, comparePassword } from './auth.js';
import rateLimit from 'express-rate-limit';
import { listDatesInclusive, generateDaySlotsUtc } from './utils.js';

const router = express.Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50 });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: 'name, email, password required' } });
    }
    const pwHash = await hashPassword(password);
    const { rows } = await pool.query(
      'insert into users(name,email,password_hash,role) values($1,$2,$3,$4) returning id,name,email,role',
      [name, email.toLowerCase(), pwHash, 'patient']
    );
    return res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
    }
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Unexpected error' } });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: { code: 'VALIDATION', message: 'email, password required' } });
  }
  const { rows } = await pool.query('select id,name,email,password_hash,role from users where email=$1', [email.toLowerCase()]);
  if (rows.length === 0) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
  const user = rows[0];
  const ok = await comparePassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
  const token = signToken({ userId: user.id, role: user.role, name: user.name });
  return res.json({ token, role: user.role, name: user.name });
});

// GET /api/slots?from=YYYY-MM-DD&to=YYYY-MM-DD
router.get('/slots', async (req, res) => {
  try {
    let { from, to } = req.query;
    const today = new Date();
    const startISO = (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) ? from : today.toISOString().slice(0,10);
    const endDate = new Date(new Date(startISO).getTime() + 6 * 24 * 60 * 60 * 1000);
    const endISO = (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) ? to : endDate.toISOString().slice(0,10);

    // ensure slots exist in DB for the window; upsert by start_at unique
    const dates = listDatesInclusive(startISO, endISO);
    const upserts = [];
    for (const d of dates) {
      for (const { start, end } of generateDaySlotsUtc(d)) {
        upserts.push(pool.query(
          'insert into slots(start_at,end_at) values($1,$2) on conflict (start_at) do nothing',
          [start.toISOString(), end.toISOString()]
        ));
      }
    }
    await Promise.all(upserts);

    // fetch all slots in range
    const { rows: slots } = await pool.query(
      'select s.id, s.start_at, s.end_at from slots s where s.start_at >= $1::timestamptz and s.end_at <= $2::timestamptz order by s.start_at asc',
      [new Date(startISO + 'T00:00:00Z').toISOString(), new Date(endISO + 'T23:59:59Z').toISOString()]
    );

    // booked slots
    const { rows: booked } = await pool.query('select slot_id from bookings');
    const bookedSet = new Set(booked.map(b => b.slot_id));

    const available = slots.filter(s => !bookedSet.has(s.id));
    return res.json({ from: startISO, to: endISO, timezone: 'UTC', slots: available });
  } catch {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Unexpected error' } });
  }
});

// POST /api/book { slotId }
router.post('/book', authMiddleware, requireRole('patient'), async (req, res) => {
  try {
    const { slotId } = req.body || {};
    if (!slotId) return res.status(400).json({ error: { code: 'VALIDATION', message: 'slotId required' } });
    // Ensure slot exists
    const { rows: slotRows } = await pool.query('select id from slots where id=$1', [slotId]);
    if (slotRows.length === 0) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Slot not found' } });

    // Try to insert booking (unique(slot_id) prevents double)
    try {
      const { rows } = await pool.query(
        'insert into bookings(user_id, slot_id) values($1,$2) returning id, user_id, slot_id, created_at',
        [req.user.userId, slotId]
      );
      return res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505') {
        return res.status(409).json({ error: { code: 'SLOT_TAKEN', message: 'This slot is already booked' } });
      }
      throw e;
    }
  } catch {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Unexpected error' } });
  }
});

// GET /api/my-bookings (patient)
router.get('/my-bookings', authMiddleware, requireRole('patient'), async (req, res) => {
  const { rows } = await pool.query(`
    select b.id, b.created_at, s.id as slot_id, s.start_at, s.end_at
    from bookings b
    join slots s on s.id = b.slot_id
    where b.user_id = $1
    order by s.start_at asc
  `, [req.user.userId]);
  return res.json(rows);
});

// GET /api/all-bookings (admin)
router.get('/all-bookings', authMiddleware, requireRole('admin'), async (req, res) => {
  const { rows } = await pool.query(`
    select b.id, b.created_at, s.start_at, s.end_at, u.name as patient_name, u.email as patient_email
    from bookings b
    join slots s on s.id = b.slot_id
    join users u on u.id = b.user_id
    order by s.start_at asc
  `);
  return res.json(rows);
});

export default router;
