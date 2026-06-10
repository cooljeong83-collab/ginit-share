import type { Metadata } from 'next';

import { fetchShareMeetingOgMeta } from '@/lib/share-meeting-og';
import { normalizeShareToken } from '@/lib/share-token-server';
import { meetingShareOgImages } from '@/lib/site-og';

import ShareMeetingClient from './ShareMeetingClient';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token: raw } = await params;
  const token = normalizeShareToken(decodeURIComponent(typeof raw === 'string' ? raw : '')) ?? '';
  const og = await fetchShareMeetingOgMeta(token);
  const ogImages = meetingShareOgImages(token, og?.title ?? '지닛 모임 공유');
  const ogImageUrl = ogImages[0]?.url ?? '';

  if (!og) {
    const t = '지닛 모임 공유';
    const d = '지닛 모임 공유 링크입니다. 링크가 만료되었거나 잘못되었을 수 있어요.';
    return {
      title: { absolute: t },
      description: d,
      openGraph: {
        title: t,
        description: d,
        url: `/s/${encodeURIComponent(token)}`,
        siteName: '지닛',
        locale: 'ko_KR',
        images: ogImages,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: t,
        description: d,
        images: ogImageUrl ? [ogImageUrl] : [],
      },
    };
  }

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
      siteName: '지닛',
      locale: 'ko_KR',
      images: ogImages,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: og.pageTitle,
      description: og.description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const raw = typeof token === 'string' ? token : '';
  const normalized = normalizeShareToken(decodeURIComponent(raw)) ?? decodeURIComponent(raw);
  return <ShareMeetingClient token={normalized} />;
}
