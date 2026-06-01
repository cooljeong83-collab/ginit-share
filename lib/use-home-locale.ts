'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { getHomeContent, resolveHomeLocale, type HomeContent, type HomeLocale } from '@/lib/home-i18n';

export function useHomeLocale(): { locale: HomeLocale; c: HomeContent } {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');

  const locale = useMemo(() => resolveHomeLocale(langParam), [langParam]);
  const c = useMemo(() => getHomeContent(locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = c.htmlLang;
  }, [c.htmlLang]);

  return { locale, c };
}
