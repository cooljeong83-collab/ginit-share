'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import { GINIT_PLAY_STORE_URL } from '@/lib/ginit-app-open';
import { FEATURE_SLIDES, HIGHLIGHT_SLIDES } from '@/lib/home-onboarding';

import { OnboardingIcon } from './OnboardingIcons';
import styles from './page.module.css';

const YOUTUBE_VIDEO_ID = 'k4RHJp1sqRc';
const SLIDE_COUNT = 1 + FEATURE_SLIDES.length + HIGHLIGHT_SLIDES.length;

function useScrollSlides(containerRef: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const slides = root.querySelectorAll<HTMLElement>('[data-slide]');
    if (!slides.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIdx = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const idx = Number((entry.target as HTMLElement).dataset.slide);
          if (Number.isNaN(idx)) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIdx = idx;
          }
        }
        if (bestIdx >= 0) setActive(bestIdx);
      },
      { root, threshold: [0.4, 0.55, 0.7] },
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [containerRef]);

  const scrollTo = useCallback((index: number) => {
    const root = containerRef.current;
    if (!root) return;
    root.querySelector<HTMLElement>(`[data-slide="${index}"]`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [containerRef]);

  return { active, scrollTo };
}

export default function HomeLanding() {
  const deckRef = useRef<HTMLElement>(null);
  const { active, scrollTo } = useScrollSlides(deckRef);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const youtubeEmbedSrc = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`;
  let slideIndex = 0;

  return (
    <main
      className={`${styles.page} ${ready ? styles.ready : ''} ${active === 0 ? styles.pageOnIntro : ''}`}>
      <div className={styles.ambient} aria-hidden>
        <span className={styles.orbA} />
        <span className={styles.orbB} />
        <span className={styles.gridFade} />
      </div>

      <nav className={styles.dots} aria-label="온보딩 섹션">
        {Array.from({ length: SLIDE_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${active === i ? styles.dotActive : ''}`}
            aria-label={`${i + 1}번째 화면`}
            aria-current={active === i ? 'true' : undefined}
            onClick={() => scrollTo(i)}
          />
        ))}
      </nav>

      <section ref={deckRef} className={styles.deck} aria-label="지닛 소개">
        <article
          data-slide={slideIndex++}
          className={`${styles.slide} ${styles.slideIntro} ${active === 0 ? styles.slideActive : ''}`}
          aria-label="지닛 홈">
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
              <p className={styles.brand}>지닛</p>
              <h1 className={styles.headline}>
                <span className={styles.headlineMain}>모임의 시작부터 마무리까지,</span>
                <span className={styles.headlineAccent}>하나로!</span>
              </h1>
            </header>

            <section className={styles.introVideo} aria-label="소개 영상">
              <div className={styles.introVideoFrame}>
                <iframe
                  className={styles.video}
                  src={youtubeEmbedSrc}
                  title="지닛 소개 영상"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </section>

            <section className={styles.introCta} aria-label="다운로드">
              <div className={styles.introActions}>
                <a
                  href={GINIT_PLAY_STORE_URL}
                  className={styles.introBtnPrimary}
                  target="_blank"
                  rel="noopener noreferrer">
                  <span className={styles.btnShine} aria-hidden />
                  Google Play 다운로드
                </a>
                <GinitAppOpenLink className={styles.introBtnGhost}>앱 열기</GinitAppOpenLink>
              </div>
            </section>

            <p className={styles.introScrollCue}>아래로 넘겨 기능 살펴보기</p>
          </div>
        </article>

        {FEATURE_SLIDES.map((item) => {
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

        {HIGHLIGHT_SLIDES.map((item) => {
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
