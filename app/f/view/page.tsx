import type { Metadata } from 'next';

import { buildGinitShareMetadata, friendInviteOgImages } from '@/lib/site-og';

import ShareFriendInviteViewClient from './ShareFriendInviteViewClient';

export const metadata: Metadata = {
  ...buildGinitShareMetadata({
    title: '지닛 · 친구 요청',
    description: '지닛 친구 요청 링크입니다. 앱에서 친구를 수락할 수 있어요.',
    images: friendInviteOgImages('default'),
  }),
  robots: { index: false, follow: false },
};

export default function ShareFriendInviteViewPage() {
  return <ShareFriendInviteViewClient />;
}
