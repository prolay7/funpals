import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';
export const questionRouter = Router();
questionRouter.use(authenticate);
questionRouter.get('/', ctrl.list);
questionRouter.post('/', body('question').isLength({min:1,max:500}), validate, ctrl.create);
