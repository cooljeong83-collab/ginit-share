import { isAllowedNaverMediaUrl, isAllowedNaverPlaceUrl } from '@/lib/safe-external-url';

export type PlaceThumbnailInput = {
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

function buildNaverPlaceImageSearchQuery(req: PlaceThumbnailInput): string {
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

function naverPlaceOgFetchUrls(placeUrl: string): string[] {
  const urls = [placeUrl];
  const idMatch = placeUrl.match(/place\.naver\.com\/place\/(\d+)/i);
  if (idMatch?.[1]) {
    const id = idMatch[1];
    urls.push(`https://pcmap.place.naver.com/restaurant/${id}/home`);
    urls.push(`https://map.naver.com/p/entry/place/${id}`);
  }
  return [...new Set(urls)];
}

async function fetchOgImageFromHtml(url: string): Promise<string | null> {
  const res = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(12_000),
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const m =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
  const u = m?.[1] ? m[1].trim() : '';
  return isAllowedNaverMediaUrl(u) ? u : null;
}

async function fetchOgImage(placeUrl: string): Promise<string | null> {
  for (const url of naverPlaceOgFetchUrls(placeUrl)) {
    try {
      const u = await fetchOgImageFromHtml(url);
      if (u) return u;
    } catch {
      /* try next URL */
    }
  }
  return null;
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

/** 장소 썸네일: DB URL → 네이버 장소 OG → (선택) 이미지 검색 API */
export async function resolvePlaceThumbnailUrl(req: PlaceThumbnailInput): Promise<string | null> {
  const prefRaw = typeof req.preferredPhotoMediaUrl === 'string' ? req.preferredPhotoMediaUrl.trim() : '';
  if (prefRaw) {
    const pref = isAllowedNaverMediaUrl(prefRaw) ? prefRaw : null;
    if (pref) return pref;
  }

  const title = typeof req.title === 'string' ? req.title.trim() : '';
  const addressLine = typeof req.addressLine === 'string' ? req.addressLine.trim() : '';
  const q = buildNaverPlaceImageSearchQuery(req);
  const cacheKey = `p|${cacheKeyForQuery(q)}|u:${cacheKeyForQuery(req.naverPlaceLink ?? '')}`;
  if (thumbCache.has(cacheKey)) {
    return thumbCache.get(cacheKey) ?? null;
  }

  const placeUrlRaw = typeof req.naverPlaceLink === 'string' ? req.naverPlaceLink.trim() : '';
  if (placeUrlRaw && isAllowedNaverPlaceUrl(placeUrlRaw)) {
    const og = await fetchOgImage(placeUrlRaw);
    if (og) {
      thumbCache.set(cacheKey, og);
      return og;
    }
  }

  if (!q) {
    thumbCache.set(cacheKey, null);
    return null;
  }

  try {
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
    return out;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg === 'naver_search_not_configured') {
      thumbCache.set(cacheKey, null);
      return null;
    }
    throw e;
  }
}
