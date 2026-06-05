import type { Metadata } from 'next';

import ShareFriendInviteViewClient from './ShareFriendInviteViewClient';

export const metadata: Metadata = {
  title: { absolute: '지닛 · 친구 요청' },
  description: '지닛 친구 요청 링크입니다.',
  robots: { index: false, follow: false },
};

export default function ShareFriendInviteViewPage() {
  return <ShareFriendInviteViewClient />;
}
