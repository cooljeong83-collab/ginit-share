import { NextResponse } from 'next/server';

type PlaceThumbnailRequest = {
  title?: string;
  addressLine?: string;
  category?: string;
  preferredPhotoMediaUrl?: string;
  naverPlaceLink?: string;
};

function normalizeHttpsUrl(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim() : '';
  if (!s) return null;
  if (!s.startsWith('https://')) return null;
  return s;
}

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
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    const html = await res.text();
    const m =
      html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
      html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
    const u = m?.[1] ? m[1].trim() : '';
    return normalizeHttpsUrl(u);
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
    throw new Error('NAVER_SEARCH_CLIENT_ID / NAVER_SEARCH_CLIENT_SECRET 가 필요합니다.');
  }

  const q = query.trim();
  const baseUrl = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(q)}&display=${display}&sort=sim`;
  const res = await fetch(baseUrl, {
    headers: {
      'X-Naver-Client-Id': id,
      'X-Naver-Client-Secret': secret,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`이미지 검색 API 오류 (${res.status}): ${t.slice(0, 200)}`);
  }
  return (await res.json()) as NaverOpenApiImageJson;
}

const thumbCache = new Map<string, string | null>();

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlaceThumbnailRequest;
    const pref = normalizeHttpsUrl(body.preferredPhotoMediaUrl);
    if (pref) {
      return NextResponse.json({ thumbnailUrl: pref });
    }

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const addressLine = typeof body.addressLine === 'string' ? body.addressLine.trim() : '';
    const q = buildNaverPlaceImageSearchQuery(body);
    const cacheKey = `p|${cacheKeyForQuery(q)}|u:${cacheKeyForQuery(body.naverPlaceLink ?? '')}`;
    if (thumbCache.has(cacheKey)) {
      return NextResponse.json({ thumbnailUrl: thumbCache.get(cacheKey) });
    }

    const placeUrl = normalizeHttpsUrl(body.naverPlaceLink);
    if (placeUrl) {
      const og = await fetchOgImage(placeUrl);
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
      const url = normalizeHttpsUrl(it.thumbnail) ?? normalizeHttpsUrl(it.link);
      if (!url) continue;
      const score = scoreImageTitleAgainstPlace(String(it.title ?? ''), title, addressLine);
      if (!best || score > best.score) best = { url, score };
    }
    const out = best?.url ?? null;
    thumbCache.set(cacheKey, out);
    return NextResponse.json({ thumbnailUrl: out });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown_error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

