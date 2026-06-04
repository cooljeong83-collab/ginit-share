'use client';

import { OnboardingIcon } from '@/app/(home)/OnboardingIcons';
import homeStyles from '@/app/(home)/page.module.css';
import GinitFriendInviteOpenLink from '@/app/GinitFriendInviteOpenLink';
import { apiFriendInviteGuestGet } from '@/lib/friend-invite-api-client';
import type { FriendInviteMessages } from '@/lib/friend-invite-i18n';
import { getHomeContent, youtubeThumbnailUrl, type HomeLocale } from '@/lib/home-i18n';
import type { ShareLocale } from '@/lib/share-i18n';
import { useScrollDeckLoop, useScrollSlides } from '@/lib/use-home-scroll-deck';
import { useFriendInviteLocale } from '@/lib/use-friend-invite-locale';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import FriendInviteLanguageSelect from './FriendInviteLanguageSelect';
import styles from './friend-invite.module.css';

function FriendInviteTopChrome({
  m,
  locale,
  setLocale,
  onIntro,
}: {
  m: FriendInviteMessages;
  locale: ShareLocale;
  setLocale: (locale: ShareLocale) => void;
  onIntro: boolean;
}) {
  return (
    <>
      <header
        className={`${styles.brandBar} ${onIntro ? styles.brandBarOnIntro : styles.brandBarOnDark}`}
        aria-label={m.kicker}>
        <Image
          src="/ginit-logo.png"
          alt=""
          width={22}
          height={22}
          className={styles.brandLogo}
          priority
        />
        <p className={styles.brandText}>
          <span className={styles.brandName}>{m.headerBrand}</span>
          <span className={styles.brandSep}> - </span>
          <span className={styles.brandSubtitle}>{m.headerSubtitle}</span>
        </p>
      </header>
      <FriendInviteLanguageSelect
        locale={locale}
        onLocaleChange={setLocale}
        onIntro={onIntro}
      />
    </>
  );
}

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
};

type ShareFriendInviteClientProps = {
  token: string;
};

export default function ShareFriendInviteClient({ token }: ShareFriendInviteClientProps) {
  const { locale, m, setLocale } = useFriendInviteLocale();
  const home = useMemo(() => getHomeContent(locale as HomeLocale), [locale]);
  const deckRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState<string | null>(null);
  const [profile, setProfile] = useState<InviteProfile | null>(null);

  const deckEnabled = phase === 'ready';
  const slideCount = 1 + home.featureSlides.length + home.highlightSlides.length;
  const { active, scrollTo } = useScrollSlides(deckRef, deckEnabled);
  useScrollDeckLoop(deckRef, deckEnabled, active, slideCount, scrollTo);

  const youtubeEmbedSrc = `https://www.youtube-nocookie.com/embed/${home.youtubeVideoId}?rel=0&modestbranding=1`;
  const youtubePosterSrc = youtubeThumbnailUrl(home.youtubeVideoId);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

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
      setProfile({ nickname, photoUrl });
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
      <main className={styles.statePage}>
        <FriendInviteTopChrome m={m} locale={locale} setLocale={setLocale} onIntro />
        <p className={styles.stateText}>{m.loading}</p>
      </main>
    );
  }

  if (phase === 'error' || !profile) {
    return (
      <main className={styles.statePage}>
        <FriendInviteTopChrome m={m} locale={locale} setLocale={setLocale} onIntro />
        <h1 className={styles.stateTitle}>{m.errorTitle}</h1>
        <p className={styles.alert} role="alert">
          {err ?? m.unknownError}
        </p>
        <p className={styles.stateText}>{m.errorHint}</p>
      </main>
    );
  }

  const { nickname, photoUrl } = profile;
  const photoOk = photoUrl.startsWith('https://') || photoUrl.startsWith('http://');
  let slideIndex = 0;

  return (
    <main
      className={`${homeStyles.page} ${ready ? homeStyles.ready : ''} ${active === 0 ? homeStyles.pageOnIntro : ''}`}>
      <FriendInviteTopChrome
        m={m}
        locale={locale}
        setLocale={setLocale}
        onIntro={active === 0}
      />
      <nav className={homeStyles.dots} aria-label={home.dotsAria}>
        {Array.from({ length: slideCount }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${homeStyles.dot} ${active === i ? homeStyles.dotActive : ''}`}
            aria-label={home.slideAria(i + 1)}
            aria-current={active === i ? 'true' : undefined}
            onClick={() => scrollTo(i)}
          />
        ))}
      </nav>

      <section ref={deckRef} className={homeStyles.deck} aria-label={home.onboardingAria}>
        <article
          data-slide={slideIndex++}
          className={`${homeStyles.slide} ${homeStyles.slideIntro} ${styles.introSlide} ${active === 0 ? homeStyles.slideActive : ''}`}
          aria-label={m.inviteTitle(nickname)}>
          <div className={`${homeStyles.introInner} ${styles.introInner}`}>
            <section className={styles.inviteCard} aria-label={nickname}>
              <div className={styles.profile}>
                <div
                  className={`${styles.avatar} ${photoOk ? styles.avatarPhoto : ''}`}
                  aria-hidden={photoOk}>
                  {photoOk ? <img src={photoUrl} alt="" /> : initialsFrom(nickname)}
                </div>
                <h1 className={styles.profileName}>{nickname}</h1>
              </div>
              <h2 className={styles.inviteTitle}>{m.inviteTitle(nickname)}</h2>
              <p className={styles.inviteBody}>{m.inviteBody}</p>
            </section>

            <section className={homeStyles.introCta} aria-label={m.acceptCta}>
              <div className={homeStyles.introActions}>
                <GinitFriendInviteOpenLink
                  className={homeStyles.introBtnPrimary}
                  friendInviteToken={token}>
                  <span className={homeStyles.btnShine} aria-hidden />
                  {m.acceptCta}
                </GinitFriendInviteOpenLink>
              </div>
            </section>

            <section className={homeStyles.introVideo} aria-label={home.videoAria}>
              <div className={`${homeStyles.introVideoFrame} ${styles.introVideoFrame}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={homeStyles.videoPoster}
                  src={youtubePosterSrc}
                  alt=""
                  width={1280}
                  height={720}
                />
                <iframe
                  className={`${homeStyles.video} ${styles.introVideo}`}
                  src={youtubeEmbedSrc}
                  title={home.videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </section>

            <button
              type="button"
              className={`${homeStyles.introScrollCue} ${styles.scrollCueBtn}`}
              onClick={() => scrollTo(1)}
              aria-label={home.scrollCue}>
              {home.scrollCue}
            </button>
          </div>
        </article>

        {home.featureSlides.map((item) => {
          const idx = slideIndex++;
          return (
            <article
              key={item.id}
              data-slide={idx}
              className={`${homeStyles.slide} ${homeStyles.slideFeature} ${active === idx ? homeStyles.slideActive : ''}`}>
              <div className={homeStyles.slideContent}>
                <span className={homeStyles.step}>{item.step}</span>
                <div className={`${homeStyles.iconStage} ${homeStyles[`iconStage_${item.id}`]}`}>
                  <span className={homeStyles.iconGlow} aria-hidden />
                  <span className={homeStyles.iconBox}>
                    <OnboardingIcon id={item.id} />
                  </span>
                </div>
                <p className={homeStyles.highlight}>{item.highlight}</p>
                <h2 className={homeStyles.slideTitle}>{item.title}</h2>
                <p className={homeStyles.slideDesc}>{item.desc}</p>
              </div>
            </article>
          );
        })}

        {home.highlightSlides.map((item, hIdx) => {
          const idx = slideIndex++;
          const isLast = hIdx === home.highlightSlides.length - 1;
          return (
            <article
              key={item.id}
              data-slide={idx}
              className={`${homeStyles.slide} ${homeStyles.slideHighlight} ${active === idx ? homeStyles.slideActive : ''}`}>
              <div className={homeStyles.slideContent}>
                <div className={`${homeStyles.iconStage} ${homeStyles[`iconStage_${item.id}`]}`}>
                  <span className={homeStyles.iconGlow} aria-hidden />
                  <span className={homeStyles.iconBox}>
                    <OnboardingIcon id={item.id} />
                  </span>
                </div>
                <p className={homeStyles.highlight}>{item.sub}</p>
                <h2 className={homeStyles.slideTitle}>{item.title}</h2>
                <p className={homeStyles.slideDesc}>{item.desc}</p>
                {isLast ? <p className={styles.installHint}>{m.footerAppHint}</p> : null}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
