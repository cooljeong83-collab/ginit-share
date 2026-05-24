import { NextResponse } from 'next/server';

import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/api-rate-limit';
import { isAllowedNaverMediaUrl, isAllowedNaverPlaceUrl } from '@/lib/safe-external-url';
import { assertValidShareToken, normalizeShareToken, readShareTokenFromJsonBody } from '@/lib/share-token-server';

type PlaceThumbnailRequest = {
  shareToken?: string;
  token?: string;
  title?: string;
  addressLine?: string;
  category?: string;
  preferredPhotoMediaUrl?: string;
  naverPlaceLink?: string;
};

function stripHtmlTags(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function cacheKeyForQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLowerCase();
}

function buildNaverPlaceImageSearchQuery(req: PlaceThumbnailRequest): string {
  const title = stripHtmlTags(typeof req.title === 'string' ? req.title : '');
  const line = typeof req.addressLine === 'string' ? req.addressLine.trim() : '';
  const cat = typeof req.category === 'string' ? req.category.trim() : '';

  if (!title) {
    return (line || cat).trim();
  }
  const parts = [title];
  if (line) parts.push(line);
  else if (cat) parts.push(cat);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function scoreImageTitleAgainstPlace(imageTitleRaw: string, placeTitle: string, addressLine: string): number {
  const img = cacheKeyForQuery(stripHtmlTags(imageTitleRaw));
  if (!img) return 0;
  const pt = cacheKeyForQuery(stripHtmlTags(placeTitle));
  const addr = cacheKeyForQuery(addressLine);
  let score = 0;

  if (pt.length >= 4 && img.includes(pt)) score += 100;
  for (const tok of pt.split(/[\s>]+/).filter((t) => t.length >= 3)) {
    if (img.includes(tok)) score += Math.min(15, tok.length);
  }
  if (addr.length >= 6 && img.includes(addr.slice(0, 12))) score += 12;
  if (addr.length >= 10 && img.includes(addr.slice(0, 22))) score += 25;
  return score;
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    const u = m?.[1] ? m[1].trim() : '';
    return isAllowedNaverMediaUrl(u) ? u : null;
  } catch {
    return null;
  }
}

type NaverOpenApiImageJson = {
  items?: { thumbnail?: string; link?: string; title?: string }[];
};

async function fetchNaverOpenApiImageSearch(query: string, display: number): Promise<NaverOpenApiImageJson> {
  const id = process.env.NAVER_SEARCH_CLIENT_ID?.trim() || '';
  const secret = process.env.NAVER_SEARCH_CLIENT_SECRET?.trim() || '';
  if (!id || !secret) {
    throw new Error('naver_search_not_configured');
  }

  const q = query.trim();
  const baseUrl = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(q)}&display=${display}&sort=sim`;
  const res = await fetch(baseUrl, {
    headers: {
      'X-Naver-Client-Id': id,
      'X-Naver-Client-Secret': secret,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) {
    throw new Error('naver_image_search_failed');
  }
  return (await res.json()) as NaverOpenApiImageJson;
}

const thumbCache = new Map<string, string | null>();

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limited = checkRateLimit(`place-thumbnail:${ip}`, 40);
    if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

    const shareToken =
      normalizeShareToken(req.headers.get('x-ginit-share-token')) ?? (await readShareTokenFromJsonBody(req));
    if (!shareToken) {
      return NextResponse.json({ error: 'share_token_required' }, { status: 401 });
    }
    await assertValidShareToken(shareToken);

    const body = (await req.json()) as PlaceThumbnailRequest;
    const prefRaw = typeof body.preferredPhotoMediaUrl === 'string' ? body.preferredPhotoMediaUrl.trim() : '';
    if (prefRaw) {
      const pref = isAllowedNaverMediaUrl(prefRaw) ? prefRaw : null;
      if (pref) {
        return NextResponse.json({ thumbnailUrl: pref });
      }
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const addressLine = typeof body.addressLine === 'string' ? body.addressLine.trim() : '';
    const q = buildNaverPlaceImageSearchQuery(body);
    const cacheKey = `p|${cacheKeyForQuery(q)}|u:${cacheKeyForQuery(body.naverPlaceLink ?? '')}`;
    if (thumbCache.has(cacheKey)) {
      return NextResponse.json({ thumbnailUrl: thumbCache.get(cacheKey) });
    }

    const placeUrlRaw = typeof body.naverPlaceLink === 'string' ? body.naverPlaceLink.trim() : '';
    if (placeUrlRaw && isAllowedNaverPlaceUrl(placeUrlRaw)) {
      const og = await fetchOgImage(placeUrlRaw);
      if (og) {
        thumbCache.set(cacheKey, og);
        return NextResponse.json({ thumbnailUrl: og });
      }
    }

    if (!q) {
      thumbCache.set(cacheKey, null);
      return NextResponse.json({ thumbnailUrl: null });
    }

    const json = await fetchNaverOpenApiImageSearch(q, 10);
    const items = Array.isArray(json.items) ? json.items : [];
    let best: { url: string; score: number } | null = null;
    for (const it of items) {
      const thumb = typeof it.thumbnail === 'string' ? it.thumbnail.trim() : '';
      const link = typeof it.link === 'string' ? it.link.trim() : '';
      const url =
        (thumb && isAllowedNaverMediaUrl(thumb) ? thumb : null) ??
        (link && isAllowedNaverMediaUrl(link) ? link : null);
      if (!url) continue;
      const score = scoreImageTitleAgainstPlace(String(it.title ?? ''), title, addressLine);
      if (!best || score > best.score) best = { url, score };
    }
    const out = best?.url ?? null;
    thumbCache.set(cacheKey, out);
    return NextResponse.json({ thumbnailUrl: out });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown_error';
    if (msg === 'invalid_share_token' || msg === 'share_token_required') {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (msg === 'naver_search_not_configured') {
      return NextResponse.json({ error: 'service_unavailable' }, { status: 503 });
    }
    return NextResponse.json({ error: 'request_failed' }, { status: 400 });
  }
}
