import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_WINDOW_MS = 60_000;
const API_LIMITS: Record<string, number> = {
  '/api/place-thumbnail': 40,
  '/api/naver-static-map': 60,
};

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientIp(req: NextRequest): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) {
    const first = xf.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

function checkApiRateLimit(key: string, limit: number): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + API_WINDOW_MS };
    buckets.set(key, b);
  }
  b.count += 1;
  if (buckets.size > 20_000) {
    for (const [k, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(k);
    }
  }
  return b.count <= limit;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const limit = API_LIMITS[pathname];
  if (limit) {
    const ip = clientIp(req);
    const ok = checkApiRateLimit(`${pathname}:${ip}`, limit);
    if (!ok) {
      return NextResponse.json(
        { error: 'rate_limited' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
