import type { Metadata } from 'next';

import { resolveMetadataBase, toAbsoluteSiteUrl } from '@/lib/site-origin';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: '지닛 모임 공유',
  description: '지닛에서 만든 모임 일정을 웹에서 확인하고 참여해요.',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: '지닛',
    title: '지닛 모임 공유',
    description: '지닛에서 만든 모임 일정을 웹에서 확인하고 참여해요.',
    images: [{ url: toAbsoluteSiteUrl('/ginit-logo.png'), width: 512, height: 512, alt: '지닛' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '지닛 모임 공유',
    description: '지닛에서 만든 모임 일정을 웹에서 확인하고 참여해요.',
    images: [toAbsoluteSiteUrl('/ginit-logo.png')],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
