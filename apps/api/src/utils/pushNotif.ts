/**
 * pushNotif.ts — Direct APNs (iOS) and FCM (Android) push notification sender.
 * NO Firebase Admin SDK subscription — uses raw HTTP API calls only.
 * FCM uses the free legacy HTTP API (only server key required).
 */
import https from 'https';
import fs from 'fs';
import { env } from '../config/env';
import { logger } from '../middleware/logger';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * sendFcmPush — Send Android push notification via FCM HTTP API.
 * @param deviceToken  FCM registration token from the Android device
 * @param payload      Notification content
 */
export async function sendFcmPush(deviceToken: string, payload: PushPayload): Promise<void> {
  if (!env.FCM_SERVER_KEY) return;
  const body = JSON.stringify({
    to: deviceToken,
    notification: { title: payload.title, body: payload.body },
    data: payload.data ?? {},
  });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'fcm.googleapis.com', path: '/fcm/send', method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `key=${env.FCM_SERVER_KEY}` },
    }, (res) => {
      res.resume();
      if (res.statusCode === 200) resolve();
      else reject(new Error(`FCM HTTP ${res.statusCode}`));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * sendApnsPush — Send iOS push notification via APNs HTTP/2.
 * Requires APNS_KEY_PATH pointing to an Apple .p8 key file.
 */
export async function sendApnsPush(deviceToken: string, payload: PushPayload): Promise<void> {
  if (!env.APNS_KEY_ID || !env.APNS_KEY_PATH) return;
  // Full APNs HTTP/2 implementation would use the 'http2' module
  // with JWT signed by the .p8 key. Placeholder for integration.
  logger.debug('APNs push (placeholder – implement with http2 module)', { deviceToken, payload });
}
