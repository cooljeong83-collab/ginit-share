'use client';

import ShareFriendInviteClient from '@/app/f/[token]/ShareFriendInviteClient';
import { readFriendInviteToken } from '@/lib/share-link-session';
import { useFriendInviteLocale } from '@/lib/use-friend-invite-locale';
import { useEffect, useState } from 'react';

import styles from '@/app/f/[token]/friend-invite.module.css';

export default function ShareFriendInviteViewClient() {
  const { m } = useFriendInviteLocale();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setToken(readFriendInviteToken());
  }, []);

  if (token === undefined) {
    return (
      <main className={styles.statePage}>
        <p className={styles.stateText}>{m.loading}</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main className={styles.statePage}>
        <h1 className={styles.stateTitle}>{m.errorTitle}</h1>
        <p className={styles.alert} role="alert">
          {m.invalidLink}
        </p>
        <p className={styles.stateText}>{m.errorHint}</p>
      </main>
    );
  }

  return <ShareFriendInviteClient token={token} urlCleanup={false} />;
}
