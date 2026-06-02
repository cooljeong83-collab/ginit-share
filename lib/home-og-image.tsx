import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { HomeLocale } from '@/lib/home-i18n';

export const HOME_OG_SIZE = { width: 1200, height: 630 } as const;

function loadLogoDataUrl(): string {
  const buf = readFileSync(join(process.cwd(), 'public', 'ginit-logo.png'));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

const HOME_OG_LABELS: Record<HomeLocale, { brand: string; tagline: string }> = {
  ko: { brand: '지닛', tagline: '올인원 모임 조율' },
  en: { brand: 'Ginit', tagline: 'All-in-one for meetups' },
  ja: { brand: 'Ginit', tagline: 'オフ会のオールインワン' },
  zh: { brand: 'Ginit', tagline: '聚会一站式' },
  'zh-TW': { brand: 'Ginit', tagline: '聚會一站式' },
  vi: { brand: 'Ginit', tagline: 'Buổi gặp all-in-one' },
  la: { brand: 'Ginit', tagline: 'Omnia pro conventibus' },
};

function labels(locale: HomeLocale) {
  return HOME_OG_LABELS[locale];
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
