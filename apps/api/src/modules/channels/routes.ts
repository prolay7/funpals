import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const channelRouter = Router();
channelRouter.use(authenticate);

channelRouter.get('/', ctrl.listChannels);
channelRouter.post('/', body('name').isLength({ min: 1, max: 80 }).trim(), validate, ctrl.createChannel);
channelRouter.get('/:id', ctrl.getChannel);
channelRouter.post('/:id/join', ctrl.joinChannel);
channelRouter.delete('/:id/leave', ctrl.leaveChannel);
channelRouter.post('/:id/favorite', ctrl.toggleFavorite);
channelRouter.get('/:id/messages', query('limit').optional().isInt({ min: 1, max: 100 }), validate, ctrl.getMessages);
