import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const invite          = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.inviteToMeeting(req.user!.id, req.body.to_user_id, req.body.meeting_type) }); } catch (e) { next(e); } };
export const privateMeeting  = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.privateMeeting(req.user!.id, req.body.to_user_id) }); } catch (e) { next(e); } };
export const getLive         = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getLiveMeetings(Number(req.query.page) || 1) }); } catch (e) { next(e); } };
export const getMeetingLink  = async (req: Request, res: Response, next: NextFunction) => { try { res.json({ data: await svc.getMeetingLink(req.params.id, req.user!.id) }); } catch (e) { next(e); } };
export const schedule        = async (req: Request, res: Response, next: NextFunction) => { try { res.status(201).json({ data: await svc.scheduleMeeting(req.user!.id, req.body) }); } catch (e) { next(e); } };
