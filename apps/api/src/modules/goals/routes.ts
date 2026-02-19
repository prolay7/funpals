import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const goalRouter = Router();
goalRouter.use(authenticate);

goalRouter.get('/', ctrl.listGoals);
goalRouter.post('/',
  body('description').trim().isLength({ min: 1, max: 500 }), validate, ctrl.createGoal);
goalRouter.patch('/:id',
  body('is_complete').optional().isBoolean(),
  body('description').optional().trim().isLength({ min: 1, max: 500 }),
  validate, ctrl.updateGoal);
goalRouter.delete('/:id', ctrl.deleteGoal);
