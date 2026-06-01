import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';

import HomeLanding from './HomeLanding';
import { getHomeContent, resolveHomeLocaleForRequest } from '@/lib/home-i18n';
import { buildGinitShareMetadata } from '@/lib/site-og';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

type HomePageProps = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

function langFromSearchParams(lang: string | string[] | undefined): string | null {
  if (lang == null) return null;
  return Array.isArray(lang) ? (lang[0] ?? null) : lang;
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const sp = await searchParams;
  const h = await headers();
  const locale = resolveHomeLocaleForRequest(langFromSearchParams(sp.lang), h.get('accept-language'));
  const { metaTitle, metaDescription } = getHomeContent(locale);

  return {
    ...buildGinitShareMetadata({
      title: metaTitle,
      description: metaDescription,
      url: toAbsoluteSiteUrl('/'),
    }),
  };
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeLanding />
    </Suspense>
  );
}
