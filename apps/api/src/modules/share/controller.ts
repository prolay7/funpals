import { Request, Response, NextFunction } from 'express';
import * as svc from './service';
export const shareInternal = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.shareInternal(req.user!.id, req.body.channel_id, req.body.content, req.body.category) }); } catch (e) { next(e); } };
export const getGlobalFeed = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getGlobalFeed(req.query.category as string, req.query.cursor as string) }); } catch (e) { next(e); } };
export const shareGlobal   = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.shareGlobal(req.user!.id, req.body.content, req.body.category) }); } catch (e) { next(e); } };
