/**
 * auth/service.ts — Authentication business logic.
 * Handles user creation, credential verification, JWT lifecycle.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { ApiError } from '../../middleware/errorHandler';

const SALT_ROUNDS = 12;

export interface RegisterInput { email: string; password: string; username: string; display_name: string }
export interface LoginInput    { email: string; password: string }

/**
 * registerUser — Creates a new user and empty profile row.
 * @throws ApiError 409 if email or username already exists
 */
export async function registerUser(input: RegisterInput) {
  const exists = await db.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [input.email, input.username],
  );
  if (exists.rowCount) throw new ApiError(409, 'Email or username already taken');

  const hash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash, username, display_name)
       VALUES ($1,$2,$3,$4) RETURNING id, email, username, display_name, role`,
      [input.email, hash, input.username, input.display_name],
    );
    const user = rows[0];
    await client.query('INSERT INTO user_profiles (user_id, available_for) VALUES ($1, $2)', [user.id, ['']]);
    await client.query('INSERT INTO online_presence (user_id) VALUES ($1)', [user.id]);
    await client.query('COMMIT');
    return { user, tokens: issueTokens(user.id, user.role) };
  } catch (e) {
    await client.query('ROLLBACK'); throw e;
  } finally { client.release(); }
}

/**
 * loginUser — Verifies credentials and issues tokens.
 * @throws ApiError 401 on invalid credentials
 */
export async function loginUser(input: LoginInput) {
  const { rows } = await db.query(
    'SELECT id, email, username, display_name, role, password_hash FROM users WHERE email = $1 AND deleted_at IS NULL',
    [input.email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(input.password, user.password_hash)))
    throw new ApiError(401, 'Invalid credentials');
  const { password_hash: _, ...safeUser } = user;
  return { user: safeUser, tokens: issueTokens(user.id, user.role) };
}

/**
 * refreshTokens — Validates refresh token and issues new pair.
 * @throws ApiError 401 if refresh token is invalid or revoked
 */
export async function refreshTokens(refreshToken: string) {
  const { rows } = await db.query(
    'SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [refreshToken],
  );
  if (!rows.length) throw new ApiError(401, 'Invalid or expired refresh token');
  const userId = rows[0].user_id;
  const { rows: userRows } = await db.query('SELECT id, role FROM users WHERE id = $1', [userId]);
  await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  return issueTokens(userRows[0].id, userRows[0].role);
}

/**
 * googleSignIn — Verifies Google ID token, creates or returns user.
 * @throws ApiError 401 if token is invalid
 */
export async function googleSignIn(idToken: string) {
  if (!env.GOOGLE_CLIENT_ID) throw new ApiError(503, 'Google OAuth not configured');
  const { OAuth2Client } = await import('google-auth-library');
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  let ticket;
  try {
    ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
  } catch {
    throw new ApiError(401, 'Invalid Google token');
  }
  const payload = ticket.getPayload();
  if (!payload?.email) throw new ApiError(401, 'Google token missing email');

  // Find existing user or create
  const { rows: existing } = await db.query(
    'SELECT id, email, username, display_name, role FROM users WHERE email=$1 AND deleted_at IS NULL',
    [payload.email],
  );
  if (existing.length) {
    // Update google_id if not set
    await db.query('UPDATE users SET updated_at=NOW() WHERE id=$1', [existing[0].id]);
    return { user: existing[0], tokens: issueTokens(existing[0].id, existing[0].role), isNew: false };
  }

  // Auto-generate username from email prefix
  const baseUsername = payload.email.split('@')[0].replace(/[^a-z0-9_]/gi, '').slice(0, 28);
  let username = baseUsername;
  let suffix = 1;
  while (true) {
    const { rows: taken } = await db.query('SELECT id FROM users WHERE username=$1', [username]);
    if (!taken.length) break;
    username = `${baseUsername}${suffix++}`;
  }

  const dbClient = await db.getClient();
  try {
    await dbClient.query('BEGIN');
    const { rows } = await dbClient.query(
      `INSERT INTO users (email, password_hash, username, display_name, photo_url)
       VALUES ($1,'',  $2,   $3,          $4) RETURNING id, email, username, display_name, role`,
      [payload.email, username, payload.name ?? username, payload.picture ?? null],
    );
    const user = rows[0];
    await dbClient.query('INSERT INTO user_profiles (user_id, available_for) VALUES ($1,$2)', [user.id, ['']]);
    await dbClient.query('INSERT INTO online_presence (user_id) VALUES ($1)', [user.id]);
    await dbClient.query('COMMIT');
    return { user, tokens: issueTokens(user.id, user.role), isNew: true };
  } catch (e) { await dbClient.query('ROLLBACK'); throw e; }
  finally { dbClient.release(); }
}

/** revokeRefreshToken — Used on logout */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  await db.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
}

function issueTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  const refreshToken = require('crypto').randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  db.query('INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1,$2,$3)', [refreshToken, userId, expiresAt]);
  return { accessToken, refreshToken };
}
