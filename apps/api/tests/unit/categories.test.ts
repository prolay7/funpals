/**
 * categories.test.ts — Unit tests for categories service.
 */
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import * as catSvc from '../../src/modules/categories/service';

beforeEach(() => { mockQuery.mockReset(); });

describe('listTopLevelCategories', () => {
  it('returns top-level categories', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'c1', name: 'Sports', parent_id: null }] });
    const result = await catSvc.listTopLevelCategories();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Sports');
  });
});

describe('searchCategories', () => {
  it('queries with ILIKE pattern', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await catSvc.searchCategories('sport');
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('ILIKE'), ['%sport%']);
  });
});

describe('toggleLikedCategory', () => {
  it('adds when not liked', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await catSvc.toggleLikedCategory('uid', 'cat-1');
    expect(result.liked).toBe(true);
  });

  it('removes when already liked', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ 1: 1 }] });
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await catSvc.toggleLikedCategory('uid', 'cat-1');
    expect(result.liked).toBe(false);
  });
});
