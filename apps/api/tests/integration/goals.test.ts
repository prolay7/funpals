/**
 * goals.test.ts — Integration tests for goals CRUD endpoints.
 */
import request from 'supertest';
import app from '../../src/app';

let token: string;
let goalId: string;

beforeAll(async () => {
  const email = `goals.${Date.now()}@funpals.com`;
  const regRes = await request(app).post('/api/v1/auth/register').send({
    email, password: 'TestPass123!', username: `gls_${Date.now()}`, display_name: 'Goals Tester',
  });
  token = regRes.body.tokens.accessToken;
});

describe('POST /api/v1/goals', () => {
  it('creates a goal', async () => {
    const res = await request(app)
      .post('/api/v1/goals')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Read 30 minutes today' });
    expect(res.status).toBe(201);
    expect(res.body.data.description).toBe('Read 30 minutes today');
    goalId = res.body.data.id;
  });
});

describe('GET /api/v1/goals', () => {
  it('returns goals list', async () => {
    const res = await request(app)
      .get('/api/v1/goals')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('PATCH /api/v1/goals/:id', () => {
  it('marks goal as complete', async () => {
    const res = await request(app)
      .patch(`/api/v1/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ is_complete: true });
    expect(res.status).toBe(200);
    expect(res.body.data.is_complete).toBe(true);
  });
});

describe('DELETE /api/v1/goals/:id', () => {
  it('deletes the goal', async () => {
    const res = await request(app)
      .delete(`/api/v1/goals/${goalId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
