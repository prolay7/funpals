import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q ?? '').trim();
    if (!q) { res.json({ data: {} }); return; }
    const type = (req.query.type as string) ?? 'all';
    res.json({ data: await svc.globalSearch(q, req.user!.id, type as any) });
  } catch (e) { next(e); }
};
