import type { Metadata } from 'next';

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

type OgImageEntry = { url: string; width: number; height: number; alt: string; type: 'image/png' };

type SiteOgPartial = {
  title: string;
  description: string;
  url?: string;
  images?: OgImageEntry[];
};

/** 홈·기본 레이아웃 공통 Open Graph / Twitter */
export function buildGinitShareMetadata({ title, description, url, images }: SiteOgPartial): Metadata {
  const ogImages = images ?? ginitLogoOgImages();
  const twitterImages = ogImages.map((img) => img.url);

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: 'ko_KR',
      siteName: '지닛',
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
