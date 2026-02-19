/**
 * skills.test.ts — Unit tests for skills service.
 * DB calls are mocked via jest.mock so no real DB is needed.
 */
import { ApiError } from '../../src/middleware/errorHandler';

const mockQuery = jest.fn();
jest.mock('../../src/config/database', () => ({
  db: { query: (...args: unknown[]) => mockQuery(...args) },
}));

import * as skillsSvc from '../../src/modules/skills/service';

beforeEach(() => { mockQuery.mockReset(); });

describe('listSkills', () => {
  it('returns rows for the user', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: '1', name: 'Chess', status: 'can_do' }] });
    const result = await skillsSvc.listSkills('user-uuid');
    expect(result).toHaveLength(1);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('user_skills'), ['user-uuid']);
  });
});

describe('createSkill', () => {
  it('inserts and returns new skill', async () => {
    const skill = { id: 'skill-1', name: 'Cooking', status: 'learning' };
    mockQuery.mockResolvedValueOnce({ rows: [skill] });
    const result = await skillsSvc.createSkill('uid', 'Cooking', undefined, 'learning');
    expect(result).toEqual(skill);
  });
});

describe('deleteSkill', () => {
  it('throws 404 when skill not found', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });
    await expect(skillsSvc.deleteSkill('bad-id', 'uid')).rejects.toThrow(ApiError);
  });

  it('deletes without error when skill exists', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    await expect(skillsSvc.deleteSkill('good-id', 'uid')).resolves.toBeUndefined();
  });
});
