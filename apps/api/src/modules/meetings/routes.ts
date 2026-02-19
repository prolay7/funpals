import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const meetingRouter = Router();
meetingRouter.use(authenticate);

meetingRouter.post('/invite',
  body('to_user_id').isUUID(),
  body('meeting_type').optional().isIn(['audio','video','google_meet']),
  validate, ctrl.invite);
meetingRouter.post('/private',
  body('to_user_id').isUUID(), validate, ctrl.privateMeeting);
meetingRouter.get('/live', ctrl.getLive);
meetingRouter.get('/:id/link', ctrl.getMeetingLink);
meetingRouter.post('/schedule',
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('starts_at').isISO8601(),
  validate, ctrl.schedule);
