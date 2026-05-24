import { NextResponse } from 'next/server';

import { assertValidShareToken, normalizeShareToken } from '@/lib/share-token-server';

function asNum(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const shareToken = normalizeShareToken(
      url.searchParams.get('shareToken') ?? url.searchParams.get('token') ?? req.headers.get('x-ginit-share-token'),
    );
    if (!shareToken) {
      return NextResponse.json({ error: 'share_token_required' }, { status: 401 });
    }
    await assertValidShareToken(shareToken);

    const lat = asNum(url.searchParams.get('lat'));
    const lng = asNum(url.searchParams.get('lng'));
    if (lat == null || lng == null) {
      return NextResponse.json({ error: 'lat_lng_required' }, { status: 400 });
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'invalid_coordinates' }, { status: 400 });
    }

    const keyId = process.env.NAVER_LOCAL_CLIENT_ID?.trim() || '';
    const keySecret = process.env.NAVER_LOCAL_CLIENT_SECRET?.trim() || '';
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
    }

    const w = Math.min(800, Math.max(240, Number(url.searchParams.get('w') ?? 640)));
    const h = Math.min(800, Math.max(200, Number(url.searchParams.get('h') ?? 440)));
    const level = Math.min(20, Math.max(6, Number(url.searchParams.get('level') ?? 16)));

    const base = 'https://maps.apigw.ntruss.com/map-static/v2/raster';
    const marker = `type:d|size:mid|pos:${lng} ${lat}|color:0x4C1D95`;
    const qs = new URLSearchParams({
      w: String(w),
      h: String(h),
      center: `${lng},${lat}`,
      level: String(level),
      format: 'png',
      scale: '2',
      markers: marker,
    });

    const upstream = `${base}?${qs.toString()}`;
    const res = await fetch(upstream, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': keyId,
        'X-NCP-APIGW-API-KEY': keySecret,
      },
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'upstream_failed' }, { status: 502 });
    }

    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown_error';
    if (msg === 'invalid_share_token' || msg === 'share_token_required') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (msg === 'rate_limited') {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': '60' } });
    }
    return NextResponse.json({ error: 'request_failed' }, { status: 500 });
  }
}
