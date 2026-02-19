import { Router } from 'express';
import { query } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const searchRouter = Router();
searchRouter.use(authenticate);

searchRouter.get('/',
  query('q').trim().isLength({ min: 1, max: 200 }),
  query('type').optional().isIn(['users','skills','posts','groups','meetings','categories','activities','all']),
  validate, ctrl.search);
