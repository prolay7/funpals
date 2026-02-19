import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../../middleware/validate';
import { rateLimit } from '../../middleware/rateLimiter';
import * as ctrl from './controller';

export const authRouter = Router();
const authLimit = rateLimit(10, 60); // 10 req/min on auth endpoints

authRouter.post('/register', authLimit,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('display_name').isLength({ min: 1, max: 60 }).trim(),
  validate, ctrl.register);

authRouter.post('/login', authLimit,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate, ctrl.login);

authRouter.post('/google', authLimit,
  body('id_token').notEmpty().withMessage('Google ID token is required'),
  validate, ctrl.googleSignIn);
authRouter.post('/refresh', ctrl.refresh);
authRouter.post('/logout', ctrl.logout);
