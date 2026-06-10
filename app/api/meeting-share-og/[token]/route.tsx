import { ImageResponse } from 'next/og';

import { MeetingShareOgImageMarkup, MEETING_SHARE_OG_SIZE } from '@/lib/meeting-share-og-image';
import { sanitizeShareImageUrl } from '@/lib/safe-external-url';
import { fetchShareMeetingOgMeta } from '@/lib/share-meeting-og';
import { normalizeShareToken } from '@/lib/share-token-server';
import { toAbsoluteSiteUrl } from '@/lib/site-origin';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ token: string }> };

async function fetchImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg';
    return `data:${ct};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

async function resolveBackgroundDataUrl(imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) return null;
  const safeRemote = sanitizeShareImageUrl(imageUrl);
  if (safeRemote) return fetchImageDataUrl(safeRemote);
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return fetchImageDataUrl(toAbsoluteSiteUrl(path));
}

export async function GET(_request: Request, context: RouteContext) {
  const { token: raw } = await context.params;
  const decoded = decodeURIComponent(typeof raw === 'string' ? raw : '');
  const token = normalizeShareToken(decoded) ?? '';

  let backgroundSrc: string | null = null;

  if (token) {
    const og = await fetchShareMeetingOgMeta(token);
    if (og) {
      backgroundSrc = await resolveBackgroundDataUrl(og.imageUrl);
    }
  }

  return new ImageResponse(<MeetingShareOgImageMarkup backgroundSrc={backgroundSrc} />, {
    ...MEETING_SHARE_OG_SIZE,
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
