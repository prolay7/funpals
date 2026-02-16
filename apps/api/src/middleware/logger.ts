/**
 * logger.ts — Winston structured logger + Express request logging middleware.
 * Outputs JSON in production, pretty-printed in development.
 */
import winston from 'winston';
import { Request, Response, NextFunction } from 'express';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(winston.format.colorize(), winston.format.simple()),
  transports: [new winston.transports.Console()],
});

/** Express middleware to log every incoming request */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({ method: req.method, url: req.originalUrl, status: res.statusCode, ms: Date.now() - start });
  });
  next();
}
