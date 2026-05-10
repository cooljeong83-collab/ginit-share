'use client';

import { getSupabaseBrowser } from '@/lib/supabase';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  Fragment,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import './share.css';

type LooseDoc = Record<string, unknown>;

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Supabase 요청이 끝나지 않을 때 로딩이 무한히 보이지 않도록 */
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMessage)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/** 앱 user id 비교용(이메일 PK는 소문자) */
function normalizeParticipantKey(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  if (t.includes('@')) return t.toLowerCase();
  return t;
}

function initialsFrom(label: string): string {
  const s = label.trim();
  if (!s) return 'G';
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
  return s.slice(0, 2).toUpperCase();
}

function asObj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function tallyFromBucket(bucket: unknown, id: string): number {
  const b = asObj(bucket);
  if (!b) return 0;
  const raw = b[id];
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : 0;
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function compareByTallyThenLabel(a: { tally: number; label: string }, b: { tally: number; label: string }): number {
  if (a.tally !== b.tally) return b.tally - a.tally;
  return a.label.localeCompare(b.label, 'ko');
}

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function ymdToDate(ymd: string): Date | null {
  if (!isYmd(ymd)) return null;
  const [yy, mm, dd] = ymd.split('-').map((x) => Number(x));
  if (!Number.isFinite(yy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null;
  const d = new Date(yy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function ymdMonthKey(ymd: string): string {
  return isYmd(ymd) ? ymd.slice(0, 7) : '';
}

function addMonths(monthKey: string, delta: number): string {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return monthKey;
  const [yy, mm] = monthKey.split('-').map((x) => Number(x));
  const d = new Date(yy, (mm - 1) + delta, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function normalizeHm(raw: string): string {
  const s = raw.trim();
  if (!s) return '';
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return s;
  const hh = String(Math.max(0, Math.min(23, Number(m[1])))).padStart(2, '0');
  const mm = String(Math.max(0, Math.min(59, Number(m[2])))).padStart(2, '0');
  return `${hh}:${mm}`;
}

function asNum(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function dateChipId(d: LooseDoc, index: number): string {
  const id = asStr(d.id);
  if (id) return id;
  return `dc-${index}`;
}

function placeChipId(p: LooseDoc, index: number): string {
  const id = asStr(p.id);
  if (id) return id;
  return `place-${index}`;
}

function movieChipId(m: LooseDoc, index: number): string {
  const mid = asStr(m.id);
  if (mid) return `${mid}#${index}`;
  return `movie-${index}`;
}

function moviePosterUrl(m: LooseDoc): string {
  const u =
    asStr(m.posterUrl) ||
    asStr(m.poster) ||
    asStr(m.imageUrl) ||
    asStr(m.thumbnailUrl) ||
    asStr(m.thumbUrl);
  return u.startsWith('https://') ? u : '';
}

function resolveNaverMovieSearchWebUrl(movieTitle: string): string {
  const title = movieTitle.trim();
  if (!title) return '';
  const q = `영화 ${title}`.replace(/\s+/g, ' ').trim();
  return `https://m.search.naver.com/search.naver?where=m&sm=mtp_hty.top&query=${encodeURIComponent(q)}`;
}

function guestStorageKey(meetingId: string): string {
  return `ginit_share_guest:${meetingId}`;
}

/** participantVoteLog / joinRequests 행의 dateChipIds 등 JSON 배열 → 문자열 id 목록 */
function stringIdsFromVoteRow(o: LooseDoc, key: string): string[] {
  const raw = o[key];
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === 'string' && x.trim()) out.push(x.trim());
  }
  return out;
}

/** PostgREST / Postgres 메시지에 포함될 수 있는 meeting_share_* 코드 → 사용자 문구 */
function formatMeetingShareRpcError(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('meeting_share_capacity_full')) {
    return '모임 정원이 찼어요. 참여할 수 없어요.';
  }
  if (m.includes('meeting_share_invalid_or_expired_token')) {
    return '링크가 만료되었거나 잘못되었어요.';
  }
  if (m.includes('meeting_share_schedule_already_confirmed')) {
    return '일정이 확정된 모임이라 더 이상 참여·투표를 바꿀 수 없어요.';
  }
  if (m.includes('meeting_share_guest_kicked')) {
    return '이 모임에서 나간 상태예요. 호스트에게 문의해 주세요.';
  }
  if (m.includes('meeting_share_already_participant')) {
    return '이미 참여 중이에요.';
  }
  if (m.includes('meeting_share_meeting_not_found')) {
    return '모임을 찾을 수 없어요.';
  }
  if (m.includes('meeting_share_use_request_endpoint') || m.includes('meeting_share_use_join_endpoint')) {
    return '참여 방식이 맞지 않아요. 페이지를 새로고침한 뒤 다시 시도해 주세요.';
  }
  if (m.includes('meeting_share_guest_not_joined')) {
    return '먼저 참여 또는 참가 신청을 완료해 주세요.';
  }
  if (m.includes('meeting_share_guest_vote_locked')) {
    return '게스트로는 참여 시점의 투표만 반영되며, 이후 변경할 수 없어요. 앱에서 지닛 참여를 이용해 주세요.';
  }
  if (m.includes('meeting_share_invalid_guest') || m.includes('meeting_share_invalid_guest_id')) {
    return '참여 정보를 확인할 수 없어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.';
  }
  if (m.includes('cannot extract elements from a scalar')) {
    return '모임 저장 데이터 형식 문제로 나가기를 처리하지 못했어요. 서버를 최신으로 올린 뒤 다시 시도해 주세요.';
  }
  return raw.trim() || '오류가 발생했어요.';
}

/** 정원 초과·만료 링크 등: 참여 확인 팝업을 다시 열어도 해결되지 않는 오류 */
function shouldReopenGuestJoinConfirmAfterJoinError(raw: string): boolean {
  const m = raw.toLowerCase();
  const noReopen = [
    'meeting_share_capacity_full',
    'meeting_share_invalid_or_expired_token',
    'meeting_share_schedule_already_confirmed',
    'meeting_share_guest_kicked',
    'meeting_share_already_participant',
    'meeting_share_meeting_not_found',
    'meeting_share_use_request_endpoint',
    'meeting_share_use_join_endpoint',
    'meeting_share_invalid_guest',
    'meeting_share_invalid_guest_id',
    'meeting_share_guest_vote_locked',
  ];
  return !noReopen.some((code) => m.includes(code));
}

function SvgGuestParticipateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9 0c2.21 0 4-1.79 4-4S8.21 4 6 4 2 5.79 2 8s1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm9 0c-.29 0-.63.02-.98.05A3.992 3.992 0 0118 16v2h6v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function SvgLeaveMeetingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

export default function ShareMeetingClient({ token }: { token: string }) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<LooseDoc | null>(null);
  const [requiresHostApproval, setRequiresHostApproval] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [joined, setJoined] = useState(false);
  const [placeThumbById, setPlaceThumbById] = useState<Record<string, string | null>>({});
  const [guestJoinConfirmOpen, setGuestJoinConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [shareRpcErrorOpen, setShareRpcErrorOpen] = useState(false);
  const [shareRpcErrorMessage, setShareRpcErrorMessage] = useState('');
  const [voteGateOpen, setVoteGateOpen] = useState(false);
  const [voteGateTarget, setVoteGateTarget] = useState<'date' | 'place' | 'movie' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<string>('');
  const [timePickYmd, setTimePickYmd] = useState<string | null>(null);

  const dateSectionRef = useRef<HTMLElement | null>(null);
  const placeSectionRef = useRef<HTMLElement | null>(null);
  const movieSectionRef = useRef<HTMLElement | null>(null);
  const participantNameSectionRef = useRef<HTMLElement | null>(null);
  const [participantNameError, setParticipantNameError] = useState('');

  const meetingId = asStr(meeting?.id);
  const scheduleConfirmed = useMemo(() => {
    const raw = meeting?.scheduleConfirmed;
    return typeof raw === 'boolean' ? raw : asStr(raw) === 'true';
  }, [meeting]);

  const dateCandidates = useMemo(() => {
    const raw = meeting?.dateCandidates;
    if (!Array.isArray(raw)) return [] as LooseDoc[];
    return raw.filter((x) => x && typeof x === 'object' && !Array.isArray(x)) as LooseDoc[];
  }, [meeting]);

  const placeCandidates = useMemo(() => {
    const raw = meeting?.placeCandidates;
    if (!Array.isArray(raw)) return [] as LooseDoc[];
    return raw.filter((x) => x && typeof x === 'object' && !Array.isArray(x)) as LooseDoc[];
  }, [meeting]);

  const treatAsConfirmed = useMemo(() => {
    return scheduleConfirmed || (dateCandidates.length === 1 && placeCandidates.length === 1);
  }, [scheduleConfirmed, dateCandidates.length, placeCandidates.length]);

  const movieExtras = useMemo(() => {
    const ex = meeting?.extraData;
    if (!ex || typeof ex !== 'object' || Array.isArray(ex)) return [] as LooseDoc[];
    const e = ex as LooseDoc;
    const mv = e.movies;
    if (Array.isArray(mv)) return mv.filter((x) => x && typeof x === 'object') as LooseDoc[];
    const one = e.movie;
    if (one && typeof one === 'object' && !Array.isArray(one)) return [one as LooseDoc];
    return [];
  }, [meeting]);

  const voteTallies = useMemo(() => asObj(meeting?.voteTallies), [meeting]);
  const placeTallyBucket = voteTallies?.places;
  const dateTallyBucket = voteTallies?.dates;
  const movieTallyBucket = voteTallies?.movies;

  const requestMessageEnabled = useMemo(() => {
    const mc = meeting?.meetingConfig;
    if (!mc || typeof mc !== 'object' || Array.isArray(mc)) return false;
    return Boolean((mc as LooseDoc).requestMessageEnabled);
  }, [meeting]);

  const voteLogDisplayNameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    const log = meeting?.participantVoteLog;
    if (!Array.isArray(log)) return map;
    for (const raw of log) {
      const o = asObj(raw);
      if (!o) continue;
      const uid = asStr(o.userId);
      const dn = asStr(o.displayName).trim();
      if (uid && dn) map.set(uid, dn);
    }
    return map;
  }, [meeting]);

  const joinRequestDisplayNameByUserId = useMemo(() => {
    const map = new Map<string, string>();
    const jrs = meeting?.joinRequests;
    if (!Array.isArray(jrs)) return map;
    for (const raw of jrs) {
      const o = asObj(raw);
      if (!o) continue;
      const uid = asStr(o.userId);
      const dn = asStr(o.displayName).trim();
      if (uid && dn) map.set(uid, dn);
    }
    return map;
  }, [meeting]);

  /** meeting_share_guest_get → profiles 기반 앱 참여자 닉네임·사진 (키: 정규화된 app user id) */
  const participantPublicByUserId = useMemo(() => {
    const map = new Map<string, { nickname: string; photoUrl: string }>();
    const raw = meeting?.participantPublicByUserId;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return map;
    const o = raw as Record<string, unknown>;
    for (const [k, v] of Object.entries(o)) {
      if (!k || typeof v !== 'object' || v === null || Array.isArray(v)) continue;
      const vo = v as LooseDoc;
      const nick = asStr(vo.nickname);
      const photo = asStr(vo.photoUrl);
      map.set(normalizeParticipantKey(k), { nickname: nick, photoUrl: photo });
    }
    return map;
  }, [meeting]);

  const sortedDateCandidates = useMemo(() => {
    return [...dateCandidates]
      .map((d, i) => {
        const id = dateChipId(d, i);
        const label = `${asStr(d.startDate) || '날짜 미정'} ${asStr(d.startTime) || ''}`.trim() || id;
        const base = tallyFromBucket(dateTallyBucket, id);
        const tally = base + (!joined && selectedDates.includes(id) ? 1 : 0);
        return { d, i, id, label, tally };
      })
      .sort((a, b) => compareByTallyThenLabel(a, b));
  }, [dateCandidates, dateTallyBucket, selectedDates, joined]);

  const dateByYmd = useMemo(() => {
    const map = new Map<string, { id: string; label: string; tally: number; hm: string }[]>();
    for (const { id, label, tally, d } of sortedDateCandidates) {
      const ymd = asStr((d as LooseDoc).startDate);
      if (!isYmd(ymd)) continue;
      const hm = normalizeHm(asStr((d as LooseDoc).startTime));
      const arr = map.get(ymd) ?? [];
      arr.push({ id, label, tally, hm });
      map.set(ymd, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => compareByTallyThenLabel({ tally: a.tally, label: a.hm || a.label }, { tally: b.tally, label: b.hm || b.label }));
      map.set(k, arr);
    }
    return map;
  }, [sortedDateCandidates]);

  const ymdTotals = useMemo(() => {
    const out = new Map<string, { tally: number; hasSelected: boolean; count: number }>();
    for (const [ymd, arr] of dateByYmd.entries()) {
      const tally = arr.reduce((acc, x) => acc + (Number.isFinite(x.tally) ? x.tally : 0), 0);
      const hasSelected = arr.some((x) => selectedDates.includes(x.id));
      out.set(ymd, { tally, hasSelected, count: arr.length });
    }
    return out;
  }, [dateByYmd, selectedDates]);

  const initialCalendarMonth = useMemo(() => {
    const keys = [...dateByYmd.keys()].sort();
    if (keys.length > 0) return ymdMonthKey(keys[0]!) || '';
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, [dateByYmd]);

  useEffect(() => {
    if (!calendarMonth && initialCalendarMonth) setCalendarMonth(initialCalendarMonth);
  }, [calendarMonth, initialCalendarMonth]);

  const sortedPlaceCandidates = useMemo(() => {
    const rows = placeCandidates.map((p, i) => {
      const id = placeChipId(p, i);
      const name = asStr(p.placeName) || '장소';
      const base = tallyFromBucket(placeTallyBucket, id);
      const tally = base + (!joined && selectedPlaces.includes(id) ? 1 : 0);
      return { p, i, id, name, tally, sortTally: base };
    });
    rows.sort((a, b) =>
      compareByTallyThenLabel({ tally: a.sortTally, label: a.name }, { tally: b.sortTally, label: b.name }),
    );
    return rows.map(({ p, i, id, name, tally }) => ({ p, i, id, name, tally }));
  }, [placeCandidates, placeTallyBucket, selectedPlaces, joined]);

  const sortedMovieExtras = useMemo(() => {
    const rows = movieExtras.map((m, i) => {
      const id = movieChipId(m, i);
      const label = asStr(m.title) || id;
      const base = tallyFromBucket(movieTallyBucket, id);
      const tally = base + (!joined && selectedMovies.includes(id) ? 1 : 0);
      return { m, i, id, label, tally, sortTally: base };
    });
    rows.sort((a, b) =>
      compareByTallyThenLabel({ tally: a.sortTally, label: a.label }, { tally: b.sortTally, label: b.label }),
    );
    return rows.map(({ m, i, id, label, tally }) => ({ m, i, id, label, tally }));
  }, [movieExtras, movieTallyBucket, selectedMovies, joined]);

  const confirmedDateChipId = useMemo(() => asStr(meeting?.confirmedDateChipId), [meeting]);
  const confirmedPlaceChipId = useMemo(() => asStr(meeting?.confirmedPlaceChipId), [meeting]);

  /** 기본 정보 카드: 일정·장소 다중 후보 + 미확정일 때 투표중 표시 */
  const basicInfoDateIsVoting = useMemo(
    () => !scheduleConfirmed && dateCandidates.length > 1,
    [scheduleConfirmed, dateCandidates.length],
  );
  const basicInfoPlaceIsVoting = useMemo(
    () => placeCandidates.length > 1 && !confirmedPlaceChipId,
    [placeCandidates.length, confirmedPlaceChipId],
  );

  const confirmedDateLabel = useMemo(() => {
    if (confirmedDateChipId) {
      const hit = sortedDateCandidates.find((x) => x.id === confirmedDateChipId);
      if (hit) return hit.label;
    }
    if (dateCandidates.length === 1) {
      const d = dateCandidates[0]!;
      return `${asStr(d.startDate) || '날짜 미정'} ${asStr(d.startTime) || ''}`.trim() || '확정 일정';
    }
    return '';
  }, [confirmedDateChipId, sortedDateCandidates, dateCandidates]);

  const confirmedPlace = useMemo(() => {
    if (confirmedPlaceChipId) {
      const hit = sortedPlaceCandidates.find((x) => x.id === confirmedPlaceChipId);
      if (hit) return hit;
    }
    if (placeCandidates.length === 1) {
      const p = placeCandidates[0]!;
      const id = placeChipId(p, 0);
      const name = asStr(p.placeName) || '장소';
      return { p, i: 0, id, name, tally: tallyFromBucket(placeTallyBucket, id) };
    }
    return null;
  }, [confirmedPlaceChipId, sortedPlaceCandidates, placeCandidates, placeTallyBucket]);

  const confirmedPlaceThumb = useMemo(() => {
    const id = confirmedPlace?.id ?? '';
    const fromCache = id ? placeThumbById[id] : null;
    if (fromCache) return fromCache;
    const p = confirmedPlace?.p;
    if (!p) return '';
    return asStr(p.preferredPhotoMediaUrl) || asStr(p.photoUrl) || asStr(p.imageUrl);
  }, [confirmedPlace, placeThumbById]);

  const confirmedPlaceLatLng = useMemo(() => {
    const p = confirmedPlace?.p;
    if (!p) return null;
    const lat = asNum((p as LooseDoc).latitude);
    const lng = asNum((p as LooseDoc).longitude);
    if (lat == null || lng == null) return null;
    if (Math.abs(lat) < 0.00001 || Math.abs(lng) < 0.00001) return null;
    return { lat, lng };
  }, [confirmedPlace]);

  /** 확정 장소 지도: 상호 제외, 주소만 검색어로 사용 (주소 없으면 좌표 문자열) */
  const confirmedPlaceNaverMapHref = useMemo(() => {
    if (!confirmedPlaceLatLng || !confirmedPlace) return '';
    const addrOnly = asStr(confirmedPlace.p.address).trim() || asStr(meeting?.address).trim() || '';
    const q = addrOnly || `${confirmedPlaceLatLng.lat},${confirmedPlaceLatLng.lng}`;
    return `https://map.naver.com/v5/search/${encodeURIComponent(q)}?c=${encodeURIComponent(
      `${confirmedPlaceLatLng.lng},${confirmedPlaceLatLng.lat},16,0,0,0,dh`,
    )}`;
  }, [confirmedPlace, confirmedPlaceLatLng, meeting?.address]);

  const heroPlaceThumbs = useMemo(() => {
    if (scheduleConfirmed) {
      if (confirmedPlace) {
        const u = confirmedPlaceThumb.trim();
        if (u.startsWith('https://') || u.startsWith('http://')) return [u];
      }
      return [];
    }
    const urls: string[] = [];
    for (const { p, id } of sortedPlaceCandidates) {
      const u =
        (placeThumbById[id] ?? '') ||
        asStr((p as LooseDoc).preferredPhotoMediaUrl) ||
        asStr((p as LooseDoc).photoUrl) ||
        asStr((p as LooseDoc).imageUrl);
      if (u.startsWith('https://')) urls.push(u);
    }
    return urls;
  }, [scheduleConfirmed, confirmedPlace, confirmedPlaceThumb, sortedPlaceCandidates, placeThumbById]);

  const load = useCallback(async () => {
    setPhase('loading');
    setErr(null);
    try {
      const sb = getSupabaseBrowser();
      const guestGetPromise = Promise.resolve(sb.rpc('meeting_share_guest_get', { p_token: token }));
      const { data, error } = await withTimeout(
        guestGetPromise,
        28_000,
        '연결 시간이 초과되었어요. 네트워크를 확인하거나, 배포(Vercel)에 NEXT_PUBLIC_SUPABASE_URL·NEXT_PUBLIC_SUPABASE_ANON_KEY가 맞게 들어갔는지 확인해 주세요.',
      );
      if (error) throw new Error(error.message);
      const row = data as { meeting?: LooseDoc; requiresHostApproval?: boolean } | null;
      const m = row?.meeting;
      if (!m || typeof m !== 'object') throw new Error('모임 정보를 불러오지 못했어요.');
      setMeeting(m);
      setRequiresHostApproval(Boolean(row?.requiresHostApproval));
      const mid = asStr(m.id);
      const stored = mid && typeof window !== 'undefined' ? window.localStorage.getItem(guestStorageKey(mid)) : null;
      setGuestUserId(stored?.trim() ? stored.trim() : null);
      const parts = Array.isArray(m.participantIds)
        ? (m.participantIds as unknown[]).filter((x): x is string => typeof x === 'string')
        : [];
      const inParticipants = stored?.trim() && parts.includes(stored.trim());
      const jrs = Array.isArray(m.joinRequests) ? m.joinRequests : [];
      const inJr = stored?.trim() && jrs.some((jr) => typeof jr === 'object' && jr && asStr((jr as LooseDoc).userId) === stored.trim());
      setJoined(Boolean(inParticipants || inJr));
      setPhase('ready');
    } catch (e) {
      setErr(e instanceof Error ? e.message : '오류가 발생했어요.');
      setPhase('error');
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (joined) {
      setGuestJoinConfirmOpen(false);
      setTimePickYmd(null);
    }
  }, [joined]);

  useEffect(() => {
    const gid = guestUserId?.trim();
    if (!joined || !gid || !meeting) return;

    let row: LooseDoc | null = null;
    const log = meeting.participantVoteLog;
    if (Array.isArray(log)) {
      for (const raw of log) {
        const o = asObj(raw);
        if (o && asStr(o.userId) === gid) {
          row = o;
          break;
        }
      }
    }
    if (!row) {
      const jrs = meeting.joinRequests;
      if (Array.isArray(jrs)) {
        for (const raw of jrs) {
          const o = asObj(raw);
          if (o && asStr(o.userId) === gid) {
            row = o;
            break;
          }
        }
      }
    }
    if (!row) return;

    const dn = asStr(row.displayName).trim();
    if (dn) setDisplayName(dn);

    setSelectedDates(stringIdsFromVoteRow(row, 'dateChipIds'));
    setSelectedPlaces(stringIdsFromVoteRow(row, 'placeChipIds'));
    setSelectedMovies(stringIdsFromVoteRow(row, 'movieChipIds'));
  }, [joined, guestUserId, meeting]);

  useEffect(() => {
    // 앱과 동일하게: 후보가 1개면 자동 선택(확정/투표 저장 payload 안정화).
    if (treatAsConfirmed) return;
    if (selectedDates.length === 0 && dateCandidates.length === 1) {
      setSelectedDates([dateChipId(dateCandidates[0]!, 0)]);
    }
    if (selectedPlaces.length === 0 && placeCandidates.length === 1) {
      setSelectedPlaces([placeChipId(placeCandidates[0]!, 0)]);
    }
  }, [treatAsConfirmed, selectedDates.length, selectedPlaces.length, dateCandidates, placeCandidates]);

  useEffect(() => {
    let cancelled = false;
    const missing = sortedPlaceCandidates
      .map(({ p, i, id }) => {
        const existing = placeThumbById[id];
        if (existing) return null;
        const pref = asStr(p.preferredPhotoMediaUrl);
        const direct = pref.startsWith('https://') ? pref : '';
        if (direct) return null;
        return { p, i, id };
      })
      .filter((x): x is { p: LooseDoc; i: number; id: string } => Boolean(x));
    if (missing.length === 0) return;

    void (async () => {
      for (const { p, id } of missing) {
        if (cancelled) return;
        try {
          const res = await fetch('/api/place-thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: asStr(p.placeName),
              addressLine: asStr(p.address),
              category: asStr(p.category),
              preferredPhotoMediaUrl: asStr(p.preferredPhotoMediaUrl),
              naverPlaceLink: asStr(p.naverPlaceLink),
            }),
          });
          const json = (await res.json()) as { thumbnailUrl?: string | null };
          const thumb = typeof json.thumbnailUrl === 'string' ? json.thumbnailUrl.trim() : null;
          if (!cancelled) {
            setPlaceThumbById((prev) => (prev[id] ? prev : { ...prev, [id]: thumb }));
          }
        } catch {
          if (!cancelled) {
            setPlaceThumbById((prev) => (prev[id] ? prev : { ...prev, [id]: null }));
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sortedPlaceCandidates, placeThumbById]);

  const toggle = (id: string, set: Dispatch<SetStateAction<string[]>>) => {
    if (joined) return;
    set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const votesPayload = useMemo(
    () => ({
      dateChipIds: selectedDates,
      placeChipIds: selectedPlaces,
      movieChipIds: selectedMovies,
    }),
    [selectedDates, selectedPlaces, selectedMovies],
  );

  /** 앱 모임 상세: `ginit-app` 푸시·알람과 동일하게 `ginitapp://meeting/<id>` (ex. meeting-host-push-notify.ts) */
  const openInAppUrl = useMemo(() => {
    const mid = meetingId ? encodeURIComponent(meetingId) : '';
    const raw = (process.env.NEXT_PUBLIC_GINIT_APP_OPEN_URL || '').trim();
    if (!mid) {
      const fallback = raw.replace(/\/+$/, '') || 'ginitapp://';
      return fallback;
    }
    const base = raw.replace(/\/+$/, '');
    if (!base || /^ginitapp:\/\/?$/i.test(base) || base.toLowerCase() === 'ginitapp:') {
      return `ginitapp://meeting/${mid}`;
    }
    return `${base}/meeting/${mid}`;
  }, [meetingId]);

  const handleJoinOrRequest = async () => {
    if (!meetingId) return;
    setBusy(true);
    setErr(null);
    setGuestJoinConfirmOpen(false);
    let openJoinWasAlreadyParticipant = false;
    try {
      const sb = getSupabaseBrowser();
      if (requiresHostApproval) {
        const { data, error } = await sb.rpc('meeting_share_guest_request', {
          p_token: token,
          p_guest_user_id: guestUserId ?? '',
          p_display_name: displayName,
          p_votes: votesPayload,
          p_message: requestMessageEnabled ? requestMessage : '',
        });
        if (error) throw new Error(error.message);
        const gid = asStr((data as { guestUserId?: string })?.guestUserId);
        if (!gid) throw new Error('참가 신청에 실패했어요.');
        window.localStorage.setItem(guestStorageKey(meetingId), gid);
        setGuestUserId(gid);
        setJoined(true);
      } else {
        const { data, error } = await sb.rpc('meeting_share_guest_join', {
          p_token: token,
          p_guest_user_id: guestUserId ?? '',
          p_display_name: displayName,
          p_votes: votesPayload,
        });
        if (error) throw new Error(error.message);
        const gid = asStr((data as { guestUserId?: string })?.guestUserId);
        if (!gid) throw new Error('참여에 실패했어요.');
        openJoinWasAlreadyParticipant = Boolean((data as { alreadyJoined?: boolean })?.alreadyJoined);
        window.localStorage.setItem(guestStorageKey(meetingId), gid);
        setGuestUserId(gid);
        setJoined(true);
      }
      await load();
      if (!requiresHostApproval && openJoinWasAlreadyParticipant) {
        setShareRpcErrorMessage('이미 참여한 투표입니다.');
        setShareRpcErrorOpen(true);
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : '오류가 발생했어요.';
      const friendly = formatMeetingShareRpcError(raw);
      setErr(friendly);
      setShareRpcErrorMessage(friendly);
      setShareRpcErrorOpen(true);
      if (shouldReopenGuestJoinConfirmAfterJoinError(raw)) {
        setGuestJoinConfirmOpen(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const performLeaveMeeting = async () => {
    if (!meetingId) return;
    const gid = guestUserId?.trim() ?? '';
    setLeaveConfirmOpen(false);
    setErr(null);
    setParticipantNameError('');
    setBusy(true);
    try {
      if (gid) {
        const sb = getSupabaseBrowser();
        const { error } = await sb.rpc('meeting_share_guest_leave', {
          p_token: token,
          p_guest_user_id: gid,
        });
        if (error) throw new Error(error.message);
      }
      try {
        window.localStorage.removeItem(guestStorageKey(meetingId));
      } catch {
        /* ignore */
      }
      setGuestUserId(null);
      setJoined(false);
      setGuestJoinConfirmOpen(false);
      setDisplayName('');
      setSelectedDates([]);
      setSelectedPlaces([]);
      setSelectedMovies([]);
      await load();
    } catch (e) {
      const raw = e instanceof Error ? e.message : '모임 나가기에 실패했어요.';
      setErr(formatMeetingShareRpcError(raw));
    } finally {
      setBusy(false);
    }
  };

  const handleGuestStart = async () => {
    if (!meetingId) return;
    setErr(null);
    setParticipantNameError('');
    if (!displayName.trim()) {
      setParticipantNameError('참여자명은 필수 입력이에요.');
      participantNameSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!treatAsConfirmed) {
      const needsDate = dateCandidates.length > 1 && selectedDates.length === 0;
      const needsPlace = placeCandidates.length > 1 && selectedPlaces.length === 0;
      const needsMovie = movieExtras.length > 1 && selectedMovies.length === 0;
      if (needsDate || needsPlace || needsMovie) {
        const target = needsDate ? 'date' : needsPlace ? 'place' : 'movie';
        setVoteGateTarget(target);
        setVoteGateOpen(true);
        return;
      }
    }
    setGuestJoinConfirmOpen(true);
  };

  const scrollToVoteTarget = (t: 'date' | 'place' | 'movie') => {
    const el =
      t === 'date' ? dateSectionRef.current : t === 'place' ? placeSectionRef.current : movieSectionRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleDateCandidateId = (id: string) => {
    if (joined) return;
    setSelectedDates((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const onCalendarDatePress = (ymd: string) => {
    if (joined) return;
    const arr = dateByYmd.get(ymd) ?? [];
    if (arr.length <= 1) {
      const first = arr[0];
      if (first) toggleDateCandidateId(first.id);
      return;
    }
    setTimePickYmd(ymd);
  };

  if (phase === 'loading') {
    return (
      <main className="gShell">
        <div className="gCenterEmpty">
          <div>
            <p className="gKicker">지닛 모임 공유</p>
            <p className="gEmptyText">불러오는 중…</p>
          </div>
        </div>
      </main>
    );
  }

  if (phase === 'error' || !meeting) {
    return (
      <main className="gShell">
        <div className="gCenterEmpty">
          <div>
            <p className="gKicker">지닛 모임 공유</p>
            <h1 className="gEmptyTitle">링크를 열 수 없어요</h1>
            <p className="gAlert" role="alert">
              {err ?? '알 수 없는 오류'}
            </p>
            <p className="gEmptyText">
              링크가 만료되었거나 잘못되었을 수 있어요. 모임 주최자에게 새 링크를 요청해 보세요.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const title = asStr(meeting.title) || '모임';
  const desc = asStr(meeting.description);
  const imageUrl = asStr(meeting.imageUrl);
  const isPublic = typeof meeting.isPublic === 'boolean' ? meeting.isPublic : asStr(meeting.isPublic) === 'true';
  const capacity = Number.isFinite(Number(meeting.capacity)) ? Number(meeting.capacity) : null;
  const scheduleDate = asStr(meeting.scheduleDate);
  const scheduleTime = asStr(meeting.scheduleTime);
  const placeName = asStr(meeting.placeName);
  const address = asStr(meeting.address);
  const categoryLabel = asStr(meeting.categoryLabel);

  const participantIds = Array.isArray(meeting.participantIds)
    ? (meeting.participantIds as unknown[]).filter((x): x is string => typeof x === 'string' && x.trim() !== '')
    : [];
  const joinRequests = Array.isArray(meeting.joinRequests)
    ? (meeting.joinRequests as unknown[]).filter((x) => x && typeof x === 'object')
    : [];
  const joinRequestIds = joinRequests
    .map((jr) => asStr((jr as LooseDoc).userId))
    .filter((x) => x);
  const totalPeople = new Set<string>([...participantIds, ...joinRequestIds]).size;

  const approvalLabel = requiresHostApproval ? '호스트 승인형' : '바로 참여';
  const heroFallbackImageUrl = heroPlaceThumbs.length > 0 ? '' : imageUrl;
  const hostDisplayNameFromApi = asStr(meeting.hostDisplayName);
  const hostPhotoUrlRaw = asStr(meeting.hostPhotoUrl);
  const hostPhotoUrl =
    hostPhotoUrlRaw.startsWith('https://') || hostPhotoUrlRaw.startsWith('http://') ? hostPhotoUrlRaw : '';

  return (
    <main className="gShell">
      <header className="gHero">
        <div className="gHeroImage">
          {heroPlaceThumbs.length === 1 ? (
            <img src={heroPlaceThumbs[0]} alt="" />
          ) : heroPlaceThumbs.length > 1 ? (
            <div className="gHeroThumbRow" aria-hidden>
              {heroPlaceThumbs.map((u, idx) => (
                <div className="gHeroThumbCell" key={`${idx}-${u}`}>
                  <img src={u} alt="" />
                </div>
              ))}
            </div>
          ) : heroFallbackImageUrl ? (
            <img src={heroFallbackImageUrl} alt="" />
          ) : null}
          <div className="gHeroOverlay" />
        </div>
        <div className="gHeroBody">
          <p className="gKicker">지닛 모임 공유</p>
          <h1 className="gTitle">{title}</h1>
          {desc ? <p className="gDesc">{desc}</p> : null}

          <div className="gBadgeRow" aria-label="모임 상태">
            <span className={`gMiniBadge ${isPublic ? '' : 'gMiniBadgeMuted'}`}>
              {isPublic ? '공개 모임' : '비공개 모임'}
            </span>
            <span className="gMiniBadge">{approvalLabel}</span>
            {scheduleConfirmed ? <span className="gMiniBadge">일정 확정</span> : <span className="gMiniBadgeMuted gMiniBadge">모집 중</span>}
            {capacity != null ? <span className="gMiniBadge gMiniBadgeMuted">{totalPeople} / {capacity}명</span> : null}
          </div>
        </div>
      </header>

      <section className="gCard" aria-label="기본 정보">
        <h2 className="gSectionTitle">기본 정보</h2>
        <div className="gInfoGrid">
          {categoryLabel ? (
            <div>
              <div className="gInfoLabel">카테고리</div>
              <div className="gInfoValue">{categoryLabel}</div>
            </div>
          ) : null}
          <div>
            <div className="gInfoLabel">일정</div>
            <div className="gInfoValue">
              {basicInfoDateIsVoting ? '투표중' : [scheduleDate, scheduleTime].filter(Boolean).join(' · ') || '미정'}
            </div>
          </div>
          <div>
            <div className="gInfoLabel">장소</div>
            <div className="gInfoValue">{basicInfoPlaceIsVoting ? '투표중' : placeName || '미정'}</div>
            {!basicInfoPlaceIsVoting && address ? (
              <div className="gSectionSub" style={{ marginTop: 6 }}>
                {address}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {(joined || !scheduleConfirmed) && (
        <section ref={participantNameSectionRef} className="gCard" aria-label="참여자명">
          <h2 className="gSectionTitle gSectionTitleRow">
            참여자명
            {!joined ? (
              <span className="gRequiredPill" aria-hidden>
                필수
              </span>
            ) : null}
          </h2>
          <p className="gSectionSub">
            {joined
              ? '참여 시 입력한 이름이에요.'
              : '참여자 목록과 투표에 표시돼요. 게스트 참여 전에 입력해 주세요.'}
          </p>
          {!joined ? (
            <>
              <input
                value={displayName}
                onChange={(e) => {
                  setParticipantNameError('');
                  setDisplayName(e.target.value.slice(0, 40));
                }}
                placeholder="참여자명을 입력하세요"
                className={`gInput ${participantNameError ? 'gInputInvalid' : ''}`}
                aria-invalid={Boolean(participantNameError)}
                aria-required
              />
              {participantNameError ? (
                <p className="gAlert" role="alert" style={{ marginTop: 10 }}>
                  {participantNameError}
                </p>
              ) : null}
            </>
          ) : (
            <div className="gInfoValue" style={{ fontWeight: 800 }}>
              {displayName.trim() || '—'}
            </div>
          )}
        </section>
      )}

      {joined && !treatAsConfirmed && (dateCandidates.length > 1 || placeCandidates.length > 1 || movieExtras.length > 1) ? (
        <div className="gHintCallout gHintCalloutWarn" role="note">
          <strong>투표 변경 불가</strong>
          <br />
          웹에서 게스트로 참여하면 참여 시점에 선택한 투표만 반영되며, 이후에는 바꿀 수 없어요. 채팅·공개 모임·투표 변경 등 모든 기능을 쓰시려면 지닛 앱을 설치한 뒤 하단의 지닛 참여로 진행해 보세요.
        </div>
      ) : null}

      {!joined && requiresHostApproval && requestMessageEnabled ? (
        <section className="gCard" aria-label="호스트에게 메시지">
          <h2 className="gSectionTitle">호스트에게 메시지</h2>
          <p className="gSectionSub">참가 신청 시 함께 전달돼요.</p>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value.slice(0, 200))}
            placeholder="한 줄 소개"
            rows={3}
            className="gTextarea"
          />
        </section>
      ) : null}

      {treatAsConfirmed ? (
        <section className="gCard" aria-label="확정">
          <h2 className="gSectionTitle">확정</h2>
          <p className="gSectionSub" style={{ marginTop: -6 }}>
            {scheduleConfirmed
              ? '호스트가 모임 일정을 확정했어요.'
              : '일자·장소 후보가 각각 1개뿐이라 확정된 것과 동일하게 표시해요.'}
          </p>
          <div className="gInfoGrid">
            <div>
              <div className="gInfoLabel">확정 일정</div>
              <div className="gInfoValue">{confirmedDateLabel || [scheduleDate, scheduleTime].filter(Boolean).join(' · ') || '미정'}</div>
            </div>
          </div>

          {confirmedPlace ? (
            <>
              <div className="gDivider" />
              <div className="gInfoLabel" style={{ marginBottom: 8 }}>
                확정 장소
              </div>
              <div className="gConfirmPlaceRow">
                <div className="gConfirmPlaceImg">
                  {confirmedPlaceThumb ? <img src={confirmedPlaceThumb} alt="" /> : <div className="gPlaceThumbPh" />}
                </div>
                <div className="gConfirmPlaceInfo">
                  <div className="gConfirmPlaceName">{confirmedPlace.name}</div>
                  {asStr(confirmedPlace.p.category) ? (
                    <div className="gConfirmPlaceMeta">{asStr(confirmedPlace.p.category)}</div>
                  ) : null}
                  {asStr(confirmedPlace.p.address) ? (
                    <div className="gConfirmPlaceMeta">{asStr(confirmedPlace.p.address)}</div>
                  ) : address ? (
                    <div className="gConfirmPlaceMeta">{address}</div>
                  ) : null}

                  <div className="gConfirmBtnRow" aria-label="확정 장소 정보·지도">
                    {asStr(confirmedPlace.p.naverPlaceLink) ? (
                      <a
                        className="gConfirmActionBtn"
                        href={asStr(confirmedPlace.p.naverPlaceLink)}
                        target="_blank"
                        rel="noreferrer">
                        정보
                      </a>
                    ) : (
                      <div className="gConfirmActionBtnDisabled" aria-hidden>
                        정보
                      </div>
                    )}

                    {confirmedPlaceLatLng && confirmedPlaceNaverMapHref ? (
                      <a
                        className="gConfirmActionBtn"
                        href={confirmedPlaceNaverMapHref}
                        target="_blank"
                        rel="noreferrer">
                        지도
                      </a>
                    ) : (
                      <div className="gConfirmActionBtnDisabled" aria-hidden>
                        지도
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </>
          ) : (
            <div className="gInfoGrid" style={{ marginTop: 12 }}>
              <div>
                <div className="gInfoLabel">확정 장소</div>
                <div className="gInfoValue">{placeName || '미정'}</div>
                {address ? <div className="gSectionSub" style={{ marginTop: 6 }}>{address}</div> : null}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {!treatAsConfirmed && dateCandidates.length > 0 ? (
        <section className="gCard" ref={(el) => void (dateSectionRef.current = el)}>
          <h2 className="gSectionTitle">일정 후보</h2>
          {dateCandidates.length === 1 ? (
            <p className="gSectionSub" style={{ marginTop: -6 }}>
              후보가 1개뿐이라 자동으로 선택돼요.
            </p>
          ) : null}
          <div className="gCalendarHeader">
            <button
              type="button"
              className="gCalNavBtn"
              disabled={joined}
              onClick={() => setCalendarMonth((m) => addMonths(m, -1))}>
              ‹
            </button>
            <div className="gCalTitle">{calendarMonth}</div>
            <button
              type="button"
              className="gCalNavBtn"
              disabled={joined}
              onClick={() => setCalendarMonth((m) => addMonths(m, 1))}>
              ›
            </button>
          </div>

          {(() => {
              if (!/^\d{4}-\d{2}$/.test(calendarMonth)) return null;
              const dow = ['일', '월', '화', '수', '목', '금', '토'] as const;
              const [yy, mm] = calendarMonth.split('-').map((x) => Number(x));
              const first = new Date(yy, mm - 1, 1);
              const startDow = first.getDay();
              const daysInMonth = new Date(yy, mm, 0).getDate();
              const cells: Array<{ kind: 'empty'; key: string } | { kind: 'day'; ymd: string; day: number; enabled: boolean; selected: boolean; tally: number }> = [];
              for (let i = 0; i < startDow; i++) cells.push({ kind: 'empty', key: `e-${i}` } as const);
              for (let day = 1; day <= daysInMonth; day++) {
                const ymd = `${yy}-${String(mm).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const meta = ymdTotals.get(ymd) ?? null;
                const enabled = Boolean(meta);
                const selected = Boolean(meta?.hasSelected);
                const tally = meta?.tally ?? 0;
                cells.push({ kind: 'day', ymd, day, enabled, selected, tally } as const);
              }
              while (cells.length % 7 !== 0) {
                cells.push({ kind: 'empty', key: `pad-${cells.length}` } as const);
              }
              const weeks: (typeof cells)[] = [];
              for (let i = 0; i < cells.length; i += 7) {
                weeks.push(cells.slice(i, i + 7));
              }
              const colHasCandidate = [false, false, false, false, false, false, false];
              for (const week of weeks) {
                week.forEach((c, col) => {
                  if (c.kind === 'day' && c.enabled) colHasCandidate[col] = true;
                });
              }
              const colWide = 'minmax(0, 2.15fr)';
              const colNarrow = 'minmax(0, 0.68fr)';
              const gridTemplateColumns = colHasCandidate.map((w) => (w ? colWide : colNarrow)).join(' ');
              const renderBody = (c: (typeof cells)[number]): ReactNode => {
                if (c.kind === 'empty') return <div className="gCalendarCell gCalendarCellEmpty" />;
                return (
                  <button
                    type="button"
                    role="gridcell"
                    disabled={!c.enabled || joined}
                    onClick={() => onCalendarDatePress(c.ymd)}
                    className={`gCalendarCell ${c.enabled ? 'gCalendarCellOn' : 'gCalendarCellOff'} ${
                      c.selected ? 'gCalendarCellSelected' : ''
                    }`}>
                    <div className="gCalDayNum">{c.day}</div>
                    {c.enabled ? (
                      <div className="gCalTimes" aria-hidden>
                        {(dateByYmd.get(c.ymd) ?? []).slice(0, 2).map((o) => (
                          <div className="gCalTimeRow" key={o.id}>
                            <div className="gCalTimeHm">{o.hm || '—'}</div>
                            <div className="gCalTimeTally">{o.tally}</div>
                          </div>
                        ))}
                        {(dateByYmd.get(c.ymd)?.length ?? 0) > 2 ? (
                          <div className="gCalTimeMore">+{(dateByYmd.get(c.ymd)?.length ?? 0) - 2}</div>
                        ) : null}
                      </div>
                    ) : null}
                    {c.selected ? <div className="gCalCheck">✓</div> : null}
                  </button>
                );
              };
              return (
                <div
                  className="gCalendarMatrix"
                  role="grid"
                  aria-label="달력"
                  style={{ gridTemplateColumns }}>
                  {dow.map((label, col) => (
                    <div key={`dow-${col}`} className="gCalendarDowCell" aria-hidden>
                      {label}
                    </div>
                  ))}
                  {weeks.flatMap((week, wi) =>
                    week.map((c) => {
                      const k = c.kind === 'empty' ? `${wi}-${c.key}` : `${wi}-${c.ymd}`;
                      return <Fragment key={k}>{renderBody(c)}</Fragment>;
                    }),
                  )}
                </div>
              );
            })()}
        </section>
      ) : null}

      {!treatAsConfirmed && placeCandidates.length > 0 ? (
        <section className="gCard" ref={(el) => void (placeSectionRef.current = el)}>
          <h2 className="gSectionTitle">장소 후보</h2>
          {placeCandidates.length === 1 ? (
            <p className="gSectionSub" style={{ marginTop: -6 }}>
              후보가 1개뿐이라 자동으로 선택돼요.
            </p>
          ) : null}
          {placeCandidates.length === 1 ? (
            (() => {
              const one = sortedPlaceCandidates[0];
              if (!one) return null;
              const { p, id, name } = one;
              const addr = asStr(p.address);
              const category = asStr(p.category);
              const thumb =
                (placeThumbById[id] ?? '') ||
                asStr(p.preferredPhotoMediaUrl) ||
                asStr(p.photoUrl) ||
                asStr(p.imageUrl);
              const link = asStr(p.naverPlaceLink);
              const singleSelected = selectedPlaces.includes(id);
              return (
                <div className={`gSinglePlaceCard${singleSelected ? ' gSinglePlaceCardSelected' : ''}`}>
                  <div className="gConfirmPlaceRow">
                    <div className="gConfirmPlaceImg">
                      {thumb ? <img src={thumb} alt="" /> : <div className="gPlaceThumbPh" />}
                    </div>
                    <div className="gConfirmPlaceInfo">
                      <div className="gConfirmPlaceName">{name}</div>
                      {category ? <div className="gConfirmPlaceMeta">{category}</div> : null}
                      {addr ? <div className="gConfirmPlaceMeta">{addr}</div> : null}
                    </div>
                  </div>
                  {link ? (
                    <a className="gPlaceDetailBtn" href={link} target="_blank" rel="noreferrer">
                      상세 정보
                    </a>
                  ) : (
                    <div className="gPlaceDetailBtnDisabled" aria-hidden>
                      상세 정보
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="gHScroll" role="list">
              {sortedPlaceCandidates.map(({ p, i, id, name, tally }) => {
                const on = selectedPlaces.includes(id);
                const addr = asStr(p.address);
                const category = asStr(p.category);
                const thumb =
                  (placeThumbById[id] ?? '') ||
                  asStr(p.preferredPhotoMediaUrl) ||
                  asStr(p.photoUrl) ||
                  asStr(p.imageUrl);
                const link = asStr(p.naverPlaceLink);
                const cardClass = `gPlaceCard ${on ? 'gPlaceCardOn' : ''}${joined ? ' gPlaceCardReadonly' : ''}`;
                const inner = (
                  <>
                    <div className="gPlaceThumb">
                      {thumb ? <img src={thumb} alt="" /> : <div className="gPlaceThumbPh" />}
                      <div className="gPlaceVoteBadges" aria-hidden>
                        <div className="gPlaceTallyPill">{tally}</div>
                        <div className={`gPlaceCheckCircle ${on ? 'gPlaceCheckCircleOn' : ''}`}>✓</div>
                      </div>
                    </div>
                    <div className="gPlaceBody">
                      <div className="gPlaceTitleBelow">{name}</div>
                      {category ? <div className="gPlaceMetaBelow">{category}</div> : null}
                      {addr ? <div className="gPlaceMetaBelow">{addr}</div> : null}
                      {link ? (
                        <a className="gPlaceInfoBtn" href={link} target="_blank" rel="noreferrer">
                          상세 정보
                        </a>
                      ) : (
                        <div className="gPlaceInfoBtnDisabled" aria-hidden>
                          상세 정보
                        </div>
                      )}
                    </div>
                  </>
                );
                return joined ? (
                  <div key={id} className={cardClass} role="listitem">
                    {inner}
                  </div>
                ) : (
                  <button
                    key={id}
                    type="button"
                    role="listitem"
                    onClick={() => toggle(id, setSelectedPlaces)}
                    className={cardClass}>
                    {inner}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {movieExtras.length > 0 ? (
        <section className="gCard" ref={(el) => void (movieSectionRef.current = el)}>
          <h2 className="gSectionTitle">영화 후보</h2>
          <div className="gHScroll" role="list">
            {sortedMovieExtras.map(({ m, id, label, tally }) => {
              const on = selectedMovies.includes(id);
              const poster = moviePosterUrl(m);
              const subtitle = asStr(m.releaseYear) || asStr(m.year) || asStr(m.originalTitle);
              const link = resolveNaverMovieSearchWebUrl(label);
              const cardClass = `gMovieCard ${on ? 'gMovieCardOn' : ''}${joined ? ' gPlaceCardReadonly' : ''}`;
              const inner = (
                <>
                  <div className="gMoviePoster">
                    {poster ? <img src={poster} alt="" /> : <div className="gMoviePosterPh" />}
                    <div className="gPlaceVoteBadges" aria-hidden>
                      <div className="gPlaceTallyPill">{tally}</div>
                      <div className={`gPlaceCheckCircle ${on ? 'gPlaceCheckCircleOn' : ''}`}>✓</div>
                    </div>
                  </div>
                  <div className="gMovieBody">
                    <div className="gMovieTitle">{label}</div>
                    {subtitle ? <div className="gMovieMeta">{subtitle}</div> : null}
                    {link ? (
                      <a className="gPlaceInfoBtn" href={link} target="_blank" rel="noreferrer">
                        영화 정보
                      </a>
                    ) : (
                      <div className="gPlaceInfoBtnDisabled" aria-hidden>
                        영화 정보
                      </div>
                    )}
                  </div>
                </>
              );
              return joined ? (
                <div key={id} className={cardClass} role="listitem">
                  {inner}
                </div>
              ) : (
                <button
                  key={id}
                  type="button"
                  role="listitem"
                  onClick={() => toggle(id, setSelectedMovies)}
                  className={cardClass}>
                  {inner}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="gCard" aria-label="참여자">
        <h2 className="gSectionTitle">참여자 ({totalPeople}명)</h2>
        {totalPeople === 0 ? (
          <p className="gSectionSub" style={{ margin: 0 }}>
            아직 참여한 사람이 없어요.
          </p>
        ) : (
          <div className="gAvatarRow">
            {participantIds.map((pid) => {
              const hostId = asStr(meeting.createdBy);
              const pidKey = normalizeParticipantKey(pid);
              const isHost = Boolean(hostId && pidKey === normalizeParticipantKey(hostId));
              const isGuest = pid.startsWith('ginitweb_');
              const guestNick = isGuest ? (voteLogDisplayNameByUserId.get(pid) ?? '').trim() : '';
              const pub = !isGuest && !isHost ? participantPublicByUserId.get(pidKey) : undefined;
              const nickFromProfile = pub?.nickname?.trim() ?? '';
              const photoFromProfile = pub?.photoUrl?.trim() ?? '';
              const memberPhotoUrl =
                photoFromProfile.startsWith('https://') || photoFromProfile.startsWith('http://')
                  ? photoFromProfile
                  : '';
              const memberNickFromLog = !isGuest && !isHost ? (voteLogDisplayNameByUserId.get(pid) ?? '').trim() : '';
              const memberNick = !isGuest && !isHost ? (nickFromProfile || memberNickFromLog) : '';
              const hostNickFromLog = isHost ? (voteLogDisplayNameByUserId.get(pid) ?? '').trim() : '';
              const primary = isHost
                ? hostDisplayNameFromApi || hostNickFromLog || '호스트'
                : isGuest
                  ? guestNick || '게스트'
                  : memberNick || '회원';
              const initialsSeed = primary;
              const sub = isGuest ? '(게스트)' : isHost ? '(호스트)' : '';
              const labelText = sub ? `${primary}\n${sub}` : primary;
              const showHostPhoto = isHost && Boolean(hostPhotoUrl);
              const showMemberPhoto = !isHost && !isGuest && Boolean(memberPhotoUrl);
              return (
                <div className="gAvatarCol" key={pid}>
                  <div className={`gAvatarCircle ${showHostPhoto || showMemberPhoto ? 'gAvatarCirclePhoto' : ''}`}>
                    {showHostPhoto ? (
                      <img src={hostPhotoUrl} alt="" />
                    ) : showMemberPhoto ? (
                      <img src={memberPhotoUrl} alt="" />
                    ) : (
                      initialsFrom(initialsSeed)
                    )}
                  </div>
                  <div className="gAvatarLabel">{labelText}</div>
                </div>
              );
            })}
            {joinRequestIds.map((pid) => {
              const nick = (joinRequestDisplayNameByUserId.get(pid) ?? '').trim() || '게스트';
              return (
                <div className="gAvatarCol" key={`jr-${pid}`}>
                  <div className="gAvatarCircle">{initialsFrom(nick)}</div>
                  <div className="gAvatarLabel">{`${nick}\n(게스트 · 신청)`}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {err ? (
        <p className="gAlert" role="alert">
          {err}
        </p>
      ) : null}

      {!joined &&
      !treatAsConfirmed &&
      (dateCandidates.length > 1 || placeCandidates.length > 1 || movieExtras.length > 1) ? (
        <div className="gHintCallout" role="note">
          후보가 여러 개인 항목은 투표를 마친 뒤 게스트 참여를 눌러 주세요. 웹 게스트는 참여 시점의 투표만 반영되며 이후 변경할 수 없어요.
        </div>
      ) : null}

      <footer className="gFooter">
        채팅·공개 모임·투표 변경·알림 등 전체 기능은 지닛 앱 설치 후 이용할 수 있어요.
      </footer>

      <div className="gBottomBar">
        <div className="gBottomInner">
          {!scheduleConfirmed && (
            <button
              type="button"
              className={`gPillBtn ${joined ? 'gPillDanger' : 'gPillPrimary'}`}
              disabled={busy}
              onClick={() => void (joined ? setLeaveConfirmOpen(true) : handleGuestStart())}>
              {!busy ? (
                <span className="gPillBtnSymbol" aria-hidden>
                  {joined ? <SvgLeaveMeetingIcon /> : <SvgGuestParticipateIcon />}
                </span>
              ) : null}
              {busy ? '처리 중…' : joined ? '나가기/재투표' : '게스트 참여'}
            </button>
          )}
          <a href={openInAppUrl} className="gPillBtn gPillPrimary">
            <img src="/ginit-logo.png" alt="" className="gPillBtnLogo" width={22} height={22} />
            지닛 참여
          </a>
        </div>
      </div>

      {leaveConfirmOpen && joined ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label="모임 참여 취소 및 재투표">
          <button
            type="button"
            className="gModalBackdrop"
            onClick={() => setLeaveConfirmOpen(false)}
            aria-label="닫기"
          />
          <div className="gModalCard">
            <div className="gModalTitle">모임 참여 취소 / 재 투표</div>
            <div className="gModalSub">
              모임 참여가 취소됩니다. 이 브라우저에 저장된 참여·투표 정보는 서버에서 삭제되며, 목록에서도 빠져요.{' '}
              <strong>같은 링크로 다시 참여할 수 있어요.</strong>
            </div>
            <div className="gConfirmBtnRow" style={{ marginTop: 14 }}>
              <button type="button" className="gPillBtn" disabled={busy} onClick={() => setLeaveConfirmOpen(false)}>
                취소
              </button>
              <button
                type="button"
                className="gPillBtn gPillDanger"
                disabled={busy}
                onClick={() => void performLeaveMeeting()}>
                {busy ? '처리 중…' : '나가기/재투표'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {guestJoinConfirmOpen && !joined ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label="게스트 참여 확인">
          <button
            type="button"
            className="gModalBackdrop"
            onClick={() => setGuestJoinConfirmOpen(false)}
            aria-label="닫기"
          />
          <div className="gModalCard">
            <div className="gModalTitle">게스트 참여 확인</div>
            <div className="gModalSub">
              <strong className="gModalWarn">게스트로 참여하면 지금 선택한 투표는 변경할 수 없습니다.</strong>
              <br />
              <br />
              채팅, 공개 모임 상세, 투표 변경 등 모든 기능을 사용하시려면 지닛 앱을 설치한 뒤 하단의 지닛 참여를 이용해 주세요.
            </div>
            <div className="gConfirmBtnRow" style={{ marginTop: 14 }}>
              <button type="button" className="gPillBtn" disabled={busy} onClick={() => setGuestJoinConfirmOpen(false)}>
                취소
              </button>
              <button type="button" className="gPillBtn gPillPrimary" disabled={busy} onClick={() => void handleJoinOrRequest()}>
                {busy ? '처리 중…' : requiresHostApproval ? '참가 신청' : '참여하기'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {voteGateOpen ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label="투표 안내">
          <button
            type="button"
            className="gModalBackdrop"
            onClick={() => setVoteGateOpen(false)}
            aria-label="닫기"
          />
          <div className="gModalCard">
            <div className="gModalTitle">참여 전 투표가 필요해요</div>
            <div className="gModalSub">
              아직 확정 전이라, 후보가 여러 개인 항목은 먼저 투표한 뒤 게스트 참여를 눌러 주세요.
              <br />
              웹 게스트는 참여하기를 누른 뒤에는 투표를 바꿀 수 없어요. 변경이 필요하면 지닛 앱에서 참여해 주세요.
            </div>

            <div className="gConfirmBtnRow" style={{ marginTop: 14 }}>
              <button type="button" className="gPillBtn" onClick={() => setVoteGateOpen(false)}>
                닫기
              </button>
              <button
                type="button"
                className="gPillBtn gPillPrimary"
                onClick={() => {
                  const t = voteGateTarget ?? 'date';
                  setVoteGateOpen(false);
                  scrollToVoteTarget(t);
                }}>
                투표하러 가기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {timePickYmd ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label="시간 선택">
          <button type="button" className="gModalBackdrop" onClick={() => setTimePickYmd(null)} aria-label="닫기" />
          <div className="gModalCard">
            <div className="gModalTitle">시간 선택</div>
            <div className="gModalSub">{timePickYmd}</div>

            <div className="gTimeList" role="list">
              {(dateByYmd.get(timePickYmd) ?? []).map((o) => {
                const on = selectedDates.includes(o.id);
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="listitem"
                    className={`gTimeRow ${on ? 'gTimeRowOn' : ''}`}
                    onClick={() => toggleDateCandidateId(o.id)}>
                    <div className="gTimeHm">{o.hm || '시간 미정'}</div>
                    <div className="gTimeRight">
                      <div className={`gTimeTally ${on ? 'gTimeTallyOn' : ''}`}>{o.tally}</div>
                      <div className={`gPlaceCheckCircle ${on ? 'gPlaceCheckCircleOn' : ''}`}>✓</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="gConfirmBtnRow" style={{ marginTop: 14 }}>
              <button type="button" className="gPillBtn" onClick={() => setTimePickYmd(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {shareRpcErrorOpen ? (
        <div className="gModalRoot" role="alertdialog" aria-modal="true" aria-labelledby="share-rpc-error-title">
          <button
            type="button"
            className="gModalBackdrop"
            onClick={() => setShareRpcErrorOpen(false)}
            aria-label="닫기"
          />
          <div className="gModalCard">
            <div className="gModalTitle" id="share-rpc-error-title">
              알림
            </div>
            <div className="gModalSub">{shareRpcErrorMessage}</div>
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="gPillBtn gPillPrimary"
                style={{ width: '100%' }}
                onClick={() => setShareRpcErrorOpen(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
