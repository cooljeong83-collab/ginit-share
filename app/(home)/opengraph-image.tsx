import { ImageResponse } from 'next/og';
import { headers } from 'next/headers';

import { resolveHomeLocaleForRequest } from '@/lib/home-i18n';
import { HOME_OG_SIZE, HomeOgImageMarkup } from '@/lib/home-og-image';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const alt = '지닛';
export const size = HOME_OG_SIZE;
export const contentType = 'image/png';

type Props = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

function langFromSearchParams(lang: string | string[] | undefined): string | null {
  if (lang == null) return null;
  return Array.isArray(lang) ? (lang[0] ?? null) : lang;
}

export default async function OpenGraphImage({ searchParams }: Props) {
  const sp = await searchParams;
  const h = await headers();
  const locale = resolveHomeLocaleForRequest(langFromSearchParams(sp.lang), h.get('accept-language'));

  return new ImageResponse(<HomeOgImageMarkup locale={locale} />, { ...HOME_OG_SIZE });
}
