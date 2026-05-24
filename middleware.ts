import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { enforceApiRateLimit, getClientIpFromHeaders } from '@/lib/edge-rate-limit';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const ip = getClientIpFromHeaders(req.headers);
  const { limited, retryAfterSec } = await enforceApiRateLimit({
    pathname,
    ip,
    headers: req.headers,
  });

  if (limited) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec || 60) } },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
