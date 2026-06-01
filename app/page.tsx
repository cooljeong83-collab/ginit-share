import type { Metadata } from 'next';
import Image from 'next/image';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import { GINIT_PLAY_STORE_URL } from '@/lib/ginit-app-open';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

import styles from './page.module.css';

const homeDesc =
  '지닛은 일정 후보, 장소, 투표, 채팅까지 모임을 한곳에서 돕는 앱입니다. 호스트가 보낸 링크로 웹에서도 참여할 수 있어요.';
const homeOgLogo = toAbsoluteSiteUrl('/ginit-logo.png');
const YOUTUBE_VIDEO_ID = 'k4RHJp1sqRc';

export const metadata: Metadata = {
  title: '지닛 — 모임·약속 앱',
  description: homeDesc,
  openGraph: {
    title: '지닛 — 모임·약속 앱',
    description: homeDesc,
    images: [{ url: homeOgLogo, width: 512, height: 512, alt: '지닛' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '지닛 — 모임·약속 앱',
    description: homeDesc,
    images: [homeOgLogo],
  },
};

function PlayStoreIcon() {
  return (
    <svg className={styles.playIcon} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85C3.34 21.61 3 21.09 3 20.5m13.81-5.38L6.05 21.34 14.54 12.85l2.27 2.27m3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.59 1.19l-2.29 1.32-2.5-2.5 2.5-2.5 2.29 1.32M6.05 2.66l10.76 6.22-2.27 2.27L6.05 2.66Z"
      />
    </svg>
  );
}

export default function HomePage() {
  const youtubeEmbedSrc = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`;

  return (
    <main className={styles.home}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div className={styles.logoWrap}>
            <Image
              src="/ginit-logo.png"
              alt=""
              width={88}
              height={88}
              className={styles.logo}
              priority
            />
          </div>
          <p className={styles.eyebrow}>모임·약속, 한곳에서</p>
          <h1 className={styles.title}>지닛</h1>
          <p className={styles.tagline}>
            일정 후보 · 장소 · 투표 · 채팅까지
            <br />
            친구와 함께 정리하는 모임 앱
          </p>
        </header>

        <section className={styles.videoSection} aria-labelledby="home-video-heading">
          <div className={styles.videoHeader}>
            <h2 id="home-video-heading" className={styles.videoTitle}>
              소개 영상
            </h2>
            <span className={styles.videoBadge}>YouTube</span>
          </div>
          <div className={styles.videoFrame}>
            <iframe
              className={styles.video}
              src={youtubeEmbedSrc}
              title="지닛 소개 영상"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>

        <ul className={styles.features}>
          <li className={styles.feature}>
            <span className={styles.featureIcon} aria-hidden>
              📅
            </span>
            <span className={styles.featureText}>여러 일정 후보 투표</span>
          </li>
          <li className={styles.feature}>
            <span className={styles.featureIcon} aria-hidden>
              📍
            </span>
            <span className={styles.featureText}>장소·지도 카드 공유</span>
          </li>
          <li className={styles.feature}>
            <span className={styles.featureIcon} aria-hidden>
              💬
            </span>
            <span className={styles.featureText}>확정 후 채팅·알림</span>
          </li>
        </ul>

        <div className={styles.actions}>
          <a
            href={GINIT_PLAY_STORE_URL}
            className={styles.playStoreBtn}
            target="_blank"
            rel="noopener noreferrer">
            <PlayStoreIcon />
            <span className={styles.playStoreText}>
              <span className={styles.playStoreLabel}>Google Play에서</span>
              <span className={styles.playStoreMain}>지닛 다운로드</span>
            </span>
          </a>
          <GinitAppOpenLink className={styles.openAppBtn}>이미 설치했어요 · 앱 열기</GinitAppOpenLink>
        </div>

        <p className={styles.note}>
          이 사이트는 <strong>웹 공유</strong>용입니다. 모임 내용은 호스트가 보낸{' '}
          <strong>공유 링크</strong>
          <code className={styles.code}> /s/…</code>로 열어 주세요.
        </p>

        <footer className={styles.footer}>© 지닛 · ginit-share</footer>
      </div>
    </main>
  );
}
