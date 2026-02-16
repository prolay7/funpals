/**
 * database.ts — PostgreSQL connection pool using node-postgres (pg).
 * Uses a single shared Pool instance across the entire application.
 * Parameterised query helper prevents SQL injection.
 */
import { Pool, QueryResult } from 'pg';
import { env } from './env';

const dbUrl = env.NODE_ENV === 'test' ? env.DATABASE_TEST_URL ?? env.DATABASE_URL : env.DATABASE_URL;

export const pool = new Pool({
  connectionString: dbUrl,
  max: parseInt(env.DB_POOL_MAX, 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

/**
 * db.query — Parameterised query shortcut.
 * @param text   SQL string with $1, $2, … placeholders
 * @param params Array of parameter values
 */
export const db = {
  query: (text: string, params?: unknown[]): Promise<QueryResult> =>
    pool.query(text, params),

  /** Get a client for multi-statement transactions. Always release in finally. */
  getClient: () => pool.connect(),
};
