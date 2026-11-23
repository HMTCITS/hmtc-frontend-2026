/**
 * Route tests for PATCH /api/cms/pages/:id (save draft).
 *
 * Handlers run through the real `defineCmsRoute` pipeline; Directus is the
 * in-memory routing below.
 *
 * `jest.mock()` paths are relative: the SWC transform rewrites `@/` in imports
 * but not in mock specifiers.
 *
 * @jest-environment node
 */
import { PATCH } from '@cms-page-routes/route';

import { resetCmsEnvForTests } from '@/lib/directus/env';
import {
  CMS_ACCESS_COOKIE,
  resetSessionStateForTests,
} from '@/lib/directus/session';

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
const BLUECAMP = 'faf07ffb-76be-4a4f-b897-4e970dc99e00';
const PAGE_ID = '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e02';

type Membership = { role: string; deptId: string; deptSlug: string };
let memberships: Membership[];
let isAdmin: boolean;
let currentRow: Record<string, unknown>;

/** Replace the Directus row returned by `GET /items/cms_pages/:id`. */
function setPageRow(overrides: Record<string, unknown> = {}): void {
  currentRow = pageRow(overrides);
}

/** Directus row for the page. `status` and `date_updated` are overridable. */
const pageRow = (overrides: Record<string, unknown> = {}) => ({
  id: PAGE_ID,
  title: 'Bluecamp 2026',
  slug: 'bluecamp',
  page_type: 'event',
  status: 'in_review',
  department: { id: RT_DEPT, slug: 'research-and-technology' },
  proker: { id: BLUECAMP, slug: 'bluecamp' },
  edition_year: 2026,
  published_revision: null,
  published_at: null,
  date_created: '2026-11-01T08:00:00.000Z',
  date_updated: '2026-11-09T10:12:00.000Z',
  blocks: [],
  excerpt: null,
  featured_image: null,
  seo_title: null,
  seo_description: null,
  template: null,
  current_revision: null,
  ...overrides,
});

const reviewEvents = () => [
  {
    id: 2,
    action: 'submitted',
    from_status: 'draft',
    to_status: 'in_review',
    comment: null,
    actor: OTHER_USER_ID,
    date_created: '2026-11-09T10:12:00.000Z',
  },
];

/* ------------------------------------------------------- Fetch routing */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

type Call = { key: string; url: URL; init: RequestInit; auth?: string };
let routes: Record<string, Handler>;
let fetchCalls: Call[];
type Handler = (call: Call) => Response;

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
const patchCalls = () => callsTo(`PATCH /items/cms_pages/${PAGE_ID}`);
const eventCalls = () => callsTo('POST /items/cms_review_events');

let postedEvents: Array<Record<string, unknown>> = [];

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
    [`GET /items/cms_pages/${PAGE_ID}`]: () => json({ data: currentRow }),
    'GET /items/cms_review_events': () =>
      json({ data: [...postedEvents, ...reviewEvents()] }),
    [`PATCH /items/cms_pages/${PAGE_ID}`]: (call) => {
      const body = JSON.parse(String(call.init.body)) as Record<
        string,
        unknown
      >;
      currentRow = {
        ...currentRow,
        ...body,
        date_updated: '2026-11-10T08:00:00.000Z',
      };
      return json({ data: { id: PAGE_ID } });
    },
    'POST /items/cms_review_events': (call) => {
      const body = JSON.parse(String(call.init.body)) as Record<
        string,
        unknown
      >;
      postedEvents.push({
        id: 100 + postedEvents.length,
        action: body.action,
        from_status: body.from_status,
        to_status: body.to_status,
        comment: body.comment ?? null,
        actor: USER_ID,
        date_created: '2026-11-10T08:00:00.000Z',
      });
      return json({ data: { id: 100 + postedEvents.length - 1 } });
    },
  };
}

/* ------------------------------------------------------------ Requests */

const saveRequest = (body: unknown, origin = SITE) =>
  PATCH(
    new Request(`${SITE}/api/cms/pages/${PAGE_ID}`, {
      method: 'PATCH',
      headers: { origin, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: PAGE_ID }) },
  );

const UPDATED_AT = '2026-11-09T10:12:00.000Z';

beforeEach(() => {
  process.env.DIRECTUS_URL = 'https://directus.test';
  process.env.DIRECTUS_READ_TOKEN = 'read-token';
  process.env.CMS_REVALIDATE_SECRET = 'secret';
  process.env.CMS_EDITING_ENABLED = 'true';
  resetCmsEnvForTests();
  resetSessionStateForTests();

  mockJar.clear();
  mockJar.set(CMS_ACCESS_COOKIE, AT);
  isAdmin = false;
  memberships = [
    { role: 'editor', deptId: RT_DEPT, deptSlug: 'research-and-technology' },
  ];
  postedEvents = [];
  setPageRow({ status: 'draft' });
  routes = defaultRoutes();
  fetchCalls = [];
  fetchMock.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

const hero = (title: string) => ({
  id: 'b0000000-0000-4000-8000-000000000001',
  type: 'hero',
  version: 1,
  props: { title, align: 'left' },
});

const patchBody = () =>
  JSON.parse(String(patchCalls()[0]!.init.body)) as Record<string, unknown>;

describe('PATCH /api/cms/pages/:id', () => {
  it('saves fields of a draft and returns the new detail', async () => {
    const res = await saveRequest({
      expectedUpdatedAt: UPDATED_AT,
      title: 'Bluecamp 2026 baru',
      seoTitle: 'SEO',
    });
    expect(res.status).toBe(200);
    expect(patchBody()).toEqual({
      title: 'Bluecamp 2026 baru',
      seo_title: 'SEO',
    });
    const { page } = (await res.json()) as {
      page: { title: string; status: string; updatedAt: string };
    };
    expect(page.title).toBe('Bluecamp 2026 baru');
    expect(page.status).toBe('draft');
    expect(page.updatedAt).toBe('2026-11-10T08:00:00.000Z');
    expect(eventCalls()).toHaveLength(0);
  });

  it('moves a published working copy to draft without touching the live revision', async () => {
    const REV = 'e0000000-0000-4000-8000-000000000001';
    setPageRow({ status: 'published', published_revision: REV });
    const res = await saveRequest({
      expectedUpdatedAt: UPDATED_AT,
      title: 'x',
    });
    expect(res.status).toBe(200);
    const sent = patchBody();
    expect(sent.status).toBe('draft');
    expect(sent).not.toHaveProperty('published_revision');
    expect(sent).not.toHaveProperty('published_at');
    const { page } = (await res.json()) as {
      page: { status: string; isLive: boolean; publishedRevisionId: string };
    };
    expect(page.status).toBe('draft');
    expect(page.isLive).toBe(true);
    expect(page.publishedRevisionId).toBe(REV);
  });

  it('keeps changes_requested as is', async () => {
    setPageRow({ status: 'changes_requested' });
    await saveRequest({ expectedUpdatedAt: UPDATED_AT, title: 'x' });
    expect(patchBody()).not.toHaveProperty('status');
  });

  it('saves valid blocks', async () => {
    const res = await saveRequest({
      expectedUpdatedAt: UPDATED_AT,
      blocks: [hero('Halo')],
    });
    expect(res.status).toBe(200);
    expect(patchBody().blocks).toEqual([hero('Halo')]);
  });

  it('rejects invalid blocks with 422 invalid_blocks and writes nothing', async () => {
    const res = await saveRequest({
      expectedUpdatedAt: UPDATED_AT,
      blocks: [hero('ok'), { type: 'nope' }],
    });
    expect(res.status).toBe(422);
    const { error } = (await res.json()) as {
      error: {
        code: string;
        invalidBlocks: Array<{ index: number; type: string | null }>;
      };
    };
    expect(error.code).toBe('invalid_blocks');
    expect(error.invalidBlocks.map((b) => b.index)).toContain(1);
    expect(error.invalidBlocks.find((b) => b.index === 1)?.type).toBe('nope');
    expect(patchCalls()).toHaveLength(0);
  });

  it('rejects a stale expectedUpdatedAt with 409 stale_write', async () => {
    const res = await saveRequest({
      expectedUpdatedAt: '2026-11-01T00:00:00.000Z',
      title: 'x',
    });
    expect(res.status).toBe(409);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe(
      'stale_write',
    );
    expect(patchCalls()).toHaveLength(0);
  });

  it('returns 403 editing_disabled when CMS_EDITING_ENABLED=false', async () => {
    process.env.CMS_EDITING_ENABLED = 'false';
    resetCmsEnvForTests();
    const res = await saveRequest({
      expectedUpdatedAt: UPDATED_AT,
      title: 'x',
    });
    expect(res.status).toBe(403);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe(
      'editing_disabled',
    );
    expect(fetchCalls).toHaveLength(0);
  });

  it('rejects in_review with 409 invalid_transition', async () => {
    setPageRow({ status: 'in_review' });
    const res = await saveRequest({
      expectedUpdatedAt: UPDATED_AT,
      title: 'x',
    });
    expect(res.status).toBe(409);
    expect(patchCalls()).toHaveLength(0);
  });

  it('rejects a reviewer with 403', async () => {
    memberships = [
      {
        role: 'reviewer',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];
    const res = await saveRequest({
      expectedUpdatedAt: UPDATED_AT,
      title: 'x',
    });
    expect(res.status).toBe(403);
    expect(patchCalls()).toHaveLength(0);
  });

  it('rejects a cross-origin request with 403 bad_origin', async () => {
    const res = await saveRequest(
      { expectedUpdatedAt: UPDATED_AT, title: 'x' },
      'https://evil.example',
    );
    expect(res.status).toBe(403);
    expect(fetchCalls).toHaveLength(0);
  });
});
