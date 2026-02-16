import { db } from '../../config/database';
export async function listPosts(cursor?: string, limit = 20) {
  const { rows } = await db.query(
    `SELECT op.*, u.display_name, u.photo_url FROM open_posts op JOIN users u ON op.user_id = u.id
     WHERE op.deleted_at IS NULL ${cursor ? 'AND op.id < $2' : ''}
     ORDER BY op.created_at DESC LIMIT $1`,
    cursor ? [limit, cursor] : [limit]);
  return rows;
}
export async function createPost(userId: string, data: { title: string; content: string; tags?: string[] }) {
  const { rows } = await db.query(
    `INSERT INTO open_posts (user_id, title, content, tags) VALUES ($1,$2,$3,$4) RETURNING *`,
    [userId, data.title, data.content, data.tags ?? []]);
  return rows[0];
}
