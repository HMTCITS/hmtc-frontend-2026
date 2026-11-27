/**
 * Route tests for the preview-grant endpoints:
 * GET/POST /api/cms/pages/:id/preview-grants and
 * DELETE /api/cms/preview-grants/:grantId.
 *
 * Same harness as `pages-routes.test.ts`: the real `defineCmsRoute` pipeline,
 * an in-memory cookie jar, and `fetch` routed by "METHOD /directus/path" with
 * every request recorded.
 *
 * @jest-environment node
 */
import { createHash } from 'node:crypto';

import { resetCmsEnvForTests } from '@/lib/directus/env';
import { logError, logInfo, logWarn } from '@/lib/directus/logger';
import { resetRateLimitsForTests } from '@/lib/directus/rate-limit';
import {
  CMS_ACCESS_COOKIE,
  resetSessionStateForTests,
} from '@/lib/directus/session';

import { DELETE as revokeGrant } from '../../preview-grants/[grantId]/route';
import {
  GET as listGrants,
  POST as createGrant,
} from '../[id]/preview-grants/route';

jest.mock('server-only', () => ({}));
jest.mock('../../../../../lib/directus/logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logInfo: jest.fn(),
}));

const mockJar = new Map<string, string>();
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      mockJar.has(name) ? { name, value: mockJar.get(name) } : undefined,
    set: (name: string, value: string, options: { maxAge?: number } = {}) => {
      if (options.maxAge === 0) mockJar.delete(name);
      else mockJar.set(name, value);
    },
  }),
}));

/* ------------------------------------------------------------ Fixtures */

const SITE = 'http://localhost:3000';

function jwt(exp: number): string {
  const enc = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${enc({ alg: 'HS256' })}.${enc({ exp })}.sig`;
}
const AT = jwt(Math.floor(Date.now() / 1000) + 900);

const USER_ID = 'd0000000-0000-4000-8000-000000000001';
const OTHER_USER_ID = 'd0000000-0000-4000-8000-000000000002';
const RT_DEPT = '7870e406-aaef-430e-8df8-1c7f8d2b3682';
const IA_DEPT = 'bcee2c03-67a3-4978-a684-c388f9a6541c';
const PAGE_ID = '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e02';
const REVISION_ID = '6a0a2f52-9c6e-4c31-9d47-1a2b3c4d5e01';
const NEW_REVISION_ID = '6a0a2f52-9c6e-4c31-9d47-1a2b3c4d5e02';
const GRANT_ID = '7a0a2f52-9c6e-4c31-9d47-1a2b3c4d5e01';
const HERO_ID = '8b0a2f52-9c6e-4c31-9d47-1a2b3c4d5e01';

const HOUR_MS = 60 * 60 * 1000;

type Membership = { role: string; deptId: string; deptSlug: string };
let memberships: Membership[];
let isAdmin: boolean;

const heroBlocks = (title = 'Bluecamp') => [
  {
    type: 'hero',
    version: 1,
    id: HERO_ID,
    props: { title, align: 'center' },
  },
];

const content = (overrides: Record<string, unknown> = {}) => ({
  title: 'Bluecamp 2026',
  blocks: heroBlocks(),
  excerpt: null,
  featured_image: null,
  seo_title: null,
  seo_description: null,
  ...overrides,
});

const pageRow = (overrides: Record<string, unknown> = {}) => ({
  id: PAGE_ID,
  status: 'draft',
  department: RT_DEPT,
  published_revision: null,
  ...content(),
  ...overrides,
});

const revisionRow = (overrides: Record<string, unknown> = {}) => ({
  id: REVISION_ID,
  revision_number: 3,
  ...content(),
  ...overrides,
});

const grantRow = (overrides: Record<string, unknown> = {}) => ({
  id: GRANT_ID,
  page: PAGE_ID,
  revision: REVISION_ID,
  created_by: USER_ID,
  date_created: '2026-11-20T08:00:00.000Z',
  expires_at: '2026-11-23T08:00:00.000Z',
  revoked_at: null,
  ...overrides,
});

const revokeRow = (overrides: Record<string, unknown> = {}) => ({
  id: GRANT_ID,
  created_by: USER_ID,
  revoked_at: null,
  page: { id: PAGE_ID, department: RT_DEPT },
  ...overrides,
});

/* ------------------------------------------------------- Fetch routing */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
const directusError = (status: number, code = 'FORBIDDEN') =>
  json({ errors: [{ message: 'raw sql', extensions: { code } }] }, status);

type Call = { key: string; url: URL; init: RequestInit; auth?: string };
type Handler = (call: Call) => Response;
let routes: Record<string, Handler>;
let fetchCalls: Call[];

const fetchMock = jest.fn(async (input: string, init: RequestInit = {}) => {
  const url = new URL(input);
  const key = `${init.method ?? 'GET'} ${url.pathname}`;
  const headers = (init.headers ?? {}) as Record<string, string>;
  const call = {
    key,
    url,
    init,
    auth: headers.Authorization?.replace(/^Bearer /, ''),
  };
  fetchCalls.push(call);
  const handler = routes[key];
  if (!handler) throw new Error(`unexpected fetch: ${key}`);
  return handler(call);
});

const callsTo = (key: string) => fetchCalls.filter((c) => c.key === key);
const bodyOf = (call: Call | undefined): Record<string, unknown> =>
  JSON.parse(String(call?.init.body));

function defaultRoutes(): Record<string, Handler> {
  return {
    'GET /users/me': () =>
      json({
        data: {
          id: USER_ID,
          email: 'editor@example.com',
          first_name: 'Local',
          last_name: 'Editor',
        },
      }),
    'GET /policies/me/globals': () => json({ data: { admin_access: isAdmin } }),
    'GET /items/cms_department_memberships': () =>
      json({
        data: memberships.map((m) => ({
          membership_role: m.role,
          department: { id: m.deptId, slug: m.deptSlug },
        })),
      }),
    [`GET /items/cms_pages/${PAGE_ID}`]: () => json({ data: pageRow() }),
    'GET /items/cms_page_revisions': () => json({ data: [revisionRow()] }),
    'POST /items/cms_page_revisions': () =>
      json({ data: { id: NEW_REVISION_ID } }),
    'POST /items/cms_preview_grants': (call) => {
      const body = bodyOf(call);
      return json({
        data: grantRow({
          revision: body.revision,
          date_created: new Date().toISOString(),
          expires_at: body.expires_at,
        }),
      });
    },
    'GET /items/cms_preview_grants': () =>
      json({
        data: [
          grantRow(),
          grantRow({
            id: '7a0a2f52-9c6e-4c31-9d47-1a2b3c4d5e00',
            created_by: null,
            revoked_at: '2026-11-19T09:00:00.000Z',
          }),
        ],
      }),
    [`GET /items/cms_preview_grants/${GRANT_ID}`]: () =>
      json({ data: revokeRow() }),
    [`PATCH /items/cms_preview_grants/${GRANT_ID}`]: () =>
      json({ data: { id: GRANT_ID } }),
  };
}

/* ------------------------------------------------------------ Requests */

const pageCtx = (id = PAGE_ID) => ({ params: Promise.resolve({ id }) });

const listRequest = (id = PAGE_ID) =>
  listGrants(
    new Request(`${SITE}/api/cms/pages/${id}/preview-grants`),
    pageCtx(id),
  );

const createRequest = (body: unknown = {}, origin = SITE) =>
  createGrant(
    new Request(`${SITE}/api/cms/pages/${PAGE_ID}/preview-grants`, {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    pageCtx(),
  );

const revokeRequest = (grantId = GRANT_ID, origin = SITE) =>
  revokeGrant(
    new Request(`${SITE}/api/cms/preview-grants/${grantId}`, {
      method: 'DELETE',
      headers: { origin },
    }),
    { params: Promise.resolve({ grantId }) },
  );

const tokenOf = (url: string) => url.replace(/^\/preview\//, '');

beforeEach(() => {
  process.env.DIRECTUS_URL = 'https://directus.test';
  process.env.DIRECTUS_READ_TOKEN = 'read-token';
  process.env.CMS_REVALIDATE_SECRET = 'secret';
  process.env.CMS_EDITING_ENABLED = 'true';
  resetCmsEnvForTests();
  resetSessionStateForTests();
  resetRateLimitsForTests();
  jest.mocked(logInfo).mockClear();
  jest.mocked(logWarn).mockClear();
  jest.mocked(logError).mockClear();

  mockJar.clear();
  mockJar.set(CMS_ACCESS_COOKIE, AT);
  isAdmin = false;
  memberships = [
    { role: 'editor', deptId: RT_DEPT, deptSlug: 'research-and-technology' },
  ];
  routes = defaultRoutes();
  fetchCalls = [];
  fetchMock.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
});

/* ---------------------------------------------------------------- Create */

describe('POST /api/cms/pages/:id/preview-grants', () => {
  it('returns a one-time /preview/{token} URL and stores only its SHA-256', async () => {
    const res = await createRequest();
    expect(res.status).toBe(201);
    expect(res.headers.get('cache-control')).toBe('no-store');

    const body = await res.json();
    expect(body.url).toMatch(/^\/preview\/[A-Za-z0-9_-]{43}$/);
    const token = tokenOf(body.url);
    expect(Buffer.from(token, 'base64url')).toHaveLength(32);

    const insert = callsTo('POST /items/cms_preview_grants')[0];
    expect(insert?.auth).toBe(AT);
    const sent = bodyOf(insert);
    expect(sent.token_hash).toBe(
      createHash('sha256').update(token).digest('hex'),
    );
    expect(Object.keys(sent).sort()).toEqual([
      'expires_at',
      'page',
      'revision',
      'token_hash',
    ]);
    expect(String(insert?.init.body)).not.toContain(token);
    expect(body.grant).not.toHaveProperty('token_hash');
  });

  it('defaults to a 72 hour expiry', async () => {
    const before = Date.now();
    await createRequest();
    const expires = Date.parse(
      String(bodyOf(callsTo('POST /items/cms_preview_grants')[0]).expires_at),
    );
    expect(expires).toBeGreaterThanOrEqual(before + 72 * HOUR_MS);
    expect(expires).toBeLessThanOrEqual(Date.now() + 72 * HOUR_MS);
  });

  it('accepts a shorter ttl', async () => {
    const before = Date.now();
    await createRequest({ ttlHours: 1 });
    const expires = Date.parse(
      String(bodyOf(callsTo('POST /items/cms_preview_grants')[0]).expires_at),
    );
    expect(expires).toBeGreaterThanOrEqual(before + HOUR_MS);
    expect(expires).toBeLessThanOrEqual(Date.now() + HOUR_MS);
  });

  it('rejects a ttl above 72 hours', async () => {
    const res = await createRequest({ ttlHours: 73 });
    expect(res.status).toBe(422);
    expect(callsTo('POST /items/cms_preview_grants')).toHaveLength(0);
  });

  it('reuses the latest revision when the working copy is unchanged', async () => {
    // Same content, different key order: still unchanged.
    routes['GET /items/cms_page_revisions'] = () =>
      json({
        data: [
          {
            ...Object.fromEntries(Object.entries(revisionRow()).reverse()),
            blocks: [
              {
                props: { align: 'center', title: 'Bluecamp' },
                id: HERO_ID,
                version: 1,
                type: 'hero',
              },
            ],
          },
        ],
      });
    const res = await createRequest();
    expect(res.status).toBe(201);
    expect(callsTo('POST /items/cms_page_revisions')).toHaveLength(0);
    expect(bodyOf(callsTo('POST /items/cms_preview_grants')[0]).revision).toBe(
      REVISION_ID,
    );
  });

  it('snapshots the working copy when it changed since the last revision', async () => {
    routes[`GET /items/cms_pages/${PAGE_ID}`] = () =>
      json({ data: pageRow({ blocks: heroBlocks('Bluecamp v2') }) });
    const res = await createRequest();
    expect(res.status).toBe(201);

    const insert = callsTo('POST /items/cms_page_revisions')[0];
    expect(insert?.auth).toBe(AT);
    expect(bodyOf(insert)).toEqual({
      page: PAGE_ID,
      revision_number: 4,
      ...content({ blocks: heroBlocks('Bluecamp v2') }),
      blocks_schema_version: 1,
      change_note: null,
    });
    expect(bodyOf(callsTo('POST /items/cms_preview_grants')[0]).revision).toBe(
      NEW_REVISION_ID,
    );
    // The working copy is never touched.
    expect(callsTo(`PATCH /items/cms_pages/${PAGE_ID}`)).toHaveLength(0);
  });

  it('starts at revision 1 when the page has none', async () => {
    routes['GET /items/cms_page_revisions'] = () => json({ data: [] });
    await createRequest();
    expect(
      bodyOf(callsTo('POST /items/cms_page_revisions')[0]).revision_number,
    ).toBe(1);
  });

  it('retries once when a concurrent mint took the revision number', async () => {
    let reads = 0;
    routes['GET /items/cms_page_revisions'] = () => {
      reads += 1;
      return json({
        data: [revisionRow({ revision_number: 2 + reads, title: 'old' })],
      });
    };
    let inserts = 0;
    routes['POST /items/cms_page_revisions'] = () => {
      inserts += 1;
      return inserts === 1
        ? directusError(400, 'RECORD_NOT_UNIQUE')
        : json({ data: { id: NEW_REVISION_ID } });
    };
    const res = await createRequest();
    expect(res.status).toBe(201);
    expect(
      callsTo('POST /items/cms_page_revisions').map(
        (c) => bodyOf(c).revision_number,
      ),
    ).toEqual([4, 5]);
  });

  it('409s when the revision number races twice', async () => {
    routes['GET /items/cms_page_revisions'] = () =>
      json({ data: [revisionRow({ title: 'old' })] });
    routes['POST /items/cms_page_revisions'] = () =>
      directusError(400, 'RECORD_NOT_UNIQUE');
    const res = await createRequest();
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('duplicate');
    expect(callsTo('POST /items/cms_preview_grants')).toHaveLength(0);
  });

  it('422s when the working copy has an invalid block', async () => {
    routes[`GET /items/cms_pages/${PAGE_ID}`] = () =>
      json({
        data: pageRow({
          blocks: [...heroBlocks(), { type: 'marquee', version: 1, id: 'x' }],
        }),
      });
    const res = await createRequest();
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('invalid_blocks');
    expect(body.error.invalidBlocks).toHaveLength(1);
    expect(callsTo('POST /items/cms_page_revisions')).toHaveLength(0);
  });

  it('409s for an archived page', async () => {
    routes[`GET /items/cms_pages/${PAGE_ID}`] = () =>
      json({ data: pageRow({ status: 'archived' }) });
    const res = await createRequest();
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('invalid_transition');
  });

  it('allows reviewers and publishers', async () => {
    for (const role of ['reviewer', 'publisher']) {
      memberships = [
        { role, deptId: RT_DEPT, deptSlug: 'research-and-technology' },
      ];
      resetSessionStateForTests();
      const res = await createRequest();
      expect(res.status).toBe(201);
    }
  });

  it('404s for a user outside the page department', async () => {
    memberships = [
      { role: 'editor', deptId: IA_DEPT, deptSlug: 'internal-affairs' },
    ];
    const res = await createRequest();
    expect(res.status).toBe(404);
  });

  it('404s when Directus hides the page', async () => {
    routes[`GET /items/cms_pages/${PAGE_ID}`] = () => directusError(403);
    const res = await createRequest();
    expect(res.status).toBe(404);
  });

  it('never logs the token or the URL', async () => {
    const res = await createRequest();
    const token = tokenOf((await res.json()).url);
    const logged = JSON.stringify([
      jest.mocked(logInfo).mock.calls,
      jest.mocked(logWarn).mock.calls,
      jest.mocked(logError).mock.calls,
    ]);
    expect(jest.mocked(logInfo)).toHaveBeenCalled();
    expect(logged).not.toContain(token);
  });

  it('rate-limits after 20 mints per hour', async () => {
    for (let i = 0; i < 20; i += 1) {
      expect((await createRequest()).status).toBe(201);
    }
    const res = await createRequest();
    expect(res.status).toBe(429);
    expect((await res.json()).error.code).toBe('rate_limited');
  });

  it('rejects a cross-origin request', async () => {
    const res = await createRequest({}, 'https://evil.test');
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('bad_origin');
  });

  it('is blocked when editing is disabled', async () => {
    process.env.CMS_EDITING_ENABLED = 'false';
    resetCmsEnvForTests();
    const res = await createRequest();
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('editing_disabled');
  });
});

/* ------------------------------------------------------------------ List */

describe('GET /api/cms/pages/:id/preview-grants', () => {
  it('lists grants with the user token and without the hash', async () => {
    const res = await listRequest();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items).toHaveLength(2);
    expect(body.items[0]).toEqual({
      id: GRANT_ID,
      pageId: PAGE_ID,
      revisionId: REVISION_ID,
      createdById: USER_ID,
      createdAt: '2026-11-20T08:00:00.000Z',
      expiresAt: '2026-11-23T08:00:00.000Z',
      revokedAt: null,
    });
    expect(body.items[1].revokedAt).toBe('2026-11-19T09:00:00.000Z');

    const call = callsTo('GET /items/cms_preview_grants')[0];
    expect(call?.auth).toBe(AT);
    expect(call?.url.searchParams.get('fields')).not.toContain('token_hash');
    expect(JSON.parse(call?.url.searchParams.get('filter') ?? 'null')).toEqual({
      page: { _eq: PAGE_ID },
    });
  });

  it('404s for a user outside the page department', async () => {
    memberships = [
      { role: 'editor', deptId: IA_DEPT, deptSlug: 'internal-affairs' },
    ];
    const res = await listRequest();
    expect(res.status).toBe(404);
    expect(callsTo('GET /items/cms_preview_grants')).toHaveLength(0);
  });
});

/* ---------------------------------------------------------------- Revoke */

describe('DELETE /api/cms/preview-grants/:grantId', () => {
  it('lets the creator revoke, setting revoked_at and revoked_by together', async () => {
    const res = await revokeRequest();
    expect(res.status).toBe(204);
    const patch = callsTo(`PATCH /items/cms_preview_grants/${GRANT_ID}`)[0];
    expect(patch?.auth).toBe(AT);
    const sent = bodyOf(patch);
    expect(Object.keys(sent).sort()).toEqual(['revoked_at', 'revoked_by']);
    expect(sent.revoked_by).toBe(USER_ID);
    expect(Number.isNaN(Date.parse(String(sent.revoked_at)))).toBe(false);
  });

  it('lets a publisher of the department revoke another user’s grant', async () => {
    memberships = [
      {
        role: 'publisher',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];
    routes[`GET /items/cms_preview_grants/${GRANT_ID}`] = () =>
      json({ data: revokeRow({ created_by: OTHER_USER_ID }) });
    const res = await revokeRequest();
    expect(res.status).toBe(204);
  });

  it('lets an admin revoke', async () => {
    isAdmin = true;
    memberships = [];
    routes[`GET /items/cms_preview_grants/${GRANT_ID}`] = () =>
      json({ data: revokeRow({ created_by: OTHER_USER_ID }) });
    expect((await revokeRequest()).status).toBe(204);
  });

  it('403s for an editor who did not create the grant', async () => {
    routes[`GET /items/cms_preview_grants/${GRANT_ID}`] = () =>
      json({ data: revokeRow({ created_by: OTHER_USER_ID }) });
    const res = await revokeRequest();
    expect(res.status).toBe(403);
    expect(callsTo(`PATCH /items/cms_preview_grants/${GRANT_ID}`)).toHaveLength(
      0,
    );
  });

  it('403s for a reviewer who did not create the grant', async () => {
    memberships = [
      {
        role: 'reviewer',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];
    routes[`GET /items/cms_preview_grants/${GRANT_ID}`] = () =>
      json({ data: revokeRow({ created_by: null }) });
    expect((await revokeRequest()).status).toBe(403);
  });

  it('is a no-op for an already revoked grant', async () => {
    routes[`GET /items/cms_preview_grants/${GRANT_ID}`] = () =>
      json({ data: revokeRow({ revoked_at: '2026-11-19T09:00:00.000Z' }) });
    const res = await revokeRequest();
    expect(res.status).toBe(204);
    expect(callsTo(`PATCH /items/cms_preview_grants/${GRANT_ID}`)).toHaveLength(
      0,
    );
  });

  it('404s for an unknown or hidden grant', async () => {
    routes[`GET /items/cms_preview_grants/${GRANT_ID}`] = () =>
      directusError(403);
    expect((await revokeRequest()).status).toBe(404);
  });

  it('404s for a user outside the page department', async () => {
    memberships = [
      { role: 'publisher', deptId: IA_DEPT, deptSlug: 'internal-affairs' },
    ];
    expect((await revokeRequest()).status).toBe(404);
  });

  it('rejects a cross-origin request', async () => {
    const res = await revokeRequest(GRANT_ID, 'https://evil.test');
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('bad_origin');
  });
});
