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

export async function updateAppSettings(data: Record<string, unknown>) {
  const allowed = ['default_radius_miles','notif_frequency','admob_force_watch'];
  const updates = Object.entries(data).filter(([k]) => allowed.includes(k));
  if (!updates.length) return getAppSettings();
  const sets = updates.map(([k], i) => `${k} = $${i + 1}`).join(', ');
  const vals = updates.map(([, v]) => v);
  await db.query(`UPDATE app_settings SET ${sets}, updated_at=NOW() WHERE id=1`, vals);
  return getAppSettings();
}

export async function listMaterials(search?: string) {
  const { rows } = await db.query(
    `SELECT * FROM materials ${search ? "WHERE title ILIKE $1 OR category ILIKE $1" : ''}
     ORDER BY sort_order ASC, title ASC`,
    search ? [`%${search}%`] : [],
  );
  return rows;
}

export async function createMaterial(data: Record<string, unknown>) {
  const { rows } = await db.query(
    `INSERT INTO materials (category,title,description,image_url,external_url,address,sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [data.category,data.title,data.description??null,data.image_url??null,
     data.external_url??null,data.address??null,data.sort_order??0],
  );
  return rows[0];
}

export async function updateMaterial(id: string, data: Record<string, unknown>) {
  const allowed = ['category','title','description','image_url','external_url','address','sort_order','is_active'];
  const updates = Object.entries(data).filter(([k]) => allowed.includes(k));
  if (!updates.length) throw new Error('No valid fields');
  const sets = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const vals = updates.map(([, v]) => v);
  const { rows } = await db.query(`UPDATE materials SET ${sets} WHERE id=$1 RETURNING *`, [id, ...vals]);
  return rows[0];
}

export async function deleteMaterial(id: string) {
  await db.query('UPDATE materials SET is_active=FALSE WHERE id=$1', [id]);
}
