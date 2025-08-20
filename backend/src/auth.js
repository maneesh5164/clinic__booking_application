import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET } = process.env;

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient role' } });
    }
    next();
  };
}

export async function hashPassword(pw) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

export async function comparePassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}
