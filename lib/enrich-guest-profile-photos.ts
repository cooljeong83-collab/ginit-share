import { sanitizeShareProfilePhotoUrl } from '@/lib/safe-external-url';
import { signAvatarsStorageUrlIfNeeded } from '@/lib/supabase-storage-url';
import type { FriendInviteGuestGetResult } from '@/lib/friend-invite-rpc-server';
import type { GuestGetResult } from '@/lib/share-rpc-server';

async function resolveGuestProfilePhotoUrl(raw: unknown): Promise<string | null> {
  const safe = sanitizeShareProfilePhotoUrl(raw);
  if (!safe) return null;
  return signAvatarsStorageUrlIfNeeded(safe);
}

function normalizeParticipantKey(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (t.includes('@')) return t.toLowerCase();
  return t;
}

export async function enrichMeetingShareGuestGet(data: GuestGetResult): Promise<GuestGetResult> {
  const meeting = data.meeting;
  if (!meeting || typeof meeting !== 'object' || Array.isArray(meeting)) {
    return data;
  }

  const out = { ...meeting } as Record<string, unknown>;

  const partPubRaw = out.participantPublicByUserId;
  if (partPubRaw && typeof partPubRaw === 'object' && !Array.isArray(partPubRaw)) {
    const enriched: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(partPubRaw as Record<string, unknown>)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        enriched[key] = value;
        continue;
      }
      const row = { ...(value as Record<string, unknown>) };
      const signed = await resolveGuestProfilePhotoUrl(row.photoUrl);
      if (signed) row.photoUrl = signed;
      else delete row.photoUrl;
      enriched[key] = row;
    }
    out.participantPublicByUserId = enriched;
  }

  let hostPhoto = await resolveGuestProfilePhotoUrl(out.hostPhotoUrl);
  if (!hostPhoto) {
    const hostKey = normalizeParticipantKey(String(out.createdBy ?? ''));
    const partPub = out.participantPublicByUserId;
    if (hostKey && partPub && typeof partPub === 'object' && !Array.isArray(partPub)) {
      const hostRow = (partPub as Record<string, unknown>)[hostKey];
      if (hostRow && typeof hostRow === 'object' && !Array.isArray(hostRow)) {
        hostPhoto = await resolveGuestProfilePhotoUrl((hostRow as Record<string, unknown>).photoUrl);
      }
    }
  }
  if (hostPhoto) out.hostPhotoUrl = hostPhoto;
  else delete out.hostPhotoUrl;

  return { ...data, meeting: out };
}

export async function enrichFriendInviteShareGuestGet(
  data: FriendInviteGuestGetResult,
): Promise<FriendInviteGuestGetResult> {
  if (!data.ok) return data;
  const signed = await resolveGuestProfilePhotoUrl(data.photoUrl);
  return signed ? { ...data, photoUrl: signed } : { ...data, photoUrl: null };
}
