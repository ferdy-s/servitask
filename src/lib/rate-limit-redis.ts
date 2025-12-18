import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type Result =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export async function rateLimitRedis(
  key: string,
  limit: number,
  windowSec: number
): Promise<Result> {
  const now = Math.floor(Date.now() / 1000);
  const bucketKey = `rl:${key}`;
  const resetAtKey = `${bucketKey}:reset`;

  const resetAt = (await redis.get<number>(resetAtKey)) ?? 0;

  if (resetAt <= now) {
    await redis
      .multi()
      .set(bucketKey, 1)
      .set(resetAtKey, now + windowSec)
      .exec();

    return { ok: true, remaining: limit - 1 };
  }

  const count = (await redis.incr(bucketKey)) as number;

  if (count > limit) {
    return { ok: false, retryAfterSec: resetAt - now };
  }

  return { ok: true, remaining: limit - count };
}
