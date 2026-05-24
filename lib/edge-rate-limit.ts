import { checkRateLimit } from '@vercel/firewall';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type ApiRateLimitPath = '/api/place-thumbnail' | '/api/naver-static-map';

const LIMITS: Record<ApiRateLimitPath, number> = {
  '/api/place-thumbnail': 40,
  '/api/naver-static-map': 60,
};

/** Vercel Firewall 대시보드 @vercel/firewall 규칙 ID와 동일해야 함 */
const FIREWALL_RATE_LIMIT_IDS: Record<ApiRateLimitPath, string> = {
  '/api/place-thumbnail': 'ginit-share-place-thumbnail',
  '/api/naver-static-map': 'ginit-share-naver-static-map',
};

const WINDOW_MS = 60_000;

type MemBucket = { count: number; resetAt: number };
const memBuckets = new Map<string, MemBucket>();

let upstashByPath: Partial<Record<ApiRateLimitPath, Ratelimit>> | null = null;

function isApiRateLimitPath(pathname: string): pathname is ApiRateLimitPath {
  return pathname === '/api/place-thumbnail' || pathname === '/api/naver-static-map';
}

function getUpstashLimiters(): Partial<Record<ApiRateLimitPath, Ratelimit>> {
  if (upstashByPath !== null) return upstashByPath;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    upstashByPath = {};
    return upstashByPath;
  }
  const redis = new Redis({ url, token });
  upstashByPath = {
    '/api/place-thumbnail': new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS['/api/place-thumbnail'], '1 m'),
      prefix: 'ginit-share:place-thumbnail',
    }),
    '/api/naver-static-map': new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS['/api/naver-static-map'], '1 m'),
      prefix: 'ginit-share:naver-static-map',
    }),
  };
  return upstashByPath;
}

function checkMemory(key: string, limit: number): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let b = memBuckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + WINDOW_MS };
    memBuckets.set(key, b);
  }
  b.count += 1;
  if (b.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)) };
  }
  if (memBuckets.size > 20_000) {
    for (const [k, bucket] of memBuckets) {
      if (now >= bucket.resetAt) memBuckets.delete(k);
    }
  }
  return { ok: true };
}

async function checkVercelFirewall(
  pathname: ApiRateLimitPath,
  ip: string,
  headers: Headers,
): Promise<'ok' | 'limited' | 'skip'> {
  if (process.env.VERCEL !== '1') return 'skip';

  const rateLimitId = FIREWALL_RATE_LIMIT_IDS[pathname];
  try {
    const { rateLimited, error } = await checkRateLimit(rateLimitId, {
      headers,
      rateLimitKey: ip,
      firewallHostForDevelopment: process.env.VERCEL_FIREWALL_DEV_HOST?.trim() || undefined,
    });
    if (error === 'not-found') return 'skip';
    if (rateLimited) return 'limited';
    return 'ok';
  } catch {
    return 'skip';
  }
}

async function checkUpstash(pathname: ApiRateLimitPath, ip: string): Promise<'ok' | 'limited' | 'skip'> {
  const limiter = getUpstashLimiters()[pathname];
  if (!limiter) return 'skip';
  const { success } = await limiter.limit(ip);
  return success ? 'ok' : 'limited';
}

export function getClientIpFromHeaders(headers: Headers): string {
  const xf = headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'unknown';
}

/** WAF SDK → Upstash → 인메모리(로컬 폴백) */
export async function enforceApiRateLimit(opts: {
  pathname: string;
  ip: string;
  headers: Headers;
}): Promise<{ limited: boolean; retryAfterSec: number; source?: string }> {
  if (!isApiRateLimitPath(opts.pathname)) {
    return { limited: false, retryAfterSec: 0 };
  }

  const limit = LIMITS[opts.pathname];
  const key = `${opts.pathname}:${opts.ip}`;

  const fw = await checkVercelFirewall(opts.pathname, opts.ip, opts.headers);
  if (fw === 'limited') {
    return { limited: true, retryAfterSec: 60, source: 'vercel-firewall' };
  }

  const upstash = await checkUpstash(opts.pathname, opts.ip);
  if (upstash === 'limited') {
    return { limited: true, retryAfterSec: 60, source: 'upstash' };
  }

  if (fw === 'skip' && upstash === 'skip') {
    const mem = checkMemory(key, limit);
    if (!mem.ok) {
      return { limited: true, retryAfterSec: mem.retryAfterSec, source: 'memory' };
    }
  }

  return { limited: false, retryAfterSec: 0 };
}

export function rateLimitedJsonResponse(retryAfterSec: number): Response {
  return new Response(JSON.stringify({ error: 'rate_limited' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfterSec),
    },
  });
}
