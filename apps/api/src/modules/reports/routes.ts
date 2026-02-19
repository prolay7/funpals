import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const reportRouter = Router();
reportRouter.use(authenticate);

reportRouter.post('/',
  body('reported_id').isUUID(),
  body('reason').trim().isLength({ min: 1, max: 500 }),
  validate, ctrl.report);
