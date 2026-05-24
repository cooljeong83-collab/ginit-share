import { SHARE_TOKEN_HEADER } from '@/lib/share-api-http';

type ShareApiErrorBody = {
  error?: string;
  message?: string;
};

async function parseShareApiJson<T>(res: Response): Promise<T> {
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

export type GuestGetApiResult = {
  meeting?: Record<string, unknown>;
  requiresHostApproval?: boolean;
};

export async function apiShareGuestGet(token: string): Promise<GuestGetApiResult> {
  const res = await fetch('/api/share/guest-get', {
    method: 'POST',
    headers: shareHeaders(token),
    body: '{}',
  });
  return parseShareApiJson<GuestGetApiResult>(res);
}

export async function apiShareGuestJoin(
  token: string,
  body: {
    guestUserId: string;
    displayName: string;
    votes: Record<string, unknown>;
  },
): Promise<Record<string, unknown>> {
  const res = await fetch('/api/share/join', {
    method: 'POST',
    headers: shareHeaders(token),
    body: JSON.stringify(body),
  });
  return parseShareApiJson<Record<string, unknown>>(res);
}

export async function apiShareGuestRequest(
  token: string,
  body: {
    guestUserId: string;
    displayName: string;
    votes: Record<string, unknown>;
    message: string;
  },
): Promise<Record<string, unknown>> {
  const res = await fetch('/api/share/request', {
    method: 'POST',
    headers: shareHeaders(token),
    body: JSON.stringify(body),
  });
  return parseShareApiJson<Record<string, unknown>>(res);
}

export async function apiShareGuestLeave(
  token: string,
  body: {
    guestUserId: string;
    guestLeaveSecret: string;
  },
): Promise<void> {
  const res = await fetch('/api/share/leave', {
    method: 'POST',
    headers: shareHeaders(token),
    body: JSON.stringify(body),
  });
  await parseShareApiJson<Record<string, unknown>>(res);
}
