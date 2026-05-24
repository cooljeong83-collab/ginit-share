import { rpcMeetingShareAssertValidToken } from '@/lib/share-rpc-server';

const SHARE_TOKEN_RE = /^[0-9a-f]{64}$/i;

export function normalizeShareToken(raw: unknown): string | null {
  const t = typeof raw === 'string' ? raw.trim().replace(/\s/g, '').toLowerCase() : '';
  if (!SHARE_TOKEN_RE.test(t)) return null;
  return t;
}

/** 유효한(미만료·미폐기) 공유 토큰인지 확인 (가벼운 RPC, service role) */
export async function assertValidShareToken(token: string): Promise<void> {
  try {
    await rpcMeetingShareAssertValidToken(token);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const lower = msg.toLowerCase();
    if (
      lower.includes('meeting_share_invalid_or_expired_token') ||
      lower.includes('invalid_share_token')
    ) {
      throw new Error('invalid_share_token');
    }
    if (lower.includes('meeting_share_rate_limited') || lower.includes('rate_limited')) {
      throw new Error('rate_limited');
    }
    throw new Error('share_token_check_failed');
  }
}

export function readShareTokenFromRequest(req: Request): string | null {
  const header = req.headers.get('x-ginit-share-token');
  if (header) {
    const t = normalizeShareToken(header);
    if (t) return t;
  }
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('shareToken') ?? url.searchParams.get('token');
    const t = normalizeShareToken(q);
    if (t) return t;
  } catch {
    /* ignore */
  }
  return null;
}

export async function readShareTokenFromJsonBody(req: Request): Promise<string | null> {
  try {
    const body = (await req.clone().json()) as { shareToken?: unknown; token?: unknown };
    return normalizeShareToken(body.shareToken) ?? normalizeShareToken(body.token);
  } catch {
    return null;
  }
}
