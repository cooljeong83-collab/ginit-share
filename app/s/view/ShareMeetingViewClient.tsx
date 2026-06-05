'use client';

import ShareMeetingClient from '@/app/s/[token]/ShareMeetingClient';
import { readShareMeetingToken } from '@/lib/share-link-session';
import { useShareLocale } from '@/lib/use-share-locale';
import { useEffect, useState } from 'react';

export default function ShareMeetingViewClient() {
  const { m } = useShareLocale();
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setToken(readShareMeetingToken());
  }, []);

  if (token === undefined) {
    return (
      <main className="gShell">
        <div className="gCenterEmpty">
          <p className="gEmptyText">{m.loading}</p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="gShell">
        <div className="gCenterEmpty">
          <div>
            <p className="gKicker">{m.kicker}</p>
            <h1 className="gEmptyTitle">{m.errorTitle}</h1>
            <p className="gAlert" role="alert">
              {m.errors.invalidToken}
            </p>
            <p className="gEmptyText">{m.errorHint}</p>
          </div>
        </div>
      </main>
    );
  }

  return <ShareMeetingClient token={token} urlCleanup={false} />;
}
