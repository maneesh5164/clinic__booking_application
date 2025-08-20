import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function initDb() {
  await pool.query(`
    create table if not exists users (
      id serial primary key,
      name text not null,
      email text unique not null,
      password_hash text not null,
      role text not null check (role in ('patient','admin')),
      created_at timestamptz default now()
    );

    create table if not exists slots (
      id serial primary key,
      start_at timestamptz not null unique,
      end_at timestamptz not null,
      created_at timestamptz default now()
    );

    create table if not exists bookings (
      id serial primary key,
      user_id int not null references users(id) on delete cascade,
      slot_id int not null unique references slots(id) on delete cascade,
      created_at timestamptz default now()
    );

    create index if not exists idx_bookings_user_id on bookings(user_id);
  `);
}
