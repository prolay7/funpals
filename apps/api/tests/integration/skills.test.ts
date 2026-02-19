/**
 * skills.test.ts — Integration tests for skills CRUD endpoints.
 */
import request from 'supertest';
import app from '../../src/app';

let token: string;
let skillId: string;

beforeAll(async () => {
  const email = `skills.${Date.now()}@funpals.com`;
  const regRes = await request(app).post('/api/v1/auth/register').send({
    email, password: 'TestPass123!', username: `skl_${Date.now()}`, display_name: 'Skills Tester',
  });
  token = regRes.body.tokens.accessToken;
});

describe('POST /api/v1/skills', () => {
  it('creates a skill', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Chess', status: 'can_do', description: 'Love playing chess' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Chess');
    skillId = res.body.data.id;
  });

  it('returns 422 with missing name', async () => {
    const res = await request(app)
      .post('/api/v1/skills')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'can_do' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/skills', () => {
  it('returns user skills list', async () => {
    const res = await request(app)
      .get('/api/v1/skills')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('PUT /api/v1/skills/:id', () => {
  it('updates the skill status', async () => {
    const res = await request(app)
      .put(`/api/v1/skills/${skillId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'learning' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('learning');
  });
});

describe('DELETE /api/v1/skills/:id', () => {
  it('deletes the skill', async () => {
    const res = await request(app)
      .delete(`/api/v1/skills/${skillId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
