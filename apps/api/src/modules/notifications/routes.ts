import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './controller';
export const notifRouter = Router();
notifRouter.use(authenticate);
notifRouter.get('/', ctrl.list);
notifRouter.patch('/read-all', ctrl.markAllRead);
