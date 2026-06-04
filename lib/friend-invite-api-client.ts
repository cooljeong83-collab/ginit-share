import { SHARE_TOKEN_HEADER } from '@/lib/share-api-http';

import type { FriendInviteGuestGetResult } from '@/lib/friend-invite-rpc-server';

type ShareApiErrorBody = {
  error?: string;
  message?: string;
};

async function parseFriendInviteApiJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as T & ShareApiErrorBody;
  if (!res.ok) {
    const msg =
      typeof json.message === 'string' && json.message.trim()
        ? json.message.trim()
        : typeof json.error === 'string'
          ? json.error
          : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

function shareHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    [SHARE_TOKEN_HEADER]: token,
  };
}

export async function apiFriendInviteGuestGet(
  token: string,
): Promise<FriendInviteGuestGetResult> {
  const res = await fetch('/api/friend-invite/guest-get', {
    method: 'POST',
    headers: shareHeaders(token),
    body: '{}',
  });
  return parseFriendInviteApiJson<FriendInviteGuestGetResult>(res);
}
