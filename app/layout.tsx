import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '지닛 모임 공유',
  description: '지닛에서 만든 모임 일정을 웹에서 확인하고 참여해요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
