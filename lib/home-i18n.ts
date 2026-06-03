/** 홈 랜딩 — ko / en / ja / zh / zh-TW / vi / la */

export type HomeLocale = 'ko' | 'en' | 'ja' | 'zh' | 'zh-TW' | 'vi' | 'la';

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
const YOUTUBE_EN = 'VC2Yh9aTivY';
const YOUTUBE_JA = 'MJyJAklCIMg';
const YOUTUBE_ZH = 'zwUDhi71O-8';
const YOUTUBE_ZH_TW = 'Wh72WxMDt8c';
const YOUTUBE_LA = '7o7QUYBq6SQ';

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

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
      desc: '모임 전용 채팅과 실시간 번역으로 언어 장벽 없이 대화해요.',
      highlight: '7개 언어 지원',
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
      desc: '한국어, 영어, 일본어, 중국어, 대만어, 라틴어, 베트남어를 지원하는 실시간 번역으로 글로벌 친구와 자연스럽게 이어져요.',
      sub: '7개 언어 지원',
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
  headlineMain: 'Meet Friends in Korea',
  headlineAccent: '',
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
  metaTitle: 'Ginit — Meet Friends in Korea',
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
      desc: 'Group chat with live translation—talk across languages with ease.',
      highlight: '7 languages',
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
      desc: 'Live translation supports Korean, English, Japanese, Chinese, Taiwanese, Latin, and Vietnamese—stay close with friends worldwide.',
      sub: '7 languages supported',
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

const JA: HomeContent = {
  locale: 'ja',
  htmlLang: 'ja',
  youtubeVideoId: YOUTUBE_JA,
  brand: 'Ginit',
  headlineMain: '韓国で友だちと出会う',
  headlineAccent: '',
  videoTitle: 'Ginit 紹介動画',
  googlePlay: 'Google Play で入手',
  openApp: 'アプリを開く',
  scrollCue: '下にスクロールして機能を見る',
  dotsAria: 'オンボーディング',
  slideAria: (n) => `画面 ${n}`,
  homeAria: 'Ginit ホーム',
  onboardingAria: 'Ginit について',
  videoAria: '紹介動画',
  downloadAria: 'ダウンロード',
  metaTitle: 'Ginit — 韓国で友だちと出会う',
  metaDescription:
    '日程・場所・投票・チャットをひとつのアプリで。共有リンクからWebでも参加でき、インストールは不要です。',
  featureSlides: [
    {
      id: 'search',
      step: '01',
      title: 'オフ会を探す',
      desc: 'マップやフィードで公開オフ会をチェック。食事、飲み会、スポーツなど。',
      highlight: '近くがひと目で',
    },
    {
      id: 'schedule',
      step: '02',
      title: '日程を一緒に決める',
      desc: '参加しながら日時・場所を提案し、投票で素早く決定。',
      highlight: 'やり取りを減らす',
    },
    {
      id: 'chat',
      step: '03',
      title: 'チャット＆翻訳',
      desc: 'グループチャットとリアルタイム翻訳で、言葉の壁なく会話。',
      highlight: '7言語対応',
    },
    {
      id: 'arrival',
      step: '04',
      title: '到着チェックイン',
      desc: '到着を確認し、グループへリアルタイムで通知。',
      highlight: '誰が来たかすぐわかる',
    },
    {
      id: 'receipt',
      step: '05',
      title: 'レシート割り勘',
      desc: 'レシートを撮るだけで、AIが金額を読み取り自動で割り勘。',
      highlight: '計算の手間を軽く',
    },
    {
      id: 'review',
      step: '06',
      title: 'レビュー＆特典',
      desc: 'オフ会のレビューやスポットメモを残し、思い出までひと続きに。',
      highlight: '最後までスムーズに',
    },
  ],
  highlightSlides: [
    {
      id: 'global',
      title: '言葉の壁を越えて',
      desc: '韓国語・英語・日本語・中国語・台湾語・ラテン語・ベトナム語のリアルタイム翻訳で、世界中の友だちと自然につながれます。',
      sub: '7言語対応',
    },
    {
      id: 'link',
      title: 'アプリ不要',
      desc: '共有リンクから、Webで日時・場所に投票できます。',
      sub: '招待がかんたん',
    },
    {
      id: 'ai',
      title: 'AIがおすすめする場所',
      desc: 'オフ会の雰囲気に合う会場をAIが提案します。',
      sub: 'テーマ別に',
    },
    {
      id: 'allinone',
      title: '最初から最後まで',
      desc: '日程・チャット・到着・精算を、Ginitひとつで。',
      sub: 'オールインワン',
    },
  ],
};

const ZH: HomeContent = {
  locale: 'zh',
  htmlLang: 'zh-Hans',
  youtubeVideoId: YOUTUBE_ZH,
  brand: 'Ginit',
  headlineMain: '在韩国结识新朋友',
  headlineAccent: '',
  videoTitle: 'Ginit 介绍视频',
  googlePlay: '在 Google Play 获取',
  openApp: '打开应用',
  scrollCue: '向下滑动，了解功能',
  dotsAria: '引导分区',
  slideAria: (n) => `第 ${n} 屏`,
  homeAria: 'Ginit 首页',
  onboardingAria: '关于 Ginit',
  videoAria: '介绍视频',
  downloadAria: '下载',
  metaTitle: 'Ginit — 在韩国结识新朋友',
  metaDescription:
    '日程、地点、投票、聊天，一个应用全搞定。通过分享链接即可在网页参与，无需安装。',
  featureSlides: [
    {
      id: 'search',
      step: '01',
      title: '发现聚会',
      desc: '在地图和动态中浏览公开聚会——聚餐、酒局、运动等。',
      highlight: '附近一目了然',
    },
    {
      id: 'schedule',
      step: '02',
      title: '一起定日程',
      desc: '参与时即可提议日期和地点，投票快速敲定计划。',
      highlight: '少来回沟通',
    },
    {
      id: 'chat',
      step: '03',
      title: '聊天与翻译',
      desc: '群聊配合实时翻译，跨语言轻松交流。',
      highlight: '支持 7 种语言',
    },
    {
      id: 'arrival',
      step: '04',
      title: '到达签到',
      desc: '确认到达并实时通知全组。',
      highlight: '谁到了立刻知道',
    },
    {
      id: 'receipt',
      step: '05',
      title: '小票分账',
      desc: '拍一张小票，AI 识别金额并自动 AA。',
      highlight: '算账更轻松',
    },
    {
      id: 'review',
      step: '06',
      title: '评价与福利',
      desc: '留下聚会评价、地点笔记，把回忆串在一起。',
      highlight: '从开始到收尾',
    },
  ],
  highlightSlides: [
    {
      id: 'global',
      title: '跨越语言障碍',
      desc: '实时翻译支持韩语、英语、日语、中文、台湾繁体、拉丁语和越南语，与世界各地的朋友自然相连。',
      sub: '支持 7 种语言',
    },
    {
      id: 'link',
      title: '无需安装',
      desc: '通过分享链接在网页上投票选时间和地点。',
      sub: '邀请更轻松',
    },
    {
      id: 'ai',
      title: 'AI 推荐地点',
      desc: '根据聚会氛围智能推荐合适场地。',
      sub: '按主题与氛围',
    },
    {
      id: 'allinone',
      title: '从头到尾',
      desc: '日程、聊天、到达、结算——一个应用全包。',
      sub: '聚会一站式',
    },
  ],
};

const ZH_TW: HomeContent = {
  locale: 'zh-TW',
  htmlLang: 'zh-Hant',
  youtubeVideoId: YOUTUBE_ZH_TW,
  brand: 'Ginit',
  headlineMain: '在韓國認識新朋友',
  headlineAccent: '',
  videoTitle: 'Ginit 介紹影片',
  googlePlay: '在 Google Play 取得',
  openApp: '開啟 App',
  scrollCue: '向下滑動，了解功能',
  dotsAria: '導覽區塊',
  slideAria: (n) => `第 ${n} 頁`,
  homeAria: 'Ginit 首頁',
  onboardingAria: '關於 Ginit',
  videoAria: '介紹影片',
  downloadAria: '下載',
  metaTitle: 'Ginit — 在韓國認識新朋友',
  metaDescription:
    '行程、地點、投票、聊天，一個 App 全搞定。透過分享連結即可在網頁參與，無需安裝。',
  featureSlides: [
    {
      id: 'search',
      step: '01',
      title: '探索聚會',
      desc: '在地圖與動態上瀏覽公開聚會——聚餐、小酌、運動等。',
      highlight: '附近一眼掌握',
    },
    {
      id: 'schedule',
      step: '02',
      title: '一起喬時間',
      desc: '加入時即可提議日期與地點，投票快速敲定。',
      highlight: '少來回訊息',
    },
    {
      id: 'chat',
      step: '03',
      title: '聊天與翻譯',
      desc: '群組聊天搭配即時翻譯，跨語言輕鬆聊。',
      highlight: '支援 7 種語言',
    },
    {
      id: 'arrival',
      step: '04',
      title: '到達簽到',
      desc: '確認抵達並即時通知全員。',
      highlight: '誰到了馬上知道',
    },
    {
      id: 'receipt',
      step: '05',
      title: '發票分帳',
      desc: '拍張發票，AI 辨識金額並自動分攤。',
      highlight: '分帳更省心',
    },
    {
      id: 'review',
      step: '06',
      title: '評價與回饋',
      desc: '留下聚會評價、地點筆記，把回憶串在一起。',
      highlight: '從頭到尾一氣呵成',
    },
  ],
  highlightSlides: [
    {
      id: 'global',
      title: '打破語言隔閡',
      desc: '即時翻譯支援韓語、英語、日語、中文、台灣繁體、拉丁語與越南語，與世界各地的朋友自然相連。',
      sub: '支援 7 種語言',
    },
    {
      id: 'link',
      title: '免安裝也能用',
      desc: '透過分享連結在網頁上投票選時間與地點。',
      sub: '邀請更簡單',
    },
    {
      id: 'ai',
      title: 'AI 推薦地點',
      desc: '依聚會氛圍智慧推薦合適場地。',
      sub: '依主題與心情',
    },
    {
      id: 'allinone',
      title: '從頭到尾',
      desc: '行程、聊天、到達、結帳——一個 App 搞定。',
      sub: '聚會一站式',
    },
  ],
};

const VI: HomeContent = {
  locale: 'vi',
  htmlLang: 'vi',
  youtubeVideoId: YOUTUBE_EN,
  brand: 'Ginit',
  headlineMain: 'Kết bạn tại Hàn Quốc',
  headlineAccent: '',
  videoTitle: 'Video giới thiệu Ginit',
  googlePlay: 'Tải trên Google Play',
  openApp: 'Mở ứng dụng',
  scrollCue: 'Cuộn xuống để khám phá tính năng',
  dotsAria: 'Các phần giới thiệu',
  slideAria: (n) => `Màn hình ${n}`,
  homeAria: 'Trang chủ Ginit',
  onboardingAria: 'Giới thiệu Ginit',
  videoAria: 'Video giới thiệu',
  downloadAria: 'Tải xuống',
  metaTitle: 'Ginit — Kết bạn tại Hàn Quốc',
  metaDescription:
    'Ginit giúp nhóm chọn ngày, địa điểm, bình chọn và chat trong một app. Tham gia qua link chia sẻ trên web — không cần cài đặt.',
  featureSlides: [
    {
      id: 'search',
      step: '01',
      title: 'Khám phá buổi gặp',
      desc: 'Xem các buổi gặp công khai trên bản đồ và bảng tin — ăn uống, nhậu, thể thao và hơn thế.',
      highlight: 'Gần bạn, một cái nhìn',
    },
    {
      id: 'schedule',
      step: '02',
      title: 'Hẹn lịch cùng nhau',
      desc: 'Đề xuất ngày và địa điểm khi tham gia; bình chọn để chốt nhanh.',
      highlight: 'Ít nhắn qua lại',
    },
    {
      id: 'chat',
      step: '03',
      title: 'Chat & dịch',
      desc: 'Chat nhóm kèm dịch thời gian thực — trò chuyện xuyên ngôn ngữ dễ dàng.',
      highlight: '7 ngôn ngữ',
    },
    {
      id: 'arrival',
      step: '04',
      title: 'Check-in đến nơi',
      desc: 'Xác nhận khi bạn đến và báo cho cả nhóm ngay lập tức.',
      highlight: 'Biết ai đã tới',
    },
    {
      id: 'receipt',
      step: '05',
      title: 'Chia hóa đơn',
      desc: 'Chụp hóa đơn — AI đọc số tiền và chia bill tự động.',
      highlight: 'Đỡ tính toán',
    },
    {
      id: 'review',
      step: '06',
      title: 'Đánh giá & ưu đãi',
      desc: 'Để lại review buổi gặp, ghi chú địa điểm và lưu kỷ niệm trong một luồng.',
      highlight: 'Trọn vẹn đến cuối',
    },
  ],
  highlightSlides: [
    {
      id: 'global',
      title: 'Không rào cản ngôn ngữ',
      desc: 'Dịch thời gian thực hỗ trợ tiếng Hàn, Anh, Nhật, Trung, Đài Loan, Latinh và Việt — kết nối bạn bè toàn cầu.',
      sub: 'Hỗ trợ 7 ngôn ngữ',
    },
    {
      id: 'link',
      title: 'Không cần cài app',
      desc: 'Bình chọn giờ và địa điểm qua link web được chia sẻ.',
      sub: 'Mời bạn dễ dàng',
    },
    {
      id: 'ai',
      title: 'AI gợi ý địa điểm',
      desc: 'Gợi ý địa điểm phù hợp không khí buổi gặp của bạn.',
      sub: 'Theo chủ đề & vibe',
    },
    {
      id: 'allinone',
      title: 'Từ đầu đến cuối',
      desc: 'Lịch hẹn, chat, đến nơi và thanh toán — một app.',
      sub: 'Buổi gặp all-in-one',
    },
  ],
};

const LA: HomeContent = {
  locale: 'la',
  htmlLang: 'la',
  youtubeVideoId: YOUTUBE_LA,
  brand: 'Ginit',
  headlineMain: 'Amicos in Corea inveni',
  headlineAccent: '',
  videoTitle: 'Ginit — video introductionis',
  googlePlay: 'Accipe in Google Play',
  openApp: 'Aperi applicationem',
  scrollCue: 'Devolve ut notitias perdiscas',
  dotsAria: 'Sectio introductionis',
  slideAria: (n) => `Tabula ${n}`,
  homeAria: 'Ginit domus',
  onboardingAria: 'De Ginit',
  videoAria: 'Video introductionis',
  downloadAria: 'Promtus',
  metaTitle: 'Ginit — Amicos in Corea inveni',
  metaDescription:
    'Ginit coetibus ad dies, loca, suffragia et colloquium in una applicatione iuvat. Per nexum communem in interrete accede — nulla installatio opus est.',
  featureSlides: [
    {
      id: 'search',
      step: '01',
      title: 'Conventus reperi',
      desc: 'In charta et pulso coetus publicos specta — convivia, pocula, ludi et alia.',
      highlight: 'Prope, uno visu',
    },
    {
      id: 'schedule',
      step: '02',
      title: 'Tempus simul constitue',
      desc: 'Dies et loca suggerendo suffragiis cito constitue.',
      highlight: 'Minus iterationum',
    },
    {
      id: 'chat',
      step: '03',
      title: 'Colloquium et interpretatio',
      desc: 'Colloquium gregis cum interpretatione vivā — trans linguas loquere.',
      highlight: '7 linguae',
    },
    {
      id: 'arrival',
      step: '04',
      title: 'Adventus confirmatio',
      desc: 'Adventum confirma et gregem statim certiorem fac.',
      highlight: 'Quis advenit, scito',
    },
    {
      id: 'receipt',
      step: '05',
      title: 'Rationis divisio',
      desc: 'Rationem capta — AI summas legit et billum dividit.',
      highlight: 'Minus calculi',
    },
    {
      id: 'review',
      step: '06',
      title: 'Recensiones et commoda',
      desc: 'Recensiones conventus, notas loci et memorias in uno flumine serva.',
      highlight: 'Usque ad finem',
    },
  ],
  highlightSlides: [
    {
      id: 'global',
      title: 'Sine obice linguae',
      desc: 'Interpretatio viva Coreanam, Anglicam, Iaponicam, Sinicam, Taivanensem, Latinam et Vietnamensem sustinet — cum amicis toto orbe.',
      sub: '7 linguae',
    },
    {
      id: 'link',
      title: 'Sine installatione',
      desc: 'De nexu communi in interrete tempus et locum suffragio elige.',
      sub: 'Invitatio facilis',
    },
    {
      id: 'ai',
      title: 'Loci a IA suggesti',
      desc: 'Loca ad habitum conventus tui accommodata accipe.',
      sub: 'Themata et animus',
    },
    {
      id: 'allinone',
      title: 'Ab initio ad finem',
      desc: 'Tempus, colloquium, adventus et ratio — una applicatio.',
      sub: 'Omnia pro conventibus',
    },
  ],
};

const HOME_BY_LOCALE: Record<HomeLocale, HomeContent> = {
  ko: KO,
  en: EN,
  ja: JA,
  zh: ZH,
  'zh-TW': ZH_TW,
  vi: VI,
  la: LA,
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

function matchLocaleFromLanguageTag(tag: string): HomeLocale | null {
  const t = tag.trim().toLowerCase();
  if (!t) return null;

  const region = regionFromTag(t);
  const base = baseLang(t);

  if (region === 'kr' || base === 'ko' || t === 'ko') return 'ko';
  if (base === 'ja' || region === 'jp') return 'ja';
  if (base === 'vi' || region === 'vn') return 'vi';
  if (base === 'la') return 'la';
  if (base === 'zh') {
    if (
      region === 'tw' ||
      region === 'hk' ||
      region === 'mo' ||
      t.includes('hant') ||
      t === 'zh-tw' ||
      t === 'zh_hant'
    ) {
      return 'zh-TW';
    }
    return 'zh';
  }
  if (base === 'en') return 'en';

  return null;
}

/** `?lang=` (ko, en, ja, zh, zh-tw, vi, la 및 별칭) */
export function parseHomeLocaleParam(value: string | null | undefined): HomeLocale | null {
  if (value == null || value === '') return null;
  const v = value.trim().toLowerCase().replace(/_/g, '-');

  if (v === 'ko' || v === 'kr') return 'ko';
  if (v === 'en' || v === 'english') return 'en';
  if (v === 'ja' || v === 'jp' || v === 'japanese') return 'ja';
  if (v === 'zh-tw' || v === 'zhtw' || v === 'tw' || v === 'zh-hant') return 'zh-TW';
  if (v === 'zh' || v === 'cn' || v === 'zh-cn' || v === 'chinese') return 'zh';
  if (v === 'vi' || v === 'vn' || v === 'vietnamese') return 'vi';
  if (v === 'la' || v === 'latin') return 'la';

  return matchLocaleFromLanguageTag(v);
}

function detectHomeLocaleAuto(): HomeLocale {
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

  for (const tag of tags) {
    const matched = matchLocaleFromLanguageTag(tag);
    if (matched && matched !== 'ko') return matched;
  }

  return 'en';
}

/** URL `lang` 우선, 없으면 브라우저·시간대 자동 감지 */
export function resolveHomeLocale(langOverride?: string | null): HomeLocale {
  const forced = parseHomeLocaleParam(langOverride);
  if (forced) return forced;
  return detectHomeLocaleAuto();
}

/** Accept-Language 헤더(서버 메타데이터용) */
export function resolveHomeLocaleFromAcceptLanguage(header: string | null): HomeLocale {
  if (!header) return 'ko';

  const parts = header.split(',').map((p) => p.trim().split(';')[0]?.toLowerCase() ?? '');
  for (const tag of parts) {
    const matched = matchLocaleFromLanguageTag(tag);
    if (matched) return matched;
  }

  return 'en';
}

/** `?lang=` + Accept-Language (서버 메타데이터) */
export function resolveHomeLocaleForRequest(
  langParam: string | null | undefined,
  acceptLanguage: string | null,
): HomeLocale {
  const forced = parseHomeLocaleParam(langParam);
  if (forced) return forced;
  return resolveHomeLocaleFromAcceptLanguage(acceptLanguage);
}

export function getHomeContent(locale: HomeLocale): HomeContent {
  return HOME_BY_LOCALE[locale];
}

/** 메타데이터·OG용 홈 canonical path (`ko`는 `/`, 그 외 `/?lang=…`) */
export function homeCanonicalPath(locale: HomeLocale): string {
  if (locale === 'ko') return '/';
  if (locale === 'zh-TW') return '/?lang=zh-tw';
  return `/?lang=${locale}`;
}
