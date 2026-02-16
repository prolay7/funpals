import { db } from '../../config/database';
import { sendFcmPush, sendApnsPush, PushPayload } from '../../utils/pushNotif';

export async function listNotifications(userId: string, limit = 30) {
  const { rows } = await db.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`, [userId, limit]);
  return rows;
}

export async function markAllRead(userId: string) {
  await db.query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [userId]);
}

/** sendPushNotification — Saves to DB and dispatches via FCM/APNs */
export async function sendPushNotification(userId: string, payload: PushPayload, data?: Record<string, string>) {
  const { rows: profileRows } = await db.query(`SELECT fcm_token, apns_token FROM user_profiles WHERE user_id = $1`, [userId]);
  const profile = profileRows[0];
  // Save to DB
  await db.query(`INSERT INTO notifications (user_id, type, title, body, data, sent_at) VALUES ($1,$2,$3,$4,$5,NOW())`,
    [userId, data?.type ?? 'general', payload.title, payload.body, JSON.stringify(data ?? {})]);
  // Dispatch to device
  if (profile?.fcm_token) sendFcmPush(profile.fcm_token, payload).catch(() => {});
  if (profile?.apns_token) sendApnsPush(profile.apns_token, payload).catch(() => {});
}
