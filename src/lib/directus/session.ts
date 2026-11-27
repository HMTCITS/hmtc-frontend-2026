/**
 * HMTC CMS — editor session.
 *
 * The only module that knows the cookie names and handles the user's Directus
 * tokens. Tokens live in HttpOnly cookies, local variables and the hashed
 * single-flight map — never in logs or response bodies.
 *
 * Next 16 can WRITE cookies only in Route Handlers / Server Functions, so
 * Server Components call getSession({ refresh: false }) and, on 'expired',
 * redirect to /api/cms/auth/refresh, which refreshes and redirects back.
 */
import 'server-only';

import { createHash } from 'node:crypto';

import { cookies } from 'next/headers';
import { cache } from 'react';
import { z } from 'zod';

import type { SessionUser } from '@/lib/cms/dto';
import { CmsError } from '@/lib/cms/errors';
import { membershipRoleSchema } from '@/lib/cms/vocab';

import {
  directusAsUser,
  DirectusRequestError,
  joinUrl,
  mapDirectusError,
} from './client';
import { getCmsEnv } from './env';
import { logError, logWarn } from './logger';

/* -------------------------------------------------------------- Constants */

export const CMS_ACCESS_COOKIE = 'cms_at';
export const CMS_REFRESH_COOKIE = 'cms_rt';

/** Directus default REFRESH_TOKEN_TTL (7d); Directus does not return it. */
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Refresh this long before `exp` (clock skew + latency). */
const EXPIRY_SKEW_MS = 30_000;

/** A settled refresh is reused this long for late requests. */
const REFRESH_REUSE_MS = 30_000;

const LOG_SCOPE = 'auth';
const INTERNAL_MESSAGE = 'Terjadi kesalahan pada server.';

/* ------------------------------------------------------------------ Types */

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  /** Access-token lifetime in ms, as Directus returns it. */
  expiresMs: number;
};

export type CmsSession = { user: SessionUser; accessToken: string };

export type SessionResult =
  | { status: 'ok'; session: CmsSession }
  /** Access token expired and this caller may not refresh (Server Component). */
  | { status: 'expired' }
  /** No session, refresh rejected, or no CMS rights. */
  | { status: 'none' };

/* ---------------------------------------------------------------- Schemas */

const tokenResponseSchema = z.object({
  data: z.object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1),
    expires: z.number().int().positive(),
  }),
});

const meSchema = z.object({
  data: z.object({
    id: z.string(),
    email: z.string(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
  }),
});

const globalsSchema = z.object({
  data: z.object({ admin_access: z.boolean() }),
});

const membershipsSchema = z.object({
  data: z.array(
    z.object({
      membership_role: membershipRoleSchema,
      // null when the department is deleted or hidden by policy
      department: z.object({ id: z.string(), slug: z.string() }).nullable(),
    }),
  ),
});

/* ------------------------------------------------- Token-less Directus I/O */

type AuthPath = '/auth/login' | '/auth/refresh' | '/auth/logout';

/** Raw result so callers can map Directus codes (e.g. INVALID_OTP) themselves. */
type AuthResult =
  | { ok: true; json: unknown }
  | { ok: false; status: number; json: unknown };

/** POST to /auth/*. `mode: 'json'` always. Never logs the body. */
async function directusAuthPost(
  path: AuthPath,
  body: Record<string, string>,
): Promise<AuthResult> {
  const env = getCmsEnv();
  const response = await fetch(joinUrl(env.directusUrl, path), {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, mode: 'json' }),
    cache: 'no-store',
  });

  let json: unknown = null;
  if (response.status !== 204) {
    try {
      json = await response.json();
    } catch {
      // Non-JSON body (proxy error page); the status still maps.
    }
  }
  return response.ok
    ? { ok: true, json }
    : { ok: false, status: response.status, json };
}

/** First Directus `extensions.code`, e.g. 'INVALID_CREDENTIALS' / 'INVALID_OTP'. */
function directusCodeOf(json: unknown): string | null {
  if (typeof json !== 'object' || json === null) return null;
  const errors = (json as { errors?: unknown }).errors;
  if (!Array.isArray(errors)) return null;
  const code = (errors[0] as { extensions?: { code?: unknown } } | undefined)
    ?.extensions?.code;
  return typeof code === 'string' ? code : null;
}

/** Generic mapping for refresh/logout: Directus body never leaves this module. */
function toRequestError(status: number, json: unknown): DirectusRequestError {
  const { code } = mapDirectusError(status, json);
  return new DirectusRequestError(
    code,
    code === 'internal' ? INTERNAL_MESSAGE : code,
  );
}

function toTokenPair(json: unknown): TokenPair {
  const parsed = tokenResponseSchema.safeParse(json);
  if (!parsed.success) {
    logError(LOG_SCOPE, 'token response does not match schema'); // no body
    throw new DirectusRequestError('internal', INTERNAL_MESSAGE);
  }
  const { access_token, refresh_token, expires } = parsed.data.data;
  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    expiresMs: expires,
  };
}

/* ------------------------------------------------------------- Login */

/** Messages are always ours; the Directus body never reaches the client. */
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<TokenPair> {
  const result = await directusAuthPost('/auth/login', { email, password });
  if (result.ok) return toTokenPair(result.json);

  const directusCode = directusCodeOf(result.json);
  if (directusCode === 'INVALID_OTP') {
    throw new CmsError(
      'unauthenticated',
      'Akun ini memakai 2FA; login 2FA belum didukung.',
    );
  }
  switch (result.status) {
    case 400:
    case 401:
      throw new CmsError('unauthenticated', 'Email atau kata sandi salah.');
    case 403:
      throw new CmsError('forbidden', 'Akun ini tidak aktif.');
    case 429:
      throw new CmsError(
        'rate_limited',
        'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
      );
    default:
      throw new DirectusRequestError('internal', INTERNAL_MESSAGE);
  }
}

/* ---------------------------------------------- Refresh (single-flight) */

type RefreshEntry = { promise: Promise<TokenPair>; settledAt: number | null };
const refreshes = new Map<string, RefreshEntry>();

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function pruneRefreshes(now: number): void {
  refreshes.forEach((entry, key) => {
    if (entry.settledAt !== null && now - entry.settledAt >= REFRESH_REUSE_MS) {
      refreshes.delete(key);
    }
  });
}

async function doRefresh(refreshToken: string): Promise<TokenPair> {
  const result = await directusAuthPost('/auth/refresh', {
    refresh_token: refreshToken,
  });
  if (!result.ok) throw toRequestError(result.status, result.json);
  return toTokenPair(result.json);
}

/**
 * Exchange a refresh token for a new pair (Directus rotates it).
 *
 * - Concurrent callers with the same token share ONE Directus call.
 * - A success is reused for 30 s, so a request sent before the browser got
 *   the new Set-Cookie still succeeds instead of burning the rotated token.
 * - Failures are not cached.
 *
 * Pure (no cookies()), so src/proxy.ts could reuse it if refresh ever moves there.
 */
export function refreshTokenPair(refreshToken: string): Promise<TokenPair> {
  const now = Date.now();
  pruneRefreshes(now);

  const key = hashToken(refreshToken);
  const existing = refreshes.get(key);
  if (existing) return existing.promise;

  const promise = doRefresh(refreshToken).then(
    (pair) => {
      const entry = refreshes.get(key);
      if (entry) entry.settledAt = Date.now();
      return pair;
    },
    (error: unknown) => {
      refreshes.delete(key);
      throw error;
    },
  );
  refreshes.set(key, { promise, settledAt: null });
  return promise;
}

/* ------------------------------------------------------------- Revoke */

/** Best effort. Never throws, never logs the token. */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    const result = await directusAuthPost('/auth/logout', {
      refresh_token: refreshToken,
    });
    if (!result.ok) {
      logWarn(LOG_SCOPE, `logout revoke failed: HTTP ${result.status}`);
    }
  } catch {
    logWarn(LOG_SCOPE, 'logout revoke failed: network');
  }
}

/* ---------------------------------------------------------- Cookies */

function baseCookieOptions() {
  const { sessionCookieDomain } = getCmsEnv();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    ...(sessionCookieDomain ? { domain: sessionCookieDomain } : {}),
  };
}

/** Route Handlers / Server Functions only (throws in a Server Component). */
export async function setSessionCookies(pair: TokenPair): Promise<void> {
  const jar = await cookies();
  const base = baseCookieOptions();
  jar.set(CMS_ACCESS_COOKIE, pair.accessToken, {
    ...base,
    maxAge: Math.floor(pair.expiresMs / 1000),
  });
  jar.set(CMS_REFRESH_COOKIE, pair.refreshToken, {
    ...base,
    maxAge: REFRESH_TTL_SECONDS,
  });
}

/** Same path/domain as set — otherwise the browser keeps the original. */
export async function clearSessionCookies(): Promise<void> {
  const jar = await cookies();
  const base = baseCookieOptions();
  jar.set(CMS_ACCESS_COOKIE, '', { ...base, maxAge: 0 });
  jar.set(CMS_REFRESH_COOKIE, '', { ...base, maxAge: 0 });
}

/* ------------------------------------------------------------ Expiry */

/** JWT `exp` in ms, read WITHOUT verification (Directus verifies). */
function jwtExpiresAt(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) return null;
  try {
    const json: unknown = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    );
    const exp = (json as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function isFresh(token: string | undefined): token is string {
  if (!token) return false;
  const exp = jwtExpiresAt(token);
  return exp !== null && exp - EXPIRY_SKEW_MS > Date.now();
}

/* ---------------------------------------------------------- Load the user */

function parseOrThrow<T>(
  schema: z.ZodType<T>,
  input: unknown,
  what: string,
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    logError(LOG_SCOPE, `Directus response does not match schema: ${what}`, {
      issues: result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      ),
    });
    throw new DirectusRequestError('internal', INTERNAL_MESSAGE);
  }
  return result.data;
}

/**
 * /users/me + /policies/me/globals + active memberships, in parallel, with the
 * user's own token. Returns null when the user has no CMS rights
 * (not admin and no active membership).
 * A rejected token surfaces as DirectusRequestError('unauthenticated').
 */
export async function loadSessionUser(
  accessToken: string,
): Promise<SessionUser | null> {
  const membershipQuery = new URLSearchParams({
    'filter[user][_eq]': '$CURRENT_USER',
    'filter[is_active][_eq]': 'true',
    fields: 'membership_role,department.id,department.slug',
    limit: '-1',
  }).toString();

  const [meRaw, globalsRaw, membershipsRaw] = await Promise.all([
    directusAsUser<unknown>(
      accessToken,
      '/users/me?fields=id,email,first_name,last_name',
    ),
    directusAsUser<unknown>(accessToken, '/policies/me/globals'),
    directusAsUser<unknown>(
      accessToken,
      `/items/cms_department_memberships?${membershipQuery}`,
    ),
  ]);

  const me = parseOrThrow(meSchema, meRaw, 'users/me').data;
  const isAdmin = parseOrThrow(globalsSchema, globalsRaw, 'policies/me/globals')
    .data.admin_access;
  const memberships = parseOrThrow(
    membershipsSchema,
    membershipsRaw,
    'cms_department_memberships',
  ).data.flatMap((row) =>
    row.department
      ? [
          {
            departmentId: row.department.id,
            departmentSlug: row.department.slug,
            role: row.membership_role,
          },
        ]
      : [],
  );

  if (!isAdmin && memberships.length === 0) return null;

  const name =
    [me.first_name, me.last_name].filter(Boolean).join(' ').trim() || me.email;
  return { id: me.id, email: me.email, name, isAdmin, memberships };
}

/* --------------------------------------------------- getSession */

function isRejected(error: unknown): boolean {
  return (
    error instanceof DirectusRequestError && error.code === 'unauthenticated'
  );
}

const loadSession = cache(
  async (allowRefresh: boolean): Promise<SessionResult> => {
    const jar = await cookies();
    let accessToken = jar.get(CMS_ACCESS_COOKIE)?.value;
    const refreshToken = jar.get(CMS_REFRESH_COOKIE)?.value;

    if (!accessToken && !refreshToken) return { status: 'none' };

    const expiredOrNone = (): SessionResult =>
      refreshToken ? { status: 'expired' } : { status: 'none' };

    let refreshed = false;
    /** true = new pair in place; false = no session (cookies cleared). */
    const refresh = async (): Promise<boolean> => {
      if (!refreshToken || refreshed) return false;
      refreshed = true;
      try {
        const pair = await refreshTokenPair(refreshToken);
        await setSessionCookies(pair);
        accessToken = pair.accessToken;
        return true;
      } catch (error) {
        if (!isRejected(error)) throw error; // Directus down ≠ logged out
        await clearSessionCookies();
        return false;
      }
    };

    // 1. Proactive refresh, before Directus rejects the token.
    if (!isFresh(accessToken)) {
      if (!allowRefresh) return expiredOrNone();
      if (!(await refresh())) return { status: 'none' };
    }

    // 2. Load; one reactive refresh if Directus still rejects the token.
    for (;;) {
      try {
        const user = await loadSessionUser(accessToken as string);
        if (!user) {
          if (allowRefresh) await clearSessionCookies();
          return { status: 'none' };
        }
        return {
          status: 'ok',
          session: { user, accessToken: accessToken as string },
        };
      } catch (error) {
        if (!isRejected(error)) throw error;
        if (!allowRefresh) return expiredOrNone();
        if (!(await refresh())) return { status: 'none' };
      }
    }
  },
);

/**
 * Route Handlers: default `refresh: true` (may rewrite cookies).
 * Server Components: MUST pass `{ refresh: false }`.
 * Throws on Directus outages — an outage is not "logged out".
 */
export function getSession(
  options: { refresh?: boolean } = {},
): Promise<SessionResult> {
  return loadSession(options.refresh ?? true);
}

/** Route Handlers. CmsError 401 unless there is a verified session. */
export async function requireSession(): Promise<CmsSession> {
  const result = await getSession();
  if (result.status !== 'ok') {
    throw new CmsError(
      'unauthenticated',
      'Sesi tidak valid. Silakan masuk kembali.',
    );
  }
  return result.session;
}

/** Test-only. */
export function resetSessionStateForTests(): void {
  refreshes.clear();
}
