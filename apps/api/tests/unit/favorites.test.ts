/**
 * favorites.test.ts — Unit tests for favorites service.
 */
const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import * as favSvc from '../../src/modules/favorites/service';

beforeEach(() => { mockQuery.mockReset(); });

describe('toggleFavoriteCaller', () => {
  it('adds when not already favorited', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });   // check: not exists
    mockQuery.mockResolvedValueOnce({ rows: [] });   // insert
    const result = await favSvc.toggleFavoriteCaller('uid', 'target');
    expect(result.favorited).toBe(true);
  });

  it('removes when already favorited', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ 1: 1 }] }); // check: exists
    mockQuery.mockResolvedValueOnce({ rows: [] });           // delete
    const result = await favSvc.toggleFavoriteCaller('uid', 'target');
    expect(result.favorited).toBe(false);
  });
});

describe('toggleFavoriteGroup', () => {
  it('adds group when not favorited', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await favSvc.toggleFavoriteGroup('uid', 'channel-1');
    expect(result.favorited).toBe(true);
  });
});
