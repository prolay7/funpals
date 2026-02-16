/**
 * auth.test.ts — Integration tests for all authentication endpoints.
 */
import request from 'supertest';
import app from '../../src/app';

const testUser = {
  email:        `test.${Date.now()}@funpals.com`,
  password:     'TestPass123!',
  username:     `user_${Date.now()}`,
  display_name: 'Test User',
};

describe('POST /api/v1/auth/register', () => {
  it('creates a new user and returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('tokens.accessToken');
    expect(res.body).toHaveProperty('tokens.refreshToken');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('returns 409 on duplicate email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('returns 422 on invalid email', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ ...testUser, email: 'bad-email' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('returns tokens on valid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.tokens.accessToken).toMatch(/^eyJ/);
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: 'wrong' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/users/me', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });

  it('returns profile with valid token', async () => {
    const loginRes = await request(app).post('/api/v1/auth/login').send({ email: testUser.email, password: testUser.password });
    const token = loginRes.body.tokens.accessToken;
    const res = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email', testUser.email);
  });
});

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
