/**
 * pagination.ts — Keyset (cursor-based) pagination helpers.
 * Avoids expensive OFFSET scans on large tables.
 * @example
 *   const { sql, params } = buildCursorQuery('messages', 'created_at', cursor, 20);
 */
export interface PaginationResult<T> { data: T[]; nextCursor: string | null; hasMore: boolean }

export function buildCursorClause(cursor?: string): string {
  return cursor ? `AND id < $CURSOR_PLACEHOLDER` : '';
}

export function parsePaginationQuery(query: Record<string, unknown>): { limit: number; cursor?: string } {
  const limit = Math.min(Number(query.limit) || 20, 100);
  const cursor = typeof query.cursor === 'string' ? query.cursor : undefined;
  return { limit, cursor };
}
