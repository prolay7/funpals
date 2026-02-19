import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './controller';

export const categoryRouter = Router();
categoryRouter.use(authenticate);

categoryRouter.get('/', ctrl.listTop);
categoryRouter.get('/search', query('q').trim().isLength({ min: 1 }), validate, ctrl.search);
categoryRouter.get('/:id/children', ctrl.getChildren);
categoryRouter.get('/:id/users', ctrl.getUsersByCategory);
categoryRouter.post('/liked', body('category_id').isUUID(), validate, ctrl.toggleLiked);
