/**
 * reports/service.ts — User report submission.
 */
import { db } from '../../config/database';

export async function reportUser(reporterId: string, reportedId: string, reason: string) {
  const { rows } = await db.query(
    `INSERT INTO user_reports (reporter_id, reported_id, reason) VALUES ($1,$2,$3) RETURNING id, created_at`,
    [reporterId, reportedId, reason],
  );
  return rows[0];
}
