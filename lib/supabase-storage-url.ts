import { getSupabaseServiceRole } from '@/lib/supabase-service-role';

const AVATAR_SIGN_TTL_SEC = 60 * 60 * 24;

export type ParsedStorageObject = { bucket: string; path: string };

/** `/storage/v1/object/public|sign|authenticated/{bucket}/{path}` */
export function parseSupabaseStorageObjectUrl(url: string): ParsedStorageObject | null {
  const raw = url.trim();
  if (!raw) return null;
  let pathname = '';
  try {
    pathname = new URL(raw).pathname;
  } catch {
    return null;
  }
  const markers = [
    '/storage/v1/object/public/',
    '/storage/v1/object/sign/',
    '/storage/v1/object/authenticated/',
  ] as const;
  for (const marker of markers) {
    const i = pathname.indexOf(marker);
    if (i === -1) continue;
    const rest = pathname.slice(i + marker.length);
    const slash = rest.indexOf('/');
    if (slash <= 0) return null;
    const bucket = decodeURIComponent(rest.slice(0, slash));
    const path = decodeURIComponent(rest.slice(slash + 1));
    if (!bucket || !path) return null;
    return { bucket, path };
  }
  return null;
}

export function isGinitAvatarsStorageUrl(url: string): boolean {
  const parsed = parseSupabaseStorageObjectUrl(url);
  return parsed?.bucket === 'avatars';
}

/** private `avatars` 버킷 public URL → signed URL (게스트 웹용) */
export async function signAvatarsStorageUrlIfNeeded(url: string): Promise<string | null> {
  const raw = url.trim();
  if (!raw) return null;
  if (!isGinitAvatarsStorageUrl(raw)) return raw;

  const parsed = parseSupabaseStorageObjectUrl(raw);
  if (!parsed) return null;

  const supabase = getSupabaseServiceRole();
  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, AVATAR_SIGN_TTL_SEC);
  if (error || !data?.signedUrl?.trim()) return null;
  return data.signedUrl.trim();
}
