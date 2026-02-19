import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const favoriteRouter = Router();
favoriteRouter.use(authenticate);

favoriteRouter.post('/callers', body('user_id').isUUID(), validate, ctrl.toggleCaller);
favoriteRouter.get('/callers', ctrl.listCallers);
favoriteRouter.post('/groups', body('channel_id').isUUID(), validate, ctrl.toggleGroup);
favoriteRouter.get('/groups', ctrl.listGroups);
