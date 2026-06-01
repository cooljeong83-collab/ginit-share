'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import { AUDIENCE, HIGHLIGHTS, PAIN_APPS, PILLARS } from '@/lib/home-content';
import { GINIT_PLAY_STORE_URL } from '@/lib/ginit-app-open';

import styles from './page.module.css';

const YOUTUBE_VIDEO_ID = 'k4RHJp1sqRc';

function useInView<T extends HTMLElement>(rootMargin = '0px 0px -8% 0px') {
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
      { threshold: 0.08, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}

export default function HomeLanding() {
  const [ready, setReady] = useState(false);
  const pillars = useInView<HTMLElement>();
  const highlights = useInView<HTMLElement>();
  const audience = useInView<HTMLElement>();
  const video = useInView<HTMLElement>();
  const cta = useInView<HTMLElement>();

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const youtubeEmbedSrc = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`;
  const painLoop = [...PAIN_APPS, ...PAIN_APPS];

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
              width={56}
              height={56}
              className={styles.logo}
              priority
            />
          </div>
          <p className={styles.painHook}>
            카톡 따로, 지도 따로, 정산 앱 따로…
            <br />
            <strong>모임 하나에 앱을 몇 개나?</strong>
          </p>
          <h1 className={styles.headline}>
            <span className={styles.headlineMain}>올인원 모임 조율,</span>
            <span className={styles.headlineAccent}>지닛</span>
          </h1>
          <p className={styles.sub}>
            일정·장소·투표·채팅·도착·정산까지
            <br />
            <span className={styles.subMuted}>Gather · initiate</span>
          </p>
        </header>

        <div className={styles.painTrack} aria-hidden>
          <div className={styles.painMarquee}>
            {painLoop.map((app, i) => (
              <span key={`${app}-${i}`} className={styles.painChip}>
                {app}
              </span>
            ))}
          </div>
        </div>

        <section
          ref={pillars.ref}
          className={`${styles.section} ${pillars.inView ? styles.inView : ''}`}
          aria-labelledby="pillars-heading">
          <h2 id="pillars-heading" className={styles.sectionTitle}>
            하나로 끝내는 4가지
          </h2>
          <ul className={styles.pillarGrid}>
            {PILLARS.map((pillar, index) => (
              <li
                key={pillar.id}
                className={styles.pillarCard}
                style={{ '--card-i': index } as CSSProperties}>
                <span className={styles.pillarLabel}>{pillar.label}</span>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDesc}>{pillar.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          ref={highlights.ref}
          className={`${styles.section} ${highlights.inView ? styles.inView : ''}`}
          aria-labelledby="highlights-heading">
          <h2 id="highlights-heading" className={styles.sectionTitle}>
            핵심 기능
          </h2>
          <div className={styles.featureScroll}>
            <ul className={styles.featureTrack}>
              {HIGHLIGHTS.map((item, index) => (
                <li
                  key={item.num}
                  className={styles.featureCard}
                  style={{ '--card-i': index } as CSSProperties}>
                  <span className={styles.featureNum}>{item.num}</span>
                  <h3 className={styles.featureTitle}>{item.title}</h3>
                  <p className={styles.featureDesc}>{item.desc}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className={styles.scrollHint}>옆으로 밀어 더 보기</p>
        </section>

        <section
          ref={audience.ref}
          className={`${styles.section} ${styles.audienceSection} ${audience.inView ? styles.inView : ''}`}
          aria-labelledby="audience-heading">
          <h2 id="audience-heading" className={styles.sectionTitle}>
            이런 분께 추천
          </h2>
          <ul className={styles.audienceList}>
            {AUDIENCE.map((line, index) => (
              <li key={line} style={{ '--card-i': index } as CSSProperties}>
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section
          ref={video.ref}
          className={`${styles.videoBlock} ${video.inView ? styles.inView : ''}`}
          aria-label="소개 영상">
          <h2 className={styles.sectionTitle}>소개 영상</h2>
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
          <p className={styles.ctaLead}>지금 새로운 모임을 시작해 보세요</p>
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
          <p className={styles.note}>
            앱 없이도 <code className={styles.code}>/s/…</code> 공유 링크로 웹 투표 참여
          </p>
        </section>

        <footer className={styles.footer}>© 지닛 · Ginit</footer>
      </div>
    </main>
  );
}
