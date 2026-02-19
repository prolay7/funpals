/**
 * categories/service.ts — Hierarchical category taxonomy and user preferences.
 */
import { db } from '../../config/database';

export async function listTopLevelCategories() {
  const { rows } = await db.query(
    'SELECT * FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC, name ASC');
  return rows;
}

export async function getChildren(categoryId: string) {
  const { rows } = await db.query(
    'SELECT * FROM categories WHERE parent_id=$1 ORDER BY sort_order ASC, name ASC', [categoryId]);
  return rows;
}

export async function toggleLikedCategory(userId: string, categoryId: string) {
  const { rows } = await db.query(
    'SELECT 1 FROM user_liked_categories WHERE user_id=$1 AND category_id=$2', [userId, categoryId]);
  if (rows.length) {
    await db.query('DELETE FROM user_liked_categories WHERE user_id=$1 AND category_id=$2', [userId, categoryId]);
    return { liked: false };
  }
  await db.query(
    'INSERT INTO user_liked_categories (user_id, category_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [userId, categoryId],
  );
  return { liked: true };
}

export async function getUsersByCategory(categoryId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const { rows } = await db.query(
    `SELECT u.id, u.display_name, u.photo_url, u.username, up.interests, up.available_for,
            op.is_online
     FROM user_liked_categories ulc
     JOIN users u ON ulc.user_id = u.id
     LEFT JOIN user_profiles up ON u.id = up.user_id
     LEFT JOIN online_presence op ON u.id = op.user_id
     WHERE ulc.category_id = $1 AND u.deleted_at IS NULL
     ORDER BY op.is_online DESC NULLS LAST, u.display_name ASC
     LIMIT $2 OFFSET $3`,
    [categoryId, limit, offset],
  );
  return rows;
}

export async function searchCategories(query: string) {
  const { rows } = await db.query(
    `SELECT id, name, parent_id, is_special, sort_order FROM categories
     WHERE name ILIKE $1 ORDER BY sort_order ASC, name ASC LIMIT 30`,
    [`%${query}%`],
  );
  return rows;
}
