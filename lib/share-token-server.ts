import { createClient } from '@supabase/supabase-js';

const SHARE_TOKEN_RE = /^[0-9a-f]{64}$/i;

export function normalizeShareToken(raw: unknown): string | null {
  const t = typeof raw === 'string' ? raw.trim().replace(/\s/g, '').toLowerCase() : '';
  if (!SHARE_TOKEN_RE.test(t)) return null;
  return t;
}

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    throw new Error('supabase_not_configured');
  }
  return createClient(url, key);
}

/** 유효한(미만료·미폐기) 공유 토큰인지 확인 (가벼운 RPC) */
export async function assertValidShareToken(token: string): Promise<void> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.rpc('meeting_share_assert_valid_share_token', { p_token: token });
  if (error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('meeting_share_invalid_or_expired_token') ||
      msg.includes('invalid_share_token')
    ) {
      throw new Error('invalid_share_token');
    }
    if (msg.includes('meeting_share_rate_limited') || msg.includes('rate_limited')) {
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
