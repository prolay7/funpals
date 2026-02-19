/**
 * search.test.ts — Integration tests for global search endpoint.
 */
import request from 'supertest';
import app from '../../src/app';

let token: string;

beforeAll(async () => {
  const email = `search.${Date.now()}@funpals.com`;
  const regRes = await request(app).post('/api/v1/auth/register').send({
    email, password: 'TestPass123!', username: `srch_${Date.now()}`, display_name: 'Search Tester',
  });
  token = regRes.body.tokens.accessToken;
});

describe('GET /api/v1/search', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/search?q=chess');
    expect(res.status).toBe(401);
  });

  it('returns 422 without query param', async () => {
    const res = await request(app)
      .get('/api/v1/search')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(422);
  });

  it('returns search results for all types', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=test&type=all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('users');
    expect(res.body.data).toHaveProperty('activities');
  });

  it('returns only users when type=users', async () => {
    const res = await request(app)
      .get('/api/v1/search?q=test&type=users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('users');
  });
});
