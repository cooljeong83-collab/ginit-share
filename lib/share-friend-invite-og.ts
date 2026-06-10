import { rpcFriendInviteShareGuestGet } from '@/lib/friend-invite-rpc-server';
import { normalizeShareToken } from '@/lib/share-token-server';

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export type ShareFriendInviteOgPayload = {
  pageTitle: string;
  description: string;
  imageHeadline: string;
};

export function resolveFriendInviteOgImagePath(token: string): string {
  const t = token.trim() || 'default';
  return `/api/friend-invite-og/${encodeURIComponent(t)}`;
}

/** 링크 프리뷰용: service role RPC로 초대자 닉네임 조회 (실패 시 null) */
export async function fetchShareFriendInviteOgMeta(token: string): Promise<ShareFriendInviteOgPayload | null> {
  const normalized = normalizeShareToken(token);
  if (!normalized) return null;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return null;
  }

  try {
    const row = await rpcFriendInviteShareGuestGet(normalized);
    if (!row.ok) return null;

    const nickname = asStr(row.nickname) || 'Ginit';
    const imageHeadline = `${nickname}님이 친구를 요청했어요`;
    const pageTitle = `${imageHeadline} · 지닛`;
    const description = '지닛 친구 요청 링크입니다. 앱에서 친구를 수락할 수 있어요.';

    return { pageTitle, description, imageHeadline };
  } catch {
    return null;
  }
}
