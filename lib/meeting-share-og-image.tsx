import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** 카카오·채팅 링크 미리보기 표준 비율 (1.91:1) */
export const MEETING_SHARE_OG_SIZE = { width: 1200, height: 630 } as const;

function loadLogoDataUrl(): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'ginit-logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export type MeetingShareOgImageProps = {
  backgroundSrc?: string | null;
};

/** next/og ImageResponse — 장소 썸네일만 표시 (텍스트 오버레이 없음) */
export function MeetingShareOgImageMarkup({ backgroundSrc }: MeetingShareOgImageProps) {
  if (!backgroundSrc) {
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
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'relative',
        background: '#1e293b',
      }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={backgroundSrc}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}
