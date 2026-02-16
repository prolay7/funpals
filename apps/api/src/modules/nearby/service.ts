/**
 * nearby/service.ts — PostGIS-powered nearby user search.
 * Uses ST_DWithin for radius filter + ST_Distance for sorted results.
 * Results capped at 20 to prevent server overload on open-radius queries.
 */
import { db } from '../../config/database';
import { getCachedOrFetch } from '../../config/redis';
import { milesToMeters } from '../../utils/geoUtils';

export interface NearbyQuery { lat: number; lng: number; radiusMiles: number; excludeUserId: string }

/**
 * findNearbyUsers — Returns up to 20 users within the given radius.
 * Results cached in Redis for 30 seconds per unique query combination.
 */
export async function findNearbyUsers(q: NearbyQuery) {
  const cacheKey = `nearby:${Math.round(q.lat * 100)}:${Math.round(q.lng * 100)}:${q.radiusMiles}`;
  return getCachedOrFetch(cacheKey, 30, async () => {
    const { rows } = await db.query(
      `SELECT u.id, u.display_name, u.photo_url, u.username,
              up.age_range, up.gender, up.interests, up.available_for,
              op.is_online, op.is_on_call, op.available_call,
              ROUND((ST_Distance(
                up.location,
                ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
              ) / 1609.344)::NUMERIC, 1) AS distance_miles
       FROM users u
       JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN online_presence op ON u.id = op.user_id
       WHERE u.id != $3
         AND u.deleted_at IS NULL
         AND up.location IS NOT NULL
         AND ST_DWithin(
               up.location,
               ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
               $4)
       ORDER BY distance_miles ASC
       LIMIT 20`,
      [q.lat, q.lng, q.excludeUserId, milesToMeters(q.radiusMiles)],
    );
    return rows;
  });
}

export async function updateUserLocation(userId: string, lat: number, lng: number): Promise<void> {
  await db.query(
    `UPDATE user_profiles
     SET location = ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography, updated_at = NOW()
     WHERE user_id = $3`,
    [lat, lng, userId],
  );
}

export async function updatePresence(userId: string, presence: Partial<{ is_online: boolean; is_on_call: boolean; available_call: boolean }>): Promise<void> {
  const fields = Object.keys(presence).map((k, i) => `${k} = $${i + 2}`).join(', ');
  if (!fields) return;
  await db.query(
    `INSERT INTO online_presence (user_id, ${Object.keys(presence).join(', ')}, last_seen)
     VALUES ($1, ${Object.keys(presence).map((_, i) => `$${i + 2}`).join(', ')}, NOW())
     ON CONFLICT (user_id) DO UPDATE SET ${fields}, last_seen = NOW()`,
    [userId, ...Object.values(presence)],
  );
}
