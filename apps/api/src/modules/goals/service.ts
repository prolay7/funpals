/**
 * goals/service.ts — Community/personal goals CRUD.
 */
import { db } from '../../config/database';
import { ApiError } from '../../middleware/errorHandler';

export async function listGoals(userId: string) {
  const { rows } = await db.query(
    'SELECT * FROM user_goals WHERE user_id=$1 ORDER BY created_at DESC', [userId]);
  return rows;
}

export async function createGoal(userId: string, description: string) {
  const { rows } = await db.query(
    'INSERT INTO user_goals (user_id, description) VALUES ($1,$2) RETURNING *',
    [userId, description],
  );
  return rows[0];
}

export async function updateGoal(goalId: string, userId: string, data: Record<string, unknown>) {
  const { rows: existing } = await db.query(
    'SELECT id FROM user_goals WHERE id=$1 AND user_id=$2', [goalId, userId]);
  if (!existing.length) throw new ApiError(404, 'Goal not found');
  const allowed = ['description','is_complete'];
  const updates = Object.entries(data).filter(([k]) => allowed.includes(k));
  if (!updates.length) throw new ApiError(400, 'No valid fields to update');
  const sets = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const vals = updates.map(([, v]) => v);
  const { rows } = await db.query(
    `UPDATE user_goals SET ${sets} WHERE id=$1 RETURNING *`, [goalId, ...vals]);
  return rows[0];
}

export async function deleteGoal(goalId: string, userId: string) {
  const { rowCount } = await db.query(
    'DELETE FROM user_goals WHERE id=$1 AND user_id=$2', [goalId, userId]);
  if (!rowCount) throw new ApiError(404, 'Goal not found');
}
