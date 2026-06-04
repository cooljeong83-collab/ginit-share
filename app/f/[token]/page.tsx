import type { Metadata } from 'next';

import { toAbsoluteSiteUrl } from '@/lib/site-origin';

import ShareFriendInviteClient from './ShareFriendInviteClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token: raw } = await params;
  const token = decodeURIComponent(typeof raw === 'string' ? raw : '');
  const title = '지닛 · 친구 요청';
  const description = '지닛 친구 요청 링크입니다. 앱에서 친구를 수락할 수 있어요.';
  const logoAbs = toAbsoluteSiteUrl('/ginit-logo.png');

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
      images: [{ url: logoAbs, width: 512, height: 512, alt: '지닛' }],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [logoAbs],
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
  return <ShareFriendInviteClient token={decodeURIComponent(raw)} />;
}
