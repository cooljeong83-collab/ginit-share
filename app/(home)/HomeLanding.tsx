'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import { GINIT_PLAY_STORE_URL } from '@/lib/ginit-app-open';

import styles from './page.module.css';

const YOUTUBE_VIDEO_ID = 'k4RHJp1sqRc';
const FEATURES = ['일정 투표', '장소·지도', '채팅·알림'] as const;

function useInView<T extends HTMLElement>(rootMargin = '0px 0px -6% 0px') {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

export default function HomeLanding() {
  const [ready, setReady] = useState(false);
  const video = useInView<HTMLElement>();
  const cta = useInView<HTMLElement>();

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
        <span className={styles.gridFade} />
      </div>

      <div className={styles.inner}>
        <header className={styles.hero}>
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
          <p className={styles.kicker}>Ginit</p>
          <h1 className={styles.headline}>
            <span className={styles.headlineMain}>모임·약속,</span>
            <span className={styles.headlineAccent}>한곳에서.</span>
          </h1>
        </header>

        <section
          ref={video.ref}
          className={`${styles.videoBlock} ${video.inView ? styles.inView : ''}`}
          aria-label="소개 영상">
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
            YouTube에서 보기
          </a>
        </section>

        <section
          ref={cta.ref}
          className={`${styles.ctaBlock} ${cta.inView ? styles.inView : ''}`}
          aria-label="다운로드">
          <div className={styles.actions}>
            <a
              href={GINIT_PLAY_STORE_URL}
              className={styles.btnPrimary}
              target="_blank"
              rel="noopener noreferrer">
              <span className={styles.btnShine} aria-hidden />
              Google Play 다운로드
            </a>
            <GinitAppOpenLink className={styles.btnGhost}>앱 열기</GinitAppOpenLink>
          </div>

          <ul className={styles.chips} aria-label="주요 기능">
            {FEATURES.map((label, index) => (
              <li
                key={label}
                style={{ '--chip-i': index } as CSSProperties}
                className={cta.inView ? styles.chipVisible : undefined}>
                {label}
              </li>
            ))}
          </ul>

          <p className={styles.note}>
            공유 링크 <code className={styles.code}>/s/…</code>로 웹에서도 참여할 수 있어요.
          </p>
        </section>

        <footer className={styles.footer}>© 지닛</footer>
      </div>
    </main>
  );
}
