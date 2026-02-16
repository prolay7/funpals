import { Request, Response, NextFunction } from 'express';
import * as svc from './service';
export const list        = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listNotifications(req.user!.id) }); } catch (e) { next(e); } };
export const markAllRead = async (req: Request, res: Response, next: NextFunction) => { try { await svc.markAllRead(req.user!.id); res.json({ success: true }); } catch (e) { next(e); } };
