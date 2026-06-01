import { ImageResponse } from 'next/og';

import { resolveHomeLocaleForRequest } from '@/lib/home-i18n';
import { HOME_OG_SIZE, HomeOgImageMarkup } from '@/lib/home-og-image';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = resolveHomeLocaleForRequest(searchParams.get('lang'), null);

  return new ImageResponse(<HomeOgImageMarkup locale={locale} />, {
    ...HOME_OG_SIZE,
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
