const GINIT_APP_PACKAGE = 'com.ginit.app';

export const GINIT_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.ginit.app';

function appendShareTokenQuery(url: string, shareToken?: string | null): string {
  const token = shareToken?.trim();
  if (!token) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}shareToken=${encodeURIComponent(token)}`;
}

export function resolveGinitAppDeepLink(meetingId?: string | null, shareToken?: string | null): string {
  const mid = meetingId?.trim() ? encodeURIComponent(meetingId.trim()) : '';
  const raw = (process.env.NEXT_PUBLIC_GINIT_APP_OPEN_URL || '').trim();
  if (!mid) {
    return appendShareTokenQuery(raw.replace(/\/+$/, '') || 'ginitapp://', shareToken);
  }
  const base = raw.replace(/\/+$/, '');
  if (!base || /^ginitapp:\/\/?$/i.test(base) || base.toLowerCase() === 'ginitapp:') {
    return appendShareTokenQuery(`ginitapp://meeting/${mid}`, shareToken);
  }
  return appendShareTokenQuery(`${base}/meeting/${mid}`, shareToken);
}

function ginitAppIntentPath(deepLink: string): string {
  const match = deepLink.match(/^ginitapp:\/\/(.*)$/i);
  return match?.[1] ?? '';
}

export function buildAndroidIntentOpenUrl(
  deepLink: string,
  fallbackUrl: string = GINIT_PLAY_STORE_URL,
): string {
  const path = ginitAppIntentPath(deepLink);
  const fallback = encodeURIComponent(fallbackUrl);
  return `intent://${path}#Intent;scheme=ginitapp;package=${GINIT_APP_PACKAGE};S.browser_fallback_url=${fallback};end`;
}

export function isAndroidUserAgent(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

export function openGinitApp(meetingId?: string | null, shareToken?: string | null): void {
  if (typeof window === 'undefined') return;

  const deepLink = resolveGinitAppDeepLink(meetingId, shareToken);
  const url = isAndroidUserAgent(navigator.userAgent)
    ? buildAndroidIntentOpenUrl(deepLink)
    : deepLink;
  window.location.assign(url);
}

export function resolveFriendInviteDeepLink(friendInviteToken: string): string {
  const token = friendInviteToken.trim();
  return `ginitapp://friends?friendInviteToken=${encodeURIComponent(token)}`;
}

export function openGinitAppForFriendInvite(friendInviteToken: string): void {
  if (typeof window === 'undefined') return;
  const deepLink = resolveFriendInviteDeepLink(friendInviteToken);
  const fallback =
    (process.env.NEXT_PUBLIC_GINIT_PLAY_STORE_URL || '').trim() || GINIT_PLAY_STORE_URL;
  const url = isAndroidUserAgent(navigator.userAgent)
    ? buildAndroidIntentOpenUrl(deepLink, fallback)
    : deepLink;
  window.location.assign(url);
}
