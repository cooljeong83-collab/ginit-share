import type { Metadata } from 'next';

import ShareMeetingViewClient from './ShareMeetingViewClient';

export const metadata: Metadata = {
  title: { absolute: '지닛 모임 공유' },
  description: '지닛 모임 공유',
  robots: { index: false, follow: false },
};

export default function ShareMeetingViewPage() {
  return <ShareMeetingViewClient />;
}
