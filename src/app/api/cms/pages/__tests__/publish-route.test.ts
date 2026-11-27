/**
 * Route tests for POST /api/cms/pages/:id/publish.
 *
 * Handlers run through the real `defineCmsRoute` pipeline (Origin check, body
 * validation, response-schema check in test mode). `requireSession` exercises
 * the real session flow against the in-memory Directus routing below.
 *
 * `jest.mock()` paths are relative: the SWC transform rewrites `@/` in imports
 * but not in mock specifiers.
 *
 * @jest-environment node
 */
import { POST as publish } from '@cms-page-routes/publish/route';
import { revalidateTag } from 'next/cache';

import { createBlock } from '@/lib/directus/blocks';
import { resetCmsEnvForTests } from '@/lib/directus/env';
import { logError } from '@/lib/directus/logger';
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

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }));

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
const REV_ID = '6a0b3c63-0d7f-4d42-8e58-2b3c4d5e6f03';

type Membership = { role: string; deptId: string; deptSlug: string };
let memberships: Membership[];
let isAdmin: boolean;
let currentRow: Record<string, unknown>;
let latestRevision: number | null;

/** Replace the Directus row returned by `GET /items/cms_pages/:id`. */
function setPageRow(overrides: Record<string, unknown> = {}): void {
  currentRow = pageRow(overrides);
}

function validHero() {
  const block = createBlock('hero');
  return { ...block, props: { ...block.props, title: 'Bluecamp 2026' } };
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
  blocks: [validHero()],
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
const revisionCalls = () => callsTo('POST /items/cms_page_revisions');
const writeKeys = () =>
  fetchCalls
    .filter((c) => c.key.startsWith('POST') || c.key.startsWith('PATCH'))
    .map((c) => c.key);

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
    'GET /items/cms_page_revisions': () =>
      json({
        data:
          latestRevision === null ? [] : [{ revision_number: latestRevision }],
      }),
    'POST /items/cms_page_revisions': () => json({ data: { id: REV_ID } }),
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

const publishRequest = (body: unknown) =>
  publish(
    new Request(`${SITE}/api/cms/pages/${PAGE_ID}/publish`, {
      method: 'POST',
      headers: { origin: SITE, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: PAGE_ID }) },
  );

const directusError = (status: number, code: string) => () =>
  json({ errors: [{ message: 'nope', extensions: { code } }] }, status);

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
    { role: 'publisher', deptId: RT_DEPT, deptSlug: 'research-and-technology' },
  ];
  latestRevision = null;
  jest.mocked(revalidateTag).mockClear();
  postedEvents = [];
  setPageRow();
  routes = defaultRoutes();
  fetchCalls = [];
  fetchMock.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

/* -------------------------------------------------------------- Publish */

type ErrorBody = { error: { code: string; invalidBlocks?: unknown[] } };
const BODY = { expectedUpdatedAt: UPDATED_AT, changeNote: 'rilis pertama' };

const PUBLIC_TAGS = [
  'cms:page:research-and-technology/bluecamp/2026',
  `cms:page-id:${PAGE_ID}`,
  'cms:routes',
];

function expectPublicPageUntouched(): void {
  expect(patchCalls()).toHaveLength(0);
  expect(eventCalls()).toHaveLength(0);
  expect(revalidateTag).not.toHaveBeenCalled();
}

describe('POST /api/cms/pages/:id/publish', () => {
  it('snapshots, points published_revision at it, writes the event, then revalidates', async () => {
    const res = await publishRequest(BODY);

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      page: { status: string; isLive: boolean; publishedRevisionId: string };
    };
    expect(body.page.status).toBe('published');
    expect(body.page.isLive).toBe(true);
    expect(body.page.publishedRevisionId).toBe(REV_ID);

    expect(writeKeys()).toEqual([
      'POST /items/cms_page_revisions',
      `PATCH /items/cms_pages/${PAGE_ID}`,
      'POST /items/cms_review_events',
    ]);

    const revision = JSON.parse(
      String(revisionCalls()[0]?.init.body),
    ) as Record<string, unknown>;
    expect(revision).toEqual(
      expect.objectContaining({
        page: PAGE_ID,
        revision_number: 1,
        title: 'Bluecamp 2026',
        blocks_schema_version: 1,
        change_note: 'rilis pertama',
      }),
    );
    expect(revision.author).toBeUndefined();

    const patch = JSON.parse(String(patchCalls()[0]?.init.body)) as Record<
      string,
      unknown
    >;
    expect(Object.keys(patch).sort()).toEqual([
      'published_at',
      'published_by',
      'published_revision',
      'status',
    ]);
    expect(patch).toEqual(
      expect.objectContaining({
        published_revision: REV_ID,
        status: 'published',
        published_by: USER_ID,
      }),
    );

    const event = JSON.parse(String(eventCalls()[0]?.init.body)) as Record<
      string,
      unknown
    >;
    expect(event).toEqual(
      expect.objectContaining({
        page: PAGE_ID,
        action: 'approved',
        from_status: 'in_review',
        to_status: 'published',
      }),
    );
    expect(event.actor).toBeUndefined();

    for (const tag of PUBLIC_TAGS) {
      expect(revalidateTag).toHaveBeenCalledWith(tag, { expire: 0 });
    }
    expect(
      fetchCalls.every((c) => c.key.startsWith('GET /users') || c.auth === AT),
    ).toBe(true);
  });

  it('numbers the revision after the latest one', async () => {
    latestRevision = 4;
    await publishRequest(BODY);

    const revision = JSON.parse(String(revisionCalls()[0]?.init.body)) as {
      revision_number: number;
    };
    expect(revision.revision_number).toBe(5);
  });

  it('refuses the last submitter with 403 self_approval', async () => {
    postedEvents = [
      {
        id: 3,
        action: 'submitted',
        from_status: 'changes_requested',
        to_status: 'in_review',
        comment: null,
        actor: USER_ID,
        date_created: '2026-11-09T11:00:00.000Z',
      },
    ];

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('self_approval');
    expect(revisionCalls()).toHaveLength(0);
    expectPublicPageUntouched();
  });

  it('refuses self-approval for a Directus admin too', async () => {
    isAdmin = true;
    memberships = [];
    postedEvents = [
      {
        id: 3,
        action: 'submitted',
        from_status: 'draft',
        to_status: 'in_review',
        comment: null,
        actor: USER_ID,
        date_created: '2026-11-09T11:00:00.000Z',
      },
    ];

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('self_approval');
    expect(revisionCalls()).toHaveLength(0);
  });

  it("lets an admin publish someone else's submission", async () => {
    isAdmin = true;
    memberships = [];

    const res = await publishRequest(BODY);
    expect(res.status).toBe(200);
  });

  it('refuses a reviewer with 403 forbidden', async () => {
    memberships = [
      {
        role: 'reviewer',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('forbidden');
    expect(revisionCalls()).toHaveLength(0);
  });

  it('refuses a page that is not in review with 409 invalid_transition', async () => {
    setPageRow({ status: 'draft' });

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('invalid_transition');
    expect(revisionCalls()).toHaveLength(0);
  });

  it('refuses a stale expectedUpdatedAt with 409 stale_write', async () => {
    const res = await publishRequest({
      expectedUpdatedAt: '2020-01-01T00:00:00.000Z',
    });
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('stale_write');
    expect(revisionCalls()).toHaveLength(0);
  });

  it('refuses a stored block that fails validation with 422 invalid_blocks', async () => {
    setPageRow({
      blocks: [validHero(), { id: 'x', type: 'unknown', props: {} }],
    });

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(422);
    expect(body.error.code).toBe('invalid_blocks');
    expect(body.error.invalidBlocks).toHaveLength(1);
    expect(revisionCalls()).toHaveLength(0);
    expectPublicPageUntouched();
  });

  it('refuses blocks that are valid as a draft but incomplete for publishing', async () => {
    // An empty gallery is a valid draft but cannot be published.
    setPageRow({ blocks: [validHero(), createBlock('gallery')] });

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(422);
    expect(body.error.code).toBe('invalid_blocks');
    expect(revisionCalls()).toHaveLength(0);
  });

  it('leaves the public page untouched when the revision insert fails', async () => {
    routes = {
      ...defaultRoutes(),
      'POST /items/cms_page_revisions': directusError(
        503,
        'SERVICE_UNAVAILABLE',
      ),
    };

    const res = await publishRequest(BODY);

    expect(res.status).toBeGreaterThanOrEqual(500);
    expectPublicPageUntouched();
  });

  it('maps a revision-number conflict (concurrent publish) to 409 stale_write', async () => {
    routes = {
      ...defaultRoutes(),
      'POST /items/cms_page_revisions': directusError(400, 'RECORD_NOT_UNIQUE'),
    };

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('stale_write');
    expectPublicPageUntouched();
  });

  it('leaves the public page untouched when the PATCH fails', async () => {
    routes = {
      ...defaultRoutes(),
      [`PATCH /items/cms_pages/${PAGE_ID}`]: directusError(
        503,
        'SERVICE_UNAVAILABLE',
      ),
    };

    const res = await publishRequest(BODY);

    expect(res.status).toBeGreaterThanOrEqual(500);
    expect(currentRow.published_revision).toBeNull();
    expect(eventCalls()).toHaveLength(0);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('maps a policy rejection of the PATCH to 409 invalid_transition', async () => {
    routes = {
      ...defaultRoutes(),
      [`PATCH /items/cms_pages/${PAGE_ID}`]: directusError(403, 'FORBIDDEN'),
    };

    const res = await publishRequest(BODY);
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('invalid_transition');
    expect(eventCalls()).toHaveLength(0);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('answers 200, logs and revalidates when the approved event fails after the page went live', async () => {
    routes = {
      ...defaultRoutes(),
      'POST /items/cms_review_events': directusError(
        503,
        'SERVICE_UNAVAILABLE',
      ),
    };

    const res = await publishRequest(BODY);

    expect(res.status).toBe(200);
    const body = (await res.json()) as { page: { status: string } };
    expect(body.page.status).toBe('published');
    expect(currentRow.published_revision).toBe(REV_ID);
    expect(logError).toHaveBeenCalledWith(
      expect.any(String),
      'page published but the approved event failed',
      expect.objectContaining({ pageId: PAGE_ID, revisionId: REV_ID }),
    );
    for (const tag of PUBLIC_TAGS) {
      expect(revalidateTag).toHaveBeenCalledWith(tag, { expire: 0 });
    }
  });

  it('rejects a changeNote over 500 chars with 422', async () => {
    const res = await publishRequest({
      expectedUpdatedAt: UPDATED_AT,
      changeNote: 'x'.repeat(501),
    });
    const body = (await res.json()) as ErrorBody;

    expect(res.status).toBe(422);
    expect(body.error.code).toBe('validation_failed');
    expect(revisionCalls()).toHaveLength(0);
  });
});
