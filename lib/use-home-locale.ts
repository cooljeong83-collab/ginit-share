'use client';

import { useEffect, useMemo, useState } from 'react';

import { getHomeContent, resolveHomeLocale, type HomeContent, type HomeLocale } from '@/lib/home-i18n';

export function useHomeLocale(): { locale: HomeLocale; c: HomeContent } {
  const [locale, setLocale] = useState<HomeLocale>(() =>
    typeof window !== 'undefined' ? resolveHomeLocale() : 'ko',
  );
  const c = useMemo(() => getHomeContent(locale), [locale]);

  useEffect(() => {
    const next = resolveHomeLocale();
    setLocale(next);
    document.documentElement.lang = getHomeContent(next).htmlLang;
  }, []);

  return { locale, c };
}
