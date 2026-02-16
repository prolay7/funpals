/**
 * rateLimiter.ts — Redis-backed rate limiter middleware.
 * No third-party service. Uses Redis INCR + EXPIRE sliding windows.
 *
 * @example
 * // 200 requests per 60 seconds per IP
 * router.use(rateLimit(200, 60));
 * // Stricter for auth: 10 per minute
 * authRouter.use(rateLimit(10, 60));
 */
import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';

/**
 * rateLimit — Factory returning Express middleware.
 * @param maxRequests   Maximum allowed requests in the window
 * @param windowSeconds Time window in seconds
 */
export function rateLimit(maxRequests: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const window = Math.floor(Date.now() / (windowSeconds * 1000));
    const key = `rl:${req.ip}:${window}`;
    try {
      const count = await redisClient.incr(key);
      if (count === 1) await redisClient.expire(key, windowSeconds);
      if (count > maxRequests) {
        res.status(429).json({ error: 'Too many requests, please slow down' });
        return;
      }
    } catch {
      // If Redis is down, fail open (do not block the request)
    }
    next();
  };
}
