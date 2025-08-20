import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

import { initDb } from './db.js';
import router from './routes.js';

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || '*', credentials: false }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', router);

const PORT = process.env.PORT || 8080;
initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`API running on :${PORT}`));
  })
  .catch((e) => {
    console.error('DB init failed', e);
    process.exit(1);
  });
