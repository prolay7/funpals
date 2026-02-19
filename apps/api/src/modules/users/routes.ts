import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export const userRouter = Router();

userRouter.get('/me', authenticate, ctrl.getMe);
userRouter.patch('/me', authenticate,
  body('display_name').optional().isLength({ min: 1, max: 60 }).trim(),
  body('available_for').optional().isArray({ min: 1 }),
  body('expertise_level').optional().isInt({ min: 1, max: 5 }),
  validate, ctrl.updateMe);
userRouter.post('/me/photo', authenticate, upload.single('photo'), ctrl.uploadPhoto);
userRouter.get('/me/goal', authenticate, ctrl.getGoal);
userRouter.patch('/me/goal', authenticate,
  body('daily_goal').isLength({ max: 280 }).trim(), validate, ctrl.setGoal);
userRouter.get('/online', authenticate, ctrl.getOnlineUsers);
userRouter.get('/:id', authenticate, ctrl.getUserById);
