import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const listMaterials  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listMaterials(req.query.category as string | undefined) }); } catch (e) { next(e); } };
export const randomMaterial = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getRandomMaterial() }); } catch (e) { next(e); } };
