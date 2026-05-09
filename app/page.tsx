import type { Metadata } from 'next';
import Image from 'next/image';

import styles from './page.module.css';

export const metadata: Metadata = {
  title: '지닛 — 모임·약속 앱',
  description:
    '지닛은 일정 후보, 장소, 투표, 채팅까지 모임을 한곳에서 돕는 앱입니다. 호스트가 보낸 링크로 웹에서도 참여할 수 있어요.',
};

function resolveAppOpenHref(): string {
  const raw = (process.env.NEXT_PUBLIC_GINIT_APP_OPEN_URL || '').trim();
  if (raw) return raw.replace(/\/+$/, '');
  return 'ginitapp://';
}

export default function HomePage() {
  const appHref = resolveAppOpenHref();

  return (
    <main className={styles.home}>
      <div className={styles.card}>
        <Image
          src="/ginit-logo.png"
          alt="지닛"
          width={108}
          height={108}
          className={styles.logo}
          priority
        />
        <h1 className={styles.title}>지닛</h1>
        <p className={styles.tagline}>모임·약속을 함께 정리하는 앱</p>

        <p className={styles.lead}>
          지닛은 친구·동료와 모임을 만들 때 <strong>일정 후보</strong>, <strong>장소</strong>,{' '}
          <strong>투표</strong>를 한곳에서 모으고, 확정 후에는 <strong>채팅·알림</strong>으로 이어질 수 있게
          돕습니다.
        </p>

        <ul className={styles.list}>
          <li>여러 날짜·시간 후보를 두고 참여자 투표로 정리</li>
          <li>장소 후보와 지도·상세 정보를 카드로 공유</li>
          <li>공개 모임, 승인형 모임 등 호스트 설정에 맞춘 참여 흐름</li>
        </ul>

        <p className={styles.note}>
          이 주소는 <strong>비회원 웹 공유</strong>용 사이트의 홈입니다. 모임 내용을 보려면 호스트가 보낸{' '}
          <strong>공유 링크</strong>(<code className={styles.code}>/s/…</code>)로 접속해 주세요.
        </p>

        <div className={styles.actions}>
          <a href={appHref} className={styles.cta}>
            지닛 앱 열기
          </a>
          <p className={styles.secondaryMuted}>앱스토어 링크는 준비 중이에요</p>
        </div>

        <p className={styles.footer}>
          © 지닛 · ginit-share
        </p>
      </div>
    </main>
  );
}
