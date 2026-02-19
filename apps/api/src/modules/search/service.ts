/**
 * search/service.ts — Global search across users, skills, posts, groups, meetings, categories, activities.
 */
import { db } from '../../config/database';

type SearchType = 'users' | 'skills' | 'posts' | 'groups' | 'meetings' | 'categories' | 'activities' | 'all';

export async function globalSearch(query: string, userId: string, type: SearchType = 'all') {
  const like = `%${query}%`;
  const result: Record<string, unknown[]> = {};

  const run = async (key: string, condition: boolean, fn: () => Promise<{ rows: unknown[] }>) => {
    if (condition) result[key] = (await fn()).rows;
  };

  await Promise.all([
    run('users', type === 'all' || type === 'users', () =>
      db.query(
        `SELECT id, display_name, username, photo_url FROM users
         WHERE (display_name ILIKE $1 OR username ILIKE $1) AND deleted_at IS NULL AND id != $2 LIMIT 10`,
        [like, userId],
      )),
    run('skills', type === 'all' || type === 'skills', () =>
      db.query(
        `SELECT us.id, us.name, us.status, us.description, u.display_name, u.photo_url
         FROM user_skills us JOIN users u ON us.user_id = u.id
         WHERE us.name ILIKE $1 AND u.deleted_at IS NULL LIMIT 10`,
        [like],
      )),
    run('posts', type === 'all' || type === 'posts', () =>
      db.query(
        `SELECT op.id, op.title, op.content, u.display_name, op.created_at
         FROM open_posts op JOIN users u ON op.user_id = u.id
         WHERE (op.title ILIKE $1 OR op.content ILIKE $1) AND op.deleted_at IS NULL LIMIT 10`,
        [like],
      )),
    run('groups', type === 'all' || type === 'groups', () =>
      db.query(
        `SELECT id, name, description, type FROM channels
         WHERE name ILIKE $1 AND type IN ('public','group') AND deleted_at IS NULL LIMIT 10`,
        [like],
      )),
    run('categories', type === 'all' || type === 'categories', () =>
      db.query(
        `SELECT id, name, parent_id FROM categories WHERE name ILIKE $1 LIMIT 10`,
        [like],
      )),
    run('activities', type === 'all' || type === 'activities', () =>
      db.query(
        `SELECT a.id, a.title, a.description, ac.name AS category FROM activities a
         LEFT JOIN activity_categories ac ON a.category_id = ac.id
         WHERE (a.title ILIKE $1 OR a.description ILIKE $1) AND a.is_active=TRUE LIMIT 10`,
        [like],
      )),
    run('meetings', type === 'all' || type === 'meetings', () =>
      db.query(
        `SELECT m.id, m.call_id, m.meeting_type, m.is_live, m.created_at, u.display_name AS host
         FROM meetings m JOIN users u ON m.created_by = u.id
         WHERE m.is_live=TRUE LIMIT 10`,
        [],
      )),
  ]);

  return result;
}
