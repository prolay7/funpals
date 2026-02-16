import { db } from '../../config/database';
export async function listQuestions(cursor?: string, limit = 20) {
  const { rows } = await db.query(
    `SELECT oq.*, u.display_name, u.photo_url FROM open_questions oq JOIN users u ON oq.user_id = u.id
     WHERE oq.deleted_at IS NULL ${cursor ? 'AND oq.id < $2' : ''} ORDER BY oq.created_at DESC LIMIT $1`,
    cursor ? [limit, cursor] : [limit]);
  return rows;
}
export async function createQuestion(userId: string, data: { question: string; tags?: string[] }) {
  const { rows } = await db.query(`INSERT INTO open_questions (user_id, question, tags) VALUES ($1,$2,$3) RETURNING *`,
    [userId, data.question, data.tags ?? []]);
  return rows[0];
}
