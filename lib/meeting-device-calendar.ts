/** 웹 공유: 확정 일정을 휴대폰·PC 캘린더 앱으로 넘기기 위한 iCalendar(.ics) 생성 */

export type LooseDoc = Record<string, unknown>;

function asStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
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

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatIcsUtcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`;
}

function formatIcsLocalCompressed(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}${pad2(d.getSeconds())}`;
}

/** API 문서 기준 일정: scheduleDate/Time → chip → 단일 후보 */
export function resolveShareMeetingEventYmdHm(
  meeting: LooseDoc,
  confirmedDateChipId: string,
  sortedDateCandidates: { id: string; d: LooseDoc }[],
  dateCandidates: LooseDoc[],
): { ymd: string; hm: string } | null {
  let ymd = asStr(meeting.scheduleDate);
  let hm = normalizeHm(asStr(meeting.scheduleTime));
  if (!isYmd(ymd) && confirmedDateChipId) {
    const hit = sortedDateCandidates.find((x) => x.id === confirmedDateChipId);
    if (hit) {
      ymd = asStr(hit.d.startDate);
      const th = normalizeHm(asStr(hit.d.startTime));
      if (th) hm = th;
    }
  }
  if (!isYmd(ymd) && dateCandidates.length === 1) {
    const d = dateCandidates[0]!;
    ymd = asStr(d.startDate);
    const th = normalizeHm(asStr(d.startTime));
    if (th) hm = th;
  }
  if (!isYmd(ymd)) return null;
  return { ymd, hm: hm || '' };
}

export function buildGinitMeetingIcs(opts: {
  uidBase: string;
  title: string;
  description: string;
  location: string;
  dateYmd: string;
  timeHm: string;
}): string | null {
  const { dateYmd, timeHm, title, description, location, uidBase } = opts;
  if (!isYmd(dateYmd)) return null;
  const [yy, mm, dd] = dateYmd.split('-').map((x) => Number(x));
  if (!Number.isFinite(yy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null;

  const hasTime = /^\d{2}:\d{2}$/.test(timeHm);
  const dtStamp = formatIcsUtcStamp(new Date());
  const uidSafe = uidBase.replace(/[^a-zA-Z0-9-]/g, '') || 'event';
  const uid = `${uidSafe}@ginit-share.local`;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ginit//WebShare//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
  ];

  if (!hasTime) {
    const endDate = new Date(yy, mm - 1, dd + 1);
    const ds = dateYmd.replace(/-/g, '');
    const de = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}`;
    lines.push(`DTSTART;VALUE=DATE:${ds}`);
    lines.push(`DTEND;VALUE=DATE:${de}`);
  } else {
    const [h, mi] = timeHm.split(':').map((x) => Number(x));
    const start = new Date(yy, mm - 1, dd, h, mi, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    lines.push(`DTSTART:${formatIcsLocalCompressed(start)}`);
    lines.push(`DTEND:${formatIcsLocalCompressed(end)}`);
  }

  const sum = (title || '모임').trim() || '모임';
  lines.push(`SUMMARY:${escapeIcsText(sum)}`);
  if (description.trim()) lines.push(`DESCRIPTION:${escapeIcsText(description.trim())}`);
  if (location.trim()) lines.push(`LOCATION:${escapeIcsText(location.trim())}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}
