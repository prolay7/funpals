/**
 * redis.ts — ioredis client configuration.
 * Exports separate publisher and subscriber instances
 * (required because a subscribed Redis connection cannot send commands).
 */
import Redis from 'ioredis';
import { env } from './env';

const makeClient = (name: string) => {
  const client = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 3 });
  client.on('error', (err) => console.error(`Redis [${name}] error:`, err));
  client.on('connect', () => console.log(`Redis [${name}] connected`));
  return client;
};

/** General-purpose Redis client (get/set/del/etc.) */
export const redisClient = makeClient('main');

/** Dedicated publisher instance (cannot be subscribed) */
export const redisPublisher = makeClient('publisher');

/** Dedicated subscriber instance */
export const redisSubscriber = makeClient('subscriber');

/** Generic cache-aside helper with TTL */
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached) as T;
  const fresh = await fetcher();
  await redisClient.setex(key, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}

/** Invalidate all keys matching a glob pattern */
export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redisClient.keys(pattern);
  if (keys.length) await redisClient.del(...keys);
}
