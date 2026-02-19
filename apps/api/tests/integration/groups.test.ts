/**
 * groups.test.ts — Integration tests for groups endpoints.
 */
import request from 'supertest';
import app from '../../src/app';

let token: string;
let groupId: string;

beforeAll(async () => {
  const email = `groups.${Date.now()}@funpals.com`;
  const regRes = await request(app).post('/api/v1/auth/register').send({
    email, password: 'TestPass123!', username: `grp_${Date.now()}`, display_name: 'Groups Tester',
  });
  token = regRes.body.tokens.accessToken;
});

describe('POST /api/v1/groups', () => {
  it('creates a group', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Group', description: 'A test group', member_ids: [] });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test Group');
    groupId = res.body.data.id;
  });

  it('returns 422 without name', async () => {
    const res = await request(app)
      .post('/api/v1/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'No name' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/groups', () => {
  it('returns user groups', async () => {
    const res = await request(app)
      .get('/api/v1/groups')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/groups/public', () => {
  it('returns public groups', async () => {
    const res = await request(app)
      .get('/api/v1/groups/public')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/v1/groups/:id', () => {
  it('returns group details', async () => {
    const res = await request(app)
      .get(`/api/v1/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(groupId);
  });

  it('returns 404 for unknown group', async () => {
    const res = await request(app)
      .get('/api/v1/groups/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
