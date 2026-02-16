import { Request, Response, NextFunction } from 'express';
import * as svc from './service';
export const list      = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listActivities(req.query.category as string) }); } catch (e) { next(e); } };
export const getRandom = async (req: Request, res: Response, next: NextFunction) => { try { const a = await svc.getRandomActivity(); a ? res.json({ data: a }) : res.status(404).json({ error: 'No activities' }); } catch (e) { next(e); } };
export const getById   = async (req: Request, res: Response, next: NextFunction) => { try { const a = await svc.getActivityById(req.params.id); a ? res.json({ data: a }) : res.status(404).json({ error: 'Not found' }); } catch (e) { next(e); } };
export const join      = async (req: Request, res: Response, next: NextFunction) => { try { await svc.joinActivity(req.user!.id, req.params.id); res.json({ success: true }); } catch (e) { next(e); } };
