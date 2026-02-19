import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './controller';

export const materialRouter = Router();
materialRouter.use(authenticate);

materialRouter.get('/', ctrl.listMaterials);
materialRouter.get('/random', ctrl.randomMaterial);
