/** 공유 페이지 UI — 브라우저 시스템 언어(navigator.languages) 기준 */

export type ShareLocale = 'ko' | 'en' | 'ja' | 'zh';

export type ShareMessages = {
  htmlLang: string;
  localeCompare: string;
  weekdays: readonly string[];
  kicker: string;
  loading: string;
  errorTitle: string;
  errorHint: string;
  unknownError: string;
  loadTimeout: string;
  loadMeetingFailed: string;
  defaultMeetingTitle: string;
  defaultPlaceName: string;
  dateTbd: string;
  scheduleConfirmed: string;
  recruiting: string;
  publicMeeting: string;
  privateMeeting: string;
  hostApproval: string;
  openJoin: string;
  meetingStatusAria: string;
  basicInfo: string;
  category: string;
  schedule: string;
  place: string;
  voting: string;
  undecided: string;
  participantName: string;
  required: string;
  participantNameJoinedHint: string;
  participantNameJoinHint: string;
  participantNamePlaceholder: string;
  participantNameRequired: string;
  voteLockedTitle: string;
  voteLockedBody: string;
  hostMessage: string;
  hostMessageHint: string;
  hostMessagePlaceholder: string;
  confirmedSection: string;
  confirmedScheduleHost: string;
  confirmedScheduleSingle: string;
  confirmedSchedule: string;
  confirmedPlace: string;
  confirmedScheduleFallback: string;
  dateCandidates: string;
  multiSelectHint: string;
  singleDateAuto: string;
  placeCandidates: string;
  placeSectionSingle: string;
  movieCandidates: string;
  participants: string;
  participantsEmpty: string;
  participantsCount: (n: number) => string;
  capacityCount: (current: number, max: number) => string;
  host: string;
  guest: string;
  member: string;
  hostTag: string;
  guestTag: string;
  guestPendingTag: string;
  voteBeforeJoinHint: string;
  footerAppHint: string;
  guestJoin: string;
  leaveRetake: string;
  processing: string;
  saveCalendar: string;
  saveCalendarAria: string;
  openInApp: string;
  placeInfo: string;
  placeMap: string;
  placeInfoMapAria: (label: string) => string;
  placeDetail: string;
  movieInfo: string;
  calendarAria: string;
  close: string;
  cancel: string;
  confirm: string;
  leaveModalAria: string;
  leaveModalTitle: string;
  leaveModalBody: string;
  guestJoinModalAria: string;
  guestJoinModalTitle: string;
  guestJoinModalWarn: string;
  guestJoinModalBody: string;
  joinRequest: string;
  joinNow: string;
  voteGateAria: string;
  voteGateTitle: string;
  voteGateBody: string;
  goVote: string;
  timePickAria: string;
  timePickTitle: string;
  timeTbd: string;
  notice: string;
  requestFailed: string;
  joinFailed: string;
  leaveFailed: string;
  alreadyVoted: string;
  calendarPlaceLine: (name: string, address: string) => string;
  calendarTitlePrefix: string;
  movieSearchPrefix: string;
  errors: {
    capacityFull: string;
    invalidToken: string;
    scheduleConfirmed: string;
    guestKicked: string;
    alreadyParticipant: string;
    meetingNotFound: string;
    wrongEndpoint: string;
    notJoined: string;
    voteLocked: string;
    invalidGuest: string;
    leaveForbidden: string;
    leaveSecretRequired: string;
    rateLimited: string;
    scalarLeave: string;
    generic: string;
  };
};

const ko: ShareMessages = {
  htmlLang: 'ko',
  localeCompare: 'ko',
  weekdays: ['일', '월', '화', '수', '목', '금', '토'],
  kicker: '지닛 모임 공유',
  loading: '불러오는 중…',
  errorTitle: '링크를 열 수 없어요',
  errorHint: '링크가 만료되었거나 잘못되었을 수 있어요. 모임 주최자에게 새 링크를 요청해 보세요.',
  unknownError: '알 수 없는 오류',
  loadTimeout:
    '연결 시간이 초과되었어요. 네트워크를 확인하거나, Vercel에 SUPABASE_SERVICE_ROLE_KEY가 설정됐는지 확인해 주세요.',
  loadMeetingFailed: '모임 정보를 불러오지 못했어요.',
  defaultMeetingTitle: '모임',
  defaultPlaceName: '장소',
  dateTbd: '날짜 미정',
  scheduleConfirmed: '일정 확정',
  recruiting: '모집 중',
  publicMeeting: '공개 모임',
  privateMeeting: '비공개 모임',
  hostApproval: '호스트 승인형',
  openJoin: '바로 참여',
  meetingStatusAria: '모임 상태',
  basicInfo: '기본 정보',
  category: '카테고리',
  schedule: '일정',
  place: '장소',
  voting: '투표중',
  undecided: '미정',
  participantName: '참여자명',
  required: '필수',
  participantNameJoinedHint: '참여 시 입력한 이름이에요.',
  participantNameJoinHint: '참여자 목록과 투표에 표시돼요. 게스트 참여 전에 입력해 주세요.',
  participantNamePlaceholder: '참여자명을 입력하세요',
  participantNameRequired: '참여자명은 필수 입력이에요.',
  voteLockedTitle: '투표 변경 불가',
  voteLockedBody:
    '웹에서 게스트로 참여하면 참여 시점에 선택한 투표만 반영되며, 이후에는 바꿀 수 없어요. 채팅·공개 모임·투표 변경 등 모든 기능을 쓰시려면 지닛 앱을 설치한 뒤 하단의 지닛 참여로 진행해 보세요.',
  hostMessage: '호스트에게 메시지',
  hostMessageHint: '참가 신청 시 함께 전달돼요.',
  hostMessagePlaceholder: '한 줄 소개',
  confirmedSection: '확정',
  confirmedScheduleHost: '호스트가 모임 일정을 확정했어요.',
  confirmedScheduleSingle: '일자·장소 후보가 각각 1개뿐이라 확정된 것과 동일하게 표시해요.',
  confirmedSchedule: '확정 일정',
  confirmedPlace: '확정 장소',
  confirmedScheduleFallback: '확정 일정',
  dateCandidates: '일정 후보',
  multiSelectHint: '(다건 선택 가능)',
  singleDateAuto: '후보가 1개뿐이라 자동으로 선택돼요.',
  placeCandidates: '장소 후보',
  placeSectionSingle: '장소',
  movieCandidates: '영화 후보',
  participants: '참여자',
  participantsEmpty: '아직 참여한 사람이 없어요.',
  participantsCount: (n) => `참여자 (${n}명)`,
  capacityCount: (current, max) => `${current} / ${max}명`,
  host: '호스트',
  guest: '게스트',
  member: '회원',
  hostTag: '(호스트)',
  guestTag: '(게스트)',
  guestPendingTag: '(게스트 · 신청)',
  voteBeforeJoinHint:
    '후보가 여러 개인 항목은 투표를 마친 뒤 게스트 참여를 눌러 주세요. 웹 게스트는 참여 시점의 투표만 반영되며 이후 변경할 수 없어요.',
  footerAppHint: '채팅·공개 모임·투표 변경·알림 등 전체 기능은 지닛 앱 설치 후 이용할 수 있어요.',
  guestJoin: '게스트 참여',
  leaveRetake: '나가기/재투표',
  processing: '처리 중…',
  saveCalendar: '캘린더 저장하기',
  saveCalendarAria: '확정 일정을 휴대폰 캘린더에 저장',
  openInApp: '지닛 참여',
  placeInfo: '정보',
  placeMap: '지도',
  placeInfoMapAria: (label) => `${label} 정보·지도`,
  placeDetail: '상세 정보',
  movieInfo: '영화 정보',
  calendarAria: '달력',
  close: '닫기',
  cancel: '취소',
  confirm: '확인',
  leaveModalAria: '모임 참여 취소 및 재투표',
  leaveModalTitle: '모임 참여 취소 / 재 투표',
  leaveModalBody:
    '모임 참여가 취소됩니다. 이 브라우저에 저장된 참여·투표 정보는 서버에서 삭제되며, 목록에서도 빠져요. 같은 링크로 다시 참여할 수 있어요.',
  guestJoinModalAria: '게스트 참여 확인',
  guestJoinModalTitle: '게스트 참여 확인',
  guestJoinModalWarn: '게스트로 참여하면 지금 선택한 투표는 변경할 수 없습니다.',
  guestJoinModalBody:
    '채팅, 공개 모임 상세, 투표 변경 등 모든 기능을 사용하시려면 지닛 앱을 설치한 뒤 하단의 지닛 참여를 이용해 주세요.',
  joinRequest: '참가 신청',
  joinNow: '참여하기',
  voteGateAria: '투표 안내',
  voteGateTitle: '참여 전 투표가 필요해요',
  voteGateBody:
    '아직 확정 전이라, 후보가 여러 개인 항목은 먼저 투표한 뒤 게스트 참여를 눌러 주세요. 웹 게스트는 참여하기를 누른 뒤에는 투표를 바꿀 수 없어요. 변경이 필요하면 지닛 앱에서 참여해 주세요.',
  goVote: '투표하러 가기',
  timePickAria: '시간 선택',
  timePickTitle: '시간 선택',
  timeTbd: '시간 미정',
  notice: '알림',
  requestFailed: '참가 신청에 실패했어요.',
  joinFailed: '참여에 실패했어요.',
  leaveFailed: '모임 나가기에 실패했어요.',
  alreadyVoted: '이미 참여한 투표입니다.',
  calendarPlaceLine: (name, address) => {
    if (name && address) return `장소 : ${name} (${address})`;
    if (name) return `장소 : ${name}`;
    if (address) return `장소 : (${address})`;
    return '';
  },
  calendarTitlePrefix: '[지닛]',
  movieSearchPrefix: '영화',
  errors: {
    capacityFull: '모임 정원이 찼어요. 참여할 수 없어요.',
    invalidToken: '링크가 만료되었거나 잘못되었어요.',
    scheduleConfirmed: '일정이 확정된 모임이라 더 이상 참여·투표를 바꿀 수 없어요.',
    guestKicked: '이 모임에서 나간 상태예요. 호스트에게 문의해 주세요.',
    alreadyParticipant: '이미 참여 중이에요.',
    meetingNotFound: '모임을 찾을 수 없어요.',
    wrongEndpoint: '참여 방식이 맞지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요.',
    notJoined: '먼저 참여 또는 참가 신청을 완료해 주세요.',
    voteLocked:
      '게스트로는 참여 시점의 투표만 반영되며, 이후 변경할 수 없어요. 앱에서 지닛 참여를 이용해 주세요.',
    invalidGuest: '참여 정보를 확인할 수 없어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.',
    leaveForbidden: '나가기 권한이 없어요. 이 브라우저에서 참여한 뒤 다시 시도해 주세요.',
    leaveSecretRequired: '참여 당시 브라우저에서만 나갈 수 있어요. 다시 참여한 뒤 나가기를 시도해 주세요.',
    rateLimited: '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.',
    scalarLeave:
      '모임 저장 데이터 형식 문제로 나가기를 처리하지 못했어요. 서버를 최신으로 올린 뒤 다시 시도해 주세요.',
    generic: '오류가 발생했어요.',
  },
};

const en: ShareMessages = {
  ...ko,
  htmlLang: 'en',
  localeCompare: 'en',
  weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  kicker: 'Ginit meeting share',
  loading: 'Loading…',
  errorTitle: "Can't open this link",
  errorHint: 'The link may have expired or is invalid. Ask the host for a new link.',
  unknownError: 'Unknown error',
  loadTimeout:
    'Connection timed out. Check your network, or verify SUPABASE_SERVICE_ROLE_KEY is set on Vercel.',
  loadMeetingFailed: "Couldn't load meeting details.",
  defaultMeetingTitle: 'Meeting',
  defaultPlaceName: 'Place',
  dateTbd: 'Date TBD',
  scheduleConfirmed: 'Schedule set',
  recruiting: 'Open',
  publicMeeting: 'Public',
  privateMeeting: 'Private',
  hostApproval: 'Host approval',
  openJoin: 'Join instantly',
  meetingStatusAria: 'Meeting status',
  basicInfo: 'Details',
  category: 'Category',
  schedule: 'Schedule',
  place: 'Place',
  voting: 'Voting',
  undecided: 'TBD',
  participantName: 'Your name',
  required: 'Required',
  participantNameJoinedHint: 'Name you entered when joining.',
  participantNameJoinHint: 'Shown in the participant list and votes. Enter before joining as a guest.',
  participantNamePlaceholder: 'Enter your name',
  participantNameRequired: 'Name is required.',
  voteLockedTitle: "Votes can't be changed",
  voteLockedBody:
    "As a web guest, only votes selected when you joined count and can't be changed later. For chat, public meetings, and vote changes, install the Ginit app and use Join Ginit below.",
  hostMessage: 'Message to host',
  hostMessageHint: 'Sent with your join request.',
  hostMessagePlaceholder: 'Short intro',
  confirmedSection: 'Confirmed',
  confirmedScheduleHost: 'The host confirmed the schedule.',
  confirmedScheduleSingle: 'Only one date and place candidate each, shown as confirmed.',
  confirmedSchedule: 'Confirmed schedule',
  confirmedPlace: 'Confirmed place',
  confirmedScheduleFallback: 'Confirmed schedule',
  dateCandidates: 'Date options',
  multiSelectHint: '(multiple selection)',
  singleDateAuto: 'Only one option — selected automatically.',
  placeCandidates: 'Place options',
  placeSectionSingle: 'Place',
  movieCandidates: 'Movie options',
  participants: 'Participants',
  participantsEmpty: 'No participants yet.',
  participantsCount: (n) => `Participants (${n})`,
  capacityCount: (current, max) => `${current} / ${max}`,
  host: 'Host',
  guest: 'Guest',
  member: 'Member',
  hostTag: '(host)',
  guestTag: '(guest)',
  guestPendingTag: '(guest · pending)',
  voteBeforeJoinHint:
    'Vote on items with multiple options, then tap Join as guest. Web guest votes are locked after joining.',
  footerAppHint: 'Chat, public meetings, vote changes, and notifications require the Ginit app.',
  guestJoin: 'Join as guest',
  leaveRetake: 'Leave / vote again',
  processing: 'Working…',
  saveCalendar: 'Save to calendar',
  saveCalendarAria: 'Save confirmed schedule to device calendar',
  openInApp: 'Open in Ginit',
  placeInfo: 'Info',
  placeMap: 'Map',
  placeInfoMapAria: (label) => `${label} info & map`,
  placeDetail: 'Details',
  movieInfo: 'Movie info',
  calendarAria: 'Calendar',
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'OK',
  leaveModalAria: 'Leave meeting and vote again',
  leaveModalTitle: 'Leave meeting / vote again',
  leaveModalBody:
    'You will leave this meeting. Guest data in this browser is removed from the server and the list. You can join again with the same link.',
  guestJoinModalAria: 'Confirm guest join',
  guestJoinModalTitle: 'Confirm guest join',
  guestJoinModalWarn: "As a guest, votes you select now can't be changed.",
  guestJoinModalBody:
    'For chat, meeting details, and changing votes, install the Ginit app and use Open in Ginit below.',
  joinRequest: 'Request to join',
  joinNow: 'Join',
  voteGateAria: 'Vote required',
  voteGateTitle: 'Vote before joining',
  voteGateBody:
    "This meeting isn't finalized. Vote on items with multiple options, then join as a guest. After joining on the web, votes can't be changed — use the Ginit app if you need to update them.",
  goVote: 'Go vote',
  timePickAria: 'Pick a time',
  timePickTitle: 'Pick a time',
  timeTbd: 'Time TBD',
  notice: 'Notice',
  requestFailed: 'Join request failed.',
  joinFailed: "Couldn't join.",
  leaveFailed: "Couldn't leave the meeting.",
  alreadyVoted: 'You already joined with these votes.',
  calendarPlaceLine: (name, address) => {
    if (name && address) return `Place: ${name} (${address})`;
    if (name) return `Place: ${name}`;
    if (address) return `Place: (${address})`;
    return '';
  },
  calendarTitlePrefix: '[Ginit]',
  movieSearchPrefix: 'movie',
  errors: {
    capacityFull: 'This meeting is full.',
    invalidToken: 'This link has expired or is invalid.',
    scheduleConfirmed: "Schedule is set — you can't join or change votes.",
    guestKicked: 'You left this meeting. Contact the host.',
    alreadyParticipant: "You're already in.",
    meetingNotFound: 'Meeting not found.',
    wrongEndpoint: 'Wrong join flow. Refresh and try again.',
    notJoined: 'Join or request to join first.',
    voteLocked: "Guest votes are locked after joining. Use Join Ginit in the app to change votes.",
    invalidGuest: "Can't verify guest info. Refresh and try again.",
    leaveForbidden: "Can't leave. Join from this browser first.",
    leaveSecretRequired: 'You can only leave from the browser you joined with. Rejoin, then try leaving.',
    rateLimited: 'Too many requests. Try again shortly.',
    scalarLeave: "Couldn't process leave due to data format. Update the server and try again.",
    generic: 'Something went wrong.',
  },
};

const ja: ShareMessages = {
  ...ko,
  htmlLang: 'ja',
  localeCompare: 'ja',
  weekdays: ['日', '月', '火', '水', '木', '金', '土'],
  kicker: 'Ginit ミーティング共有',
  loading: '読み込み中…',
  errorTitle: 'リンクを開けません',
  errorHint: 'リンクの有効期限が切れているか、無効な可能性があります。主催者に新しいリンクを依頼してください。',
  unknownError: '不明なエラー',
  loadTimeout:
    '接続がタイムアウトしました。ネットワークを確認するか、Vercel に SUPABASE_SERVICE_ROLE_KEY が設定されているか確認してください。',
  loadMeetingFailed: 'ミーティング情報を読み込めませんでした。',
  defaultMeetingTitle: 'ミーティング',
  defaultPlaceName: '場所',
  dateTbd: '日付未定',
  scheduleConfirmed: '日程確定',
  recruiting: '募集中',
  publicMeeting: '公開',
  privateMeeting: '非公開',
  hostApproval: 'ホスト承認',
  openJoin: 'すぐ参加',
  meetingStatusAria: 'ミーティング状態',
  basicInfo: '基本情報',
  category: 'カテゴリ',
  schedule: '日程',
  place: '場所',
  voting: '投票中',
  undecided: '未定',
  participantName: '表示名',
  required: '必須',
  participantNameJoinedHint: '参加時に入力した名前です。',
  participantNameJoinHint: '参加者一覧と投票に表示されます。ゲスト参加前に入力してください。',
  participantNamePlaceholder: '表示名を入力',
  participantNameRequired: '表示名は必須です。',
  voteLockedTitle: '投票の変更不可',
  voteLockedBody:
    'Webゲストは参加時の投票のみ反映され、後から変更できません。チャット・公開ミーティング・投票変更などは Ginit アプリをインストールし、下部の「Ginitで参加」をご利用ください。',
  hostMessage: 'ホストへのメッセージ',
  hostMessageHint: '参加申請と一緒に送信されます。',
  hostMessagePlaceholder: 'ひとこと自己紹介',
  confirmedSection: '確定',
  confirmedScheduleHost: 'ホストが日程を確定しました。',
  confirmedScheduleSingle: '日付・場所の候補がそれぞれ1件のみのため、確定として表示しています。',
  confirmedSchedule: '確定日程',
  confirmedPlace: '確定場所',
  confirmedScheduleFallback: '確定日程',
  dateCandidates: '日程候補',
  multiSelectHint: '（複数選択可）',
  singleDateAuto: '候補が1件のため自動選択されます。',
  placeCandidates: '場所候補',
  placeSectionSingle: '場所',
  movieCandidates: '映画候補',
  participants: '参加者',
  participantsEmpty: 'まだ参加者がいません。',
  participantsCount: (n) => `参加者（${n}人）`,
  capacityCount: (current, max) => `${current} / ${max}人`,
  host: 'ホスト',
  guest: 'ゲスト',
  member: 'メンバー',
  hostTag: '（ホスト）',
  guestTag: '（ゲスト）',
  guestPendingTag: '（ゲスト・申請中）',
  voteBeforeJoinHint:
    '候補が複数ある項目は投票してからゲスト参加を押してください。Webゲストの投票は参加後変更できません。',
  footerAppHint: 'チャット・公開ミーティング・投票変更・通知などの全機能は Ginit アプリが必要です。',
  guestJoin: 'ゲスト参加',
  leaveRetake: '退出／再投票',
  processing: '処理中…',
  saveCalendar: 'カレンダーに保存',
  saveCalendarAria: '確定日程を端末のカレンダーに保存',
  openInApp: 'Ginitで参加',
  placeInfo: '情報',
  placeMap: '地図',
  placeInfoMapAria: (label) => `${label}の情報・地図`,
  placeDetail: '詳細',
  movieInfo: '映画情報',
  calendarAria: 'カレンダー',
  close: '閉じる',
  cancel: 'キャンセル',
  confirm: '確認',
  leaveModalAria: '参加取消と再投票',
  leaveModalTitle: '参加取消／再投票',
  leaveModalBody:
    'ミーティングから退出します。このブラウザの参加・投票情報はサーバーから削除され、一覧からも外れます。同じリンクで再参加できます。',
  guestJoinModalAria: 'ゲスト参加の確認',
  guestJoinModalTitle: 'ゲスト参加の確認',
  guestJoinModalWarn: 'ゲスト参加後は、今選んだ投票は変更できません。',
  guestJoinModalBody:
    'チャット、公開ミーティングの詳細、投票変更などは Ginit アプリをインストールし、下部の「Ginitで参加」をご利用ください。',
  joinRequest: '参加申請',
  joinNow: '参加する',
  voteGateAria: '投票の案内',
  voteGateTitle: '参加前に投票が必要です',
  voteGateBody:
    'まだ確定前です。候補が複数ある項目は先に投票してからゲスト参加を押してください。Webでは参加後に投票を変えられません。変更が必要な場合は Ginit アプリから参加してください。',
  goVote: '投票へ',
  timePickAria: '時間を選択',
  timePickTitle: '時間を選択',
  timeTbd: '時間未定',
  notice: 'お知らせ',
  requestFailed: '参加申請に失敗しました。',
  joinFailed: '参加に失敗しました。',
  leaveFailed: '退出に失敗しました。',
  alreadyVoted: 'すでにこの投票で参加しています。',
  calendarPlaceLine: (name, address) => {
    if (name && address) return `場所：${name}（${address}）`;
    if (name) return `場所：${name}`;
    if (address) return `場所：（${address}）`;
    return '';
  },
  calendarTitlePrefix: '[Ginit]',
  movieSearchPrefix: '映画',
  errors: {
    capacityFull: '定員に達しています。参加できません。',
    invalidToken: 'リンクの有効期限が切れているか、無効です。',
    scheduleConfirmed: '日程が確定したため、参加・投票の変更はできません。',
    guestKicked: 'このミーティングから退出した状態です。ホストにお問い合わせください。',
    alreadyParticipant: 'すでに参加しています。',
    meetingNotFound: 'ミーティングが見つかりません。',
    wrongEndpoint: '参加方法が正しくありません。ページを更新して再試行してください。',
    notJoined: '先に参加または参加申請を完了してください。',
    voteLocked: 'ゲストの投票は参加時のみ反映され、後から変更できません。アプリの「Ginitで参加」をご利用ください。',
    invalidGuest: '参加情報を確認できません。ページを更新して再試行してください。',
    leaveForbidden: '退出する権限がありません。このブラウザで参加してから再試行してください。',
    leaveSecretRequired: '参加したブラウザからのみ退出できます。再参加してから退出を試してください。',
    rateLimited: 'リクエストが多すぎます。しばらくしてから再試行してください。',
    scalarLeave: 'データ形式の問題で退出できませんでした。サーバーを最新にして再試行してください。',
    generic: 'エラーが発生しました。',
  },
};

const zh: ShareMessages = {
  ...ko,
  htmlLang: 'zh-Hans',
  localeCompare: 'zh-Hans',
  weekdays: ['日', '一', '二', '三', '四', '五', '六'],
  kicker: 'Ginit 聚会分享',
  loading: '加载中…',
  errorTitle: '无法打开链接',
  errorHint: '链接可能已过期或无效。请向组织者索取新链接。',
  unknownError: '未知错误',
  loadTimeout: '连接超时。请检查网络，或确认 Vercel 已配置 SUPABASE_SERVICE_ROLE_KEY。',
  loadMeetingFailed: '无法加载聚会信息。',
  defaultMeetingTitle: '聚会',
  defaultPlaceName: '地点',
  dateTbd: '日期待定',
  scheduleConfirmed: '日程已确定',
  recruiting: '招募中',
  publicMeeting: '公开',
  privateMeeting: '私密',
  hostApproval: '需组织者批准',
  openJoin: '直接加入',
  meetingStatusAria: '聚会状态',
  basicInfo: '基本信息',
  category: '类别',
  schedule: '日程',
  place: '地点',
  voting: '投票中',
  undecided: '待定',
  participantName: '昵称',
  required: '必填',
  participantNameJoinedHint: '加入时填写的名称。',
  participantNameJoinHint: '显示在参与者列表和投票中。请以访客身份加入前先填写。',
  participantNamePlaceholder: '输入昵称',
  participantNameRequired: '昵称为必填项。',
  voteLockedTitle: '无法更改投票',
  voteLockedBody:
    '网页访客仅保留加入时的投票，之后无法修改。如需聊天、公开聚会、更改投票等功能，请安装 Ginit 应用并使用下方「在 Ginit 中加入」。',
  hostMessage: '给组织者的留言',
  hostMessageHint: '随加入申请一起发送。',
  hostMessagePlaceholder: '简短自我介绍',
  confirmedSection: '已确定',
  confirmedScheduleHost: '组织者已确定日程。',
  confirmedScheduleSingle: '日期和地点各只有一个候选，按已确定显示。',
  confirmedSchedule: '确定日程',
  confirmedPlace: '确定地点',
  confirmedScheduleFallback: '确定日程',
  dateCandidates: '日期候选',
  multiSelectHint: '（可多选）',
  singleDateAuto: '仅一个候选，已自动选中。',
  placeCandidates: '地点候选',
  placeSectionSingle: '地点',
  movieCandidates: '电影候选',
  participants: '参与者',
  participantsEmpty: '尚无参与者。',
  participantsCount: (n) => `参与者（${n}人）`,
  capacityCount: (current, max) => `${current} / ${max}人`,
  host: '组织者',
  guest: '访客',
  member: '成员',
  hostTag: '（组织者）',
  guestTag: '（访客）',
  guestPendingTag: '（访客·待批准）',
  voteBeforeJoinHint: '有多项候选时请先投票，再点访客加入。网页访客加入后无法更改投票。',
  footerAppHint: '聊天、公开聚会、更改投票、通知等完整功能需安装 Ginit 应用。',
  guestJoin: '访客加入',
  leaveRetake: '退出/重新投票',
  processing: '处理中…',
  saveCalendar: '保存到日历',
  saveCalendarAria: '将确定日程保存到设备日历',
  openInApp: '在 Ginit 中加入',
  placeInfo: '信息',
  placeMap: '地图',
  placeInfoMapAria: (label) => `${label}信息与地图`,
  placeDetail: '详情',
  movieInfo: '电影信息',
  calendarAria: '日历',
  close: '关闭',
  cancel: '取消',
  confirm: '确定',
  leaveModalAria: '取消参与并重新投票',
  leaveModalTitle: '退出聚会 / 重新投票',
  leaveModalBody:
    '将退出此聚会。本浏览器中的参与和投票信息会从服务器删除并从列表移除。可使用同一链接再次加入。',
  guestJoinModalAria: '确认访客加入',
  guestJoinModalTitle: '确认访客加入',
  guestJoinModalWarn: '以访客加入后，当前选择的投票无法更改。',
  guestJoinModalBody: '如需聊天、聚会详情、更改投票，请安装 Ginit 应用并使用下方「在 Ginit 中加入」。',
  joinRequest: '申请加入',
  joinNow: '加入',
  voteGateAria: '投票提示',
  voteGateTitle: '加入前需先投票',
  voteGateBody:
    '日程尚未确定。有多项候选时请先投票，再点访客加入。网页加入后无法改票；如需修改请在 Ginit 应用中加入。',
  goVote: '去投票',
  timePickAria: '选择时间',
  timePickTitle: '选择时间',
  timeTbd: '时间待定',
  notice: '提示',
  requestFailed: '申请加入失败。',
  joinFailed: '加入失败。',
  leaveFailed: '退出聚会失败。',
  alreadyVoted: '您已用这些投票加入。',
  calendarPlaceLine: (name, address) => {
    if (name && address) return `地点：${name}（${address}）`;
    if (name) return `地点：${name}`;
    if (address) return `地点：（${address}）`;
    return '';
  },
  calendarTitlePrefix: '[Ginit]',
  movieSearchPrefix: '电影',
  errors: {
    capacityFull: '聚会已满，无法加入。',
    invalidToken: '链接已过期或无效。',
    scheduleConfirmed: '日程已确定，无法再加入或更改投票。',
    guestKicked: '您已退出此聚会。请联系组织者。',
    alreadyParticipant: '您已在聚会中。',
    meetingNotFound: '找不到聚会。',
    wrongEndpoint: '加入方式不正确。请刷新页面后重试。',
    notJoined: '请先完成加入或申请加入。',
    voteLocked: '访客投票在加入后锁定。请在应用中使用「在 Ginit 中加入」更改投票。',
    invalidGuest: '无法验证访客信息。请刷新后重试。',
    leaveForbidden: '无法退出。请在本浏览器中先加入。',
    leaveSecretRequired: '只能从加入时使用的浏览器退出。请重新加入后再试。',
    rateLimited: '请求过多，请稍后再试。',
    scalarLeave: '因数据格式问题无法处理退出。请更新服务器后重试。',
    generic: '发生错误。',
  },
};

const MESSAGES: Record<ShareLocale, ShareMessages> = { ko, en, ja, zh };

export function getShareMessages(locale: ShareLocale): ShareMessages {
  return MESSAGES[locale];
}

function baseLang(tag: string): string | null {
  const t = tag.trim().toLowerCase();
  if (!t) return null;
  return t.split(/[-_]/)[0] ?? null;
}

/** navigator.languages / navigator.language 순으로 시스템 언어 매칭 */
export function resolveShareLocale(): ShareLocale {
  if (typeof navigator === 'undefined') return 'ko';
  const tags = navigator.languages?.length ? [...navigator.languages] : [navigator.language];
  for (const tag of tags) {
    const b = baseLang(tag);
    if (b === 'ko') return 'ko';
    if (b === 'en') return 'en';
    if (b === 'ja') return 'ja';
    if (b === 'zh') return 'zh';
  }
  return 'en';
}

export function formatYmdWithWeekday(ymd: string, m: ShareMessages): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const [yy, mm, dd] = ymd.split('-').map((x) => Number(x));
  const d = new Date(yy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return ymd;
  if (d.getFullYear() !== yy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return ymd;
  return `${ymd}(${m.weekdays[d.getDay()]})`;
}

export function formatMeetingShareRpcError(raw: string, m: ShareMessages): string {
  const low = raw.toLowerCase();
  const e = m.errors;
  if (low.includes('meeting_share_capacity_full')) return e.capacityFull;
  if (low.includes('meeting_share_invalid_or_expired_token')) return e.invalidToken;
  if (low.includes('meeting_share_schedule_already_confirmed')) return e.scheduleConfirmed;
  if (low.includes('meeting_share_guest_kicked')) return e.guestKicked;
  if (low.includes('meeting_share_already_participant')) return e.alreadyParticipant;
  if (low.includes('meeting_share_meeting_not_found')) return e.meetingNotFound;
  if (low.includes('meeting_share_use_request_endpoint') || low.includes('meeting_share_use_join_endpoint')) {
    return e.wrongEndpoint;
  }
  if (low.includes('meeting_share_guest_not_joined')) return e.notJoined;
  if (low.includes('meeting_share_guest_vote_locked')) return e.voteLocked;
  if (low.includes('meeting_share_invalid_guest') || low.includes('meeting_share_invalid_guest_id')) {
    return e.invalidGuest;
  }
  if (low.includes('meeting_share_guest_leave_forbidden')) return e.leaveForbidden;
  if (low.includes('meeting_share_guest_leave_secret_required')) return e.leaveSecretRequired;
  if (low.includes('rate_limited') || low.includes('meeting_share_rate_limited')) return e.rateLimited;
  if (low.includes('cannot extract elements from a scalar')) return e.scalarLeave;
  return raw.trim() || e.generic;
}

export function resolveNaverMovieSearchWebUrl(movieTitle: string, searchPrefix: string): string {
  const title = movieTitle.trim();
  if (!title) return '';
  const q = `${searchPrefix} ${title}`.replace(/\s+/g, ' ').trim();
  return `https://m.search.naver.com/search.naver?where=m&sm=mtp_hty.top&query=${encodeURIComponent(q)}`;
}
