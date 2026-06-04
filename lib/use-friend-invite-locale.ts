'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getFriendInviteMessages,
  persistFriendInviteLocale,
  resolveFriendInviteLocale,
  type FriendInviteMessages,
} from '@/lib/friend-invite-i18n';
import type { ShareLocale } from '@/lib/share-i18n';

export function useFriendInviteLocale(): {
  locale: ShareLocale;
  m: FriendInviteMessages;
  setLocale: (locale: ShareLocale) => void;
} {
  const [locale, setLocaleState] = useState<ShareLocale>(() =>
    typeof window !== 'undefined' ? resolveFriendInviteLocale() : 'ko',
  );
  const m = useMemo(() => getFriendInviteMessages(locale), [locale]);

  const setLocale = useCallback((next: ShareLocale) => {
    setLocaleState(next);
    persistFriendInviteLocale(next);
    document.documentElement.lang = getFriendInviteMessages(next).htmlLang;
  }, []);

  useEffect(() => {
    const next = resolveFriendInviteLocale();
    setLocaleState(next);
    document.documentElement.lang = getFriendInviteMessages(next).htmlLang;
  }, []);

  return { locale, m, setLocale };
}
