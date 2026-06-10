import { ImageResponse } from 'next/og';

import { FriendInviteOgImageMarkup, FRIEND_INVITE_OG_SIZE } from '@/lib/friend-invite-og-image';
import { fetchShareFriendInviteOgMeta } from '@/lib/share-friend-invite-og';
import { normalizeShareToken } from '@/lib/share-token-server';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token: raw } = await context.params;
  const decoded = decodeURIComponent(typeof raw === 'string' ? raw : '');
  const token = normalizeShareToken(decoded) ?? '';

  let headline = '지닛 · 친구 요청';
  if (token) {
    const og = await fetchShareFriendInviteOgMeta(token);
    if (og?.imageHeadline) headline = og.imageHeadline;
  }

  return new ImageResponse(<FriendInviteOgImageMarkup headline={headline} />, {
    ...FRIEND_INVITE_OG_SIZE,
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
