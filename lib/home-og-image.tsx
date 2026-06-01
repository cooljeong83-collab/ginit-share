import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { HomeLocale } from '@/lib/home-i18n';

export const HOME_OG_SIZE = { width: 1200, height: 630 } as const;

function loadLogoDataUrl(): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'ginit-logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function labels(locale: HomeLocale) {
  if (locale === 'en') {
    return { brand: 'Ginit', tagline: 'All-in-one for meetups' };
  }
  return { brand: '지닛', tagline: '올인원 모임 조율' };
}

/** next/og ImageResponse용 마크업 */
export function HomeOgImageMarkup({ locale }: { locale: HomeLocale }) {
  const logoSrc = loadLogoDataUrl();
  const { brand, tagline } = labels(locale);

  return (
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
        {brand}
      </div>
      <div style={{ marginTop: 10, fontSize: 28, color: '#6b6b6b' }}>{tagline}</div>
    </div>
  );
}
