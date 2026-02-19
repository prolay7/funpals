import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const submitReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await svc.submitVerificationReport(req.user!.id, {
      targetId: req.body.target_id,
      ageRange: req.body.age_range,
      gender: req.body.gender,
      approved: Boolean(req.body.approved),
    });
    res.status(201).json({ data });
  } catch (e) { next(e); }
};

// Verification photos are ephemeral — handled via WebSocket, not stored.
// This endpoint acknowledges the intent and returns instructions.
export const uploadPhotos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({
      message: 'Send verification photos via the WebSocket connection using type: "verification_photo"',
    });
  } catch (e) { next(e); }
};
