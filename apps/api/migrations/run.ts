/**
 * run.ts — Runs all SQL migrations in order.
 * Idempotent: can be run multiple times safely (all statements use IF NOT EXISTS).
 */
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const dbUrl = process.env.NODE_ENV === 'test'
  ? process.env.DATABASE_TEST_URL ?? process.env.DATABASE_URL!
  : process.env.DATABASE_URL!;

const pool = new Pool({ connectionString: dbUrl });

async function run() {
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }
  await pool.end();
  console.log('✅ All migrations completed');
}

run().catch(err => { console.error('Migration failed:', err); process.exit(1); });
