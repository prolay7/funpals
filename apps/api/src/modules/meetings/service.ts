/**
 * meetings/service.ts — Stream.IO meeting management.
 * Supports invite flows, live meeting discovery, and scheduled meetings.
 */
import jwt from 'jsonwebtoken';
import { db } from '../../config/database';
import { env } from '../../config/env';
import { ApiError } from '../../middleware/errorHandler';

function streamToken(userId: string): string {
  if (!env.STREAM_API_SECRET) throw new ApiError(503, 'Stream not configured');
  return jwt.sign({ user_id: userId }, env.STREAM_API_SECRET, { algorithm: 'HS256' });
}

export async function inviteToMeeting(fromUserId: string, toUserId: string, meetingType: string = 'video') {
  const callId = `dm-${fromUserId}-${toUserId}-${Date.now()}`;
  const { rows } = await db.query(
    `INSERT INTO meetings (call_id, meeting_type, created_by, is_live)
     VALUES ($1,$2,$3,TRUE) RETURNING *`,
    [callId, meetingType, fromUserId],
  );
  const meeting = rows[0];
  await db.query(
    'INSERT INTO meeting_participants (meeting_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [meeting.id, fromUserId],
  );
  return { meeting, callToken: streamToken(fromUserId), callId };
}

export async function privateMeeting(fromUserId: string, toUserId: string) {
  return inviteToMeeting(fromUserId, toUserId, 'video');
}

export async function getLiveMeetings(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const { rows } = await db.query(
    `SELECT m.id, m.call_id, m.meeting_type, m.is_live, m.created_at,
            u.id AS host_id, u.display_name AS host_name, u.photo_url AS host_photo,
            (SELECT COUNT(*) FROM meeting_participants WHERE meeting_id=m.id) AS participant_count
     FROM meetings m
     JOIN users u ON m.created_by = u.id
     WHERE m.is_live=TRUE
     ORDER BY m.created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return rows;
}

export async function getMeetingLink(meetingId: string, userId: string) {
  const { rows } = await db.query('SELECT * FROM meetings WHERE id=$1', [meetingId]);
  if (!rows.length) throw new ApiError(404, 'Meeting not found');
  const meeting = rows[0];
  await db.query(
    'INSERT INTO meeting_participants (meeting_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [meetingId, userId],
  );
  if (meeting.meeting_type === 'google_meet') return { link: meeting.meet_link };
  return { callToken: streamToken(userId), callId: meeting.call_id };
}

export async function scheduleMeeting(userId: string, data: {
  title: string; channelId?: string; startsAt: string; meetingType?: string; meetLink?: string;
}) {
  const callId = `sched-${userId}-${Date.now()}`;
  const { rows } = await db.query(
    `INSERT INTO meetings (call_id, meeting_type, created_by, channel_id, meet_link, starts_at, is_live)
     VALUES ($1,$2,$3,$4,$5,$6,FALSE) RETURNING *`,
    [callId, data.meetingType ?? 'video', userId, data.channelId ?? null,
     data.meetLink ?? null, data.startsAt],
  );
  const meeting = rows[0];
  // Also create an event for calendar integration
  await db.query(
    `INSERT INTO events (title, starts_at, ends_at, created_by, channel_id, is_group)
     VALUES ($1,$2,$2::timestamptz + INTERVAL '1 hour',$3,$4,FALSE)`,
    [data.title, data.startsAt, userId, data.channelId ?? null],
  );
  return meeting;
}
