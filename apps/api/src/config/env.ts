/**
 * env.ts — Environment variable validation using Zod.
 * Throws at startup if any required variable is missing.
 */
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:                z.enum(['development', 'test', 'production']).default('development'),
  PORT:                    z.string().default('3000'),
  DATABASE_URL:            z.string().url(),
  DATABASE_TEST_URL:       z.string().url().optional(),
  DB_POOL_MAX:             z.string().default('50'),
  REDIS_URL:               z.string().default('redis://localhost:6379'),
  JWT_SECRET:              z.string().min(32),
  JWT_EXPIRES_IN:          z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN:z.string().default('30d'),
  ALLOWED_ORIGINS:         z.string().default('http://localhost:5173'),
  MEDIA_UPLOAD_PATH:       z.string().default('./uploads'),
  MEDIA_BASE_URL:          z.string().default('http://localhost:3000/media'),
  APNS_KEY_ID:             z.string().optional(),
  APNS_TEAM_ID:            z.string().optional(),
  APNS_BUNDLE_ID:          z.string().optional(),
  APNS_KEY_PATH:           z.string().optional(),
  APNS_PRODUCTION:         z.string().default('false'),
  FCM_SERVER_KEY:          z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌  Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
