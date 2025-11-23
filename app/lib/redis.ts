import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

const globalForRedis = global as unknown as {
  redisClient?: Redis;
};

function getRedisClient() {
  if (!redisUrl) {
    throw new Error("REDIS_URL is not configured.");
  }

  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
    });
  }

  return globalForRedis.redisClient;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const redis = getRedisClient();
  const windowKey = `ratelimit:${key}:${Math.floor(Date.now() / (windowSeconds * 1000))}`;

  const current = await redis.incr(windowKey);
  if (current === 1) {
    await redis.expire(windowKey, windowSeconds);
  }

  const ttl = await redis.ttl(windowKey);

  return {
    allowed: current <= limit,
    remaining: Math.max(limit - current, 0),
    retryAfter: ttl >= 0 ? ttl : windowSeconds,
  };
}

export async function getCachedString(key: string) {
  const redis = getRedisClient();
  const value = await redis.get(key);
  return value ?? null;
}

export async function setCachedString(
  key: string,
  value: string,
  ttlSeconds: number,
) {
  const redis = getRedisClient();
  await redis.set(key, value, "EX", ttlSeconds);
}
