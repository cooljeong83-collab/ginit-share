import type { Metadata } from 'next';

import { sanitizeShareImageUrl } from '@/lib/safe-external-url';
import { fetchShareMeetingOgMeta } from '@/lib/share-meeting-og';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

import ShareMeetingClient from './ShareMeetingClient';

function absoluteOgImageUrl(candidate: string | null, logoAbs: string): string {
  if (!candidate) return logoAbs;
  const safeRemote = sanitizeShareImageUrl(candidate);
  if (safeRemote) return safeRemote;
  const path = candidate.startsWith('/') ? candidate : `/${candidate}`;
  return toAbsoluteSiteUrl(path);
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token: raw } = await params;
  const token = decodeURIComponent(typeof raw === 'string' ? raw : '');
  const og = await fetchShareMeetingOgMeta(token);
  const logoAbs = toAbsoluteSiteUrl('/ginit-logo.png');

  if (!og) {
    const t = '지닛 모임 공유';
    const d = '지닛 모임 공유 링크입니다. 링크가 만료되었거나 잘못되었을 수 있어요.';
    return {
      title: { absolute: t },
      description: d,
      openGraph: {
        title: t,
        description: d,
        images: [{ url: logoAbs, width: 512, height: 512, alt: '지닛' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: t,
        description: d,
        images: [logoAbs],
      },
    };
  }

  const primaryImage = absoluteOgImageUrl(og.imageUrl, logoAbs);
  const images = [{ url: primaryImage, alt: og.title }];

  return {
    title: { absolute: og.pageTitle },
    description: og.description,
    alternates: {
      canonical: `/s/${encodeURIComponent(token)}`,
    },
    openGraph: {
      title: og.pageTitle,
      description: og.description,
      url: `/s/${encodeURIComponent(token)}`,
      images,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: og.pageTitle,
      description: og.description,
      images: [primaryImage],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const raw = typeof token === 'string' ? token : '';
  return <ShareMeetingClient token={decodeURIComponent(raw)} />;
}
