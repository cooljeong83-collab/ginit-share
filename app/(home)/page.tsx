import type { Metadata } from 'next';
import { headers } from 'next/headers';

import HomeLanding from './HomeLanding';
import { getHomeContent, resolveHomeLocaleFromAcceptLanguage } from '@/lib/home-i18n';
import { buildGinitShareMetadata } from '@/lib/site-og';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const locale = resolveHomeLocaleFromAcceptLanguage(h.get('accept-language'));
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
  return <HomeLanding />;
}
