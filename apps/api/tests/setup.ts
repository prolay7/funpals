/**
 * setup.ts — Jest test setup: runs migrations on test DB before all tests.
 */
import { pool } from '../src/config/database';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

beforeAll(async () => {
  // Run migrations on test database
  await execAsync('NODE_ENV=test npm run migrate:test', { cwd: __dirname + '/..' });
}, 30_000);

afterAll(async () => {
  await pool.end();
});
