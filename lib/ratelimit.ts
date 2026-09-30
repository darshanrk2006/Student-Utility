import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory fallback for local dev or when Upstash Redis is not yet configured
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    // Rate limit: 10 conversions per hour per IP
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "studenttoolkit:ratelimit",
    });
  } catch (err) {
    console.warn("Could not initialize Upstash Redis rate limiter:", err);
  }
}

export async function checkRateLimit(ip: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  // If Upstash Redis is configured, use it
  if (ratelimit) {
    try {
      const result = await ratelimit.limit(ip);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (err) {
      console.warn("Upstash rate limit check failed, falling back to memory store:", err);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const limit = 10;

  const entry = inMemoryStore.get(ip);
  if (!entry || entry.resetTime < now) {
    inMemoryStore.set(ip, { count: 1, resetTime: now + windowMs });
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  entry.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - entry.count,
    reset: entry.resetTime,
  };
}
