/**
 * Schedule configuration utilities
 *
 * This module defines per-page period gating windows and helpers to resolve
 * the appropriate schedule for an incoming pathname. Schedules are defined
 * using timezone-aware ISO-8601 strings (e.g. '2025-01-01T00:00:00+07:00').
 *
 * Usage:
 * - Add a new entry to PAGE_SCHEDULES with the page prefix and its schedule.
 * - The API route `/api/schedule` and the middleware will call
 *   `getScheduleForPath()` to determine whether a page is currently active.
 *
 * Notes:
 * - Prefer storing timezone offsets in each ISO string to avoid ambiguity.
 * - If multiple prefixes match a path, the longest (most specific) prefix wins.
 */
export type RangeSchedule = {
  mode: 'range';
  start: string; // ISO with timezone, e.g. '2025-01-01T00:00:00+07:00'
  end: string; // ISO with timezone
  timezone?: string; // informational
};

export type PageScheduleConfig = RangeSchedule;

// Map of pathname prefix -> schedule. Use the most specific match.
// Easily add other pages with different windows here.
export const PAGE_SCHEDULES: Array<{
  prefix: string;
  schedule: PageScheduleConfig;
}> = [
  // {
  //   prefix: '/ayomeludaftarmagang',
  //   schedule: {
  //     mode: 'range',
  //     start: '2025-10-30T15:00:00+07:00',
  //     end: '2025-10-30T21:00:00+07:00',
  //     timezone: 'Asia/Jakarta',
  //   },
  // },
  // Test schedule for hidden page used for Cloudflare/asset testing. Adjust
  // the window as needed for your testing. This is intentionally a short
  // window so it can be toggled easily in staging environments.
  {
    prefix: '/hidden-page-cf',
    schedule: {
      mode: 'range',
      // Assumption: quick test window starting now (2025-10-24) for a few days
      start: '2025-10-24T09:55:00+07:00',
      end: '2025-10-24T10:00:00+07:00',
      timezone: 'Asia/Jakarta',
    },
  },
];

/**
 * Resolve the configured schedule for a given pathname.
 *
 * @param pathname Route pathname (e.g. "/foo/bar").
 * @returns The matching page schedule or null if no mapping exists.
 */
export function getScheduleForPath(
  pathname: string,
): PageScheduleConfig | null {
  const match = PAGE_SCHEDULES.filter(
    (p) => pathname === p.prefix || pathname.startsWith(p.prefix + '/'),
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return match?.schedule ?? null;
}
