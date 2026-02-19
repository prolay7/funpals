/**
 * location/routes.ts — LocationIQ autocomplete and reverse geocoding proxy.
 * Keeps the API key server-side so it's never exposed to mobile clients.
 */
import { Router } from 'express';
import { query } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { env } from '../../config/env';

export const locationRouter = Router();
locationRouter.use(authenticate);

locationRouter.get('/suggestions',
  query('q').trim().isLength({ min: 2, max: 200 }),
  validate,
  async (req, res, next) => {
    try {
      const key = env.LOCATION_IQ_KEY;
      if (!key) { res.status(503).json({ error: 'Location service not configured' }); return; }
      const q = encodeURIComponent(String(req.query.q));
      const url = `https://api.locationiq.com/v1/autocomplete?key=${key}&q=${q}&format=json&limit=5`;
      const resp = await fetch(url);
      const data = await resp.json();
      res.json({ data });
    } catch (e) { next(e); }
  });
