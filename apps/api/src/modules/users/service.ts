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

export async function saveProfilePhoto(userId: string, buffer: Buffer, _mimetype: string): Promise<string> {
  // Always resize+compress with Sharp first
  const webpBuffer = await sharp(buffer).resize(400, 400, { fit: 'cover' }).webp({ quality: 85 }).toBuffer();
  let photoUrl: string;

  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    const cloudinary = await import('cloudinary');
    cloudinary.v2.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key:    env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: 'funpals/avatars', public_id: `avatar-${userId}`, overwrite: true, format: 'webp' },
        (err, res) => { if (err || !res) reject(err ?? new Error('Cloudinary error')); else resolve(res); },
      ).end(webpBuffer);
    });
    photoUrl = result.secure_url;
  } else {
    const filename = `${userId}-${Date.now()}.webp`;
    const uploadDir = path.resolve(env.MEDIA_UPLOAD_PATH);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), webpBuffer);
    photoUrl = `${env.MEDIA_BASE_URL}/${filename}`;
  }

  await db.query('UPDATE users SET photo_url = $1, updated_at = NOW() WHERE id = $2', [photoUrl, userId]);
  await invalidateCache(`profile:${userId}`);
  return photoUrl;
}

export async function listOnlineUsers() {
  const { rows } = await db.query(
    `SELECT u.id, u.display_name, u.photo_url, u.username,
            op.is_on_call, op.available_call, op.last_seen
     FROM online_presence op
     JOIN users u ON op.user_id = u.id
     WHERE op.is_online = TRUE AND u.deleted_at IS NULL
     ORDER BY op.last_seen DESC LIMIT 50`,
  );
  return rows;
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
