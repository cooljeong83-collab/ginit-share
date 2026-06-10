import type { Metadata } from 'next';

import { fetchShareFriendInviteOgMeta } from '@/lib/share-friend-invite-og';
import { normalizeShareToken } from '@/lib/share-token-server';
import { friendInviteOgImages } from '@/lib/site-og';

import ShareFriendInviteClient from './ShareFriendInviteClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token: raw } = await params;
  const token = normalizeShareToken(decodeURIComponent(typeof raw === 'string' ? raw : '')) ?? '';
  const og = await fetchShareFriendInviteOgMeta(token);
  const ogImages = friendInviteOgImages(token);
  const ogImageUrl = ogImages[0]?.url ?? '';

  if (!og) {
    const title = '지닛 · 친구 요청';
    const description = '지닛 친구 요청 링크입니다. 링크가 만료되었거나 잘못되었을 수 있어요.';
    return {
      title: { absolute: title },
      description,
      alternates: {
        canonical: `/f/${encodeURIComponent(token)}`,
      },
      openGraph: {
        title,
        description,
        url: `/f/${encodeURIComponent(token)}`,
        siteName: '지닛',
        locale: 'ko_KR',
        images: ogImages,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImageUrl ? [ogImageUrl] : [],
      },
    };
  }

  return {
    title: { absolute: og.pageTitle },
    description: og.description,
    alternates: {
      canonical: `/f/${encodeURIComponent(token)}`,
    },
    openGraph: {
      title: og.pageTitle,
      description: og.description,
      url: `/f/${encodeURIComponent(token)}`,
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

export default async function FriendInviteSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const raw = typeof token === 'string' ? token : '';
  const normalized = normalizeShareToken(decodeURIComponent(raw)) ?? decodeURIComponent(raw);
  return <ShareFriendInviteClient token={normalized} />;
}
