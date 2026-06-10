'use client';

import GinitAppOpenLink from '@/app/GinitAppOpenLink';
import { buildGinitMeetingIcs, resolveShareMeetingEventYmdHm } from '@/lib/meeting-device-calendar';
import {
  apiShareGuestGet,
  apiShareGuestJoin,
  apiShareGuestLeave,
  apiShareGuestRequest,
} from '@/lib/share-api-client';
import { SHARE_TOKEN_HEADER } from '@/lib/share-api-http';
import { sanitizeNaverPlaceHref, sanitizeShareImageUrl, sanitizeShareProfilePhotoUrl } from '@/lib/safe-external-url';
import {
  formatMeetingShareRpcError,
  formatYmdWithWeekday,
  resolveNaverMovieSearchWebUrl,
  type ShareMessages,
} from '@/lib/share-i18n';
import {
  persistShareMeetingToken,
  replaceShareUrlWithViewPath,
  SHARE_MEETING_VIEW_PATH,
} from '@/lib/share-link-session';
import { useShareLocale } from '@/lib/use-share-locale';
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

function shareImageUrl(raw: unknown): string {
  return sanitizeShareImageUrl(raw) ?? '';
}

function profilePhotoUrl(raw: unknown): string {
  return sanitizeShareProfilePhotoUrl(raw) ?? '';
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

function compareByTallyThenLabel(
  a: { tally: number; label: string },
  b: { tally: number; label: string },
  localeCompare: string,
): number {
  if (a.tally !== b.tally) return b.tally - a.tally;
  return a.label.localeCompare(b.label, localeCompare);
}

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
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

type SharePlaceCandidateView = {
  p: LooseDoc;
  name: string;
};

function ShareConfirmedPlaceCard({
  place,
  thumb,
  mapHref,
  hasMap,
  fallbackAddress = '',
  label,
  withDivider = false,
  showLabel = true,
  m,
}: {
  place: SharePlaceCandidateView;
  thumb: string;
  mapHref: string;
  hasMap: boolean;
  fallbackAddress?: string;
  label?: string;
  withDivider?: boolean;
  showLabel?: boolean;
  m: ShareMessages;
}) {
  const placeLabel = label ?? m.confirmedPlace;
  const { p, name } = place;
  const category = asStr(p.category);
  const addr = asStr(p.address) || fallbackAddress;
  const naverLink = sanitizeNaverPlaceHref(p.naverPlaceLink) ?? '';

  return (
    <>
      {withDivider ? <div className="gDivider" /> : null}
      {showLabel ? (
        <div className="gInfoLabel" style={{ marginBottom: 8 }}>
          {placeLabel}
        </div>
      ) : null}
      <div className="gConfirmPlaceRow">
        <div className="gConfirmPlaceImg">
          {thumb ? <img src={thumb} alt="" /> : <div className="gPlaceThumbPh" />}
        </div>
        <div className="gConfirmPlaceInfo">
          <div className="gConfirmPlaceName">{name}</div>
          {category ? <div className="gConfirmPlaceMeta">{category}</div> : null}
          {addr ? <div className="gConfirmPlaceMeta">{addr}</div> : null}

          <div className="gConfirmBtnRow" aria-label={m.placeInfoMapAria(placeLabel)}>
            {naverLink ? (
              <a className="gConfirmActionBtn" href={naverLink} target="_blank" rel="noreferrer">
                {m.placeInfo}
              </a>
            ) : (
              <div className="gConfirmActionBtnDisabled" aria-hidden>
                {m.placeInfo}
              </div>
            )}

            {hasMap && mapHref ? (
              <a className="gConfirmActionBtn" href={mapHref} target="_blank" rel="noreferrer">
                {m.placeMap}
              </a>
            ) : (
              <div className="gConfirmActionBtnDisabled" aria-hidden>
                {m.placeMap}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function movieChipId(m: LooseDoc, index: number): string {
  const mid = asStr(m.id);
  if (mid) return `${mid}#${index}`;
  return `movie-${index}`;
}

function moviePosterUrl(m: LooseDoc): string {
  for (const key of ['posterUrl', 'poster', 'imageUrl', 'thumbnailUrl', 'thumbUrl'] as const) {
    const u = shareImageUrl(m[key]);
    if (u) return u;
  }
  return '';
}

function guestStorageKey(meetingId: string): string {
  return `ginit_share_guest:${meetingId}`;
}

type GuestSession = {
  userId: string;
  leaveSecret?: string;
};

function readGuestSession(meetingId: string): GuestSession | null {
  if (typeof window === 'undefined' || !meetingId.trim()) return null;
  try {
    const raw = window.localStorage.getItem(guestStorageKey(meetingId));
    if (!raw?.trim()) return null;
    const t = raw.trim();
    if (t.startsWith('{')) {
      const o = JSON.parse(t) as { userId?: unknown; leaveSecret?: unknown };
      const userId = typeof o.userId === 'string' ? o.userId.trim() : '';
      if (!userId) return null;
      const leaveSecret = typeof o.leaveSecret === 'string' ? o.leaveSecret.trim() : '';
      return leaveSecret ? { userId, leaveSecret } : { userId };
    }
    return { userId: t };
  } catch {
    return null;
  }
}

function writeGuestSession(meetingId: string, session: GuestSession): void {
  if (typeof window === 'undefined' || !meetingId.trim()) return;
  const userId = session.userId.trim();
  if (!userId) return;
  const leaveSecret = session.leaveSecret?.trim() ?? '';
  const payload: GuestSession = leaveSecret ? { userId, leaveSecret } : { userId };
  window.localStorage.setItem(guestStorageKey(meetingId), JSON.stringify(payload));
}

function clearGuestSession(meetingId: string): void {
  if (typeof window === 'undefined' || !meetingId.trim()) return;
  try {
    window.localStorage.removeItem(guestStorageKey(meetingId));
  } catch {
    /* ignore */
  }
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

function SvgCalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17c0 3-1.5 5-5 5H8c-3.5 0-5-2-5-5V8.5c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.695 13.7h.009M15.695 16.7h.009M11.994 13.7h.01M11.994 16.7h.01M8.294 13.7h.01M8.294 16.7h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ShareMeetingClient({
  token,
  urlCleanup = true,
}: {
  token: string;
  urlCleanup?: boolean;
}) {
  const { m } = useShareLocale();
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [err, setErr] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<LooseDoc | null>(null);
  const [requiresHostApproval, setRequiresHostApproval] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [guestLeaveSecret, setGuestLeaveSecret] = useState<string | null>(null);
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
        const dateLabel = formatYmdWithWeekday(asStr(d.startDate), m);
        const label = `${dateLabel || m.dateTbd} ${asStr(d.startTime) || ''}`.trim() || id;
        const base = tallyFromBucket(dateTallyBucket, id);
        const tally = base + (!joined && selectedDates.includes(id) ? 1 : 0);
        return { d, i, id, label, tally };
      })
      .sort((a, b) => compareByTallyThenLabel(a, b, m.localeCompare));
  }, [dateCandidates, dateTallyBucket, selectedDates, joined, m]);

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
      arr.sort((a, b) =>
        compareByTallyThenLabel(
          { tally: a.tally, label: a.hm || a.label },
          { tally: b.tally, label: b.hm || b.label },
          m.localeCompare,
        ),
      );
      map.set(k, arr);
    }
    return map;
  }, [sortedDateCandidates, m.localeCompare]);

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
      const name = asStr(p.placeName) || m.defaultPlaceName;
      const base = tallyFromBucket(placeTallyBucket, id);
      const tally = base + (!joined && selectedPlaces.includes(id) ? 1 : 0);
      return { p, i, id, name, tally, sortTally: base };
    });
    rows.sort((a, b) =>
      compareByTallyThenLabel(
        { tally: a.sortTally, label: a.name },
        { tally: b.sortTally, label: b.name },
        m.localeCompare,
      ),
    );
    return rows.map(({ p, i, id, name, tally }) => ({ p, i, id, name, tally }));
  }, [placeCandidates, placeTallyBucket, selectedPlaces, joined, m]);

  const sortedMovieExtras = useMemo(() => {
    const rows = movieExtras.map((m, i) => {
      const id = movieChipId(m, i);
      const label = asStr(m.title) || id;
      const base = tallyFromBucket(movieTallyBucket, id);
      const tally = base + (!joined && selectedMovies.includes(id) ? 1 : 0);
      return { m, i, id, label, tally, sortTally: base };
    });
    rows.sort((a, b) =>
      compareByTallyThenLabel(
        { tally: a.sortTally, label: a.label },
        { tally: b.sortTally, label: b.label },
        m.localeCompare,
      ),
    );
    return rows.map(({ m: mv, i, id, label, tally }) => ({ m: mv, i, id, label, tally }));
  }, [movieExtras, movieTallyBucket, selectedMovies, joined, m]);

  const confirmedDateChipId = useMemo(() => asStr(meeting?.confirmedDateChipId), [meeting]);
  const confirmedPlaceChipId = useMemo(() => asStr(meeting?.confirmedPlaceChipId), [meeting]);
  const confirmedMovieChipId = useMemo(() => asStr(meeting?.confirmedMovieChipId), [meeting]);

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
      const dateLabel = formatYmdWithWeekday(asStr(d.startDate), m);
      return `${dateLabel || m.dateTbd} ${asStr(d.startTime) || ''}`.trim() || m.confirmedScheduleFallback;
    }
    return '';
  }, [confirmedDateChipId, sortedDateCandidates, dateCandidates, m]);

  const confirmedPlace = useMemo(() => {
    if (confirmedPlaceChipId) {
      const hit = sortedPlaceCandidates.find((x) => x.id === confirmedPlaceChipId);
      if (hit) return hit;
    }
    if (placeCandidates.length === 1) {
      const p = placeCandidates[0]!;
      const id = placeChipId(p, 0);
      const name = asStr(p.placeName) || m.defaultPlaceName;
      return { p, i: 0, id, name, tally: tallyFromBucket(placeTallyBucket, id) };
    }
    return null;
  }, [confirmedPlaceChipId, sortedPlaceCandidates, placeCandidates, placeTallyBucket, m]);

  const confirmedPlaceThumb = useMemo(() => {
    const id = confirmedPlace?.id ?? '';
    const fromCache = id ? placeThumbById[id] : null;
    if (fromCache) return fromCache;
    const p = confirmedPlace?.p;
    if (!p) return '';
    return (
      shareImageUrl(p.preferredPhotoMediaUrl) ||
      shareImageUrl(p.photoUrl) ||
      shareImageUrl(p.imageUrl)
    );
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
        if (u) return [u];
      }
      return [];
    }
    const urls: string[] = [];
    for (const { p, id } of sortedPlaceCandidates) {
      const u =
        shareImageUrl(placeThumbById[id]) ||
        shareImageUrl((p as LooseDoc).preferredPhotoMediaUrl) ||
        shareImageUrl((p as LooseDoc).photoUrl) ||
        shareImageUrl((p as LooseDoc).imageUrl);
      if (u) urls.push(u);
    }
    return urls;
  }, [scheduleConfirmed, confirmedPlace, confirmedPlaceThumb, sortedPlaceCandidates, placeThumbById]);

  const heroMovieThumbs = useMemo(() => {
    if (scheduleConfirmed && confirmedMovieChipId) {
      for (const { m, id } of sortedMovieExtras) {
        if (id !== confirmedMovieChipId) continue;
        const u = moviePosterUrl(m);
        if (u) return [u];
      }
    }
    const urls: string[] = [];
    for (const { m } of sortedMovieExtras) {
      const u = moviePosterUrl(m);
      if (u) urls.push(u);
    }
    return urls;
  }, [scheduleConfirmed, confirmedMovieChipId, sortedMovieExtras]);

  const heroThumbs = useMemo(() => {
    if (heroPlaceThumbs.length > 0) return heroPlaceThumbs;
    return heroMovieThumbs;
  }, [heroPlaceThumbs, heroMovieThumbs]);

  const load = useCallback(async () => {
    setPhase('loading');
    setErr(null);
    try {
      const row = await withTimeout(
        apiShareGuestGet(token),
        28_000,
        m.loadTimeout,
      );
      const meetingRow = row?.meeting;
      if (!meetingRow || typeof meetingRow !== 'object') throw new Error(m.loadMeetingFailed);
      setMeeting(meetingRow);
      setRequiresHostApproval(Boolean(row?.requiresHostApproval));
      const mid = asStr(meetingRow.id);
      const session = mid ? readGuestSession(mid) : null;
      const storedId = session?.userId?.trim() ?? '';
      setGuestUserId(storedId || null);
      setGuestLeaveSecret(session?.leaveSecret?.trim() ? session.leaveSecret.trim() : null);
      const parts = Array.isArray(meetingRow.participantIds)
        ? (meetingRow.participantIds as unknown[]).filter((x): x is string => typeof x === 'string')
        : [];
      const inParticipants = storedId !== '' && parts.includes(storedId);
      const jrs = Array.isArray(meetingRow.joinRequests) ? meetingRow.joinRequests : [];
      const inJr =
        storedId !== '' &&
        jrs.some((jr) => typeof jr === 'object' && jr && asStr((jr as LooseDoc).userId) === storedId);
      setJoined(Boolean(inParticipants || inJr));
      setPhase('ready');
    } catch (e) {
      setErr(e instanceof Error ? e.message : m.errors.generic);
      setPhase('error');
    }
  }, [token, m]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!urlCleanup || phase !== 'ready') return;
    persistShareMeetingToken(token);
    replaceShareUrlWithViewPath(SHARE_MEETING_VIEW_PATH);
  }, [urlCleanup, phase, token]);

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
        const direct = shareImageUrl(p.preferredPhotoMediaUrl);
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
            headers: { 'Content-Type': 'application/json', [SHARE_TOKEN_HEADER]: token },
            body: JSON.stringify({
              title: asStr(p.placeName),
              addressLine: asStr(p.address),
              category: asStr(p.category),
              preferredPhotoMediaUrl: asStr(p.preferredPhotoMediaUrl),
              naverPlaceLink: asStr(p.naverPlaceLink),
            }),
          });
          const json = (await res.json()) as { thumbnailUrl?: string | null };
          const thumb = shareImageUrl(json.thumbnailUrl) || null;
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

  const canSaveDeviceCalendar = useMemo(() => {
    if (!meeting || !meetingId.trim() || !joined || !scheduleConfirmed) return false;
    return resolveShareMeetingEventYmdHm(meeting, confirmedDateChipId, sortedDateCandidates, dateCandidates) != null;
  }, [meeting, meetingId, joined, scheduleConfirmed, confirmedDateChipId, sortedDateCandidates, dateCandidates]);

  const handleDeviceCalendarSave = useCallback(() => {
    const meet = meeting;
    if (!meet || !meetingId.trim()) return;
    const ymdHm = resolveShareMeetingEventYmdHm(meet, confirmedDateChipId, sortedDateCandidates, dateCandidates);
    if (!ymdHm) return;
    const addressOnly = asStr(confirmedPlace?.p.address) || asStr(meet.address) || '';
    const placeTradeName = (confirmedPlace?.name || asStr(meet.placeName) || '').trim();
    const placeLine = m.calendarPlaceLine(placeTradeName, addressOnly);
    const href = typeof window !== 'undefined' ? window.location.href : '';
    const rawTitle = (asStr(meet.title) || m.defaultMeetingTitle).trim() || m.defaultMeetingTitle;
    const prefix = m.calendarTitlePrefix;
    const summaryTitle = rawTitle.startsWith(prefix) ? rawTitle : `${prefix} ${rawTitle}`;
    const descBits = [asStr(meet.description), placeLine, href].filter(Boolean);
    const ics = buildGinitMeetingIcs({
      uidBase: meetingId,
      title: summaryTitle,
      description: descBits.join('\n\n'),
      location: addressOnly,
      dateYmd: ymdHm.ymd,
      timeHm: ymdHm.hm,
    });
    if (!ics) return;
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = meetingId.replace(/[^a-zA-Z0-9-]+/g, '-').slice(0, 40) || 'meeting';
    a.download = `ginit-${safe}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [meeting, meetingId, confirmedDateChipId, sortedDateCandidates, dateCandidates, confirmedPlace, m]);

  const handleJoinOrRequest = async () => {
    if (!meetingId) return;
    setBusy(true);
    setErr(null);
    setGuestJoinConfirmOpen(false);
    let openJoinWasAlreadyParticipant = false;
    try {
      if (requiresHostApproval) {
        const data = await apiShareGuestRequest(token, {
          guestUserId: guestUserId ?? '',
          displayName,
          votes: votesPayload,
          message: requestMessageEnabled ? requestMessage : '',
        });
        const gid = asStr((data as { guestUserId?: string })?.guestUserId);
        if (!gid) throw new Error(m.requestFailed);
        const leaveSecret = asStr((data as { guestLeaveSecret?: string })?.guestLeaveSecret);
        writeGuestSession(meetingId, leaveSecret ? { userId: gid, leaveSecret } : { userId: gid });
        setGuestUserId(gid);
        setGuestLeaveSecret(leaveSecret || null);
        setJoined(true);
      } else {
        const data = await apiShareGuestJoin(token, {
          guestUserId: guestUserId ?? '',
          displayName,
          votes: votesPayload,
        });
        const gid = asStr((data as { guestUserId?: string })?.guestUserId);
        if (!gid) throw new Error(m.joinFailed);
        openJoinWasAlreadyParticipant = Boolean((data as { alreadyJoined?: boolean })?.alreadyJoined);
        const leaveSecret = asStr((data as { guestLeaveSecret?: string })?.guestLeaveSecret);
        if (leaveSecret) {
          writeGuestSession(meetingId, { userId: gid, leaveSecret });
          setGuestLeaveSecret(leaveSecret);
        } else {
          writeGuestSession(meetingId, { userId: gid, leaveSecret: guestLeaveSecret ?? undefined });
        }
        setGuestUserId(gid);
        setJoined(true);
      }
      await load();
      if (!requiresHostApproval && openJoinWasAlreadyParticipant) {
        setShareRpcErrorMessage(m.alreadyVoted);
        setShareRpcErrorOpen(true);
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : m.errors.generic;
      const friendly = formatMeetingShareRpcError(raw, m);
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
        await apiShareGuestLeave(token, {
          guestUserId: gid,
          guestLeaveSecret: guestLeaveSecret?.trim() ?? '',
        });
      }
      clearGuestSession(meetingId);
      setGuestUserId(null);
      setGuestLeaveSecret(null);
      setJoined(false);
      setGuestJoinConfirmOpen(false);
      setDisplayName('');
      setSelectedDates([]);
      setSelectedPlaces([]);
      setSelectedMovies([]);
      await load();
    } catch (e) {
      const raw = e instanceof Error ? e.message : m.leaveFailed;
      setErr(formatMeetingShareRpcError(raw, m));
    } finally {
      setBusy(false);
    }
  };

  const handleGuestStart = async () => {
    if (!meetingId) return;
    setErr(null);
    setParticipantNameError('');
    if (!displayName.trim()) {
      setParticipantNameError(m.participantNameRequired);
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
            <p className="gKicker">{m.kicker}</p>
            <p className="gEmptyText">{m.loading}</p>
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
            <p className="gKicker">{m.kicker}</p>
            <h1 className="gEmptyTitle">{m.errorTitle}</h1>
            <p className="gAlert" role="alert">
              {err ?? m.unknownError}
            </p>
            <p className="gEmptyText">{m.errorHint}</p>
          </div>
        </div>
      </main>
    );
  }

  const title = asStr(meeting.title) || m.defaultMeetingTitle;
  const desc = asStr(meeting.description);
  const imageUrl = shareImageUrl(meeting.imageUrl);
  const isPublic = typeof meeting.isPublic === 'boolean' ? meeting.isPublic : asStr(meeting.isPublic) === 'true';
  const capacity = Number.isFinite(Number(meeting.capacity)) ? Number(meeting.capacity) : null;
  const scheduleDate = asStr(meeting.scheduleDate);
  const scheduleDateLabel = formatYmdWithWeekday(scheduleDate, m);
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

  const approvalLabel = requiresHostApproval ? m.hostApproval : m.openJoin;
  const heroFallbackImageUrl = heroThumbs.length > 0 ? '' : imageUrl;
  const hostDisplayNameFromApi = asStr(meeting.hostDisplayName);
  const hostPhotoUrl = profilePhotoUrl(meeting.hostPhotoUrl);

  return (
    <main className="gShell">
      <header className="gHero">
        <div className="gHeroImage">
          {heroThumbs.length === 1 ? (
            <img src={heroThumbs[0]} alt="" />
          ) : heroThumbs.length > 1 ? (
            <div className="gHeroThumbRow" aria-hidden>
              {heroThumbs.map((u, idx) => (
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
          <p className="gKicker">{m.kicker}</p>
          <h1 className="gTitle">{title}</h1>
          {desc ? <p className="gDesc">{desc}</p> : null}

          <div className="gBadgeRow" aria-label={m.meetingStatusAria}>
            <span className={`gMiniBadge ${isPublic ? '' : 'gMiniBadgeMuted'}`}>
              {isPublic ? m.publicMeeting : m.privateMeeting}
            </span>
            <span className="gMiniBadge">{approvalLabel}</span>
            {scheduleConfirmed ? (
              <span className="gMiniBadge">{m.scheduleConfirmed}</span>
            ) : (
              <span className="gMiniBadgeMuted gMiniBadge">{m.recruiting}</span>
            )}
            {capacity != null ? (
              <span className="gMiniBadge gMiniBadgeMuted">{m.capacityCount(totalPeople, capacity)}</span>
            ) : null}
          </div>
        </div>
      </header>

      <section className="gCard" aria-label={m.basicInfo}>
        <h2 className="gSectionTitle">{m.basicInfo}</h2>
        <div className="gInfoGrid">
          {categoryLabel ? (
            <div>
              <div className="gInfoLabel">{m.category}</div>
              <div className="gInfoValue">{categoryLabel}</div>
            </div>
          ) : null}
          <div>
            <div className="gInfoLabel">{m.schedule}</div>
            <div className="gInfoValue">
              {basicInfoDateIsVoting
                ? m.voting
                : [scheduleDateLabel, scheduleTime].filter(Boolean).join(' · ') || m.undecided}
            </div>
          </div>
          <div>
            <div className="gInfoLabel">{m.place}</div>
            <div className="gInfoValue">{basicInfoPlaceIsVoting ? m.voting : placeName || m.undecided}</div>
            {!basicInfoPlaceIsVoting && address ? (
              <div className="gSectionSub" style={{ marginTop: 6 }}>
                {address}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {(joined || !scheduleConfirmed) && (
        <section ref={participantNameSectionRef} className="gCard" aria-label={m.participantName}>
          <h2 className="gSectionTitle gSectionTitleRow">
            {m.participantName}
            {!joined ? (
              <span className="gRequiredPill" aria-hidden>
                {m.required}
              </span>
            ) : null}
          </h2>
          <p className="gSectionSub">
            {joined ? m.participantNameJoinedHint : m.participantNameJoinHint}
          </p>
          {!joined ? (
            <>
              <input
                value={displayName}
                onChange={(e) => {
                  setParticipantNameError('');
                  setDisplayName(e.target.value.slice(0, 40));
                }}
                placeholder={m.participantNamePlaceholder}
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
          <strong>{m.voteLockedTitle}</strong>
          <br />
          {m.voteLockedBody}
        </div>
      ) : null}

      {!joined && requiresHostApproval && requestMessageEnabled ? (
        <section className="gCard" aria-label={m.hostMessage}>
          <h2 className="gSectionTitle">{m.hostMessage}</h2>
          <p className="gSectionSub">{m.hostMessageHint}</p>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value.slice(0, 200))}
            placeholder={m.hostMessagePlaceholder}
            rows={3}
            className="gTextarea"
          />
        </section>
      ) : null}

      {treatAsConfirmed ? (
        <section className="gCard" aria-label={m.confirmedSection}>
          <h2 className="gSectionTitle">{m.confirmedSection}</h2>
          <p className="gSectionSub" style={{ marginTop: -6 }}>
            {scheduleConfirmed ? m.confirmedScheduleHost : m.confirmedScheduleSingle}
          </p>
          <div className="gInfoGrid">
            <div>
              <div className="gInfoLabel">{m.confirmedSchedule}</div>
              <div className="gInfoValue">
                {confirmedDateLabel || [scheduleDateLabel, scheduleTime].filter(Boolean).join(' · ') || m.undecided}
              </div>
            </div>
          </div>

          {confirmedPlace ? (
            <ShareConfirmedPlaceCard
              place={confirmedPlace}
              thumb={confirmedPlaceThumb}
              mapHref={confirmedPlaceNaverMapHref}
              hasMap={Boolean(confirmedPlaceLatLng)}
              fallbackAddress={address}
              withDivider
              m={m}
            />
          ) : (
            <div className="gInfoGrid" style={{ marginTop: 12 }}>
              <div>
                <div className="gInfoLabel">{m.confirmedPlace}</div>
                <div className="gInfoValue">{placeName || m.undecided}</div>
                {address ? <div className="gSectionSub" style={{ marginTop: 6 }}>{address}</div> : null}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {!treatAsConfirmed && dateCandidates.length > 0 ? (
        <section className="gCard" ref={(el) => void (dateSectionRef.current = el)}>
          <h2 className="gSectionTitle">
            {m.dateCandidates}{' '}
            {dateCandidates.length > 1 ? <span className="gSectionTitleHint">{m.multiSelectHint}</span> : null}
          </h2>
          {dateCandidates.length === 1 ? (
            <p className="gSectionSub" style={{ marginTop: -6 }}>
              {m.singleDateAuto}
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
              const dow = m.weekdays;
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
              /* 후보 열: 셀 내용(max-content)만큼만 — fr은 남는 폭을 후보 열까지 늘려 과하게 넓어짐 */
              const colWithCandidates = 'max-content';
              const colWithoutCandidates = 'minmax(0, 1fr)';
              const gridTemplateColumns = colHasCandidate
                .map((has) => (has ? colWithCandidates : colWithoutCandidates))
                .join(' ');
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
                  </button>
                );
              };
              return (
                <div
                  className="gCalendarMatrix"
                  role="grid"
                  aria-label={m.calendarAria}
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
          <h2 className="gSectionTitle">
            {placeCandidates.length > 1 ? (
              <>
                {m.placeCandidates} <span className="gSectionTitleHint">{m.multiSelectHint}</span>
              </>
            ) : (
              m.placeSectionSingle
            )}
          </h2>
          {placeCandidates.length === 1 && confirmedPlace ? (
            <ShareConfirmedPlaceCard
              place={confirmedPlace}
              thumb={confirmedPlaceThumb}
              mapHref={confirmedPlaceNaverMapHref}
              hasMap={Boolean(confirmedPlaceLatLng)}
              fallbackAddress={address}
              showLabel={false}
              m={m}
            />
          ) : placeCandidates.length > 1 ? (
            <div className="gHScroll" role="list">
              {sortedPlaceCandidates.map(({ p, i, id, name, tally }) => {
                const on = selectedPlaces.includes(id);
                const addr = asStr(p.address);
                const category = asStr(p.category);
                const thumb =
                  shareImageUrl(placeThumbById[id]) ||
                  shareImageUrl(p.preferredPhotoMediaUrl) ||
                  shareImageUrl(p.photoUrl) ||
                  shareImageUrl(p.imageUrl);
                const link = sanitizeNaverPlaceHref(p.naverPlaceLink) ?? '';
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
                          {m.placeDetail}
                        </a>
                      ) : (
                        <div className="gPlaceInfoBtnDisabled" aria-hidden>
                          {m.placeDetail}
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
          ) : null}
        </section>
      ) : null}

      {movieExtras.length > 0 ? (
        <section className="gCard" ref={(el) => void (movieSectionRef.current = el)}>
          <h2 className="gSectionTitle">{m.movieCandidates}</h2>
          <div className="gHScroll" role="list">
            {sortedMovieExtras.map(({ m: mv, id, label, tally }) => {
              const on = selectedMovies.includes(id);
              const poster = moviePosterUrl(mv);
              const subtitle = asStr(mv.releaseYear) || asStr(mv.year) || asStr(mv.originalTitle);
              const link = resolveNaverMovieSearchWebUrl(label, m.movieSearchPrefix);
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
                        {m.movieInfo}
                      </a>
                    ) : (
                      <div className="gPlaceInfoBtnDisabled" aria-hidden>
                        {m.movieInfo}
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

      <section className="gCard" aria-label={m.participants}>
        <h2 className="gSectionTitle">{m.participantsCount(totalPeople)}</h2>
        {totalPeople === 0 ? (
          <p className="gSectionSub" style={{ margin: 0 }}>
            {m.participantsEmpty}
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
              const memberPhotoUrl = profilePhotoUrl(pub?.photoUrl);
              const memberNickFromLog = !isGuest && !isHost ? (voteLogDisplayNameByUserId.get(pid) ?? '').trim() : '';
              const memberNick = !isGuest && !isHost ? (nickFromProfile || memberNickFromLog) : '';
              const hostNickFromLog = isHost ? (voteLogDisplayNameByUserId.get(pid) ?? '').trim() : '';
              const primary = isHost
                ? hostDisplayNameFromApi || hostNickFromLog || m.host
                : isGuest
                  ? guestNick || m.guest
                  : memberNick || m.member;
              const initialsSeed = primary;
              const sub = isGuest ? m.guestTag : isHost ? m.hostTag : '';
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
              const nick = (joinRequestDisplayNameByUserId.get(pid) ?? '').trim() || m.guest;
              return (
                <div className="gAvatarCol" key={`jr-${pid}`}>
                  <div className="gAvatarCircle">{initialsFrom(nick)}</div>
                  <div className="gAvatarLabel">{`${nick}\n${m.guestPendingTag}`}</div>
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
          {m.voteBeforeJoinHint}
        </div>
      ) : null}

      <footer className="gFooter">{m.footerAppHint}</footer>

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
              {busy ? m.processing : joined ? m.leaveRetake : m.guestJoin}
            </button>
          )}
          {canSaveDeviceCalendar ? (
            <button
              type="button"
              className="gPillBtn gPillPrimary gPillCalendarSave"
              onClick={() => void handleDeviceCalendarSave()}
              aria-label={m.saveCalendarAria}>
              <span className="gPillBtnSymbol" aria-hidden>
                <SvgCalendarIcon />
              </span>
              {m.saveCalendar}
            </button>
          ) : null}
          <GinitAppOpenLink meetingId={meetingId} shareToken={token} className="gPillBtn gPillPrimary">
            <img src="/ginit-logo.png" alt="" className="gPillBtnLogo" width={22} height={22} />
            {m.openInApp}
          </GinitAppOpenLink>
        </div>
      </div>

      {leaveConfirmOpen && joined ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label={m.leaveModalAria}>
          <button
            type="button"
            className="gModalBackdrop"
            onClick={() => setLeaveConfirmOpen(false)}
            aria-label={m.close}
          />
          <div className="gModalCard">
            <div className="gModalTitle">{m.leaveModalTitle}</div>
            <div className="gModalSub">{m.leaveModalBody}</div>
            <div className="gConfirmBtnRow" style={{ marginTop: 14 }}>
              <button type="button" className="gPillBtn" disabled={busy} onClick={() => setLeaveConfirmOpen(false)}>
                {m.cancel}
              </button>
              <button
                type="button"
                className="gPillBtn gPillDanger"
                disabled={busy}
                onClick={() => void performLeaveMeeting()}>
                {busy ? m.processing : m.leaveRetake}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {guestJoinConfirmOpen && !joined ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label={m.guestJoinModalAria}>
          <button
            type="button"
            className="gModalBackdrop"
            onClick={() => setGuestJoinConfirmOpen(false)}
            aria-label={m.close}
          />
          <div className="gModalCard">
            <div className="gModalTitle">{m.guestJoinModalTitle}</div>
            <div className="gModalSub">
              <strong className="gModalWarn">{m.guestJoinModalWarn}</strong>
              <br />
              <br />
              {m.guestJoinModalBody}
            </div>
            <div className="gConfirmBtnRow" style={{ marginTop: 14 }}>
              <button type="button" className="gPillBtn" disabled={busy} onClick={() => setGuestJoinConfirmOpen(false)}>
                {m.cancel}
              </button>
              <button type="button" className="gPillBtn gPillPrimary" disabled={busy} onClick={() => void handleJoinOrRequest()}>
                {busy ? m.processing : requiresHostApproval ? m.joinRequest : m.joinNow}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {voteGateOpen ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label={m.voteGateAria}>
          <button
            type="button"
            className="gModalBackdrop"
            onClick={() => setVoteGateOpen(false)}
            aria-label={m.close}
          />
          <div className="gModalCard">
            <div className="gModalTitle">{m.voteGateTitle}</div>
            <div className="gModalSub">{m.voteGateBody}</div>

            <div className="gConfirmBtnRow" style={{ marginTop: 14 }}>
              <button type="button" className="gPillBtn" onClick={() => setVoteGateOpen(false)}>
                {m.close}
              </button>
              <button
                type="button"
                className="gPillBtn gPillPrimary"
                onClick={() => {
                  const target = voteGateTarget ?? 'date';
                  setVoteGateOpen(false);
                  scrollToVoteTarget(target);
                }}>
                {m.goVote}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {timePickYmd ? (
        <div className="gModalRoot" role="dialog" aria-modal="true" aria-label={m.timePickAria}>
          <button type="button" className="gModalBackdrop" onClick={() => setTimePickYmd(null)} aria-label={m.close} />
          <div className="gModalCard">
            <div className="gModalTitle">{m.timePickTitle}</div>
            <div className="gModalSub">{formatYmdWithWeekday(timePickYmd, m)}</div>

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
                    <div className="gTimeHm">{o.hm || m.timeTbd}</div>
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
                {m.close}
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
            aria-label={m.close}
          />
          <div className="gModalCard">
            <div className="gModalTitle" id="share-rpc-error-title">
              {m.notice}
            </div>
            <div className="gModalSub">{shareRpcErrorMessage}</div>
            <div style={{ marginTop: 14 }}>
              <button
                type="button"
                className="gPillBtn gPillPrimary"
                style={{ width: '100%' }}
                onClick={() => setShareRpcErrorOpen(false)}>
                {m.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
