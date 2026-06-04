'use client';

import GinitFriendInviteOpenLink from '@/app/GinitFriendInviteOpenLink';
import { apiFriendInviteGuestGet } from '@/lib/friend-invite-api-client';
import { useFriendInviteLocale } from '@/lib/use-friend-invite-locale';
import { useCallback, useEffect, useState } from 'react';

import '../../s/[token]/share.css';

function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function initialsFrom(label: string): string {
  const s = label.trim();
  if (!s) return 'G';
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

type InviteProfile = {
  nickname: string;
  photoUrl: string;
  gDna: string;
};

type ShareFriendInviteClientProps = {
  token: string;
};

export default function ShareFriendInviteClient({ token }: ShareFriendInviteClientProps) {
  const { m } = useFriendInviteLocale();
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<InviteProfile | null>(null);

  const load = useCallback(async () => {
    setPhase('loading');
    setErr(null);
    setProfile(null);
    try {
      const data = await withTimeout(
        apiFriendInviteGuestGet(token),
        20_000,
        m.loadTimeout,
      );
      if (!data.ok) {
        setErr(m.invalidLink);
        setPhase('error');
        return;
      }
      const nickname = asStr(data.nickname) || 'Ginit';
      const photoUrl = asStr(data.photoUrl);
      const gDna = asStr(data.gDna);
      setProfile({ nickname, photoUrl, gDna });
      setPhase('ready');
    } catch (e) {
      setErr(e instanceof Error ? e.message : m.unknownError);
      setPhase('error');
    }
  }, [m.invalidLink, m.loadTimeout, m.unknownError, token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase === 'loading') {
    return (
      <main className="gShell">
        <div className="gCenterEmpty">
          <div>
            <p className="gKicker">{m.kicker}</p>
            <p className="gEmptyText">{m.loading}</p>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'error' || !profile) {
    return (
      <main className="gShell">
        <div className="gCenterEmpty">
          <div>
            <p className="gKicker">{m.kicker}</p>
            <h1 className="gEmptyTitle">{m.errorTitle}</h1>
            <p className="gAlert" role="alert">
              {err ?? m.unknownError}
            </p>
            <p className="gEmptyText">{m.errorHint}</p>
          </div>
        </div>
      </main>
    );
  }

  const { nickname, photoUrl, gDna } = profile;
  const photoOk = photoUrl.startsWith('https://') || photoUrl.startsWith('http://');

  return (
    <main className="gShell">
      <header className="gHero">
        <div className="gHeroBody" style={{ paddingTop: 8 }}>
          <p className="gKicker">{m.kicker}</p>
          <h1 className="gTitle">{m.inviteTitle(nickname)}</h1>
          <p className="gDesc">{m.inviteBody}</p>
        </div>
      </header>

      <section className="gCard" aria-label={nickname}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            className={`gAvatarCircle ${photoOk ? 'gAvatarCirclePhoto' : ''}`}
            style={{ width: 72, height: 72, flexShrink: 0 }}>
            {photoOk ? <img src={photoUrl} alt="" /> : initialsFrom(nickname)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="gTitle" style={{ fontSize: 20, margin: 0 }}>
              {nickname}
            </div>
            {gDna ? (
              <p className="gDesc" style={{ marginTop: 6 }}>
                {m.gDnaLabel}: {gDna}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="gFooter">{m.footerAppHint}</footer>

      <div className="gBottomBar">
        <div className="gBottomInner">
          <GinitFriendInviteOpenLink
            className="gPillBtn gPillPrimary"
            friendInviteToken={token}>
            <span className="gPillBtnSymbol" aria-hidden>
              ✓
            </span>
            {m.acceptCta}
          </GinitFriendInviteOpenLink>
        </div>
      </div>
    </main>
  );
}
