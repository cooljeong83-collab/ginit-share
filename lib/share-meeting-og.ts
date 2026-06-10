import { resolvePlaceThumbnailUrl, type PlaceThumbnailInput } from '@/lib/place-thumbnail-resolve';
import { sanitizeHttpsImageUrl, sanitizeNaverPlaceHref } from '@/lib/safe-external-url';
import { normalizeShareToken } from '@/lib/share-token-server';
import { rpcMeetingShareGuestGet } from '@/lib/share-rpc-server';

type LooseMeeting = Record<string, unknown>;

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** 링크 미리보기 하단 설명 — 친구 초대와 동일하게 고정 안내 문구 */
export const MEETING_SHARE_OG_DESCRIPTION =
  '지닛으로 모임을 시작하고 일정·장소를 함께 정해 보세요.';

function pickFirstHttpsFromPlace(p: unknown): string | null {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const o = p as Record<string, unknown>;
  for (const k of ['preferredPhotoMediaUrl', 'photoUrl', 'imageUrl']) {
    const u = sanitizeHttpsImageUrl(o[k]);
    if (u) return u;
  }
  return null;
}

function placeChipId(p: Record<string, unknown>, index: number): string {
  const id = asStr(p.id);
  if (id) return id;
  return `place-${index}`;
}

function placeCandidatesList(meeting: LooseMeeting): Record<string, unknown>[] {
  const raw = meeting.placeCandidates;
  if (!Array.isArray(raw)) return [];
  return raw.filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === 'object' && !Array.isArray(p));
}

/** 공유 UI와 동일: 확정 chip → 단일 후보 → 후보 순회 → meeting.imageUrl */
function pickOgImageUrl(meeting: LooseMeeting): string | null {
  const candidates = placeCandidatesList(meeting);
  const confirmedChipId = asStr(meeting.confirmedPlaceChipId);

  if (confirmedChipId) {
    for (let i = 0; i < candidates.length; i++) {
      const p = candidates[i]!;
      if (placeChipId(p, i) !== confirmedChipId) continue;
      const u = pickFirstHttpsFromPlace(p);
      if (u) return u;
    }
  }

  if (candidates.length === 1) {
    const u = pickFirstHttpsFromPlace(candidates[0]);
    if (u) return u;
  }

  for (const p of candidates) {
    const u = pickFirstHttpsFromPlace(p);
    if (u) return u;
  }

  return sanitizeHttpsImageUrl(meeting.imageUrl);
}

function placeThumbnailInputFromRecord(p: Record<string, unknown>): PlaceThumbnailInput {
  const naverPlaceLink =
    sanitizeNaverPlaceHref(p.naverPlaceLink) ?? sanitizeNaverPlaceHref(p.placeKey) ?? undefined;
  return {
    title: asStr(p.placeName) || undefined,
    addressLine: asStr(p.address) || undefined,
    category: asStr(p.category) || undefined,
    preferredPhotoMediaUrl:
      asStr(p.preferredPhotoMediaUrl) || asStr(p.photoUrl) || asStr(p.imageUrl) || undefined,
    naverPlaceLink,
  };
}

function pickOgPlaceCandidate(meeting: LooseMeeting): Record<string, unknown> | null {
  const candidates = placeCandidatesList(meeting);
  if (!candidates.length) return null;

  const confirmedChipId = asStr(meeting.confirmedPlaceChipId);
  if (confirmedChipId) {
    for (let i = 0; i < candidates.length; i++) {
      const p = candidates[i]!;
      if (placeChipId(p, i) === confirmedChipId) return p;
    }
  }

  if (candidates.length === 1) return candidates[0]!;

  for (const p of candidates) {
    if (sanitizeNaverPlaceHref(p.naverPlaceLink) || sanitizeNaverPlaceHref(p.placeKey)) return p;
  }
  return candidates[0] ?? null;
}

async function pickOgImageUrlWithResolve(meeting: LooseMeeting): Promise<string | null> {
  const fromDb = pickOgImageUrl(meeting);
  if (fromDb) return fromDb;

  const place = pickOgPlaceCandidate(meeting);
  if (!place) return null;

  try {
    return await resolvePlaceThumbnailUrl(placeThumbnailInputFromRecord(place));
  } catch {
    return null;
  }
}

export type ShareMeetingOgPayload = {
  title: string;
  pageTitle: string;
  description: string;
  imageUrl: string | null;
};

export function resolveMeetingShareOgImagePath(token: string): string {
  const t = token.trim() || 'default';
  return `/api/meeting-share-og/${encodeURIComponent(t)}`;
}

/** 링크 프리뷰용: service role RPC로 모임 메타만 조회 (실패 시 null) */
export async function fetchShareMeetingOgMeta(token: string): Promise<ShareMeetingOgPayload | null> {
  const normalized = normalizeShareToken(token);
  if (!normalized) return null;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return null;
  }

  try {
    const row = await rpcMeetingShareGuestGet(normalized);
    const meeting = row.meeting;
    if (!meeting || typeof meeting !== 'object' || Array.isArray(meeting)) return null;

    const title = asStr(meeting.title) || '모임';
    const pageTitle = `${title} · 지닛 모임 공유`;
    const description = MEETING_SHARE_OG_DESCRIPTION;
    const imageUrl = await pickOgImageUrlWithResolve(meeting);

    return { title, pageTitle, description, imageUrl };
  } catch {
    return null;
  }
}
