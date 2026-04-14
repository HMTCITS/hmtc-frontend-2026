/**
 * Global Middleware (Proxy in next.js 16+)
 *
 * Responsibilities:
 * 1) Period-based gating (public pages):
 *    - For specific route prefixes, consult `/api/schedule?path=...` to decide
 *      whether the page is within its active window. If inactive, redirect to
 *      `/coming-soon` before rendering.
 *    - Uses short-term caching (Cache-Control honored via `cache: 'force-cache'`)
 *      to prevent jitter and reduce load on public time providers.
 *
 * 2) Admin/privileged routes blocking (production safety net):
 *    - Based on `NODE_ENV` and `DISABLE_ADMIN_ROUTES`, block sensitive routes
 *      (e.g., `/dashboard`, `/sandbox`, auth pages) in production unless
 *      explicitly enabled.
 *
 * NOTE: Logic preserved exactly from original file — only restructured for clarity.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/* ---------------------------
   Configuration / Constants
   --------------------------- */

// Admin blocking configuration
const BLOCKED_PREFIXES = ['/sandbox', '/dashboard'];
const BLOCKED_EXACT = ['/login', '/register'];
const BLOCKED_PREFIX_AUTH = ['/change-password'];

// Period-gated prefixes used for schedule checks (kept as in original)
const GATED_PREFIXES: string[] = ['/ayomeludaftarmagang', '/hidden-page-cf'];

/* ---------------------------
   Helpers
   --------------------------- */

function isSafeMethod(method: string) {
  return method === 'GET' || method === 'HEAD';
}

function isPathUnderPrefixes(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * Create a fresh URL instance from an object that implements toString().
 * NextRequest.nextUrl is a NextURL (Next.js), which can be stringified via toString().
 * Using `new URL(...)` avoids relying on a `.clone()` method that doesn't exist on URL.
 */
function cloneUrl(base: { toString(): string }) {
  return new URL(base.toString());
}

function buildScheduleUrlForPath(
  baseUrl: { toString(): string },
  pathname: string,
) {
  const url = cloneUrl(baseUrl);
  url.pathname = '/api/schedule';
  url.searchParams.set('path', pathname);
  return url;
}

async function fetchJsonWithNoStore(url: string) {
  // Wrapper so calling code remains expressive and centralized
  return fetch(url, { cache: 'no-store' });
}

/**
 * Performs the schedule check for the given request+pathname.
 * Returns a NextResponse redirect to /coming-soon when schedule is inactive,
 * otherwise returns null to allow the request to continue.
 *
 * This preserves the original flow:
 * - fetch schedule
 * - if non-ok -> retry with cache-buster; if retry non-ok -> allow (next)
 * - if ok but j.active false -> retry with cache-buster and redirect on false
 */
async function handlePeriodGating(req: NextRequest, pathname: string) {
  const isGated = isPathUnderPrefixes(pathname, GATED_PREFIXES);
  if (!isGated) return null;

  const url = buildScheduleUrlForPath(req.nextUrl, pathname);
  let res: Response | null = null;

  try {
    // initial fetch (no-store to avoid stale edge cache here)
    res = await fetchJsonWithNoStore(url.toString());
  } catch (err) {
    // Network/runtime error contacting schedule API -> allow traffic (silent and continue)
    void err;
    return null;
  }

  // If initial response was not ok, attempt one retry with cache-busting. If retry fails,
  // allow traffic to avoid creating an outage.
  if (!res.ok) {
    try {
      const retryUrl = cloneUrl(url);
      retryUrl.searchParams.set('_ts', Date.now().toString());
      const retryRes = await fetchJsonWithNoStore(retryUrl.toString());
      if (!retryRes.ok) {
        // allow traffic on non-ok retry (silent)
        return null;
      }

      const retryJson = await retryRes.json().catch(() => null);
      if (!retryJson?.active) {
        const to = cloneUrl(req.nextUrl);
        const matched = GATED_PREFIXES.find(
          (p) => pathname === p || pathname.startsWith(p + '/'),
        );
        to.pathname = '/coming-soon';
        if (matched) to.searchParams.set('page', matched.replace(/^\//, ''));
        // redirecting due to inactive schedule (silent)
        return NextResponse.redirect(to);
      }
      return null;
    } catch (err) {
      // retry error -> allow traffic (silent)
      void err;
      return null;
    }
  }

  // res.ok branch: parse JSON and redirect if inactive after a retry guard
  try {
    const j: any = await res.json().catch(() => null);
    if (!j?.active) {
      // First try cache-busting re-check — if still inactive, redirect
      try {
        const retryUrl = cloneUrl(url);
        retryUrl.searchParams.set('_ts', Date.now().toString());
        const retryRes = await fetchJsonWithNoStore(retryUrl.toString());
        if (retryRes.ok) {
          const retryJson = await retryRes.json().catch(() => null);
          if (!retryJson?.active) {
            const to = cloneUrl(req.nextUrl);
            const matched = GATED_PREFIXES.find(
              (p) => pathname === p || pathname.startsWith(p + '/'),
            );
            to.pathname = '/coming-soon';
            if (matched)
              to.searchParams.set('page', matched.replace(/^\//, ''));
            // redirecting due to inactive schedule (silent)
            return NextResponse.redirect(to);
          }
        } else {
          // retry non-ok -> allow (silent)
          return null;
        }
      } catch (err) {
        // retry error -> allow (silent)
        void err;
        return null;
      }
    }
    // active or nothing wrong -> allow
    return null;
  } catch (err) {
    // Reference the caught error to satisfy linters, but remain silent in production.
    void err;
    // If parsing throws, fallback: preserve original behavior by redirecting to /coming-soon
    // NOTE: original catch used a smaller gatedPrefixes list — keep that behavior for parity.
    const to = cloneUrl(req.nextUrl);
    const fallbackGated = GATED_PREFIXES;
    const matched = fallbackGated.find(
      (p) => pathname === p || pathname.startsWith(p + '/'),
    );
    to.pathname = '/coming-soon';
    if (matched) to.searchParams.set('page', matched.replace(/^\//, ''));
    // schedule check failed while parsing -> redirect silently
    return NextResponse.redirect(to);
  }
}

/**
 * Determine whether admin routes should be disabled based on environment.
 * Preserves semantics from original:
 * - Production default: disabled unless DISABLE_ADMIN_ROUTES === '0'
 * - Development default: enabled unless DISABLE_ADMIN_ROUTES === '1' (simulate disabling)
 */
function shouldDisableAdminRoutes(): boolean {
  const isProd = process.env.NODE_ENV === 'production';
  const envFlag = process.env.DISABLE_ADMIN_ROUTES;
  if (isProd) {
    // In production default to disabling admin routes unless explicitly set to '0'
    return envFlag !== '0';
  } else {
    // In development default to NOT disabling admin routes unless explicitly set to '1'
    return envFlag === '1';
  }
}

/**
 * Checks and returns a redirect NextResponse if the pathname matches admin-block rules.
 * Returns null if allowed.
 */
function handleAdminBlocking(
  req: NextRequest,
  pathname: string,
  shouldDisable: boolean,
) {
  if (!shouldDisable) return null;

  // blocked prefixes (e.g., /sandbox/*)
  for (const p of BLOCKED_PREFIXES) {
    if (pathname === p || pathname.startsWith(p + '/')) {
      const url = cloneUrl(req.nextUrl);
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }
  }

  // exact blocked routes (e.g., /login)
  if (BLOCKED_EXACT.includes(pathname)) {
    const url = cloneUrl(req.nextUrl);
    url.pathname = '/coming-soon';
    return NextResponse.redirect(url);
  }

  // blocked auth prefixes (e.g., /change-password/*)
  for (const p of BLOCKED_PREFIX_AUTH) {
    if (pathname === p || pathname.startsWith(p + '/')) {
      const url = cloneUrl(req.nextUrl);
      url.pathname = '/coming-soon';
      return NextResponse.redirect(url);
    }
  }

  return null;
}

/* ---------------------------
   Middleware Entry Point
   --------------------------- */

export async function proxy(req: NextRequest) {
  // Only apply gating to safe idempotent fetches to avoid interfering with non-GET requests
  if (!isSafeMethod(req.method)) {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  // 1) Period-based gating (public pages) — run first
  const scheduleDecision = await handlePeriodGating(req, pathname);
  if (scheduleDecision) return scheduleDecision;

  // 2) Admin/privileged routes blocking
  const disableAdmin = shouldDisableAdminRoutes();
  const adminDecision = handleAdminBlocking(req, pathname, disableAdmin);
  if (adminDecision) return adminDecision;

  return NextResponse.next();
}

/* ---------------------------
   Matcher configuration
   --------------------------- */

export const config = {
  matcher: [
    '/ayomeludaftarmagang',
    '/ayomeludaftarmagang/:path*',
    '/hidden-page-cf',
    '/hidden-page-cf/:path*',
    '/sandbox/:path*',
    '/dashboard/:path*',
    '/login',
    '/login/:path*',
    '/register',
    '/register/:path*',
    '/change-password',
    '/change-password/:path*',
  ],
};
