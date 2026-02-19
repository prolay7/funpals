/**
 * groups/service.ts — Group management logic.
 * Groups are stored as channels with type='group'.
 * Stream.IO tokens generated via JWT for video/audio calls.
 */
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { ApiError } from '../../middleware/errorHandler';

/** Generate a Stream.IO user token for the given user */
function streamToken(userId: string): string {
  if (!env.STREAM_API_SECRET) throw new ApiError(503, 'Stream not configured');
  return jwt.sign({ user_id: userId }, env.STREAM_API_SECRET, { algorithm: 'HS256' });
}

export async function createGroup(
  createdBy: string,
  name: string,
  description: string | undefined,
  memberIds: string[],
) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO channels (name, description, type, created_by)
       VALUES ($1,$2,'group',$3) RETURNING *`,
      [name, description ?? null, createdBy],
    );
    const channel = rows[0];
    const allMembers = Array.from(new Set([createdBy, ...memberIds]));
    for (const uid of allMembers) {
      const role = uid === createdBy ? 'owner' : 'member';
      await client.query(
        'INSERT INTO channel_members (channel_id, user_id, role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [channel.id, uid, role],
      );
    }
    await client.query('COMMIT');
    return channel;
  } catch (e) { await client.query('ROLLBACK'); throw e; }
  finally { client.release(); }
}

export async function listMyGroups(userId: string) {
  const { rows } = await db.query(
    `SELECT c.id, c.name, c.description, c.photo_url, c.created_at,
            cm.role,
            (SELECT COUNT(*) FROM channel_members WHERE channel_id = c.id) AS member_count
     FROM channels c
     JOIN channel_members cm ON c.id = cm.channel_id
     WHERE cm.user_id = $1 AND c.type = 'group' AND c.deleted_at IS NULL
     ORDER BY c.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function listPublicGroups(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const { rows } = await db.query(
    `SELECT c.id, c.name, c.description, c.photo_url, c.created_at,
            (SELECT COUNT(*) FROM channel_members WHERE channel_id = c.id) AS member_count
     FROM channels c
     WHERE c.type = 'public' AND c.deleted_at IS NULL
     ORDER BY c.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return rows;
}

export async function getGroupById(channelId: string) {
  const { rows } = await db.query(
    `SELECT c.id, c.name, c.description, c.type, c.photo_url, c.is_default, c.created_at,
            json_agg(json_build_object(
              'user_id', u.id, 'display_name', u.display_name,
              'photo_url', u.photo_url, 'role', cm.role
            )) AS members
     FROM channels c
     JOIN channel_members cm ON c.id = cm.channel_id
     JOIN users u ON cm.user_id = u.id
     WHERE c.id = $1 AND c.deleted_at IS NULL
     GROUP BY c.id`,
    [channelId],
  );
  if (!rows.length) throw new ApiError(404, 'Group not found');
  return rows[0];
}

export async function updateGroup(channelId: string, userId: string, data: Record<string, unknown>) {
  const { rows: member } = await db.query(
    "SELECT role FROM channel_members WHERE channel_id=$1 AND user_id=$2", [channelId, userId]);
  if (!member.length || !['owner','admin'].includes(member[0].role))
    throw new ApiError(403, 'Only owner or admin can update the group');
  const allowed = ['name','description','photo_url'];
  const updates = Object.entries(data).filter(([k]) => allowed.includes(k));
  if (!updates.length) throw new ApiError(400, 'No valid fields to update');
  const sets = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const vals = updates.map(([, v]) => v);
  const { rows } = await db.query(
    `UPDATE channels SET ${sets} WHERE id = $1 RETURNING *`, [channelId, ...vals]);
  return rows[0];
}

export async function joinGroup(channelId: string, userId: string) {
  const { rows } = await db.query(
    "SELECT id, type FROM channels WHERE id=$1 AND deleted_at IS NULL", [channelId]);
  if (!rows.length) throw new ApiError(404, 'Group not found');
  await db.query(
    'INSERT INTO channel_members (channel_id, user_id, role) VALUES ($1,$2,\'member\') ON CONFLICT DO NOTHING',
    [channelId, userId],
  );
}

export async function leaveGroup(channelId: string, userId: string) {
  await db.query(
    'DELETE FROM channel_members WHERE channel_id=$1 AND user_id=$2', [channelId, userId]);
}

export async function createInstantCall(channelId: string, userId: string) {
  const callId = `group-${channelId}-${Date.now()}`;
  const { rows } = await db.query(
    `INSERT INTO meetings (call_id, meeting_type, created_by, channel_id, is_live)
     VALUES ($1,'video',$2,$3,TRUE) RETURNING *`,
    [callId, userId, channelId],
  );
  await db.query(
    'INSERT INTO meeting_participants (meeting_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [rows[0].id, userId],
  );
  return { meeting: rows[0], callToken: streamToken(userId), callId };
}

export async function joinCall(channelId: string, userId: string) {
  const { rows } = await db.query(
    'SELECT * FROM meetings WHERE channel_id=$1 AND is_live=TRUE ORDER BY created_at DESC LIMIT 1',
    [channelId],
  );
  if (!rows.length) throw new ApiError(404, 'No active call for this group');
  await db.query(
    'INSERT INTO meeting_participants (meeting_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [rows[0].id, userId],
  );
  return { meeting: rows[0], callToken: streamToken(userId), callId: rows[0].call_id };
}

export async function getLiveMeetings(channelId: string) {
  const { rows } = await db.query(
    'SELECT * FROM meetings WHERE channel_id=$1 AND is_live=TRUE ORDER BY created_at DESC',
    [channelId],
  );
  return rows;
}
