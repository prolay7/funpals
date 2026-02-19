/**
 * skills/service.ts — User skills CRUD (Can Do / Learning / Interested / Not Interested).
 */
import { db } from '../../config/database';
import { ApiError } from '../../middleware/errorHandler';

export async function listSkills(userId: string) {
  const { rows } = await db.query(
    'SELECT * FROM user_skills WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
  return rows;
}

export async function createSkill(userId: string, name: string, description: string | undefined, status: string) {
  const { rows } = await db.query(
    `INSERT INTO user_skills (user_id, name, description, status)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [userId, name, description ?? null, status ?? 'can_do'],
  );
  return rows[0];
}

export async function updateSkill(skillId: string, userId: string, data: Record<string, unknown>) {
  const { rows: existing } = await db.query(
    'SELECT id FROM user_skills WHERE id=$1 AND user_id=$2', [skillId, userId]);
  if (!existing.length) throw new ApiError(404, 'Skill not found');
  const allowed = ['name','description','status'];
  const updates = Object.entries(data).filter(([k]) => allowed.includes(k));
  if (!updates.length) throw new ApiError(400, 'No valid fields to update');
  const sets = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const vals = updates.map(([, v]) => v);
  const { rows } = await db.query(
    `UPDATE user_skills SET ${sets}, updated_at=NOW() WHERE id=$1 RETURNING *`, [skillId, ...vals]);
  return rows[0];
}

export async function deleteSkill(skillId: string, userId: string) {
  const { rowCount } = await db.query(
    'DELETE FROM user_skills WHERE id=$1 AND user_id=$2', [skillId, userId]);
  if (!rowCount) throw new ApiError(404, 'Skill not found');
}
