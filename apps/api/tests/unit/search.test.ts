/**
 * search.test.ts — Unit tests for global search service.
 */
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import * as searchSvc from '../../src/modules/search/service';

beforeEach(() => { mockQuery.mockReset(); });

describe('globalSearch', () => {
  it('returns empty result for empty query', async () => {
    // Mock all parallel queries returning empty
    mockQuery.mockResolvedValue({ rows: [] });
    const result = await searchSvc.globalSearch('chess', 'uid', 'all');
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('activities');
  });

  it('returns only users when type=users', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'u1', display_name: 'Alice' }] });
    const result = await searchSvc.globalSearch('alice', 'uid', 'users');
    expect(result).toHaveProperty('users');
    expect(result).not.toHaveProperty('posts');
  });
});
