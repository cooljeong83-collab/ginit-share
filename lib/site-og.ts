import type { Metadata } from 'next';

import type { HomeLocale } from '@/lib/home-i18n';
import { resolveMetadataBase, toAbsoluteSiteUrl } from '@/lib/site-origin';

export const GINIT_LOGO_PATH = '/ginit-logo.png';

/** 카카오·슬랙 등 링크 미리보기용 로고 절대 URL */
export function resolveGinitLogoImageUrl(): string {
  return toAbsoluteSiteUrl(GINIT_LOGO_PATH);
}

/** Next.js가 생성하는 OG 이미지 라우트 (1200×630, 로고 포함) */
export function resolveGeneratedOgImageUrl(): string {
  return toAbsoluteSiteUrl('/opengraph-image');
}

export function ginitLogoOgImages(alt = '지닛') {
  const url = resolveGinitLogoImageUrl();
  return [{ url, width: 512, height: 512, alt, type: 'image/png' as const }];
}

/** 홈 링크 미리보기 — 1200×630 OG 이미지 (로케일별) */
export function homeOgImages(locale: HomeLocale) {
  const langQ = locale === 'en' ? '?lang=en' : '';
  const alt = locale === 'en' ? 'Ginit' : '지닛';
  return [
    {
      url: toAbsoluteSiteUrl(`/opengraph-image${langQ}`),
      width: 1200,
      height: 630,
      alt,
      type: 'image/png' as const,
    },
  ];
}

type OgImageEntry = { url: string; width: number; height: number; alt: string; type: 'image/png' };

type SiteOgPartial = {
  title: string;
  description: string;
  url?: string;
  images?: OgImageEntry[];
  locale?: HomeLocale;
};

/** 홈·기본 레이아웃 공통 Open Graph / Twitter */
export function buildGinitShareMetadata({
  title,
  description,
  url,
  images,
  locale,
}: SiteOgPartial): Metadata {
  const ogImages = images ?? ginitLogoOgImages();
  const twitterImages = ogImages.map((img) => img.url);
  const ogLocale = locale === 'en' ? 'en_US' : 'ko_KR';
  const siteName = locale === 'en' ? 'Ginit' : '지닛';

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: ogLocale,
      siteName,
      title,
      description,
      ...(url ? { url } : {}),
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: twitterImages,
    },
  };
}
