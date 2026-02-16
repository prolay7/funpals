/**
 * auth.ts — JWT authentication middleware.
 * Verifies Bearer token, attaches { id, role } to req.user.
 * Used on all protected routes.
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload { userId: string; role: string }

declare global {
  namespace Express { interface Request { user?: { id: string; role: string } } }
}

/**
 * authenticate — Middleware that validates the JWT from Authorization header.
 * Returns 401 if token is missing, invalid, or expired.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing bearer token' });
    return;
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * requireAdmin — Middleware that ensures the authenticated user has admin role.
 * Must be used AFTER authenticate().
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}

/**
 * verifyToken — Pure function to validate a JWT string.
 * Used by WebSocket server for connection authentication.
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try { return jwt.verify(token, env.JWT_SECRET) as JwtPayload; }
  catch { return null; }
}
