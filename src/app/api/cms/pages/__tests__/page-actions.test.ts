/**
 * Route tests for POST /api/cms/pages/:id/{submit,request-changes} (task B5).
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
import { POST as requestChanges } from '@cms-page-routes/request-changes/route';
import { POST as submit } from '@cms-page-routes/submit/route';

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
      const body = JSON.parse(String(call.init.body)) as { status?: string };
      currentRow = {
        ...currentRow,
        status: body.status,
        date_updated: '2026-11-10T08:00:00.000Z',
      };
      return json({ data: { id: PAGE_ID, status: body.status } });
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

const submitRequest = (id: string, body: unknown, origin = SITE) =>
  submit(
    new Request(`${SITE}/api/cms/pages/${id}/submit`, {
      method: 'POST',
      headers: { origin, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  );

const requestChangesRequest = (id: string, body: unknown) =>
  requestChanges(
    new Request(`${SITE}/api/cms/pages/${id}/request-changes`, {
      method: 'POST',
      headers: { origin: SITE, 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
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

/* --------------------------------------------------------------- Submit */

describe('POST /api/cms/pages/:id/submit', () => {
  it('moves draft → in_review, writes the event and returns the new detail', async () => {
    const res = await submitRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
      comment: 'siap direview',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      page: {
        status: string;
        history: Array<{ action: string; comment: string | null }>;
      };
    };
    expect(body.page.status).toBe('in_review');
    expect(body.page.history[0]).toEqual(
      expect.objectContaining({
        action: 'submitted',
        fromStatus: 'draft',
        toStatus: 'in_review',
        comment: 'siap direview',
        actorId: USER_ID,
      }),
    );

    const patchBody = JSON.parse(String(patchCalls()[0]?.init.body)) as {
      status: string;
    };
    expect(patchBody.status).toBe('in_review');

    const eventBody = JSON.parse(String(eventCalls()[0]?.init.body)) as Record<
      string,
      unknown
    >;
    expect(eventBody.page).toBe(PAGE_ID);
    expect(eventBody.action).toBe('submitted');
    expect(eventBody.from_status).toBe('draft');
    expect(eventBody.to_status).toBe('in_review');
    expect(eventBody.comment).toBe('siap direview');
    // actor must come from the Directus preset, never from the payload
    expect(eventBody.actor).toBeUndefined();
    expect(eventCalls()[0]?.auth).toBe(AT);
  });

  it('submits without a comment', async () => {
    const res = await submitRequest(PAGE_ID, { expectedUpdatedAt: UPDATED_AT });

    expect(res.status).toBe(200);
    const eventBody = JSON.parse(String(eventCalls()[0]?.init.body)) as Record<
      string,
      unknown
    >;
    expect(eventBody.comment).toBeNull();
  });

  it('rejects a non-editor with 403', async () => {
    memberships = [
      {
        role: 'reviewer',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];

    const res = await submitRequest(PAGE_ID, { expectedUpdatedAt: UPDATED_AT });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('forbidden');
    expect(patchCalls()).toHaveLength(0);
  });

  it('rejects submit from in_review with 409 invalid_transition', async () => {
    const res = await submitRequest(PAGE_ID, { expectedUpdatedAt: UPDATED_AT });
    // first submit succeeded; the page is now in_review — submitting again
    // must be refused
    expect(res.status).toBe(200);

    const second = await submitRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
    });
    const body = (await second.json()) as { error: { code: string } };

    expect(second.status).toBe(409);
    expect(body.error.code).toBe('invalid_transition');
  });

  it('rejects a stale expectedUpdatedAt with 409 stale_write', async () => {
    const res = await submitRequest(PAGE_ID, {
      expectedUpdatedAt: '2020-01-01T00:00:00.000Z',
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('stale_write');
    expect(patchCalls()).toHaveLength(0);
  });

  it('rejects a template_maintainer with 403', async () => {
    memberships = [
      {
        role: 'template_maintainer',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];

    const res = await submitRequest(PAGE_ID, { expectedUpdatedAt: UPDATED_AT });
    const body = (await res.json()) as { error: { code: string } };

    // 404, not 403: the page's existence is not revealed to a member who
    // holds no content role in the department (contract item 4).
    expect(res.status).toBe(404);
    expect(body.error.code).toBe('not_found');
    expect(patchCalls()).toHaveLength(0);
  });

  it('allows a Directus admin to submit', async () => {
    isAdmin = true;
    const res = await submitRequest(PAGE_ID, { expectedUpdatedAt: UPDATED_AT });

    expect(res.status).toBe(200);
  });

  it('rejects a comment over 1000 chars with 422', async () => {
    const res = await submitRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
      comment: 'x'.repeat(1001),
    });
    const body = (await res.json()) as {
      error: { code: string; issues?: Array<{ path: string }> };
    };

    expect(res.status).toBe(422);
    expect(body.error.code).toBe('validation_failed');
  });

  it('maps a Directus policy rejection to 409 invalid_transition', async () => {
    routes = {
      ...defaultRoutes(),
      [`PATCH /items/cms_pages/${PAGE_ID}`]: () =>
        json(
          {
            errors: [
              {
                message: 'forbidden by policy',
                extensions: { code: 'FORBIDDEN' },
              },
            ],
          },
          403,
        ),
    };

    const res = await submitRequest(PAGE_ID, { expectedUpdatedAt: UPDATED_AT });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('invalid_transition');
  });
});

/* ------------------------------------------------------ Request changes */

describe('POST /api/cms/pages/:id/request-changes', () => {
  beforeEach(() => {
    memberships = [
      {
        role: 'reviewer',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];
    setPageRow({ status: 'in_review' });
  });

  it('moves in_review → changes_requested with a required comment', async () => {
    const res = await requestChangesRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
      comment: 'bagian agenda perlu diperjelas',
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      page: {
        status: string;
        history: Array<{ action: string; comment: string | null }>;
      };
    };
    expect(body.page.status).toBe('changes_requested');
    expect(body.page.history[0]).toEqual(
      expect.objectContaining({
        action: 'changes_requested',
        fromStatus: 'in_review',
        toStatus: 'changes_requested',
        comment: 'bagian agenda perlu diperjelas',
        actorId: USER_ID,
      }),
    );

    const patchBody = JSON.parse(String(patchCalls()[0]?.init.body)) as {
      status: string;
    };
    expect(patchBody.status).toBe('changes_requested');
  });

  it('allows a publisher too', async () => {
    memberships = [
      {
        role: 'publisher',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];

    const res = await requestChangesRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
      comment: 'perlu revisi',
    });

    expect(res.status).toBe(200);
  });

  it('rejects an editor with 403', async () => {
    memberships = [
      { role: 'editor', deptId: RT_DEPT, deptSlug: 'research-and-technology' },
    ];

    const res = await requestChangesRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
      comment: 'revisi',
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(403);
    expect(body.error.code).toBe('forbidden');
  });

  it('requires a comment (422 from the contract schema)', async () => {
    const res = await requestChangesRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(422);
    expect(body.error.code).toBe('validation_failed');
    expect(eventCalls()).toHaveLength(0);
  });

  it('rejects request-changes from draft with 409 invalid_transition', async () => {
    routes = {
      ...defaultRoutes(),
      [`GET /items/cms_pages/${PAGE_ID}`]: () =>
        json({ data: pageRow({ status: 'draft' }) }),
    };

    const res = await requestChangesRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
      comment: 'revisi',
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(409);
    expect(body.error.code).toBe('invalid_transition');
  });

  it('hides a page outside the reviewer department as 404', async () => {
    memberships = [
      {
        role: 'reviewer',
        deptId: RT_DEPT,
        deptSlug: 'research-and-technology',
      },
    ];
    routes = {
      ...defaultRoutes(),
      [`GET /items/cms_pages/${PAGE_ID}`]: () =>
        json(
          {
            errors: [
              {
                message: 'no access',
                extensions: { code: 'FORBIDDEN' },
              },
            ],
          },
          403,
        ),
    };

    const res = await requestChangesRequest(PAGE_ID, {
      expectedUpdatedAt: UPDATED_AT,
      comment: 'revisi',
    });
    const body = (await res.json()) as { error: { code: string } };

    expect(res.status).toBe(404);
    expect(body.error.code).toBe('not_found');
  });
});
