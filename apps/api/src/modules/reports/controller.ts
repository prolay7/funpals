import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const report = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.reportUser(req.user!.id, req.body.reported_id, req.body.reason);
    res.status(201).json({ data });
  } catch (e) { next(e); }
};
