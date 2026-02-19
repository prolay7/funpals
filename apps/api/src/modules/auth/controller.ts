/**
 * auth/controller.ts — Express route handlers for authentication.
 */
import { Request, Response, NextFunction } from 'express';
import * as svc from './service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.registerUser(req.body);
    res.status(201).json(result);
  } catch (e) { next(e); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await svc.loginUser(req.body)); } catch (e) { next(e); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    res.json(await svc.refreshTokens(refreshToken));
  } catch (e) { next(e); }
};

export const googleSignIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await svc.googleSignIn(req.body.id_token);
    res.status(result.isNew ? 201 : 200).json(result);
  } catch (e) { next(e); }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await svc.revokeRefreshToken(refreshToken);
    res.json({ message: 'Logged out successfully' });
  } catch (e) { next(e); }
};
