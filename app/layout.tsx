import type { Metadata } from 'next';
import './globals.css';

function resolveMetadataBase(): URL | undefined {
  try {
    const s = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (s) {
      const normalized = s.replace(/\/+$/, '');
      return new URL(normalized);
    }
  } catch {
    /* ignore */
  }
  try {
    const v = process.env.VERCEL_URL?.trim();
    if (v) {
      const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
      return new URL(withProto.replace(/\/+$/, ''));
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

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
  },
  twitter: {
    card: 'summary_large_image',
    title: '지닛 모임 공유',
    description: '지닛에서 만든 모임 일정을 웹에서 확인하고 참여해요.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
