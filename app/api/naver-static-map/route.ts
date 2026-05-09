import { NextResponse } from 'next/server';

function asNum(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const lat = asNum(url.searchParams.get('lat'));
    const lng = asNum(url.searchParams.get('lng'));
    if (lat == null || lng == null) {
      return NextResponse.json({ error: 'lat/lng required' }, { status: 400 });
    }

    const keyId = process.env.NAVER_LOCAL_CLIENT_ID?.trim() || '';
    const keySecret = process.env.NAVER_LOCAL_CLIENT_SECRET?.trim() || '';
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'NAVER_LOCAL_CLIENT_ID / NAVER_LOCAL_CLIENT_SECRET required' },
        { status: 400 },
      );
    }

    const w = Math.min(800, Math.max(240, Number(url.searchParams.get('w') ?? 640)));
    const h = Math.min(800, Math.max(200, Number(url.searchParams.get('h') ?? 440)));
    const level = Math.min(20, Math.max(6, Number(url.searchParams.get('level') ?? 16)));

    // NCP Maps Static Map API (Raster)
    // https://api.ncloud-docs.com/docs/ai-naver-mapsstaticmap-raster
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
      // cache on server; browser still can revalidate
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!res.ok) {
      const t = await res.text();
      return NextResponse.json({ error: `upstream ${res.status}: ${t.slice(0, 200)}` }, { status: 502 });
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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

