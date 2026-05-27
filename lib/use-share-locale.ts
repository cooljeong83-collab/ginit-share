'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  getShareMessages,
  resolveShareLocale,
  type ShareLocale,
  type ShareMessages,
} from '@/lib/share-i18n';

export function useShareLocale(): { locale: ShareLocale; m: ShareMessages } {
  const [locale, setLocale] = useState<ShareLocale>(() =>
    typeof window !== 'undefined' ? resolveShareLocale() : 'ko',
  );
  const m = useMemo(() => getShareMessages(locale), [locale]);

  useEffect(() => {
    const next = resolveShareLocale();
    setLocale(next);
    document.documentElement.lang = getShareMessages(next).htmlLang;
  }, []);

  return { locale, m };
}
