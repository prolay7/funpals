import { Router } from 'express';
import { query, body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const nearbyRouter = Router();
nearbyRouter.use(authenticate);

nearbyRouter.get('/',
  query('lat').isFloat({ min: -90, max: 90 }),
  query('lng').isFloat({ min: -180, max: 180 }),
  query('radius').optional().isFloat({ min: 0.1 }),
  validate, ctrl.getNearby);
nearbyRouter.patch('/location',
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
  validate, ctrl.updateLocation);
nearbyRouter.patch('/presence',
  body('is_online').optional().isBoolean(),
  body('is_on_call').optional().isBoolean(),
  body('available_call').optional().isBoolean(),
  validate, ctrl.updatePresence);
