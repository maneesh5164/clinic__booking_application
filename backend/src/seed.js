import dotenv from 'dotenv';
dotenv.config();
import { pool, initDb } from './db.js';
import { hashPassword } from './auth.js';
import { listDatesInclusive, generateDaySlotsUtc } from './utils.js';

async function seed() {
  await initDb();

  // Seed users
  const adminEmail = 'admin@example.com';
  const patientEmail = 'patient@example.com';

  const adminHash = await hashPassword('Passw0rd!');
  const patientHash = await hashPassword('Passw0rd!');

  await pool.query(
    `insert into users(name,email,password_hash,role)
     values ($1,$2,$3,'admin')
     on conflict (email) do nothing`,
    ['Admin', adminEmail, adminHash]
  );

  await pool.query(
    `insert into users(name,email,password_hash,role)
     values ($1,$2,$3,'patient')
     on conflict (email) do nothing`,
    ['Patient Zero', patientEmail, patientHash]
  );

  // Seed next 7 days slots (UTC)
  const todayISO = new Date().toISOString().slice(0,10);
  const to = new Date(new Date().getTime() + 6*24*60*60*1000).toISOString().slice(0,10);
  const dates = listDatesInclusive(todayISO, to);

  const inserts = [];
  for (const d of dates) {
    for (const { start, end } of generateDaySlotsUtc(d)) {
      inserts.push(pool.query(
        `insert into slots(start_at,end_at) values ($1,$2)
         on conflict (start_at) do nothing`,
        [start.toISOString(), end.toISOString()]
      ));
    }
  }
  await Promise.all(inserts);

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
