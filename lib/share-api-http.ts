import { normalizeShareToken, readShareTokenFromJsonBody, readShareTokenFromRequest } from '@/lib/share-token-server';

export const SHARE_TOKEN_HEADER = 'x-ginit-share-token';

export async function readShareTokenFromApiRequest(req: Request): Promise<string | null> {
  const fromHeader = readShareTokenFromRequest(req);
  if (fromHeader) return fromHeader;
  return readShareTokenFromJsonBody(req);
}

export function shareRpcErrorResponse(message: string, status = 400): Response {
  return Response.json({ error: 'share_rpc_failed', message }, { status });
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
    return Response.json({ error: 'invalid_share_token', message: msg }, { status: 403 });
  }
  if (lower.includes('meeting_share_rate_limited') || lower.includes('rate_limited')) {
    return Response.json({ error: 'rate_limited', message: msg }, { status: 429 });
  }
  return null;
}

export function normalizeTokenOrResponse(token: string | null): string | Response {
  const t = token ? normalizeShareToken(token) : null;
  if (!t) return shareTokenRequiredResponse();
  return t;
}
