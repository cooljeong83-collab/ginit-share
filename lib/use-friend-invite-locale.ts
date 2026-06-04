'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getFriendInviteMessages,
  persistFriendInviteLocale,
  resolveFriendInviteLocale,
  type FriendInviteLocale,
  type FriendInviteMessages,
} from '@/lib/friend-invite-i18n';

export function useFriendInviteLocale(): {
  locale: FriendInviteLocale;
  m: FriendInviteMessages;
  setLocale: (locale: FriendInviteLocale) => void;
} {
  const [locale, setLocaleState] = useState<FriendInviteLocale>(() =>
    typeof window !== 'undefined' ? resolveFriendInviteLocale() : 'ko',
  );
  const m = useMemo(() => getFriendInviteMessages(locale), [locale]);

  const setLocale = useCallback((next: FriendInviteLocale) => {
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
