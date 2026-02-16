import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const getNearby = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await svc.findNearbyUsers({
      lat: parseFloat(req.query.lat as string),
      lng: parseFloat(req.query.lng as string),
      radiusMiles: parseFloat((req.query.radius as string) ?? '25'),
      excludeUserId: req.user!.id,
    });
    res.json({ data: users });
  } catch (e) { next(e); }
};
export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
  try { await svc.updateUserLocation(req.user!.id, req.body.lat, req.body.lng); res.json({ success: true }); } catch (e) { next(e); }
};
export const updatePresence = async (req: Request, res: Response, next: NextFunction) => {
  try { await svc.updatePresence(req.user!.id, req.body); res.json({ success: true }); } catch (e) { next(e); }
};
