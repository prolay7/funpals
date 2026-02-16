import { Request, Response, NextFunction } from 'express';
import * as svc from './service';
export const list   = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listQuestions(req.query.cursor as string) }); } catch (e) { next(e); } };
export const create = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.createQuestion(req.user!.id, req.body) }); } catch (e) { next(e); } };
