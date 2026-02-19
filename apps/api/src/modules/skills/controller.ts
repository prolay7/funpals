import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const listSkills  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listSkills(req.user!.id) }); } catch (e) { next(e); } };
export const createSkill = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.createSkill(req.user!.id, req.body.name, req.body.description, req.body.status) }); } catch (e) { next(e); } };
export const updateSkill = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.updateSkill(req.params.id, req.user!.id, req.body) }); } catch (e) { next(e); } };
export const deleteSkill = async (req: Request, res: Response, next: NextFunction) => { try { await svc.deleteSkill(req.params.id, req.user!.id); res.json({ success: true }); } catch (e) { next(e); } };
