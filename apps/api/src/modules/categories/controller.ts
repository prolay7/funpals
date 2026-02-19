import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const listTop         = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listTopLevelCategories() }); } catch (e) { next(e); } };
export const getChildren     = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getChildren(req.params.id) }); } catch (e) { next(e); } };
export const toggleLiked     = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.toggleLikedCategory(req.user!.id, req.body.category_id) }); } catch (e) { next(e); } };
export const getUsersByCategory = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getUsersByCategory(req.params.id, Number(req.query.page) || 1) }); } catch (e) { next(e); } };
export const search          = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.searchCategories(String(req.query.q ?? '')) }); } catch (e) { next(e); } };
