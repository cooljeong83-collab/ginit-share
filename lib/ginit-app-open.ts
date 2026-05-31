const GINIT_APP_PACKAGE = 'com.ginit.app';
const GINIT_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.ginit.app';

export function resolveGinitAppDeepLink(meetingId?: string | null): string {
  const mid = meetingId?.trim() ? encodeURIComponent(meetingId.trim()) : '';
  const raw = (process.env.NEXT_PUBLIC_GINIT_APP_OPEN_URL || '').trim();
  if (!mid) {
    return raw.replace(/\/+$/, '') || 'ginitapp://';
  }
  const base = raw.replace(/\/+$/, '');
  if (!base || /^ginitapp:\/\/?$/i.test(base) || base.toLowerCase() === 'ginitapp:') {
    return `ginitapp://meeting/${mid}`;
  }
  return `${base}/meeting/${mid}`;
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

export function openGinitApp(meetingId?: string | null): void {
  if (typeof window === 'undefined') return;

  const deepLink = resolveGinitAppDeepLink(meetingId);
  const url = isAndroidUserAgent(navigator.userAgent)
    ? buildAndroidIntentOpenUrl(deepLink)
    : deepLink;
  window.location.assign(url);
}
