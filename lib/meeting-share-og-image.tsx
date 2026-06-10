import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** 카카오·채팅 링크 미리보기 표준 비율 (1.91:1) */
export const MEETING_SHARE_OG_SIZE = { width: 1200, height: 630 } as const;

function loadLogoDataUrl(): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'ginit-logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export type MeetingShareOgImageProps = {
  headline: string;
  subline?: string;
  backgroundSrc?: string | null;
};

function truncateHeadline(text: string, maxLen = 48): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

/** next/og ImageResponse — 장소 썸네일 위 하단 제목·힌트 오버레이 */
export function MeetingShareOgImageMarkup({
  headline,
  subline = '지닛 모임 초대',
  backgroundSrc,
}: MeetingShareOgImageProps) {
  const title = truncateHeadline(headline);

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
          {title}
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.82) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '48px 56px 52px',
        }}>
        <div
          style={{
            maxWidth: 1080,
            fontSize: 52,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
          }}>
          {title}
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 28,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.78)',
            letterSpacing: '-0.01em',
          }}>
          {subline}
        </div>
      </div>
    </div>
  );
}
