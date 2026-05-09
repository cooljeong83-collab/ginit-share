import { createClient } from '@supabase/supabase-js';

type LooseMeeting = Record<string, unknown>;

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function buildShareDescription(meeting: LooseMeeting, title: string): string {
  const desc = asStr(meeting.description);
  if (desc) return desc.length > 200 ? `${desc.slice(0, 197)}…` : desc;

  const bits: string[] = [];
  const schedule = [asStr(meeting.scheduleDate), asStr(meeting.scheduleTime)].filter(Boolean).join(' · ');
  if (schedule) bits.push(schedule);
  const place = asStr(meeting.placeName);
  if (place) bits.push(place);
  const cat = asStr(meeting.categoryLabel);
  if (cat) bits.push(cat);

  const line = bits.join(' · ');
  if (line) return line.length > 200 ? `${line.slice(0, 197)}…` : line;

  return `${title} — 지닛 웹 공유에서 일정·장소 투표에 참여해 보세요.`;
}

function pickOgImageUrl(meeting: LooseMeeting): string | null {
  const u = asStr(meeting.imageUrl);
  if (u.startsWith('https://') || u.startsWith('http://')) return u;
  return null;
}

export type ShareMeetingOgPayload = {
  title: string;
  pageTitle: string;
  description: string;
  imageUrl: string | null;
};

/** 링크 프리뷰용: anon RPC로 모임 메타만 조회 (실패 시 null) */
export async function fetchShareMeetingOgMeta(token: string): Promise<ShareMeetingOgPayload | null> {
  const raw = token.trim();
  if (!raw) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data, error } = await supabase.rpc('meeting_share_guest_get', { p_token: raw });
  if (error || data == null) return null;

  const row = data as { meeting?: LooseMeeting };
  const meeting = row.meeting;
  if (!meeting || typeof meeting !== 'object' || Array.isArray(meeting)) return null;

  const title = asStr(meeting.title) || '모임';
  const pageTitle = `${title} · 지닛 모임 공유`;
  const description = buildShareDescription(meeting, title);
  const imageUrl = pickOgImageUrl(meeting);

  return { title, pageTitle, description, imageUrl };
}
