import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const toggleCaller    = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.toggleFavoriteCaller(req.user!.id, req.body.user_id) }); } catch (e) { next(e); } };
export const listCallers     = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listFavoriteCallers(req.user!.id) }); } catch (e) { next(e); } };
export const toggleGroup     = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.toggleFavoriteGroup(req.user!.id, req.body.channel_id) }); } catch (e) { next(e); } };
export const listGroups      = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listFavoriteGroups(req.user!.id) }); } catch (e) { next(e); } };
