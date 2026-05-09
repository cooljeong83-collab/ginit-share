import type { Metadata } from 'next';

import { fetchShareMeetingOgMeta } from '@/lib/share-meeting-og';

import ShareMeetingClient from './ShareMeetingClient';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token: raw } = await params;
  const token = decodeURIComponent(typeof raw === 'string' ? raw : '');
  const og = await fetchShareMeetingOgMeta(token);

  if (!og) {
    const t = '지닛 모임 공유';
    const d = '지닛 모임 공유 링크입니다. 링크가 만료되었거나 잘못되었을 수 있어요.';
    return {
      title: { absolute: t },
      description: d,
      openGraph: {
        title: t,
        description: d,
        images: [{ url: '/ginit-logo.png', width: 512, height: 512, alt: '지닛' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: t,
        description: d,
        images: ['/ginit-logo.png'],
      },
    };
  }

  const images = og.imageUrl
    ? [{ url: og.imageUrl, alt: og.title }]
    : [{ url: '/ginit-logo.png', width: 512, height: 512, alt: '지닛' }];

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
      images: og.imageUrl ? [og.imageUrl] : ['/ginit-logo.png'],
    },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const raw = typeof token === 'string' ? token : '';
  return <ShareMeetingClient token={decodeURIComponent(raw)} />;
}
