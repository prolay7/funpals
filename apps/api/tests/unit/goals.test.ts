/**
 * goals.test.ts — Unit tests for goals service.
 */
import { ApiError } from '../../src/middleware/errorHandler';

const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import * as goalsSvc from '../../src/modules/goals/service';

beforeEach(() => { mockQuery.mockReset(); });

describe('createGoal', () => {
  it('inserts and returns goal', async () => {
    const goal = { id: 'g1', description: 'Learn React', is_complete: false };
    mockQuery.mockResolvedValueOnce({ rows: [goal] });
    const result = await goalsSvc.createGoal('uid', 'Learn React');
    expect(result.description).toBe('Learn React');
  });
});

describe('updateGoal', () => {
  it('throws 404 if goal does not belong to user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await expect(goalsSvc.updateGoal('g1', 'uid', { is_complete: true })).rejects.toThrow(ApiError);
  });

  it('updates goal and returns new value', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'g1' }] }); // existence check
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'g1', is_complete: true }] }); // update
    const result = await goalsSvc.updateGoal('g1', 'uid', { is_complete: true });
    expect(result.is_complete).toBe(true);
  });
});

describe('listGoals', () => {
  it('returns all goals for user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'g1' }, { id: 'g2' }] });
    const result = await goalsSvc.listGoals('uid');
    expect(result).toHaveLength(2);
  });
});
