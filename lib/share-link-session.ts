/** 공유 링크 토큰 — sessionStorage (탭 단위, URL 노출 최소화용) */

export const SHARE_MEETING_VIEW_PATH = '/s/view';
export const SHARE_FRIEND_INVITE_VIEW_PATH = '/f/view';

const MEETING_TOKEN_KEY = 'ginit_share_meeting_token';
const FRIEND_INVITE_TOKEN_KEY = 'ginit_share_friend_invite_token';

function writeSession(key: string, token: string): void {
  if (typeof window === 'undefined') return;
  const t = token.trim();
  if (!t) return;
  try {
    window.sessionStorage.setItem(key, t);
  } catch {
    /* ignore quota / private mode */
  }
}

function readSession(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const t = window.sessionStorage.getItem(key)?.trim();
    return t || null;
  } catch {
    return null;
  }
}

export function persistShareMeetingToken(token: string): void {
  writeSession(MEETING_TOKEN_KEY, token);
}

export function readShareMeetingToken(): string | null {
  return readSession(MEETING_TOKEN_KEY);
}

export function persistFriendInviteToken(token: string): void {
  writeSession(FRIEND_INVITE_TOKEN_KEY, token);
}

export function readFriendInviteToken(): string | null {
  return readSession(FRIEND_INVITE_TOKEN_KEY);
}

/** `/s/{token}`·`/f/{token}` 로드 성공 후 주소창에서 토큰 제거 */
export function replaceShareUrlWithViewPath(viewPath: string): void {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === viewPath) return;
  try {
    window.history.replaceState(null, '', viewPath);
  } catch {
    /* ignore */
  }
}
