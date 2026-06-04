/** 친구 초대 `/f/{token}` 랜딩 — 브라우저 언어 기준 */

import { resolveShareLocale, type ShareLocale } from '@/lib/share-i18n';

export type FriendInviteMessages = {
  htmlLang: string;
  /** 상단 좌측 브랜드 바 — `{headerBrand} - {headerSubtitle}` */
  headerBrand: string;
  headerSubtitle: string;
  kicker: string;
  loading: string;
  errorTitle: string;
  errorHint: string;
  unknownError: string;
  loadTimeout: string;
  invalidLink: string;
  inviteTitle: (nickname: string) => string;
  inviteBody: string;
  acceptCta: string;
  openInApp: string;
  footerAppHint: string;
  gDnaLabel: string;
  appAboutTitle: string;
};

const KO: FriendInviteMessages = {
  htmlLang: 'ko',
  headerBrand: '지닛',
  headerSubtitle: '친구초대',
  kicker: '지닛 - 친구초대',
  loading: '초대 정보를 불러오는 중…',
  errorTitle: '링크를 열 수 없어요',
  errorHint: '친구 요청 링크가 만료되었거나 잘못되었을 수 있어요. 앱에서 새 링크를 받아 보세요.',
  unknownError: '알 수 없는 오류가 발생했어요.',
  loadTimeout: '응답이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',
  invalidLink: '유효하지 않은 친구 요청 링크예요.',
  inviteTitle: (nickname) => `${nickname}님이 친구를 요청했어요`,
  inviteBody: '지닛 앱에서 친구 수락하기를 누르면 친구 목록에 추가돼요.',
  acceptCta: '친구 수락하기',
  openInApp: '지닛 앱에서 열기',
  footerAppHint:
    '앱이 설치되어 있지 않다면 Play 스토어에서 지닛을 설치한 뒤, 같은 링크로 다시 열어 주세요.',
  gDnaLabel: 'gDna',
  appAboutTitle: '지닛 소개',
};

const EN: FriendInviteMessages = {
  htmlLang: 'en',
  headerBrand: 'Ginit',
  headerSubtitle: 'Friend invite',
  kicker: 'Ginit - Friend invite',
  loading: 'Loading invite…',
  errorTitle: 'Could not open link',
  errorHint: 'This friend request link may be expired or invalid. Ask for a new link in the app.',
  unknownError: 'Something went wrong.',
  loadTimeout: 'Taking too long. Please try again.',
  invalidLink: 'Invalid friend request link.',
  inviteTitle: (nickname) => `${nickname} sent you a friend request`,
  inviteBody: 'Tap Accept in the Ginit app to add them to your friends list.',
  acceptCta: 'Accept friend',
  openInApp: 'Open in Ginit app',
  footerAppHint:
    'If the app is not installed, install Ginit from the Play Store, then open this link again.',
  gDnaLabel: 'gDna',
  appAboutTitle: 'About Ginit',
};

const JA: FriendInviteMessages = {
  htmlLang: 'ja',
  headerBrand: 'Ginit',
  headerSubtitle: '友達招待',
  kicker: 'Ginit - 友達招待',
  loading: '招待情報を読み込み中…',
  errorTitle: 'リンクを開けません',
  errorHint: '友達リクエストリンクの期限切れまたは無効の可能性があります。アプリで新しいリンクを受け取ってください。',
  unknownError: '不明なエラーが発生しました。',
  loadTimeout: '応答に時間がかかっています。しばらくしてから再度お試しください。',
  invalidLink: '無効な友達リクエストリンクです。',
  inviteTitle: (nickname) => `${nickname}さんから友達リクエストが届きました`,
  inviteBody: 'Ginitアプリで「友達を承認」をタップすると友達リストに追加されます。',
  acceptCta: '友達を承認',
  openInApp: 'Ginitアプリで開く',
  footerAppHint:
    'アプリが未インストールの場合はPlayストアからGinitをインストールし、同じリンクを再度開いてください。',
  gDnaLabel: 'gDna',
  appAboutTitle: 'Ginitについて',
};

const ZH: FriendInviteMessages = {
  htmlLang: 'zh',
  headerBrand: 'Ginit',
  headerSubtitle: '好友邀请',
  kicker: 'Ginit - 好友邀请',
  loading: '正在加载邀请信息…',
  errorTitle: '无法打开链接',
  errorHint: '好友请求链接可能已过期或无效。请在应用中获取新链接。',
  unknownError: '发生未知错误。',
  loadTimeout: '响应超时，请稍后重试。',
  invalidLink: '无效的好友请求链接。',
  inviteTitle: (nickname) => `${nickname} 向你发送了好友请求`,
  inviteBody: '在 Ginit 应用中点击接受好友，即可加入好友列表。',
  acceptCta: '接受好友',
  openInApp: '在 Ginit 应用中打开',
  footerAppHint: '如未安装应用，请从 Play 商店安装 Ginit 后再次打开此链接。',
  gDnaLabel: 'gDna',
  appAboutTitle: '关于 Ginit',
};

const BY_LOCALE: Record<ShareLocale, FriendInviteMessages> = {
  ko: KO,
  en: EN,
  ja: JA,
  zh: ZH,
};

export function getFriendInviteMessages(locale: ShareLocale): FriendInviteMessages {
  return BY_LOCALE[locale] ?? KO;
}

export function resolveFriendInviteLocale(): ShareLocale {
  return resolveShareLocale();
}
