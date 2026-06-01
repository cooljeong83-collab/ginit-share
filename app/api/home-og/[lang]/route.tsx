import { ImageResponse } from 'next/og';

import { parseHomeLocaleParam } from '@/lib/home-i18n';
import { HOME_OG_SIZE, HomeOgImageMarkup } from '@/lib/home-og-image';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ lang: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { lang: raw } = await context.params;
  const locale = parseHomeLocaleParam(raw);
  if (!locale) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(<HomeOgImageMarkup locale={locale} />, {
    ...HOME_OG_SIZE,
    headers: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
