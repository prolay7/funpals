import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';
export const postRouter = Router();
postRouter.use(authenticate);
postRouter.get('/', ctrl.list);
postRouter.post('/', body('title').isLength({min:1,max:120}), body('content').isLength({min:1,max:2000}), validate, ctrl.create);
