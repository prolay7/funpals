import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const createGroup   = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.createGroup(req.user!.id, req.body.name, req.body.description, req.body.member_ids ?? []) }); } catch (e) { next(e); } };
export const listMyGroups  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listMyGroups(req.user!.id) }); } catch (e) { next(e); } };
export const listPublic    = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.listPublicGroups(Number(req.query.page) || 1) }); } catch (e) { next(e); } };
export const getGroup      = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getGroupById(req.params.id) }); } catch (e) { next(e); } };
export const updateGroup   = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.updateGroup(req.params.id, req.user!.id, req.body) }); } catch (e) { next(e); } };
export const joinGroup     = async (req: Request, res: Response, next: NextFunction) => { try { await svc.joinGroup(req.params.id, req.user!.id); res.json({ success: true }); } catch (e) { next(e); } };
export const leaveGroup    = async (req: Request, res: Response, next: NextFunction) => { try { await svc.leaveGroup(req.params.id, req.user!.id); res.json({ success: true }); } catch (e) { next(e); } };
export const instantCall   = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.createInstantCall(req.params.id, req.user!.id) }); } catch (e) { next(e); } };
export const joinCall      = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.joinCall(req.params.id, req.user!.id) }); } catch (e) { next(e); } };
export const liveMeetings  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getLiveMeetings(req.params.id) }); } catch (e) { next(e); } };
