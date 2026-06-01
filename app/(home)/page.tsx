import type { Metadata } from 'next';

import HomeLanding from './HomeLanding';
import { buildGinitShareMetadata } from '@/lib/site-og';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

const homeDesc =
  '지닛은 일정 후보, 장소, 투표, 채팅까지 모임을 한곳에서 돕는 앱입니다. 호스트가 보낸 링크로 웹에서도 참여할 수 있어요.';

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
