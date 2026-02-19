import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const skillRouter = Router();
skillRouter.use(authenticate);

skillRouter.get('/', ctrl.listSkills);
skillRouter.post('/',
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('status').optional().isIn(['can_do','learning','interested','not_interested']),
  validate, ctrl.createSkill);
skillRouter.put('/:id',
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('status').optional().isIn(['can_do','learning','interested','not_interested']),
  validate, ctrl.updateSkill);
skillRouter.delete('/:id', ctrl.deleteSkill);
