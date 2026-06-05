/** 웹 공유에서 열거나 프록시하는 외부 URL 검증 */

const NAVER_PLACE_HOST_SUFFIXES = [
  'naver.com',
  'naver.me',
  'naver.net',
  'modoo.at',
  'band.us',
] as const;

const NAVER_MEDIA_HOST_SUFFIXES = [
  ...NAVER_PLACE_HOST_SUFFIXES,
  'pstatic.net',
  'phinf.pstatic.net',
  'ssl.pstatic.net',
  'shop-phinf.pstatic.net',
  'ldb-phinf.pstatic.net',
  'map.naver.com',
  'maps.apigw.ntruss.com',
] as const;

function hostMatchesSuffix(hostname: string, suffix: string): boolean {
  const h = hostname.toLowerCase();
  const s = suffix.toLowerCase();
  return h === s || h.endsWith(`.${s}`);
}

function hostAllowed(hostname: string, suffixes: readonly string[]): boolean {
  return suffixes.some((s) => hostMatchesSuffix(hostname, s));
}

export function parseHttpsUrl(raw: unknown): URL | null {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s.startsWith('https://')) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:') return null;
    return u;
  } catch {
    return null;
  }
}

export function isAllowedNaverPlaceUrl(raw: unknown): boolean {
  const u = parseHttpsUrl(raw);
  if (!u) return false;
  return hostAllowed(u.hostname, NAVER_PLACE_HOST_SUFFIXES);
}

export function isAllowedNaverMediaUrl(raw: unknown): boolean {
  const u = parseHttpsUrl(raw);
  if (!u) return false;
  return hostAllowed(u.hostname, NAVER_MEDIA_HOST_SUFFIXES);
}

/** 장소 상세·지도 링크용 */
export function sanitizeNaverPlaceHref(raw: unknown): string | null {
  const u = parseHttpsUrl(raw);
  if (!u || !hostAllowed(u.hostname, NAVER_PLACE_HOST_SUFFIXES)) return null;
  return u.href;
}

/** 썸네일·히어로 이미지: https + 네이버 CDN/지도 계열 */
export function sanitizeHttpsImageUrl(raw: unknown): string | null {
  const u = parseHttpsUrl(raw);
  if (!u) return null;
  if (!hostAllowed(u.hostname, NAVER_MEDIA_HOST_SUFFIXES)) return null;
  return u.href;
}

const SHARE_IMAGE_HOST_SUFFIXES = [...NAVER_MEDIA_HOST_SUFFIXES, 'supabase.co'] as const;

/** 웹 공유 UI 이미지: 네이버 CDN + Supabase Storage 프로필 사진 */
export function sanitizeShareImageUrl(raw: unknown): string | null {
  const u = parseHttpsUrl(raw);
  if (!u) return null;
  if (!hostAllowed(u.hostname, SHARE_IMAGE_HOST_SUFFIXES)) return null;
  return u.href;
}
