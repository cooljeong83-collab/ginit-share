import type { Metadata } from 'next';

import HomeLanding from '@/app/HomeLanding';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

const homeDesc =
  '카톡·지도·정산을 오가지 마세요. 지닛은 일정·장소·투표·채팅·도착·AI 정산까지 올인원으로 모임을 조율하는 앱입니다.';
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
