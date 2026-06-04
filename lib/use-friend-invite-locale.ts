'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  getFriendInviteMessages,
  resolveFriendInviteLocale,
  type FriendInviteMessages,
} from '@/lib/friend-invite-i18n';
import type { ShareLocale } from '@/lib/share-i18n';

export function useFriendInviteLocale(): { locale: ShareLocale; m: FriendInviteMessages } {
  const [locale, setLocale] = useState<ShareLocale>(() =>
    typeof window !== 'undefined' ? resolveFriendInviteLocale() : 'ko',
  );
  const m = useMemo(() => getFriendInviteMessages(locale), [locale]);

  useEffect(() => {
    const next = resolveFriendInviteLocale();
    setLocale(next);
    document.documentElement.lang = getFriendInviteMessages(next).htmlLang;
  }, []);

  return { locale, m };
}
