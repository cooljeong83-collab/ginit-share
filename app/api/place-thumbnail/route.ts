import { NextResponse } from 'next/server';

import { resolvePlaceThumbnailUrl, type PlaceThumbnailInput } from '@/lib/place-thumbnail-resolve';
import { assertValidShareToken, normalizeShareToken, readShareTokenFromJsonBody } from '@/lib/share-token-server';

export async function POST(req: Request) {
  try {
    const shareToken =
      normalizeShareToken(req.headers.get('x-ginit-share-token')) ?? (await readShareTokenFromJsonBody(req));
    if (!shareToken) {
      return NextResponse.json({ error: 'share_token_required' }, { status: 401 });
    }
    await assertValidShareToken(shareToken);

    const body = (await req.json()) as PlaceThumbnailInput;
    const thumbnailUrl = await resolvePlaceThumbnailUrl(body);
    return NextResponse.json({ thumbnailUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown_error';
    if (msg === 'invalid_share_token' || msg === 'share_token_required') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (msg === 'rate_limited') {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': '60' } });
    }
    if (msg === 'naver_search_not_configured') {
      return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
    }
    return NextResponse.json({ error: 'request_failed' }, { status: 400 });
  }
}
