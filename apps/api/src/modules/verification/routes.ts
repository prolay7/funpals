import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const verificationRouter = Router();
verificationRouter.use(authenticate);

verificationRouter.post('/',
  body('target_id').isUUID(),
  body('approved').isBoolean(),
  validate, ctrl.submitReport);
verificationRouter.post('/photos', ctrl.uploadPhotos);
