'use client';

import GinitFriendInviteOpenLink from '@/app/GinitFriendInviteOpenLink';
import { apiFriendInviteGuestGet } from '@/lib/friend-invite-api-client';
import { getHomeContent, youtubeThumbnailUrl, type HomeLocale } from '@/lib/home-i18n';
import { useFriendInviteLocale } from '@/lib/use-friend-invite-locale';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import '../../s/[token]/share.css';
import styles from './friend-invite.module.css';

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

function PageShell({ children }: { children: React.ReactNode }) {
  return <main className={styles.page}>{children}</main>;
}

export default function ShareFriendInviteClient({ token }: ShareFriendInviteClientProps) {
  const { locale, m } = useFriendInviteLocale();
  const home = useMemo(() => getHomeContent(locale as HomeLocale), [locale]);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<InviteProfile | null>(null);

  const youtubeEmbedSrc = `https://www.youtube-nocookie.com/embed/${home.youtubeVideoId}?rel=0&modestbranding=1`;
  const youtubePosterSrc = youtubeThumbnailUrl(home.youtubeVideoId);

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
      <PageShell>
        <div className={styles.centerState}>
          <div className={styles.centerBlock}>
            <header className={styles.hero}>
              <Image
                src="/ginit-logo.png"
                alt=""
                width={72}
                height={72}
                className={styles.logo}
                priority
              />
              <p className={styles.kicker}>{m.kicker}</p>
            </header>
            <p className={styles.emptyText}>{m.loading}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (phase === 'error' || !profile) {
    return (
      <PageShell>
        <div className={styles.centerState}>
          <div className={styles.centerBlock}>
            <header className={styles.hero}>
              <Image
                src="/ginit-logo.png"
                alt=""
                width={72}
                height={72}
                className={styles.logo}
                priority
              />
              <p className={styles.kicker}>{m.kicker}</p>
            </header>
            <h1 className={styles.emptyTitle}>{m.errorTitle}</h1>
            <p className={styles.alert} role="alert">
              {err ?? m.unknownError}
            </p>
            <p className={styles.emptyText}>{m.errorHint}</p>
          </div>
        </div>
      </PageShell>
    );
  }

  const { nickname, photoUrl, gDna } = profile;
  const photoOk = photoUrl.startsWith('https://') || photoUrl.startsWith('http://');

  return (
    <PageShell>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <Image
            src="/ginit-logo.png"
            alt=""
            width={72}
            height={72}
            className={styles.logo}
            priority
          />
          <p className={styles.kicker}>{m.kicker}</p>
        </header>

        <section className={styles.inviteCard} aria-label={nickname}>
          <div className={styles.profile}>
            <div
              className={`${styles.avatar} ${photoOk ? styles.avatarPhoto : ''}`}
              aria-hidden={photoOk}>
              {photoOk ? <img src={photoUrl} alt="" /> : initialsFrom(nickname)}
            </div>
            <h1 className={styles.profileName}>{nickname}</h1>
            {gDna ? (
              <p className={styles.gDna}>
                <span>{m.gDnaLabel}</span>
                <span>{gDna}</span>
              </p>
            ) : null}
          </div>
          <h2 className={styles.inviteTitle}>{m.inviteTitle(nickname)}</h2>
          <p className={styles.inviteBody}>{m.inviteBody}</p>
        </section>

        <section className={styles.videoSection} aria-label={home.videoAria}>
          <div className={styles.videoFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.videoPoster}
              src={youtubePosterSrc}
              alt=""
              width={1280}
              height={720}
            />
            <iframe
              className={styles.video}
              src={youtubeEmbedSrc}
              title={home.videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>

        <footer className={styles.appFooter}>
          <h3 className={styles.appAboutTitle}>{m.appAboutTitle}</h3>
          <p className={styles.appAbout}>{home.metaDescription}</p>
          <p className={styles.installHint}>{m.footerAppHint}</p>
        </footer>
      </div>

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
    </PageShell>
  );
}
