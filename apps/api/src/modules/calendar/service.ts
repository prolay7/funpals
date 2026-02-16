import { db } from '../../config/database';
export async function listEvents(userId: string) {
  const { rows } = await db.query(
    `SELECT e.*, er.status AS my_rsvp FROM events e
     LEFT JOIN event_rsvps er ON e.id = er.event_id AND er.user_id = $1
     WHERE e.deleted_at IS NULL AND (e.created_by = $1 OR er.user_id = $1 OR e.is_group = TRUE)
     ORDER BY e.starts_at ASC`, [userId]);
  return rows;
}
export async function createEvent(userId: string, data: Record<string, unknown>) {
  const { rows } = await db.query(
    `INSERT INTO events (title, description, location, starts_at, ends_at, created_by, channel_id, is_group)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [data.title, data.description ?? null, data.location ?? null, data.starts_at, data.ends_at, userId, data.channel_id ?? null, data.is_group ?? false]);
  return rows[0];
}
export async function setRsvp(userId: string, eventId: string, status: string) {
  await db.query(
    `INSERT INTO event_rsvps (event_id, user_id, status) VALUES ($1,$2,$3)
     ON CONFLICT (event_id, user_id) DO UPDATE SET status = $3`, [eventId, userId, status]);
}
