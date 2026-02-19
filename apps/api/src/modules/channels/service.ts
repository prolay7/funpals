/**
 * channels/service.ts — Channel and message management.
 * Default channels appear first, then favourites, then rest.
 */
import { db } from '../../config/database';
import { parsePaginationQuery } from '../../utils/pagination';

export async function listChannels(userId: string) {
  const { rows } = await db.query(
    `SELECT c.*, cm.is_favorite, cm.role,
            CASE WHEN c.is_default THEN 0 WHEN cm.is_favorite THEN 1 ELSE 2 END AS sort_order
     FROM channels c
     LEFT JOIN channel_members cm ON c.id = cm.channel_id AND cm.user_id = $1
     WHERE c.deleted_at IS NULL
     ORDER BY sort_order ASC, c.name ASC`,
    [userId],
  );
  return rows;
}

export async function createChannel(userId: string, name: string, description?: string) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO channels (name, description, created_by) VALUES ($1, $2, $3) RETURNING *`,
      [name, description ?? null, userId],
    );
    const channel = rows[0];
    await client.query(
      `INSERT INTO channel_members (channel_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [channel.id, userId],
    );
    await client.query('COMMIT');
    return channel;
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}

export async function getChannelMemberIds(channelId: string): Promise<string[]> {
  const { rows } = await db.query(
    'SELECT user_id FROM channel_members WHERE channel_id = $1', [channelId]);
  return rows.map((r: { user_id: string }) => r.user_id);
}

export async function saveMessage(data: { channelId: string; senderId: string; content: string; type?: string }) {
  const { rows } = await db.query(
    `INSERT INTO messages (channel_id, sender_id, content, type)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.channelId, data.senderId, data.content, data.type ?? 'text'],
  );
  return rows[0];
}

/** listConversations — Returns all DM (private) channels for a user */
export async function listConversations(userId: string) {
  const { rows } = await db.query(
    `SELECT c.id, c.name, c.type, c.photo_url,
            (SELECT json_build_object('content', m.content, 'created_at', m.created_at, 'sender_id', m.sender_id)
             FROM messages m WHERE m.channel_id = c.id AND m.is_deleted = FALSE
             ORDER BY m.created_at DESC LIMIT 1) AS last_message
     FROM channels c
     JOIN channel_members cm ON c.id = cm.channel_id
     WHERE cm.user_id = $1 AND c.type = 'private' AND c.deleted_at IS NULL
     ORDER BY c.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function getMessages(channelId: string, queryParams: Record<string, unknown>) {
  const { limit, cursor } = parsePaginationQuery(queryParams);
  const { rows } = await db.query(
    `SELECT m.*, u.display_name AS sender_name, u.photo_url AS sender_photo
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.channel_id = $1 ${cursor ? 'AND m.id < $3' : ''}
       AND m.is_deleted = FALSE
     ORDER BY m.created_at DESC
     LIMIT $2`,
    cursor ? [channelId, limit, cursor] : [channelId, limit],
  );
  return rows;
}
