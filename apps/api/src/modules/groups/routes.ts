import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const groupRouter = Router();
groupRouter.use(authenticate);

groupRouter.post('/', body('name').trim().isLength({ min: 1, max: 100 }), validate, ctrl.createGroup);
groupRouter.get('/', ctrl.listMyGroups);
groupRouter.get('/public', ctrl.listPublic);
groupRouter.get('/:id', ctrl.getGroup);
groupRouter.patch('/:id', ctrl.updateGroup);
groupRouter.post('/:id/join', ctrl.joinGroup);
groupRouter.delete('/:id/leave', ctrl.leaveGroup);
groupRouter.post('/:id/instant-call', ctrl.instantCall);
groupRouter.patch('/:id/join-call', ctrl.joinCall);
groupRouter.get('/:id/live-meetings', ctrl.liveMeetings);
