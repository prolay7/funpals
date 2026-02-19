/**
 * verification/service.ts — Identity verification logic.
 * Photos are ephemeral (sent via WebSocket, never stored permanently).
 * Only text-based verification reports are persisted.
 */
import { db } from '../../config/database';

export interface VerificationReport {
  targetId: string;
  ageRange?: string;
  gender?: string;
  approved: boolean;
}

export async function submitVerificationReport(reporterId: string, report: VerificationReport) {
  const { rows } = await db.query(
    `INSERT INTO verification_reports (reporter_id, target_id, age_range, gender, approved)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
    [reporterId, report.targetId, report.ageRange ?? null, report.gender ?? null, report.approved],
  );
  return rows[0];
}

export async function getVerificationStatus(userId: string) {
  const { rows } = await db.query(
    `SELECT COUNT(*) FILTER (WHERE approved=TRUE)  AS approvals,
            COUNT(*) FILTER (WHERE approved=FALSE) AS rejections
     FROM verification_reports WHERE target_id=$1`,
    [userId],
  );
  return rows[0];
}
