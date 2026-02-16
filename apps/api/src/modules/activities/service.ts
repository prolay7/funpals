/**
 * activities/service.ts — Activity catalogue management.
 * Activities are seeded via admin panel and served to the mobile app.
 * Random endpoint powers the floating "bubble" widget.
 */
import { db } from '../../config/database';
import { getCachedOrFetch } from '../../config/redis';

export async function listActivities(category?: string) {
  return getCachedOrFetch(`activities:list:${category ?? 'all'}`, 300, async () => {
    const { rows } = await db.query(
      `SELECT a.*, ac.name AS category_name, ac.icon AS category_icon
       FROM activities a JOIN activity_categories ac ON a.category_id = ac.id
       WHERE a.is_active = TRUE ${category ? 'AND ac.name = $1' : ''}
       ORDER BY a.sort_order ASC, a.created_at DESC`,
      category ? [category] : [],
    );
    return rows;
  });
}

/** getRandomActivity — Used by mobile bubble widget. Returns one random active activity. */
export async function getRandomActivity() {
  const { rows } = await db.query(
    `SELECT a.*, ac.name AS category_name, ac.icon AS category_icon
     FROM activities a JOIN activity_categories ac ON a.category_id = ac.id
     WHERE a.is_active = TRUE ORDER BY RANDOM() LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function getActivityById(id: string) {
  const { rows } = await db.query(
    `SELECT a.*, ac.name AS category_name FROM activities a
     JOIN activity_categories ac ON a.category_id = ac.id WHERE a.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function joinActivity(userId: string, activityId: string) {
  await db.query(
    `INSERT INTO user_activities (user_id, activity_id, status, started_at)
     VALUES ($1, $2, 'ongoing', NOW())
     ON CONFLICT (user_id, activity_id) DO UPDATE SET status = 'ongoing', started_at = NOW()`,
    [userId, activityId],
  );
}
