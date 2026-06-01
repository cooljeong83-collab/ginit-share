'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties, type SVGProps } from 'react';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import { GINIT_PLAY_STORE_URL } from '@/lib/ginit-app-open';

import styles from './page.module.css';

const YOUTUBE_VIDEO_ID = 'k4RHJp1sqRc';

const FEATURE_ITEMS = [
  { id: 'search', label: '모임 탐색', Icon: IconSearch },
  { id: 'schedule', label: '일정 조율', Icon: IconCalendarCheck },
  { id: 'chat', label: '채팅 & 번역', Icon: IconChat },
  { id: 'arrival', label: '도착 인증', Icon: IconPin },
  { id: 'receipt', label: '영수증 정산', Icon: IconReceipt },
  { id: 'review', label: '후기 & 혜택', Icon: IconPeople },
] as const;

function iconProps(props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  };
}

function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

function IconCalendarCheck(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M9 14.5l2 2 4-4.5" />
    </svg>
  );
}

function IconChat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M5 6.5a3 3 0 013-3h8a3 3 0 013 3v5a3 3 0 01-3 3h-5l-4.5 3.5V14.5a3 3 0 01-3-3v-5z" />
      <circle cx="9" cy="9.5" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.5" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9.5" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z" />
      <circle cx="12" cy="11" r="2.25" />
    </svg>
  );
}

function IconReceipt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M7 4h10a2 2 0 012 2v14l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5V6a2 2 0 012-2z" />
      <path d="M9 9h6M9 12.5h6M9 16h4" />
    </svg>
  );
}

function IconPeople(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="9" cy="9" r="2.75" />
      <circle cx="16.5" cy="10" r="2.25" />
      <path d="M4.5 19c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4M13.5 19c0-1.8 1.4-3.2 3-3.5" />
    </svg>
  );
}

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
  const features = useInView<HTMLElement>();
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

        <section
          ref={features.ref}
          className={`${styles.featureBlock} ${features.inView ? styles.inView : ''}`}
          aria-label="주요 기능">
          <ul className={styles.featureGrid}>
            {FEATURE_ITEMS.map(({ id, label, Icon }, index) => (
              <li
                key={id}
                className={styles.featureItem}
                style={{ '--feat-i': index } as CSSProperties}>
                <span className={styles.featureIconBox}>
                  <Icon />
                </span>
                <span className={styles.featureLabel}>{label}</span>
              </li>
            ))}
          </ul>
        </section>

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
        </section>
      </div>
    </main>
  );
}
