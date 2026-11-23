/**
 * Route tests for GET/POST /api/cms/pages and GET /api/cms/pages/:id.
 *
 * Handlers run through the real `defineCmsRoute` pipeline, so success bodies
 * are also checked against the contract's response schema. `next/headers` is
 * an in-memory cookie jar; `fetch` is routed by "METHOD /directus/path" and
 * every request is recorded so tests can assert which token and filters were
 * sent to Directus.
 *
 * `jest.mock()` paths are relative: the SWC transform rewrites `@/` in
 * imports but not in mock specifiers.
 *
 * @jest-environment node
 */
import { resetCmsEnvForTests } from '@/lib/directus/env';
import {
  CMS_ACCESS_COOKIE,
  resetSessionStateForTests,
} from '@/lib/directus/session';

import { GET as getPage } from '../[id]/route';
import { GET as listPages, POST as createPage } from '../route';

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
const SW_DEPT = 'ccbbc8b8-f2da-41c0-8ddf-e0591f968dca';
const BLUECAMP = 'faf07ffb-76be-4a4f-b897-4e970dc99e00';
const PAGE_ID = '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e02';
const NEW_PAGE_ID = '5f0a2f52-9c6e-4c31-9d47-1a2b3c4d5e99';
const REVISION_ID = '6a0a2f52-9c6e-4c31-9d47-1a2b3c4d5e01';
const HERO_ID = '8b0a2f52-9c6e-4c31-9d47-1a2b3c4d5e01';

type Membership = { role: string; deptId: string; deptSlug: string };
let memberships: Membership[];
let isAdmin: boolean;

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
  blocks: [
    {
      type: 'hero',
      version: 1,
      id: HERO_ID,
      props: { title: 'Bluecamp', align: 'center' },
    },
    { type: 'marquee', version: 1, id: 'x', props: {} },
  ],
  excerpt: null,
  featured_image: null,
  seo_title: null,
  seo_description: null,
  template: null,
  current_revision: REVISION_ID,
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
  {
    id: 1,
    action: 'submitted',
    from_status: 'draft',
    to_status: 'in_review',
    comment: 'awal',
    actor: USER_ID,
    date_created: '2026-11-05T10:00:00.000Z',
  },
  // Legacy row without an actor: skipped, not fatal.
  {
    id: 0,
    action: 'submitted',
    from_status: null,
    to_status: 'in_review',
    comment: null,
    actor: null,
    date_created: '2026-11-01T10:00:00.000Z',
  },
];

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

const filterOf = (call: Call): unknown =>
  JSON.parse(call.url.searchParams.get('filter') ?? 'null');
const callsTo = (key: string) => fetchCalls.filter((c) => c.key === key);

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
    'GET /items/cms_pages': (call) =>
      call.url.searchParams.get('fields') === 'id'
        ? json({ data: [] }) // duplicate check
        : json({ data: [pageRow()], meta: { filter_count: 7 } }),
    [`GET /items/cms_pages/${PAGE_ID}`]: () => json({ data: pageRow() }),
    'GET /items/cms_review_events': () => json({ data: reviewEvents() }),
    [`GET /items/cms_prokers/${BLUECAMP}`]: () =>
      json({
        data: {
          id: BLUECAMP,
          slug: 'bluecamp',
          is_active: true,
          department: { id: RT_DEPT, slug: 'research-and-technology' },
        },
      }),
    'POST /items/cms_pages': () => json({ data: { id: NEW_PAGE_ID } }),
    [`GET /items/cms_pages/${NEW_PAGE_ID}`]: () => {
      const created = callsTo('POST /items/cms_pages')[0];
      const body = JSON.parse(String(created?.init.body));
      return json({
        data: pageRow({
          id: NEW_PAGE_ID,
          status: 'draft',
          title: body.title,
          blocks: body.blocks,
          template: body.template,
          current_revision: null,
          date_updated: null,
        }),
      });
    },
  };
}

/* ------------------------------------------------------------ Requests */

const listRequest = (qs = '') =>
  listPages(new Request(`${SITE}/api/cms/pages${qs}`));

const getRequest = (id: string) =>
  getPage(new Request(`${SITE}/api/cms/pages/${id}`), {
    params: Promise.resolve({ id }),
  });

const createRequest = (body: unknown) =>
  createPage(
    new Request(`${SITE}/api/cms/pages`, {
      method: 'POST',
      headers: { origin: SITE, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

const createBody = {
  prokerId: BLUECAMP,
  editionYear: 2026,
  title: 'Bluecamp 2026',
  pageType: 'event',
};

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
    { role: 'publisher', deptId: SW_DEPT, deptSlug: 'student-welfare' },
    {
      role: 'template_maintainer',
      deptId: IA_DEPT,
      deptSlug: 'internal-affairs',
    },
  ];
  routes = defaultRoutes();
  fetchCalls = [];
  fetchMock.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
});

/* ------------------------------------------------------------------ List */

describe('GET /api/cms/pages', () => {
  it('lists only departments the user may read, with the user token', async () => {
    const res = await listRequest('?status=in_review&q=blue');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total).toBe(7);
    expect(body.items).toEqual([
      expect.objectContaining({
        id: PAGE_ID,
        isLive: false,
        updatedAt: '2026-11-09T10:12:00.000Z',
        path: '/research-and-technology/bluecamp/2026',
      }),
    ]);

    const [call] = callsTo('GET /items/cms_pages');
    expect(call?.auth).toBe(AT);
    expect(filterOf(call!)).toEqual({
      _and: [
        { department: { _in: [RT_DEPT, SW_DEPT] } }, // not template_maintainer
        { status: { _eq: 'in_review' } },
        { title: { _icontains: 'blue' } },
      ],
    });
    expect(call?.url.searchParams.get('limit')).toBe('25');
    expect(call?.url.searchParams.get('page')).toBe('1');
  });

  it('returns nothing for a department the user may not read', async () => {
    const res = await listRequest(`?departmentId=${IA_DEPT}`);
    expect(await res.json()).toEqual({ items: [], total: 0 });
    expect(callsTo('GET /items/cms_pages')).toHaveLength(0);
  });

  it('narrows to a readable department filter', async () => {
    await listRequest(`?departmentId=${SW_DEPT}`);
    expect(filterOf(callsTo('GET /items/cms_pages')[0]!)).toEqual({
      _and: [{ department: { _in: [SW_DEPT] } }],
    });
  });

  it('does not filter by department for admins', async () => {
    isAdmin = true;
    await listRequest();
    expect(filterOf(callsTo('GET /items/cms_pages')[0]!)).toBeNull();
  });

  it('requires a session', async () => {
    mockJar.clear();
    const res = await listRequest();
    expect(res.status).toBe(401);
  });
});

/* ------------------------------------------------------------------- Get */

describe('GET /api/cms/pages/:id', () => {
  it('returns the full page detail', async () => {
    const res = await getRequest(PAGE_ID);
    expect(res.status).toBe(200);
    const { page } = await res.json();

    expect(page.blocks).toHaveLength(1);
    expect(page.invalidBlocks).toEqual([
      expect.objectContaining({ index: 1, type: 'marquee' }),
    ]);
    expect(page.currentRevisionId).toBe(REVISION_ID);
    expect(page.history.map((e: { id: number }) => e.id)).toEqual([2, 1]);
    expect(page.history[0].actorName).toBe('Anggota CMS');
    expect(page.history[1].actorName).toBe('Local Editor');
    expect(page.lastSubmission).toEqual({
      actorId: OTHER_USER_ID,
      at: '2026-11-09T10:12:00.000Z',
    });
    // Editor on an in_review page: only previews.
    expect(page.allowedActions).toEqual(['create_preview']);
    expect(filterOf(callsTo('GET /items/cms_review_events')[0]!)).toEqual({
      page: { _eq: PAGE_ID },
    });
  });

  it('404s when Directus hides the page', async () => {
    routes[`GET /items/cms_pages/${PAGE_ID}`] = () => directusError(403);
    const res = await getRequest(PAGE_ID);
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('not_found');
  });

  it('404s when the user has no read role in the page department', async () => {
    routes[`GET /items/cms_pages/${PAGE_ID}`] = () =>
      json({
        data: pageRow({
          department: { id: IA_DEPT, slug: 'internal-affairs' },
        }),
      });
    const res = await getRequest(PAGE_ID);
    expect(res.status).toBe(404);
    expect(callsTo('GET /items/cms_review_events')).toHaveLength(0);
  });

  it('rejects a non-uuid id', async () => {
    const res = await getRequest('not-a-uuid');
    expect(res.status).toBe(422);
  });
});

/* ---------------------------------------------------------------- Create */

describe('POST /api/cms/pages', () => {
  it('creates a draft from the proker with one hero, using the user token', async () => {
    const res = await createRequest(createBody);
    expect(res.status).toBe(201);
    const { page } = await res.json();
    expect(page.id).toBe(NEW_PAGE_ID);
    expect(page.status).toBe('draft');

    const [post] = callsTo('POST /items/cms_pages');
    expect(post?.auth).toBe(AT);
    const sent = JSON.parse(String(post?.init.body));
    expect(sent).toEqual({
      title: 'Bluecamp 2026',
      slug: 'bluecamp',
      page_type: 'event',
      department: RT_DEPT,
      proker: BLUECAMP,
      edition_year: 2026,
      blocks: [
        expect.objectContaining({
          type: 'hero',
          props: { title: 'Bluecamp 2026', align: 'center' },
        }),
      ],
      template: null,
      status: 'draft',
    });
  });

  it('copies blocks from a usable template', async () => {
    routes['GET /items/cms_templates'] = () =>
      json({
        data: [
          {
            id: 3,
            department: null,
            is_global: true,
            blocks: [
              {
                type: 'hero',
                version: 1,
                id: 'tpl-hero',
                props: { title: 'Template', align: 'left' },
              },
              {
                type: 'divider',
                version: 1,
                id: 'tpl-div',
                props: { spacing: 'md' },
              },
            ],
          },
        ],
      });
    const res = await createRequest({ ...createBody, templateId: 3 });
    expect(res.status).toBe(201);

    const sent = JSON.parse(
      String(callsTo('POST /items/cms_pages')[0]?.init.body),
    );
    expect(sent.template).toBe(3);
    expect(sent.blocks.map((b: { id: string }) => b.id)).toEqual([
      'tpl-hero',
      'tpl-div',
    ]);
    expect(filterOf(callsTo('GET /items/cms_templates')[0]!)).toEqual({
      _and: [{ id: { _eq: 3 } }, { status: { _eq: 'published' } }],
    });
  });

  it('rejects a template from another department', async () => {
    routes['GET /items/cms_templates'] = () =>
      json({
        data: [{ id: 3, department: IA_DEPT, is_global: false, blocks: [] }],
      });
    const res = await createRequest({ ...createBody, templateId: 3 });
    expect(res.status).toBe(422);
    expect((await res.json()).error.issues).toEqual([
      { path: 'templateId', message: expect.any(String) },
    ]);
    expect(callsTo('POST /items/cms_pages')).toHaveLength(0);
  });

  it('409s when a page already exists for (proker, year)', async () => {
    routes['GET /items/cms_pages'] = () => json({ data: [{ id: PAGE_ID }] });
    const res = await createRequest(createBody);
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('duplicate');
    expect(filterOf(callsTo('GET /items/cms_pages')[0]!)).toEqual({
      _and: [{ proker: { _eq: BLUECAMP } }, { edition_year: { _eq: 2026 } }],
    });
    expect(callsTo('POST /items/cms_pages')).toHaveLength(0);
  });

  it('409s when the unique index catches a concurrent create', async () => {
    routes['POST /items/cms_pages'] = () =>
      directusError(400, 'RECORD_NOT_UNIQUE');
    const res = await createRequest(createBody);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error.code).toBe('duplicate');
    expect(JSON.stringify(body)).not.toContain('raw sql');
  });

  it('403s when the user is not an editor of the proker department', async () => {
    memberships = [
      {
        role: 'publisher',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];
    const res = await createRequest(createBody);
    expect(res.status).toBe(403);
    expect(callsTo('POST /items/cms_pages')).toHaveLength(0);
  });

  it('422s for an unknown proker', async () => {
    routes[`GET /items/cms_prokers/${BLUECAMP}`] = () => directusError(403);
    const res = await createRequest(createBody);
    expect(res.status).toBe(422);
    expect((await res.json()).error.issues[0].path).toBe('prokerId');
  });

  it('rejects a cross-origin request', async () => {
    const res = await createPage(
      new Request(`${SITE}/api/cms/pages`, {
        method: 'POST',
        headers: {
          origin: 'https://evil.test',
          'content-type': 'application/json',
        },
        body: JSON.stringify(createBody),
      }),
    );
    expect(res.status).toBe(403);
    expect(fetchCalls).toHaveLength(0);
  });
});
