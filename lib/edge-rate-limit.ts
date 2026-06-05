import { checkRateLimit } from '@vercel/firewall';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export type ApiRateLimitPath =
  | '/api/place-thumbnail'
  | '/api/naver-static-map'
  | '/api/share/guest-get'
  | '/api/share/join'
  | '/api/share/leave'
  | '/api/share/request'
  | '/api/friend-invite/guest-get';

const LIMITS: Record<ApiRateLimitPath, number> = {
  '/api/place-thumbnail': 40,
  '/api/naver-static-map': 60,
  '/api/share/guest-get': 60,
  '/api/friend-invite/guest-get': 30,
  '/api/share/join': 20,
  '/api/share/leave': 20,
  '/api/share/request': 20,
};

/** path별 규칙 없는 `/api/*` (home-og 등) */
const API_FALLBACK_LIMIT = 120;
const API_FALLBACK_KEY = '/api/__fallback__';

/** Vercel Firewall 대시보드 @vercel/firewall 규칙 ID와 동일해야 함 */
const FIREWALL_RATE_LIMIT_IDS: Partial<Record<ApiRateLimitPath, string>> = {
  '/api/place-thumbnail': 'ginit-share-place-thumbnail',
  '/api/naver-static-map': 'ginit-share-naver-static-map',
};

const WINDOW_MS = 60_000;

type MemBucket = { count: number; resetAt: number };
const memBuckets = new Map<string, MemBucket>();

/** env 없을 때 `{}` 를 영구 캐시하지 않음 (env 추가 후 재배포 전 인스턴스 대비) */
let upstashByPath: Partial<Record<ApiRateLimitPath, Ratelimit>> | undefined;
let upstashFallbackLimiter: Ratelimit | null | undefined;

function isApiRateLimitPath(pathname: string): pathname is ApiRateLimitPath {
  return Object.prototype.hasOwnProperty.call(LIMITS, pathname);
}

type ResolvedRateLimit = {
  bucket: ApiRateLimitPath | typeof API_FALLBACK_KEY;
  limit: number;
  useVercelFirewall: boolean;
};

function resolveRateLimit(pathname: string): ResolvedRateLimit | null {
  if (isApiRateLimitPath(pathname)) {
    return { bucket: pathname, limit: LIMITS[pathname], useVercelFirewall: true };
  }
  if (pathname.startsWith('/api/')) {
    return { bucket: API_FALLBACK_KEY, limit: API_FALLBACK_LIMIT, useVercelFirewall: false };
  }
  return null;
}

function upstashPrefixForPath(pathname: ApiRateLimitPath): string {
  return `ginit-share:${pathname.replace(/^\/api\//, '').replace(/\//g, '-')}`;
}

function getUpstashLimiters(): Partial<Record<ApiRateLimitPath, Ratelimit>> {
  if (upstashByPath) return upstashByPath;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    return {};
  }
  const redis = new Redis({ url, token });
  const limiters = {} as Partial<Record<ApiRateLimitPath, Ratelimit>>;
  for (const pathname of Object.keys(LIMITS) as ApiRateLimitPath[]) {
    limiters[pathname] = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS[pathname], '1 m'),
      prefix: upstashPrefixForPath(pathname),
    });
  }
  upstashByPath = limiters;
  return upstashByPath;
}

function getUpstashFallbackLimiter(): Ratelimit | undefined {
  if (upstashFallbackLimiter !== undefined) {
    return upstashFallbackLimiter ?? undefined;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    upstashFallbackLimiter = null;
    return undefined;
  }
  const redis = new Redis({ url, token });
  upstashFallbackLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(API_FALLBACK_LIMIT, '1 m'),
    prefix: 'ginit-share:api-fallback',
  });
  return upstashFallbackLimiter;
}

function getUpstashLimiter(bucket: ApiRateLimitPath | typeof API_FALLBACK_KEY): Ratelimit | undefined {
  if (bucket === API_FALLBACK_KEY) return getUpstashFallbackLimiter();
  return getUpstashLimiters()[bucket];
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
  const rateLimitId = FIREWALL_RATE_LIMIT_IDS[pathname];
  if (!rateLimitId || process.env.VERCEL !== '1') return 'skip';

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

async function checkUpstash(
  bucket: ApiRateLimitPath | typeof API_FALLBACK_KEY,
  ip: string,
): Promise<'ok' | 'limited' | 'skip'> {
  const limiter = bucket === API_FALLBACK_KEY ? getUpstashLimiter(bucket) : getUpstashLimiters()[bucket];
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
  const resolved = resolveRateLimit(opts.pathname);
  if (!resolved) {
    return { limited: false, retryAfterSec: 0 };
  }

  const { bucket, limit, useVercelFirewall } = resolved;
  const key = `${bucket}:${opts.ip}`;

  if (useVercelFirewall && isApiRateLimitPath(bucket)) {
    const fw = await checkVercelFirewall(bucket, opts.ip, opts.headers);
    if (fw === 'limited') {
      return { limited: true, retryAfterSec: 60, source: 'vercel-firewall' };
    }
    const upstash = await checkUpstash(bucket, opts.ip);
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

  const upstash = await checkUpstash(bucket, opts.ip);
  if (upstash === 'limited') {
    return { limited: true, retryAfterSec: 60, source: 'upstash' };
  }
  if (upstash === 'skip') {
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
