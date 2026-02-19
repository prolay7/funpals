import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await svc.getUserProfile(req.user!.id) }); } catch (e) { next(e); }
};
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await svc.updateUserProfile(req.user!.id, req.body) }); } catch (e) { next(e); }
};
export const uploadPhoto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }
    const url = await svc.saveProfilePhoto(req.user!.id, req.file.buffer, req.file.mimetype);
    res.json({ data: { photo_url: url } });
  } catch (e) { next(e); }
};
export const getGoal = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await svc.getTodaysGoal(req.user!.id) }); } catch (e) { next(e); }
};
export const setGoal = async (req: Request, res: Response, next: NextFunction) => {
  try { await svc.setTodaysGoal(req.user!.id, req.body.daily_goal); res.json({ success: true }); } catch (e) { next(e); }
};
export const getOnlineUsers = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json({ data: await svc.listOnlineUsers() }); } catch (e) { next(e); }
};
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await svc.getUserProfile(req.params.id);
    if (!profile) { res.status(404).json({ error: 'User not found' }); return; }
    res.json({ data: profile });
  } catch (e) { next(e); }
};
