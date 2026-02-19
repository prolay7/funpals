/**
 * nearby.test.ts — Integration tests for nearby and presence endpoints.
 */
import request from 'supertest';
import app from '../../src/app';

let token: string;

beforeAll(async () => {
  const email = `nearby.${Date.now()}@funpals.com`;
  const regRes = await request(app).post('/api/v1/auth/register').send({
    email, password: 'TestPass123!', username: `nbr_${Date.now()}`, display_name: 'Nearby Tester',
  });
  token = regRes.body.tokens.accessToken;
});

describe('PATCH /api/v1/nearby/location', () => {
  it('updates location successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/nearby/location')
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: 40.7128, lng: -74.0060 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 422 on invalid lat/lng', async () => {
    const res = await request(app)
      .patch('/api/v1/nearby/location')
      .set('Authorization', `Bearer ${token}`)
      .send({ lat: 999, lng: -74 });
    expect(res.status).toBe(422);
  });
});

describe('PATCH /api/v1/nearby/presence', () => {
  it('sets online status', async () => {
    const res = await request(app)
      .patch('/api/v1/nearby/presence')
      .set('Authorization', `Bearer ${token}`)
      .send({ is_online: true, available_call: true });
    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/nearby', () => {
  it('returns 422 without lat/lng', async () => {
    const res = await request(app)
      .get('/api/v1/nearby')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(422);
  });

  it('returns array of users with valid coords', async () => {
    const res = await request(app)
      .get('/api/v1/nearby?lat=40.7128&lng=-74.0060&radius=50')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
