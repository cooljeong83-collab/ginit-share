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

/** 친구 초대 `/f/{token}` — 1200×630 OG (로고 비율 맞춤) */
export function friendInviteOgImages(token: string, alt = '지닛 친구 요청') {
  const encoded = encodeURIComponent(token.trim() || 'default');
  return [
    {
      url: toAbsoluteSiteUrl(`/api/friend-invite-og/${encoded}`),
      width: 1200,
      height: 630,
      alt,
      type: 'image/png' as const,
    },
  ];
}

function homeOgLangSegment(locale: HomeLocale): string {
  if (locale === 'zh-TW') return 'zh-tw';
  return locale;
}

function homeOgBrandAlt(locale: HomeLocale): string {
  return locale === 'ko' ? '지닛' : 'Ginit';
}

const HOME_OG_LOCALE: Record<HomeLocale, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  ja: 'ja_JP',
  zh: 'zh_CN',
  'zh-TW': 'zh_TW',
  vi: 'vi_VN',
  la: 'la',
};

const HOME_OG_SITE_NAME: Record<HomeLocale, string> = {
  ko: '지닛',
  en: 'Ginit',
  ja: 'Ginit',
  zh: 'Ginit',
  'zh-TW': 'Ginit',
  vi: 'Ginit',
  la: 'Ginit',
};

/** 홈 링크 미리보기 — 1200×630 (opengraph-image.tsx 는 query 미지원 → API 사용) */
export function homeOgImages(locale: HomeLocale) {
  return [
    {
      url: toAbsoluteSiteUrl(`/api/home-og/${homeOgLangSegment(locale)}`),
      width: 1200,
      height: 630,
      alt: homeOgBrandAlt(locale),
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
  const ogLocale = locale ? HOME_OG_LOCALE[locale] : 'ko_KR';
  const siteName = locale ? HOME_OG_SITE_NAME[locale] : '지닛';

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
