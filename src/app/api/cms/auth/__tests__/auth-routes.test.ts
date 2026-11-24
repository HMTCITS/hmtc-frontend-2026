/**
 * Route tests for /api/cms/auth/{login,logout,me,refresh}.
 *
 * The handlers run through the real `defineCmsRoute` pipeline (Origin check,
 * body validation, response-schema check in test mode). `next/headers` is an
 * in-memory cookie jar; `fetch` is routed by "METHOD /directus/path".
 *
 * Note: Next merges cookies().set() into the Route Handler response as
 * Set-Cookie. That merge is Next's job and is not reproduced here — these
 * tests assert what the handler writes to the cookie store.
 *
 * `jest.mock()` paths are relative: the SWC transform rewrites `@/` in
 * imports but not in mock specifiers.
 *
 * @jest-environment node
 */
import { resetCmsEnvForTests } from '@/lib/directus/env';
import { resetRateLimitsForTests } from '@/lib/directus/rate-limit';
import {
  CMS_ACCESS_COOKIE,
  CMS_REFRESH_COOKIE,
  resetSessionStateForTests,
} from '@/lib/directus/session';

import { logError, logWarn } from '../../../../../lib/directus/logger';
import { POST as login } from '../login/route';
import { POST as logout } from '../logout/route';
import { GET as me } from '../me/route';
import { GET as refresh } from '../refresh/route';

jest.mock('server-only', () => ({}));
jest.mock('../../../../../lib/directus/logger', () => ({
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

const SITE = 'http://localhost:3000';
const nowSeconds = () => Math.floor(Date.now() / 1000);

function jwt(exp: number, tag: string): string {
  const enc = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${enc({ alg: 'HS256' })}.${enc({ exp, tag })}.sig`;
}

const AT = jwt(nowSeconds() + 900, 'login');
const EXPIRED_AT = jwt(nowSeconds() - 60, 'expired');
const NEW_AT = jwt(nowSeconds() + 900, 'new');
const RT = 'refresh-token-1';
const NEW_RT = 'refresh-token-2';
const ALL_TOKENS = [AT, EXPIRED_AT, NEW_AT, RT, NEW_RT];

const USER_ID = 'd0000000-0000-4000-8000-000000000001';
const DEPT_ID = '7870e406-aaef-430e-8df8-1c7f8d2b3682';

const me_ = {
  id: USER_ID,
  email: 'editor@example.com',
  first_name: 'Local',
  last_name: 'Editor',
};
const expectedUser = {
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
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const directusError = (status: number, code: string) =>
  json({ errors: [{ message: 'raw', extensions: { code } }] }, status);

/* ------------------------------------------------------- Fetch routing */

type Handler = (init: RequestInit, auth: string | undefined) => Response;
let routes: Record<string, Handler>;
const fetchMock = jest.fn(async (input: string, init: RequestInit = {}) => {
  const url = new URL(input);
  const key = `${init.method ?? 'GET'} ${url.pathname}`;
  const handler = routes[key];
  if (!handler) throw new Error(`unexpected fetch: ${key}`);
  const headers = (init.headers ?? {}) as Record<string, string>;
  return handler(init, headers.Authorization?.replace(/^Bearer /, ''));
});

function calls(key: string) {
  return fetchMock.mock.calls.filter(([input, init]) => {
    const url = new URL(input);
    return `${init?.method ?? 'GET'} ${url.pathname}` === key;
  });
}

function defaultRoutes(): Record<string, Handler> {
  const valid = new Set([AT, NEW_AT]);
  const asUser =
    (body: unknown): Handler =>
    (_init, auth) =>
      auth && valid.has(auth)
        ? json({ data: body })
        : directusError(401, 'INVALID_CREDENTIALS');

  return {
    'POST /auth/login': (init) => {
      const { password } = JSON.parse(String(init.body));
      return password === 'editor-local'
        ? json({
            data: { access_token: AT, refresh_token: RT, expires: 900000 },
          })
        : directusError(401, 'INVALID_CREDENTIALS');
    },
    'POST /auth/refresh': (init) => {
      const { refresh_token } = JSON.parse(String(init.body));
      return refresh_token === RT
        ? json({
            data: {
              access_token: NEW_AT,
              refresh_token: NEW_RT,
              expires: 900000,
            },
          })
        : directusError(401, 'INVALID_CREDENTIALS');
    },
    'POST /auth/logout': () => new Response(null, { status: 204 }),
    'GET /users/me': asUser(me_),
    'GET /policies/me/globals': asUser({ admin_access: false }),
    'GET /items/cms_department_memberships': asUser([
      {
        membership_role: 'editor',
        department: { id: DEPT_ID, slug: 'research-and-technology' },
      },
    ]),
  };
}

/* ------------------------------------------------------------ Requests */

function loginRequest(
  body: unknown,
  { origin = SITE, ip = '203.0.113.7' }: { origin?: string; ip?: string } = {},
) {
  return new Request(`${SITE}/api/cms/auth/login`, {
    method: 'POST',
    headers: {
      origin,
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

const goodLogin = { email: 'editor@example.com', password: 'editor-local' };
const badLogin = { email: 'editor@example.com', password: 'wrong' };

function logoutRequest(origin = SITE) {
  return new Request(`${SITE}/api/cms/auth/logout`, {
    method: 'POST',
    headers: { origin },
  });
}

/* --------------------------------------------------------------- Setup */

const responses: Response[] = [];
async function capture(response: Promise<Response>): Promise<Response> {
  const res = await response;
  responses.push(res.clone());
  return res;
}

beforeEach(() => {
  process.env.DIRECTUS_URL = 'https://directus.test';
  process.env.DIRECTUS_READ_TOKEN = 'read-token';
  process.env.CMS_REVALIDATE_SECRET = 'secret';
  resetCmsEnvForTests();
  resetSessionStateForTests();
  resetRateLimitsForTests();

  mockJar.clear();
  mockSetCalls.length = 0;
  responses.length = 0;
  routes = defaultRoutes();
  fetchMock.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
  jest.mocked(logError).mockClear();
  jest.mocked(logWarn).mockClear();
});

/** No token in any response body/header (Set-Cookie aside) or log. */
afterEach(async () => {
  const bodies = await Promise.all(responses.map((r) => r.text()));
  const headers = responses.map((r) =>
    JSON.stringify(
      Array.from(r.headers.entries()).filter(
        ([name]) => name.toLowerCase() !== 'set-cookie',
      ),
    ),
  );
  const logged = JSON.stringify([
    jest.mocked(logError).mock.calls,
    jest.mocked(logWarn).mock.calls,
  ]);
  const haystack = [...bodies, ...headers, logged].join('\n');
  for (const token of ALL_TOKENS) expect(haystack).not.toContain(token);
});

/* --------------------------------------------------------------- Login */

describe('POST /api/cms/auth/login', () => {
  it('success: 200 { user }, both cookies set, no token in the body', async () => {
    const res = await capture(login(loginRequest(goodLogin)));

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({ user: expectedUser });
    expect(mockJar.get(CMS_ACCESS_COOKIE)).toBe(AT);
    expect(mockJar.get(CMS_REFRESH_COOKIE)).toBe(RT);
    for (const call of mockSetCalls) {
      expect(call.options).toMatchObject({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
    }
  });

  it('wrong password: 401 with a login-specific message, no cookies', async () => {
    const res = await capture(login(loginRequest(badLogin)));

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: {
        code: 'unauthenticated',
        message: 'Email atau kata sandi salah.',
      },
    });
    expect(mockSetCalls).toHaveLength(0);
  });

  it('account without CMS rights: 403, refresh token revoked, no cookies', async () => {
    routes['GET /items/cms_department_memberships'] = () => json({ data: [] });

    const res = await capture(login(loginRequest(goodLogin)));

    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('forbidden');
    expect(calls('POST /auth/logout')).toHaveLength(1);
    expect(
      JSON.parse(String(calls('POST /auth/logout')[0][1]?.body)).refresh_token,
    ).toBe(RT);
    expect(mockSetCalls).toHaveLength(0);
  });

  it('rate limit: the 6th attempt after 5 failures is 429 without calling Directus', async () => {
    for (let i = 0; i < 5; i += 1) {
      const res = await capture(login(loginRequest(badLogin)));
      expect(res.status).toBe(401);
    }
    const loginCalls = calls('POST /auth/login').length;

    const blocked = await capture(login(loginRequest(goodLogin)));

    expect(blocked.status).toBe(429);
    expect((await blocked.json()).error.code).toBe('rate_limited');
    expect(calls('POST /auth/login')).toHaveLength(loginCalls);
  });

  it('the limit is per ip + email, and a success resets it', async () => {
    for (let i = 0; i < 4; i += 1) await login(loginRequest(badLogin));
    expect((await login(loginRequest(goodLogin))).status).toBe(200);
    for (let i = 0; i < 4; i += 1) await login(loginRequest(badLogin));
    // 4 failures after the reset: still allowed
    expect((await login(loginRequest(goodLogin))).status).toBe(200);

    for (let i = 0; i < 5; i += 1) await login(loginRequest(badLogin));
    // another IP is not blocked by this one's failures
    expect(
      (await login(loginRequest(goodLogin, { ip: '198.51.100.9' }))).status,
    ).toBe(200);
  });

  it('cross-origin: 403 bad_origin, Directus not called', async () => {
    const res = await capture(
      login(loginRequest(goodLogin, { origin: 'https://evil.example' })),
    );

    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('bad_origin');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('invalid body: 422, Directus not called', async () => {
    const res = await capture(
      login(loginRequest({ email: 'not-an-email', password: '' })),
    );

    expect(res.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------- Logout */

describe('POST /api/cms/auth/logout', () => {
  it('revokes the refresh token, clears both cookies, 204', async () => {
    mockJar.set(CMS_ACCESS_COOKIE, AT);
    mockJar.set(CMS_REFRESH_COOKIE, RT);

    const res = await capture(logout(logoutRequest()));

    expect(res.status).toBe(204);
    expect(JSON.parse(String(calls('POST /auth/logout')[0][1]?.body))).toEqual({
      refresh_token: RT,
      mode: 'json',
    });
    expect(mockJar.size).toBe(0);
    expect(
      mockSetCalls.filter((c) => c.options.maxAge === 0).map((c) => c.name),
    ).toEqual([CMS_ACCESS_COOKIE, CMS_REFRESH_COOKIE]);
  });

  it('no cookies: still 204, Directus not called', async () => {
    const res = await capture(logout(logoutRequest()));

    expect(res.status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Directus fails: still 204, cookies cleared, warning without the token', async () => {
    mockJar.set(CMS_REFRESH_COOKIE, RT);
    routes['POST /auth/logout'] = () => json({ errors: [] }, 500);

    const res = await capture(logout(logoutRequest()));

    expect(res.status).toBe(204);
    expect(mockJar.size).toBe(0);
    expect(logWarn).toHaveBeenCalledTimes(1);
  });

  it('cross-origin logout is rejected (logout CSRF)', async () => {
    mockJar.set(CMS_REFRESH_COOKIE, RT);

    const res = await capture(logout(logoutRequest('https://evil.example')));

    expect(res.status).toBe(403);
    expect(mockJar.get(CMS_REFRESH_COOKIE)).toBe(RT);
  });
});

/* ------------------------------------------------------------------ Me */

describe('GET /api/cms/auth/me', () => {
  const meRequest = () => new Request(`${SITE}/api/cms/auth/me`);

  it('valid session: 200 { user }', async () => {
    mockJar.set(CMS_ACCESS_COOKIE, AT);
    mockJar.set(CMS_REFRESH_COOKIE, RT);

    const res = await capture(me(meRequest()));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: expectedUser });
  });

  it('expired access token: refreshes, rewrites cookies, 200', async () => {
    mockJar.set(CMS_ACCESS_COOKIE, EXPIRED_AT);
    mockJar.set(CMS_REFRESH_COOKIE, RT);

    const res = await capture(me(meRequest()));

    expect(res.status).toBe(200);
    expect(mockJar.get(CMS_ACCESS_COOKIE)).toBe(NEW_AT);
    expect(mockJar.get(CMS_REFRESH_COOKIE)).toBe(NEW_RT);
  });

  it('no session: 401', async () => {
    const res = await capture(me(meRequest()));

    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('unauthenticated');
  });
});

/* ------------------------------------------------------------- Refresh */

describe('GET /api/cms/auth/refresh', () => {
  const refreshRequest = (next?: string) =>
    new Request(
      `${SITE}/api/cms/auth/refresh${next === undefined ? '' : `?next=${encodeURIComponent(next)}`}`,
    );

  it('refresh succeeds: 303 back to next, cookies rewritten', async () => {
    mockJar.set(CMS_ACCESS_COOKIE, EXPIRED_AT);
    mockJar.set(CMS_REFRESH_COOKIE, RT);

    const res = await capture(
      refresh(refreshRequest('/dashboard/cms/pages/1')),
    );

    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(`${SITE}/dashboard/cms/pages/1`);
    expect(mockJar.get(CMS_ACCESS_COOKIE)).toBe(NEW_AT);
  });

  it('refresh rejected: 303 to login with next preserved', async () => {
    mockJar.set(CMS_ACCESS_COOKIE, EXPIRED_AT);
    mockJar.set(CMS_REFRESH_COOKIE, 'already-rotated');

    const res = await capture(
      refresh(refreshRequest('/dashboard/cms/pages/1')),
    );

    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe(
      `${SITE}/dashboard/cms/login?next=${encodeURIComponent('/dashboard/cms/pages/1')}`,
    );
  });

  it('Directus down: 303 to login instead of a 500', async () => {
    mockJar.set(CMS_ACCESS_COOKIE, EXPIRED_AT);
    mockJar.set(CMS_REFRESH_COOKIE, RT);
    routes['POST /auth/refresh'] = () => json({ errors: [] }, 503);

    const res = await capture(refresh(refreshRequest('/dashboard/cms')));

    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toContain('/dashboard/cms/login');
  });

  it.each([
    ['protocol-relative', '//evil.example/x'],
    ['absolute URL', 'https://evil.example/dashboard/cms'],
    ['backslash trick', '/\\evil.example'],
    ['outside the CMS', '/gallery'],
    ['prefix look-alike', '/dashboard/cmsx'],
    ['missing', undefined],
  ])(
    'open-redirect guard: %s falls back to /dashboard/cms',
    async (_, next) => {
      mockJar.set(CMS_ACCESS_COOKIE, AT);
      mockJar.set(CMS_REFRESH_COOKIE, RT);

      const res = await capture(refresh(refreshRequest(next)));

      expect(res.headers.get('location')).toBe(`${SITE}/dashboard/cms`);
    },
  );
});
