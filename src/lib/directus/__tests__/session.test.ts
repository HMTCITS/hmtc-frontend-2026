/**
 * Unit tests for the editor session (`src/lib/directus/session.ts`).
 *
 * DoD coverage: verification via /users/me, automatic refresh via
 * /auth/refresh (expired session, rejected refresh, single-flight), active
 * memberships, cookie attributes, and tokens never reaching the logger.
 *
 * `next/headers` is replaced by an in-memory cookie jar; `fetch` is routed by
 * "METHOD /directus/path" so each case reads like the Directus API.
 *
 * @jest-environment node
 */
import { DirectusRequestError } from '@/lib/directus/client';
import { resetCmsEnvForTests } from '@/lib/directus/env';
import {
  CMS_ACCESS_COOKIE,
  CMS_REFRESH_COOKIE,
  getSession,
  loginWithPassword,
  REFRESH_TTL_SECONDS,
  refreshTokenPair,
  requireSession,
  resetSessionStateForTests,
  revokeRefreshToken,
} from '@/lib/directus/session';

import { logError, logWarn } from '../logger';

jest.mock('server-only', () => ({}));
jest.mock('../logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logInfo: jest.fn(),
}));

/* --------------------------------------------------------- Cookie jar */

type CookieOptions = Record<string, unknown>;
const mockJar = new Map<string, string>();
const mockSetCalls: Array<{
  name: string;
  value: string;
  options: CookieOptions;
}> = [];

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      mockJar.has(name) ? { name, value: mockJar.get(name) } : undefined,
    set: (name: string, value: string, options: CookieOptions = {}) => {
      mockSetCalls.push({ name, value, options });
      if (options.maxAge === 0) mockJar.delete(name);
      else mockJar.set(name, value);
    },
  }),
}));

/* ------------------------------------------------------------ Fixtures */

const nowSeconds = () => Math.floor(Date.now() / 1000);

/** Unsigned JWT with a chosen `exp` — session.ts never verifies signatures. */
function jwt(exp: number, tag: string): string {
  const enc = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${enc({ alg: 'HS256' })}.${enc({ exp, tag })}.sig`;
}

const FRESH_AT = jwt(nowSeconds() + 900, 'fresh');
const EXPIRED_AT = jwt(nowSeconds() - 60, 'expired');
const NEW_AT = jwt(nowSeconds() + 900, 'new');
const RT = 'refresh-token-1';
const NEW_RT = 'refresh-token-2';
const ALL_TOKENS = [FRESH_AT, EXPIRED_AT, NEW_AT, RT, NEW_RT];

const USER_ID = 'd0000000-0000-4000-8000-000000000001';
const DEPT_ID = '7870e406-aaef-430e-8df8-1c7f8d2b3682';

const me = {
  id: USER_ID,
  email: 'editor@example.com',
  first_name: 'Local',
  last_name: 'Editor',
};
const editorMembership = {
  membership_role: 'editor',
  department: { id: DEPT_ID, slug: 'research-and-technology' },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const unauthorized = () =>
  json(
    {
      errors: [
        {
          message: 'Invalid user credentials.',
          extensions: { code: 'INVALID_CREDENTIALS' },
        },
      ],
    },
    401,
  );

const tokens = (accessToken: string, refreshToken: string) =>
  json({
    data: {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires: 900000,
    },
  });

/* ------------------------------------------------------- Fetch routing */

type Handler = (init: RequestInit, auth: string | undefined) => Response;
let routes: Record<string, Handler>;
const fetchMock = jest.fn(async (input: string, init: RequestInit = {}) => {
  const url = new URL(input);
  const key = `${init.method ?? 'GET'} ${url.pathname}`;
  const handler = routes[key];
  if (!handler) throw new Error(`unexpected fetch: ${key}`);
  const headers = (init.headers ?? {}) as Record<string, string>;
  const auth = headers.Authorization?.replace(/^Bearer /, '');
  return handler(init, auth);
});

function calls(key: string) {
  return fetchMock.mock.calls.filter(([input, init]) => {
    const url = new URL(input);
    return `${init?.method ?? 'GET'} ${url.pathname}` === key;
  });
}

/** Default Directus: FRESH_AT and NEW_AT are valid; RT refreshes to NEW_*. */
function defaultRoutes(): Record<string, Handler> {
  const valid = new Set([FRESH_AT, NEW_AT]);
  const asUser =
    (body: unknown): Handler =>
    (_init, auth) =>
      auth && valid.has(auth) ? json({ data: body }) : unauthorized();

  return {
    'POST /auth/refresh': (init) => {
      const { refresh_token } = JSON.parse(String(init.body));
      return refresh_token === RT ? tokens(NEW_AT, NEW_RT) : unauthorized();
    },
    'POST /auth/logout': () => new Response(null, { status: 204 }),
    'POST /auth/login': () => tokens(FRESH_AT, RT),
    'GET /users/me': asUser(me),
    'GET /policies/me/globals': asUser({ admin_access: false }),
    'GET /items/cms_department_memberships': asUser([editorMembership]),
  };
}

/* --------------------------------------------------------------- Setup */

const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

beforeEach(() => {
  process.env.DIRECTUS_URL = 'https://directus.test';
  process.env.DIRECTUS_READ_TOKEN = 'read-token';
  process.env.CMS_REVALIDATE_SECRET = 'secret';
  delete process.env.CMS_SESSION_COOKIE_DOMAIN;
  setNodeEnv(ORIGINAL_NODE_ENV);
  resetCmsEnvForTests();
  resetSessionStateForTests();

  mockJar.clear();
  mockSetCalls.length = 0;
  routes = defaultRoutes();
  fetchMock.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
  jest.mocked(logError).mockClear();
  jest.mocked(logWarn).mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  setNodeEnv(ORIGINAL_NODE_ENV);
});

function signedIn(accessToken: string | null, refreshToken: string | null) {
  if (accessToken) mockJar.set(CMS_ACCESS_COOKIE, accessToken);
  if (refreshToken) mockJar.set(CMS_REFRESH_COOKIE, refreshToken);
}

/** No token string may ever reach a logger call. */
function expectNoTokensLogged() {
  const logged = JSON.stringify([
    jest.mocked(logError).mock.calls,
    jest.mocked(logWarn).mock.calls,
  ]);
  for (const token of ALL_TOKENS) expect(logged).not.toContain(token);
}

/* ------------------------------------------------------------ getSession */

describe('getSession', () => {
  it('fresh access token: loads user, globals and memberships, no refresh', async () => {
    signedIn(FRESH_AT, RT);

    const result = await getSession();

    expect(result).toEqual({
      status: 'ok',
      session: {
        accessToken: FRESH_AT,
        user: {
          id: USER_ID,
          email: 'editor@example.com',
          name: 'Local Editor',
          isAdmin: false,
          memberships: [
            {
              departmentId: DEPT_ID,
              departmentSlug: 'research-and-technology',
              role: 'editor',
            },
          ],
        },
      },
    });
    expect(calls('POST /auth/refresh')).toHaveLength(0);
    expect(calls('GET /users/me')).toHaveLength(1);
    expect(calls('GET /policies/me/globals')).toHaveLength(1);
    expect(calls('GET /items/cms_department_memberships')).toHaveLength(1);
    expect(mockSetCalls).toHaveLength(0);
  });

  it('expired session: refreshes, rewrites both cookies, returns the user', async () => {
    signedIn(EXPIRED_AT, RT);

    const result = await getSession();

    expect(result.status).toBe('ok');
    expect(calls('POST /auth/refresh')).toHaveLength(1);
    expect(JSON.parse(String(calls('POST /auth/refresh')[0][1]?.body))).toEqual(
      { refresh_token: RT, mode: 'json' },
    );
    expect(mockJar.get(CMS_ACCESS_COOKIE)).toBe(NEW_AT);
    expect(mockJar.get(CMS_REFRESH_COOKIE)).toBe(NEW_RT);
    if (result.status === 'ok') expect(result.session.accessToken).toBe(NEW_AT);
    expectNoTokensLogged();
  });

  it('missing access cookie with a refresh cookie: refreshes', async () => {
    signedIn(null, RT);

    const result = await getSession();

    expect(result.status).toBe('ok');
    expect(calls('POST /auth/refresh')).toHaveLength(1);
    expect(mockJar.get(CMS_ACCESS_COOKIE)).toBe(NEW_AT);
  });

  it('refresh rejected (rotated/revoked): clears cookies, returns none', async () => {
    signedIn(EXPIRED_AT, 'already-rotated');

    const result = await getSession();

    expect(result).toEqual({ status: 'none' });
    expect(mockJar.has(CMS_ACCESS_COOKIE)).toBe(false);
    expect(mockJar.has(CMS_REFRESH_COOKIE)).toBe(false);
    expect(calls('GET /users/me')).toHaveLength(0);
  });

  it('/users/me rejects a not-yet-expired token: refreshes once and retries', async () => {
    const revokedButFresh = jwt(nowSeconds() + 900, 'revoked');
    signedIn(revokedButFresh, RT);

    const result = await getSession();

    expect(result.status).toBe('ok');
    expect(calls('POST /auth/refresh')).toHaveLength(1);
    expect(calls('GET /users/me')).toHaveLength(2);
  });

  it('a second rejection after refresh gives none, without looping', async () => {
    const revokedButFresh = jwt(nowSeconds() + 900, 'revoked');
    signedIn(revokedButFresh, RT);
    routes['GET /users/me'] = () => unauthorized();

    const result = await getSession();

    expect(result).toEqual({ status: 'none' });
    expect(calls('POST /auth/refresh')).toHaveLength(1);
    expect(calls('GET /users/me')).toHaveLength(2);
  });

  it('refresh: false (Server Component) with an expired token: expired, no refresh, cookies untouched', async () => {
    signedIn(EXPIRED_AT, RT);

    const result = await getSession({ refresh: false });

    expect(result).toEqual({ status: 'expired' });
    expect(calls('POST /auth/refresh')).toHaveLength(0);
    expect(mockSetCalls).toHaveLength(0);
  });

  it('refresh: false with no refresh cookie: none', async () => {
    signedIn(EXPIRED_AT, null);
    await expect(getSession({ refresh: false })).resolves.toEqual({
      status: 'none',
    });
  });

  it('single-flight: three concurrent loads with the same expired pair make ONE refresh', async () => {
    signedIn(EXPIRED_AT, RT);

    const results = await Promise.all([
      getSession(),
      getSession(),
      getSession(),
    ]);

    expect(results.map((r) => r.status)).toEqual(['ok', 'ok', 'ok']);
    expect(calls('POST /auth/refresh')).toHaveLength(1);
  });

  it('a late request within 30 s reuses the settled pair; after 30 s Directus is called again', async () => {
    jest.useFakeTimers({ now: Date.now() });

    await expect(refreshTokenPair(RT)).resolves.toMatchObject({
      accessToken: NEW_AT,
    });
    jest.advanceTimersByTime(29_000);
    await expect(refreshTokenPair(RT)).resolves.toMatchObject({
      accessToken: NEW_AT,
    });
    expect(calls('POST /auth/refresh')).toHaveLength(1);

    jest.advanceTimersByTime(2_000);
    await refreshTokenPair(RT);
    expect(calls('POST /auth/refresh')).toHaveLength(2);
  });

  it('a failed refresh is not cached', async () => {
    await expect(refreshTokenPair('bad')).rejects.toBeInstanceOf(
      DirectusRequestError,
    );
    await expect(refreshTokenPair('bad')).rejects.toBeInstanceOf(
      DirectusRequestError,
    );
    expect(calls('POST /auth/refresh')).toHaveLength(2);
  });

  it('requests only active memberships and skips a null department', async () => {
    signedIn(FRESH_AT, RT);
    routes['GET /items/cms_department_memberships'] = () =>
      json({
        data: [
          editorMembership,
          { membership_role: 'reviewer', department: null },
        ],
      });

    const result = await getSession();

    const url = new URL(calls('GET /items/cms_department_memberships')[0][0]);
    expect(url.searchParams.get('filter[user][_eq]')).toBe('$CURRENT_USER');
    expect(url.searchParams.get('filter[is_active][_eq]')).toBe('true');
    expect(
      result.status === 'ok' && result.session.user.memberships,
    ).toHaveLength(1);
  });

  it('admin with zero memberships is a valid session', async () => {
    signedIn(FRESH_AT, RT);
    routes['GET /policies/me/globals'] = () =>
      json({ data: { admin_access: true } });
    routes['GET /items/cms_department_memberships'] = () => json({ data: [] });

    const result = await getSession();

    expect(result.status).toBe('ok');
    if (result.status === 'ok') {
      expect(result.session.user.isAdmin).toBe(true);
      expect(result.session.user.memberships).toEqual([]);
    }
  });

  it('not admin and no memberships: none, cookies cleared', async () => {
    signedIn(FRESH_AT, RT);
    routes['GET /items/cms_department_memberships'] = () => json({ data: [] });

    await expect(getSession()).resolves.toEqual({ status: 'none' });
    expect(mockJar.size).toBe(0);
  });

  it('no cookies: none, zero fetches', async () => {
    await expect(getSession()).resolves.toEqual({ status: 'none' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Directus 5xx on /users/me throws (outage is not "logged out")', async () => {
    signedIn(FRESH_AT, RT);
    routes['GET /users/me'] = () => json({ errors: [] }, 503);

    await expect(getSession()).rejects.toMatchObject({ code: 'internal' });
    expect(mockJar.get(CMS_ACCESS_COOKIE)).toBe(FRESH_AT);
  });

  it('Directus 5xx on refresh throws and keeps the cookies', async () => {
    signedIn(EXPIRED_AT, RT);
    routes['POST /auth/refresh'] = () => json({ errors: [] }, 502);

    await expect(getSession()).rejects.toBeInstanceOf(DirectusRequestError);
    expect(mockJar.get(CMS_REFRESH_COOKIE)).toBe(RT);
  });

  it('name falls back to email when first/last name are empty', async () => {
    signedIn(FRESH_AT, RT);
    routes['GET /users/me'] = () =>
      json({ data: { ...me, first_name: null, last_name: null } });

    const result = await getSession();
    expect(result.status === 'ok' && result.session.user.name).toBe(
      'editor@example.com',
    );
  });
});

/* ------------------------------------------------------- Cookie attributes */

describe('cookie attributes', () => {
  function cookieSet(name: string) {
    return mockSetCalls.filter((c) => c.name === name).at(-1)?.options;
  }

  it('HttpOnly, SameSite=Lax, Path=/, maxAge from Directus and the refresh TTL; not Secure outside production', async () => {
    signedIn(EXPIRED_AT, RT);
    await getSession();

    expect(cookieSet(CMS_ACCESS_COOKIE)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 900,
    });
    expect(cookieSet(CMS_REFRESH_COOKIE)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_TTL_SECONDS,
    });
  });

  it('Secure in production, with the configured cookie domain', async () => {
    setNodeEnv('production');
    process.env.CMS_SESSION_COOKIE_DOMAIN = '.hmtc-its.com';
    resetCmsEnvForTests();
    signedIn(EXPIRED_AT, RT);

    await getSession();

    expect(cookieSet(CMS_ACCESS_COOKIE)).toMatchObject({
      secure: true,
      domain: '.hmtc-its.com',
    });
    expect(cookieSet(CMS_REFRESH_COOKIE)).toMatchObject({
      secure: true,
      domain: '.hmtc-its.com',
    });
  });

  it('clearing uses the same path and domain with maxAge 0', async () => {
    process.env.CMS_SESSION_COOKIE_DOMAIN = '.hmtc-its.com';
    resetCmsEnvForTests();
    signedIn(EXPIRED_AT, 'already-rotated');

    await getSession();

    for (const name of [CMS_ACCESS_COOKIE, CMS_REFRESH_COOKIE]) {
      expect(cookieSet(name)).toMatchObject({
        path: '/',
        domain: '.hmtc-its.com',
        maxAge: 0,
      });
    }
  });
});

/* ------------------------------------------------------- requireSession */

describe('requireSession', () => {
  it('returns the session when signed in', async () => {
    signedIn(FRESH_AT, RT);
    await expect(requireSession()).resolves.toMatchObject({
      accessToken: FRESH_AT,
    });
  });

  it('throws unauthenticated without a session', async () => {
    await expect(requireSession()).rejects.toMatchObject({
      code: 'unauthenticated',
    });
  });
});

/* ------------------------------------------------- login / revoke helpers */

describe('loginWithPassword', () => {
  it('sends mode json and returns the pair', async () => {
    await expect(
      loginWithPassword('editor@example.com', 'editor-local'),
    ).resolves.toEqual({
      accessToken: FRESH_AT,
      refreshToken: RT,
      expiresMs: 900000,
    });
    expect(JSON.parse(String(calls('POST /auth/login')[0][1]?.body))).toEqual({
      email: 'editor@example.com',
      password: 'editor-local',
      mode: 'json',
    });
  });

  it.each([
    [
      401,
      'INVALID_CREDENTIALS',
      'unauthenticated',
      'Email atau kata sandi salah.',
    ],
    [
      401,
      'INVALID_OTP',
      'unauthenticated',
      'Akun ini memakai 2FA; login 2FA belum didukung.',
    ],
    [403, 'FORBIDDEN', 'forbidden', 'Akun ini tidak aktif.'],
    [
      429,
      'REQUESTS_EXCEEDED',
      'rate_limited',
      'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
    ],
    [500, 'INTERNAL', 'internal', 'Terjadi kesalahan pada server.'],
  ])('maps %i %s → %s', async (status, directusCode, code, message) => {
    routes['POST /auth/login'] = () =>
      json(
        { errors: [{ message: 'raw', extensions: { code: directusCode } }] },
        status,
      );

    await expect(
      loginWithPassword('editor@example.com', 'x'),
    ).rejects.toMatchObject({ code, message });
  });
});

describe('revokeRefreshToken', () => {
  it('posts the refresh token to /auth/logout', async () => {
    await revokeRefreshToken(RT);
    expect(JSON.parse(String(calls('POST /auth/logout')[0][1]?.body))).toEqual({
      refresh_token: RT,
      mode: 'json',
    });
  });

  it('never throws and never logs the token when Directus fails', async () => {
    routes['POST /auth/logout'] = () => json({ errors: [] }, 500);
    await expect(revokeRefreshToken(RT)).resolves.toBeUndefined();

    routes['POST /auth/logout'] = () => {
      throw new Error('network down');
    };
    await expect(revokeRefreshToken(RT)).resolves.toBeUndefined();

    expect(logWarn).toHaveBeenCalledTimes(2);
    expectNoTokensLogged();
  });
});
