/** OG·canonical 등에 쓰는 공개 사이트 베이스 URL */
export function resolveMetadataBase(): URL | undefined {
  try {
    const s = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (s) {
      const normalized = s.replace(/\/+$/, '');
      return new URL(normalized);
    }
  } catch {
    /* ignore */
  }
  try {
    const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    if (prod) {
      const withProto = /^https?:\/\//i.test(prod) ? prod : `https://${prod}`;
      return new URL(withProto.replace(/\/+$/, ''));
    }
  } catch {
    /* ignore */
  }
  try {
    const v = process.env.VERCEL_URL?.trim();
    if (v) {
      const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
      return new URL(withProto.replace(/\/+$/, ''));
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

/** 카카오·슬랙 등 스크레이퍼가 상대 og:image 를 못 읽는 경우 대비해 절대 URL로 만듦 */
export function toAbsoluteSiteUrl(href: string): string {
  const base = resolveMetadataBase();
  if (!base) return href;
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
}
