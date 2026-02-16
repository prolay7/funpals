import { db } from '../../config/database';
export async function shareInternal(userId: string, channelId: string, content: string, category?: string) {
  const { rows } = await db.query(`INSERT INTO shares (user_id, content, category, share_type, channel_id) VALUES ($1,$2,$3,'internal',$4) RETURNING *`,
    [userId, content, category ?? null, channelId]);
  return rows[0];
}
export async function getGlobalFeed(category?: string, cursor?: string, limit = 20) {
  const { rows } = await db.query(
    `SELECT s.*, u.display_name, u.photo_url FROM shares s JOIN users u ON s.user_id = u.id
     WHERE s.share_type = 'global' ${category ? 'AND s.category = $3' : ''} ${cursor ? `AND s.id < $${category ? 4 : 3}` : ''}
     ORDER BY s.created_at DESC LIMIT $1`,
    [limit, ...(category ? [category] : []), ...(cursor ? [cursor] : [])].filter(Boolean) as any);
  return rows;
}
export async function shareGlobal(userId: string, content: string, category?: string) {
  const { rows } = await db.query(`INSERT INTO shares (user_id, content, category, share_type) VALUES ($1,$2,$3,'global') RETURNING *`,
    [userId, content, category ?? null]);
  return rows[0];
}
