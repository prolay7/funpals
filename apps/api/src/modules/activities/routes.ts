import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './controller';
export const activityRouter = Router();
activityRouter.use(authenticate);
activityRouter.get('/', ctrl.list);
activityRouter.get('/random', ctrl.getRandom);
activityRouter.get('/:id', ctrl.getById);
activityRouter.post('/:id/join', ctrl.join);
