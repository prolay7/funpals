/**
 * errorHandler.ts — Global Express error handling middleware.
 * Must be the last middleware registered in app.ts.
 * Logs errors and returns consistent JSON error responses.
 */
import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorHandler(
  err: Error, req: Request, res: Response, _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  logger.error({ err, url: req.url, method: req.method }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
