'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import { GINIT_PLAY_STORE_URL } from '@/lib/ginit-app-open';
import { youtubeThumbnailUrl } from '@/lib/home-i18n';
import { useScrollDeckLoop, useScrollSlides } from '@/lib/use-home-scroll-deck';
import { useHomeLocale } from '@/lib/use-home-locale';

import HomeLanguageSelect from './HomeLanguageSelect';
import { OnboardingIcon } from './OnboardingIcons';
import styles from './page.module.css';

export default function HomeLanding() {
  const { c } = useHomeLocale();
  const deckRef = useRef<HTMLElement>(null);
  const slideCount = 1 + c.featureSlides.length + c.highlightSlides.length;
  const { active, scrollTo } = useScrollSlides(deckRef, true);
  useScrollDeckLoop(deckRef, true, active, slideCount, scrollTo);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const youtubeEmbedSrc = `https://www.youtube-nocookie.com/embed/${c.youtubeVideoId}?rel=0&modestbranding=1`;
  const youtubePosterSrc = youtubeThumbnailUrl(c.youtubeVideoId);
  let slideIndex = 0;

  return (
    <main
      className={`${styles.page} ${ready ? styles.ready : ''} ${active === 0 ? styles.pageOnIntro : ''}`}>
      <div className={styles.ambient} aria-hidden>
        <span className={styles.orbA} />
        <span className={styles.orbB} />
        <span className={styles.gridFade} />
      </div>

      <HomeLanguageSelect />

      <nav className={styles.dots} aria-label={c.dotsAria}>
        {Array.from({ length: slideCount }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${active === i ? styles.dotActive : ''}`}
            aria-label={c.slideAria(i + 1)}
            aria-current={active === i ? 'true' : undefined}
            onClick={() => scrollTo(i)}
          />
        ))}
      </nav>

      <section ref={deckRef} className={styles.deck} aria-label={c.onboardingAria}>
        <article
          data-slide={slideIndex++}
          className={`${styles.slide} ${styles.slideIntro} ${active === 0 ? styles.slideActive : ''}`}
          aria-label={c.homeAria}>
          <div className={styles.introInner}>
            <header className={styles.hero}>
              <div className={styles.logoRing}>
                <Image
                  src="/ginit-logo.png"
                  alt=""
                  width={96}
                  height={96}
                  className={styles.logo}
                  priority
                />
              </div>
              <p className={styles.brand}>{c.brand}</p>
              <h1 className={styles.headline}>
                <span className={styles.headlineMain}>{c.headlineMain}</span>
                {c.headlineAccent ? (
                  <span className={styles.headlineAccent}>{c.headlineAccent}</span>
                ) : null}
              </h1>
            </header>

            <section className={styles.introVideo} aria-label={c.videoAria}>
              <div className={styles.introVideoFrame}>
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
                  title={c.videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </section>

            <section className={styles.introCta} aria-label={c.downloadAria}>
              <div className={styles.introActions}>
                <a
                  href={GINIT_PLAY_STORE_URL}
                  className={styles.introBtnPrimary}
                  target="_blank"
                  rel="noopener noreferrer">
                  <span className={styles.btnShine} aria-hidden />
                  {c.googlePlay}
                </a>
                <GinitAppOpenLink className={styles.introBtnGhost}>{c.openApp}</GinitAppOpenLink>
              </div>
            </section>

            <button
              type="button"
              className={styles.introScrollCue}
              onClick={() => scrollTo(1)}
              aria-label={c.scrollCue}>
              {c.scrollCue}
            </button>
          </div>
        </article>

        {c.featureSlides.map((item) => {
          const idx = slideIndex++;
          return (
            <article
              key={item.id}
              data-slide={idx}
              className={`${styles.slide} ${styles.slideFeature} ${active === idx ? styles.slideActive : ''}`}>
              <div className={styles.slideContent}>
                <span className={styles.step}>{item.step}</span>
                <div className={`${styles.iconStage} ${styles[`iconStage_${item.id}`]}`}>
                  <span className={styles.iconGlow} aria-hidden />
                  <span className={styles.iconBox}>
                    <OnboardingIcon id={item.id} />
                  </span>
                </div>
                <p className={styles.highlight}>{item.highlight}</p>
                <h2 className={styles.slideTitle}>{item.title}</h2>
                <p className={styles.slideDesc}>{item.desc}</p>
              </div>
            </article>
          );
        })}

        {c.highlightSlides.map((item) => {
          const idx = slideIndex++;
          return (
            <article
              key={item.id}
              data-slide={idx}
              className={`${styles.slide} ${styles.slideHighlight} ${active === idx ? styles.slideActive : ''}`}>
              <div className={styles.slideContent}>
                <div className={`${styles.iconStage} ${styles[`iconStage_${item.id}`]}`}>
                  <span className={styles.iconGlow} aria-hidden />
                  <span className={styles.iconBox}>
                    <OnboardingIcon id={item.id} />
                  </span>
                </div>
                <p className={styles.highlight}>{item.sub}</p>
                <h2 className={styles.slideTitle}>{item.title}</h2>
                <p className={styles.slideDesc}>{item.desc}</p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
