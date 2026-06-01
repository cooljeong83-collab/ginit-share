/** 홈 온보딩 슬라이드 카피 — 메인 배너·기능 소개 */

export const COVER = {
  kicker: '우리만의 모임을 가볍게 시작해요',
  headline: '모임의 시작부터 마무리까지,',
  headlineAccent: '하나로!',
  sub: '모임 찾기부터 약속 잡기, 채팅, 정산까지 지닛 하나로 완벽하게!',
} as const;

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

export const FEATURE_SLIDES = [
  {
    id: 'search' as const,
    step: '01',
    title: '모임 탐색',
    desc: '지도·피드로 주변 공개 모임을 찾고, 미팅·맛집·운동 등 테마별로 탐색해요.',
    highlight: '가까운 모임, 한눈에',
  },
  {
    id: 'schedule' as const,
    step: '02',
    title: '일정 조율',
    desc: '참여와 동시에 날짜·장소를 제안하고 투표로 빠르게 약속을 맞춰요.',
    highlight: '카톡 왕복은 그만',
  },
  {
    id: 'chat' as const,
    step: '03',
    title: '채팅 & 번역',
    desc: '모임 전용 채팅에 실시간 번역이 더해져, 언어 장벽 없이 대화해요.',
    highlight: '글로벌 모임 OK',
  },
  {
    id: 'arrival' as const,
    step: '04',
    title: '도착 인증',
    desc: '약속 장소 도착을 인증하고, 멤버에게 실시간으로 알려요.',
    highlight: '누가 왔는지 바로',
  },
  {
    id: 'receipt' as const,
    step: '05',
    title: '영수증 정산',
    desc: '영수증 사진 한 장이면 AI가 금액을 인식하고 N빵·더치페이를 자동 계산해요.',
    highlight: '정산 스트레스 ↓',
  },
  {
    id: 'review' as const,
    step: '06',
    title: '후기 & 혜택',
    desc: '모임 후기와 장소 소개를 남기고, 혜택·추억까지 이어가요.',
    highlight: '모임의 마무리까지',
  },
] as const;

export const HIGHLIGHT_SLIDES = [
  {
    id: 'global' as const,
    title: '언어의 장벽 없이',
    desc: '실시간 번역으로 글로벌 친구와 자연스럽게 이어져요.',
    sub: '한·영·일 다국어 지원',
  },
  {
    id: 'link' as const,
    title: '앱 설치 없이도 OK',
    desc: '공유 링크만으로 웹에서 일정·장소 투표에 참여할 수 있어요.',
    sub: '친구 초대가 쉬워요',
  },
  {
    id: 'ai' as const,
    title: 'AI가 추천하는 장소',
    desc: '모임 성격에 맞는 장소를 AI가 제안하고 후보로 등록해요.',
    sub: '맛집·와인바·모임 테마별',
  },
  {
    id: 'allinone' as const,
    title: '시작부터 마무리까지',
    desc: '일정·채팅·도착·정산을 지닛 하나로 이어지게 해요.',
    sub: '올인원 모임 앱',
  },
] as const;
