import { db } from '../../config/database';
export async function getDashboardStats() {
  const [users, channels, messages, activities] = await Promise.all([
    db.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL'),
    db.query('SELECT COUNT(*) FROM channels WHERE deleted_at IS NULL'),
    db.query('SELECT COUNT(*) FROM messages WHERE created_at > NOW() - INTERVAL \'24 hours\''),
    db.query('SELECT COUNT(*) FROM activities WHERE is_active = TRUE'),
  ]);
  return {
    totalUsers:      parseInt(users.rows[0].count),
    totalChannels:   parseInt(channels.rows[0].count),
    messagesToday:   parseInt(messages.rows[0].count),
    activeActivities:parseInt(activities.rows[0].count),
  };
}
export async function listUsersAdmin(search?: string, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const { rows } = await db.query(
    `SELECT u.id, u.email, u.username, u.display_name, u.role, u.is_active, u.created_at, up.zip_code
     FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.deleted_at IS NULL ${search ? "AND (u.email ILIKE $3 OR u.username ILIKE $3)" : ''}
     ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
    search ? [limit, offset, `%${search}%`] : [limit, offset]);
  return rows;
}
export async function setBanStatus(userId: string, banned: boolean) {
  await db.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [!banned, userId]);
}
export async function getAppSettings() {
  const { rows } = await db.query('SELECT * FROM app_settings LIMIT 1');
  return rows[0] ?? {};
}
