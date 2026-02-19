/**
 * notificationBatch.ts — Cron job for batched push notifications.
 * Runs every hour. Finds users who prefer batched notifications
 * and sends a digest of unread notifications since last batch.
 * Configurable via user profile: notif_frequency + notif_batch_hours.
 */
import cron from 'node-cron';
import { db } from '../config/database';
import { sendPushNotification } from '../modules/notifications/service';
import { logger } from '../middleware/logger';

export function startNotificationBatchJob(): void {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running notification batch job...');
    try {
      // Find users with unread notifications and batched preference
      const { rows } = await db.query(`
        SELECT DISTINCT n.user_id, up.fcm_token, up.apns_token, COUNT(n.id) AS unread_count
        FROM notifications n
        JOIN user_profiles up ON n.user_id = up.user_id
        WHERE n.is_read = FALSE AND n.sent_at IS NULL
          AND up.notif_frequency = 'batched'
        GROUP BY n.user_id, up.fcm_token, up.apns_token
        HAVING COUNT(n.id) > 0
      `);

      for (const row of rows) {
        await sendPushNotification(row.user_id, {
          title: `You have ${row.unread_count} new notification${row.unread_count > 1 ? 's' : ''}`,
          body: 'Tap to view your activity updates',
        });
      }
      logger.info(`Batch notifications sent to ${rows.length} users`);
    } catch (err) { logger.error('Notification batch job failed', { err }); }
  });
}
