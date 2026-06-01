'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import {
  FEATURE_WORDS,
  HOME_HOOK,
  HOME_SUB,
  HOME_TITLE,
  REPLACE_FROM,
  YOUTUBE_VIDEO_ID,
} from '@/lib/home-content';
import { GINIT_PLAY_STORE_URL } from '@/lib/ginit-app-open';

import styles from './page.module.css';

const SLIDE_COUNT = 4;

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
      { root, threshold: [0.35, 0.5, 0.65, 0.8] },
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [containerRef]);

  const scrollTo = useCallback((index: number) => {
    const root = containerRef.current;
    if (!root) return;
    const slide = root.querySelector<HTMLElement>(`[data-slide="${index}"]`);
    slide?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  return (
    <main className={`${styles.page} ${ready ? styles.ready : ''}`}>
      <div className={styles.ambient} aria-hidden>
        <span className={styles.orbA} />
        <span className={styles.orbB} />
      </div>

      <nav className={styles.dots} aria-label="섹션">
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
          data-slide="0"
          className={`${styles.slide} ${active === 0 ? styles.slideActive : ''}`}
          aria-label="소개">
          <div className={styles.slideInner}>
            <div className={styles.logoRing}>
              <Image
                src="/ginit-logo.png"
                alt=""
                width={64}
                height={64}
                className={styles.logo}
                priority
              />
            </div>
            <p className={styles.hook}>{HOME_HOOK}</p>
            <h1 className={styles.title}>{HOME_TITLE}</h1>
            <p className={styles.sub}>{HOME_SUB}</p>
            <p className={styles.scrollCue} aria-hidden>
              아래로
            </p>
          </div>
        </article>

        <article
          data-slide="1"
          className={`${styles.slide} ${active === 1 ? styles.slideActive : ''}`}
          aria-label="소개 영상">
          <div className={styles.slideInner}>
            <p className={styles.slideLabel}>영상</p>
            <div className={styles.videoFrame}>
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
            <a
              className={styles.videoLink}
              href={`https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`}
              target="_blank"
              rel="noopener noreferrer">
              YouTube
            </a>
          </div>
        </article>

        <article
          data-slide="2"
          className={`${styles.slide} ${active === 2 ? styles.slideActive : ''}`}
          aria-label="기능">
          <div className={styles.slideInner}>
            <ul className={styles.replaceRow} aria-label="대신 하나로">
              {REPLACE_FROM.map((word, i) => (
                <li
                  key={word}
                  className={styles.replaceWord}
                  style={{ '--i': i } as CSSProperties}>
                  {word}
                </li>
              ))}
              <li className={styles.replaceArrow} aria-hidden>
                →
              </li>
              <li className={styles.replaceTo}>{HOME_TITLE}</li>
            </ul>
            <ul className={styles.wordGrid}>
              {FEATURE_WORDS.map((word, i) => (
                <li
                  key={word}
                  className={styles.wordChip}
                  style={{ '--i': i } as CSSProperties}>
                  {word}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article
          data-slide="3"
          className={`${styles.slide} ${active === 3 ? styles.slideActive : ''}`}
          aria-label="다운로드">
          <div className={styles.slideInner}>
            <p className={styles.ctaLead}>시작하기</p>
            <div className={styles.actions}>
              <a
                href={GINIT_PLAY_STORE_URL}
                className={styles.btnPrimary}
                target="_blank"
                rel="noopener noreferrer">
                Google Play
              </a>
              <GinitAppOpenLink className={styles.btnGhost}>앱 열기</GinitAppOpenLink>
            </div>
            <footer className={styles.footer}>© 지닛</footer>
          </div>
        </article>
      </section>
    </main>
  );
}
