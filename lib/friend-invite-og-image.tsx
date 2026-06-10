import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** 카카오·채팅 링크 미리보기 표준 비율 (1.91:1) */
export const FRIEND_INVITE_OG_SIZE = { width: 1200, height: 630 } as const;

function loadLogoDataUrl(): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'ginit-logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export type FriendInviteOgImageProps = {
  headline: string;
  subline?: string;
};

/** next/og ImageResponse — 로고가 잘리지 않도록 여백 안에 맞춤 */
export function FriendInviteOgImageMarkup({ headline, subline = '지닛 친구 초대' }: FriendInviteOgImageProps) {
  const logoSrc = loadLogoDataUrl();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f7ff 100%)',
      }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 200,
          height: 200,
          borderRadius: 44,
          background: '#f0edff',
          boxShadow: '0 8px 32px rgba(91, 33, 182, 0.08)',
        }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={140} height={140} alt="" />
      </div>
      <div
        style={{
          marginTop: 32,
          maxWidth: 1000,
          textAlign: 'center',
          fontSize: 52,
          fontWeight: 700,
          color: '#0a0a0a',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
        }}>
        {headline}
      </div>
      <div
        style={{
          marginTop: 14,
          fontSize: 28,
          color: '#6b6b6b',
          letterSpacing: '-0.01em',
        }}>
        {subline}
      </div>
    </div>
  );
}
