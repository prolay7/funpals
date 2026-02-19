import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const listGoals  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listGoals(req.user!.id) }); } catch (e) { next(e); } };
export const createGoal = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.createGoal(req.user!.id, req.body.description) }); } catch (e) { next(e); } };
export const updateGoal = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.updateGoal(req.params.id, req.user!.id, req.body) }); } catch (e) { next(e); } };
export const deleteGoal = async (req: Request, res: Response, next: NextFunction) => { try { await svc.deleteGoal(req.params.id, req.user!.id); res.json({ success: true }); } catch (e) { next(e); } };
