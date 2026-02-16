/**
 * users/service.ts — User profile management logic.
 */
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { invalidateCache } from '../../config/redis';

export async function getUserProfile(userId: string) {
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.username, u.display_name, u.photo_url, u.role,
            up.age_range, up.gender, up.zip_code, up.can_do, up.cannot_do,
            up.interests, up.available_for, up.expertise_level, up.bio,
            up.search_radius_miles, up.notif_frequency, up.notif_batch_hours
     FROM users u JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = $1 AND u.deleted_at IS NULL`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function updateUserProfile(userId: string, data: Record<string, unknown>) {
  const allowed = ['display_name','age_range','gender','zip_code','can_do','cannot_do',
                   'interests','available_for','expertise_level','bio','search_radius_miles',
                   'notif_frequency','notif_batch_hours'];
  const userFields = ['display_name'];
  const profileFields = allowed.filter(f => !userFields.includes(f));

  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    // Update users table fields
    for (const f of userFields) {
      if (data[f] !== undefined)
        await client.query(`UPDATE users SET ${f} = $1, updated_at = NOW() WHERE id = $2`, [data[f], userId]);
    }
    // Update user_profiles fields
    for (const f of profileFields) {
      if (data[f] !== undefined)
        await client.query(`UPDATE user_profiles SET ${f} = $1, updated_at = NOW() WHERE user_id = $2`, [data[f], userId]);
    }
    await client.query('COMMIT');
    await invalidateCache(`profile:${userId}`);
    return getUserProfile(userId);
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}

export async function saveProfilePhoto(userId: string, buffer: Buffer, mimetype: string): Promise<string> {
  const ext = 'webp';
  const filename = `${userId}-${Date.now()}.${ext}`;
  const uploadDir = path.resolve(env.MEDIA_UPLOAD_PATH);
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  const outputPath = path.join(uploadDir, filename);
  // Resize to 400x400, convert to WebP for optimal performance
  await sharp(buffer).resize(400, 400, { fit: 'cover' }).webp({ quality: 85 }).toFile(outputPath);
  const photoUrl = `${env.MEDIA_BASE_URL}/${filename}`;
  await db.query('UPDATE users SET photo_url = $1, updated_at = NOW() WHERE id = $2', [photoUrl, userId]);
  await invalidateCache(`profile:${userId}`);
  return photoUrl;
}

export async function getTodaysGoal(userId: string) {
  const { rows } = await db.query(
    'SELECT daily_goal, goal_shown_date FROM user_profiles WHERE user_id = $1', [userId]);
  return rows[0];
}

export async function setTodaysGoal(userId: string, goal: string) {
  await db.query(
    'UPDATE user_profiles SET daily_goal = $1, goal_shown_date = CURRENT_DATE, updated_at = NOW() WHERE user_id = $2',
    [goal, userId]);
}
