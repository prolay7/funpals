/**
 * materials/service.ts — Admin-fed materials (books, parks, libraries, trails).
 * User-facing: read-only listing + random selection for bubble display.
 */
import { db } from '../../config/database';
import { getCachedOrFetch } from '../../config/redis';

export async function listMaterials(category?: string) {
  const cacheKey = `materials:${category ?? 'all'}`;
  return getCachedOrFetch(cacheKey, 300, async () => {
    const { rows } = category
      ? await db.query(
          'SELECT * FROM materials WHERE is_active=TRUE AND category=$1 ORDER BY sort_order ASC, title ASC',
          [category],
        )
      : await db.query(
          'SELECT * FROM materials WHERE is_active=TRUE ORDER BY sort_order ASC, title ASC',
        );
    return rows;
  });
}

export async function getRandomMaterial() {
  const { rows } = await db.query(
    'SELECT * FROM materials WHERE is_active=TRUE ORDER BY RANDOM() LIMIT 1');
  return rows[0] ?? null;
}
