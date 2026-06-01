/** 홈 랜딩 — 한국(ko) / 그 외 영어(en) */

export type HomeLocale = 'ko' | 'en';

export type OnboardingIconId =
  | 'search'
  | 'schedule'
  | 'chat'
  | 'arrival'
  | 'receipt'
  | 'review'
  | 'global'
  | 'link'
  | 'ai'
  | 'allinone';

export type HomeFeatureSlide = {
  id: OnboardingIconId;
  step: string;
  title: string;
  desc: string;
  highlight: string;
};

export type HomeHighlightSlide = {
  id: OnboardingIconId;
  title: string;
  desc: string;
  sub: string;
};

export type HomeContent = {
  locale: HomeLocale;
  htmlLang: string;
  youtubeVideoId: string;
  brand: string;
  headlineMain: string;
  headlineAccent: string;
  videoTitle: string;
  googlePlay: string;
  openApp: string;
  scrollCue: string;
  dotsAria: string;
  slideAria: (n: number) => string;
  homeAria: string;
  onboardingAria: string;
  videoAria: string;
  downloadAria: string;
  featureSlides: readonly HomeFeatureSlide[];
  highlightSlides: readonly HomeHighlightSlide[];
  metaTitle: string;
  metaDescription: string;
};

const YOUTUBE_KO = 'k4RHJp1sqRc';
const YOUTUBE_EN = 'bPErBntQH5E';

const KO: HomeContent = {
  locale: 'ko',
  htmlLang: 'ko',
  youtubeVideoId: YOUTUBE_KO,
  brand: '지닛',
  headlineMain: '모임의 시작부터 마무리까지,',
  headlineAccent: '하나로!',
  videoTitle: '지닛 소개 영상',
  googlePlay: 'Google Play 다운로드',
  openApp: '앱 열기',
  scrollCue: '아래로 넘겨 기능 살펴보기',
  dotsAria: '온보딩 섹션',
  slideAria: (n) => `${n}번째 화면`,
  homeAria: '지닛 홈',
  onboardingAria: '지닛 소개',
  videoAria: '소개 영상',
  downloadAria: '다운로드',
  metaTitle: '지닛 — 모임·약속 앱',
  metaDescription:
    '지닛은 일정 후보, 장소, 투표, 채팅까지 모임을 한곳에서 돕는 앱입니다. 호스트가 보낸 링크로 웹에서도 참여할 수 있어요.',
  featureSlides: [
    {
      id: 'search',
      step: '01',
      title: '모임 탐색',
      desc: '지도·피드로 주변 공개 모임을 찾고, 미팅·맛집·운동 등 테마별로 탐색해요.',
      highlight: '가까운 모임, 한눈에',
    },
    {
      id: 'schedule',
      step: '02',
      title: '일정 조율',
      desc: '참여와 동시에 날짜·장소를 제안하고 투표로 빠르게 약속을 맞춰요.',
      highlight: '카톡 왕복은 그만',
    },
    {
      id: 'chat',
      step: '03',
      title: '채팅 & 번역',
      desc: '모임 전용 채팅에 실시간 번역이 더해져, 언어 장벽 없이 대화해요.',
      highlight: '글로벌 모임 OK',
    },
    {
      id: 'arrival',
      step: '04',
      title: '도착 인증',
      desc: '약속 장소 도착을 인증하고, 멤버에게 실시간으로 알려요.',
      highlight: '누가 왔는지 바로',
    },
    {
      id: 'receipt',
      step: '05',
      title: '영수증 정산',
      desc: '영수증 사진 한 장이면 AI가 금액을 인식하고 N빵·더치페이를 자동 계산해요.',
      highlight: '정산 스트레스 ↓',
    },
    {
      id: 'review',
      step: '06',
      title: '후기 & 혜택',
      desc: '모임 후기와 장소 소개를 남기고, 혜택·추억까지 이어가요.',
      highlight: '모임의 마무리까지',
    },
  ],
  highlightSlides: [
    {
      id: 'global',
      title: '언어의 장벽 없이',
      desc: '실시간 번역으로 글로벌 친구와 자연스럽게 이어져요.',
      sub: '한·영·일 다국어 지원',
    },
    {
      id: 'link',
      title: '앱 설치 없이도 OK',
      desc: '공유 링크만으로 웹에서 일정·장소 투표에 참여할 수 있어요.',
      sub: '친구 초대가 쉬워요',
    },
    {
      id: 'ai',
      title: 'AI가 추천하는 장소',
      desc: '모임 성격에 맞는 장소를 AI가 제안하고 후보로 등록해요.',
      sub: '맛집·와인바·모임 테마별',
    },
    {
      id: 'allinone',
      title: '시작부터 마무리까지',
      desc: '일정·채팅·도착·정산을 지닛 하나로 이어지게 해요.',
      sub: '올인원 모임 앱',
    },
  ],
};

const EN: HomeContent = {
  locale: 'en',
  htmlLang: 'en',
  youtubeVideoId: YOUTUBE_EN,
  brand: 'Ginit',
  headlineMain: 'From start to finish,',
  headlineAccent: 'all in one place.',
  videoTitle: 'Ginit intro video',
  googlePlay: 'Get it on Google Play',
  openApp: 'Open app',
  scrollCue: 'Scroll to explore features',
  dotsAria: 'Onboarding sections',
  slideAria: (n) => `Screen ${n}`,
  homeAria: 'Ginit home',
  onboardingAria: 'About Ginit',
  videoAria: 'Intro video',
  downloadAria: 'Download',
  metaTitle: 'Ginit — Meetups & plans',
  metaDescription:
    'Ginit helps groups pick dates, places, polls, and chat in one app. Join from a shared link on the web—no install required.',
  featureSlides: [
    {
      id: 'search',
      step: '01',
      title: 'Discover meetups',
      desc: 'Browse public gatherings on the map and feed—dining, drinks, sports, and more.',
      highlight: 'Nearby, at a glance',
    },
    {
      id: 'schedule',
      step: '02',
      title: 'Schedule together',
      desc: 'Suggest dates and places as you join; vote to lock plans fast.',
      highlight: 'Less back-and-forth',
    },
    {
      id: 'chat',
      step: '03',
      title: 'Chat & translate',
      desc: 'Dedicated group chat with live translation—talk across languages.',
      highlight: 'Global-friendly',
    },
    {
      id: 'arrival',
      step: '04',
      title: 'Arrival check-in',
      desc: 'Verify when you arrive and notify the group in real time.',
      highlight: 'Know who’s there',
    },
    {
      id: 'receipt',
      step: '05',
      title: 'Receipt split',
      desc: 'Snap a receipt—AI reads totals and splits the bill automatically.',
      highlight: 'Less math stress',
    },
    {
      id: 'review',
      step: '06',
      title: 'Reviews & perks',
      desc: 'Leave meetup reviews, spot notes, and keep memories in one flow.',
      highlight: 'Through the finish',
    },
  ],
  highlightSlides: [
    {
      id: 'global',
      title: 'No language barrier',
      desc: 'Live translation keeps global friends in the same conversation.',
      sub: 'Korean · English · Japanese',
    },
    {
      id: 'link',
      title: 'No install required',
      desc: 'Vote on time and place from a shared web link.',
      sub: 'Easy invites',
    },
    {
      id: 'ai',
      title: 'AI place picks',
      desc: 'Get venue suggestions that fit your meetup vibe.',
      sub: 'Themes & moods',
    },
    {
      id: 'allinone',
      title: 'Start to finish',
      desc: 'Scheduling, chat, arrival, and settlement—one app.',
      sub: 'All-in-one meetups',
    },
  ],
};

function regionFromTag(tag: string): string | null {
  const parts = tag.trim().toLowerCase().split(/[-_]/);
  return parts.length >= 2 ? (parts[1] ?? null) : null;
}

function baseLang(tag: string): string | null {
  const t = tag.trim().toLowerCase();
  if (!t) return null;
  return t.split(/[-_]/)[0] ?? null;
}

/** 한국(지역·시간대·ko)이면 ko, 아니면 en */
export function resolveHomeLocale(): HomeLocale {
  if (typeof navigator === 'undefined') return 'ko';

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Seoul') return 'ko';
  } catch {
    /* ignore */
  }

  const tags = navigator.languages?.length ? [...navigator.languages] : [navigator.language];

  for (const tag of tags) {
    if (regionFromTag(tag) === 'kr') return 'ko';
  }

  for (const tag of tags) {
    if (baseLang(tag) === 'ko') return 'ko';
  }

  return 'en';
}

/** Accept-Language 헤더(서버 메타데이터용) */
export function resolveHomeLocaleFromAcceptLanguage(header: string | null): HomeLocale {
  if (!header) return 'ko';

  const parts = header.split(',').map((p) => p.trim().split(';')[0]?.toLowerCase() ?? '');
  for (const tag of parts) {
    if (regionFromTag(tag) === 'kr' || tag === 'ko') return 'ko';
  }

  return 'en';
}

export function getHomeContent(locale: HomeLocale): HomeContent {
  return locale === 'ko' ? KO : EN;
}
