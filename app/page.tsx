import type { Metadata } from 'next';

import HomeLanding from '@/app/HomeLanding';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

const homeDesc =
  '지닛은 일정 후보, 장소, 투표, 채팅까지 모임을 한곳에서 돕는 앱입니다. 호스트가 보낸 링크로 웹에서도 참여할 수 있어요.';
const homeOgLogo = toAbsoluteSiteUrl('/ginit-logo.png');

export const metadata: Metadata = {
  title: '지닛 — 모임·약속 앱',
  description: homeDesc,
  openGraph: {
    title: '지닛 — 모임·약속 앱',
    description: homeDesc,
    images: [{ url: homeOgLogo, width: 512, height: 512, alt: '지닛' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '지닛 — 모임·약속 앱',
    description: homeDesc,
    images: [homeOgLogo],
  },
};

export default function HomePage() {
  return <HomeLanding />;
}
