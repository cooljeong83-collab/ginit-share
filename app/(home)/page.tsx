import type { Metadata } from 'next';

import HomeLanding from './HomeLanding';
import { buildGinitShareMetadata } from '@/lib/site-og';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

const homeDesc =
  '카톡·지도·정산을 오가지 마세요. 지닛은 일정·장소·투표·채팅·도착·AI 정산까지 올인원으로 모임을 조율하는 앱입니다.';

const homeTitle = '지닛 — 모임·약속 앱';

export const metadata: Metadata = {
  ...buildGinitShareMetadata({
    title: homeTitle,
    description: homeDesc,
    url: toAbsoluteSiteUrl('/'),
  }),
};

export default function HomePage() {
  return <HomeLanding />;
}
