import { normalizeShareToken, readShareTokenFromJsonBody, readShareTokenFromRequest } from '@/lib/share-token-server';

export const SHARE_TOKEN_HEADER = 'x-ginit-share-token';

const KNOWN_RPC_CODE_RE = /(?:meeting_share|friend_invite)_[a-z0-9_]+/i;

/** Supabase RPC 원문을 클라이언트에 노출하지 않고 알려진 코드만 반환 */
export function sanitizeShareRpcClientMessage(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return null;
  const match = trimmed.match(KNOWN_RPC_CODE_RE);
  if (match) return match[0].toLowerCase();
  const lower = trimmed.toLowerCase();
  if (lower.includes('meeting_share_rate_limited') || lower.includes('rate_limited')) {
    return 'rate_limited';
  }
  return null;
}

export async function readShareTokenFromApiRequest(req: Request): Promise<string | null> {
  const fromHeader = readShareTokenFromRequest(req);
  if (fromHeader) return fromHeader;
  return readShareTokenFromJsonBody(req);
}

export function shareRpcErrorResponse(message: string, status = 400): Response {
  const safe = sanitizeShareRpcClientMessage(message);
  if (safe) {
    return Response.json({ error: safe, message: safe }, { status });
  }
  return Response.json({ error: 'share_rpc_failed' }, { status });
}

export function shareTokenRequiredResponse(): Response {
  return Response.json({ error: 'share_token_required' }, { status: 401 });
}

export function mapAssertTokenError(e: unknown): Response | null {
  const msg = e instanceof Error ? e.message : String(e);
  const lower = msg.toLowerCase();
  if (
    lower.includes('meeting_share_invalid_or_expired_token') ||
    lower.includes('invalid_share_token')
  ) {
    return Response.json({ error: 'invalid_share_token' }, { status: 403 });
  }
  if (lower.includes('meeting_share_rate_limited') || lower.includes('rate_limited')) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }
  return null;
}

export function normalizeTokenOrResponse(token: string | null): string | Response {
  const t = token ? normalizeShareToken(token) : null;
  if (!t) return shareTokenRequiredResponse();
  return t;
}
