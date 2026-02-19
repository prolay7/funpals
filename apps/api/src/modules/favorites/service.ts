/**
 * favorites/service.ts — Favorite callers and groups management.
 */
import { db } from '../../config/database';

export async function toggleFavoriteCaller(userId: string, targetUserId: string) {
  const { rows } = await db.query(
    'SELECT 1 FROM favorite_callers WHERE user_id=$1 AND favorite_user_id=$2', [userId, targetUserId]);
  if (rows.length) {
    await db.query('DELETE FROM favorite_callers WHERE user_id=$1 AND favorite_user_id=$2', [userId, targetUserId]);
    return { favorited: false };
  }
  await db.query('INSERT INTO favorite_callers (user_id, favorite_user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, targetUserId]);
  return { favorited: true };
}

export async function listFavoriteCallers(userId: string) {
  const { rows } = await db.query(
    `SELECT u.id, u.display_name, u.photo_url, u.username,
            op.is_online, op.is_on_call, op.available_call, fc.created_at AS favorited_at
     FROM favorite_callers fc
     JOIN users u ON fc.favorite_user_id = u.id
     LEFT JOIN online_presence op ON u.id = op.user_id
     WHERE fc.user_id = $1 AND u.deleted_at IS NULL
     ORDER BY fc.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function toggleFavoriteGroup(userId: string, channelId: string) {
  const { rows } = await db.query(
    'SELECT 1 FROM favorite_groups WHERE user_id=$1 AND channel_id=$2', [userId, channelId]);
  if (rows.length) {
    await db.query('DELETE FROM favorite_groups WHERE user_id=$1 AND channel_id=$2', [userId, channelId]);
    return { favorited: false };
  }
  await db.query('INSERT INTO favorite_groups (user_id, channel_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, channelId]);
  return { favorited: true };
}

export async function listFavoriteGroups(userId: string) {
  const { rows } = await db.query(
    `SELECT c.id, c.name, c.description, c.photo_url, c.type, fg.created_at AS favorited_at
     FROM favorite_groups fg
     JOIN channels c ON fg.channel_id = c.id
     WHERE fg.user_id = $1 AND c.deleted_at IS NULL
     ORDER BY fg.created_at DESC`,
    [userId],
  );
  return rows;
}
