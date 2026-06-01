import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = '지닛';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function loadLogoDataUrl(): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'ginit-logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export default function OpenGraphImage() {
  const logoSrc = loadLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 240,
            height: 240,
            borderRadius: 48,
            background: '#f5f3ff',
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={168} height={168} alt="" />
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 64,
            fontWeight: 700,
            color: '#0a0a0a',
            letterSpacing: '-0.04em',
          }}>
          지닛
        </div>
        <div style={{ marginTop: 10, fontSize: 28, color: '#6b6b6b' }}>올인원 모임 조율</div>
      </div>
    ),
    { ...size },
  );
}
