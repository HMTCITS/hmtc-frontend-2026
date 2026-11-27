/**
 * Unit tests for the CMS Route Handler toolkit.
 *
 * The DoD requires each error path covered: ZodError → 422, other exceptions
 * → 500 without detail, Origin check → 403, response validation in dev/test
 * only, and the 204 path.
 *
 * @jest-environment node
 *
 * Why node: the file builds plain `Request` / `Response` objects and calls
 * `request.formData()`. jsdom has neither.
 */
import { ZodError } from 'zod';

import { CMS_ERROR_STATUS, CmsError } from '@/lib/cms/errors';
import { DirectusRequestError } from '@/lib/directus/client';
import { resetCmsEnvForTests } from '@/lib/directus/env';
import {
  defineCmsRoute,
  ResponseSchemaMismatchError,
} from '@/lib/directus/route-handler';

jest.mock('server-only', () => ({}));
jest.mock('../logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logInfo: jest.fn(),
}));

const UUID = '00000000-0000-4000-8000-000000000000';
const ISO = '2026-01-01T00:00:00Z';

function setNodeEnv(value: string): void {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

function postHeaders(
  extra: Record<string, string> = {},
): Record<string, string> {
  return {
    origin: 'http://localhost',
    host: 'localhost',
    'content-type': 'application/json',
    ...extra,
  };
}

beforeEach(() => {
  process.env.DIRECTUS_URL = 'http://directus:8055';
  process.env.DIRECTUS_READ_TOKEN = 'test-token';
  process.env.CMS_REVALIDATE_SECRET = 'test-secret';
  process.env.CMS_EDITING_ENABLED = 'true';
  jest.clearAllMocks();
  resetCmsEnvForTests();
});

afterEach(() => {
  jest.restoreAllMocks();
  resetCmsEnvForTests();
});

/* ------------------------------------------------ 1–2: GET + query parsing */

describe('GET endpoints', () => {
  it('valid query → 200 with a contract-conformant body', async () => {
    const handler = defineCmsRoute('listPages', async () => ({
      items: [],
      total: 0,
    }));
    const req = new Request('http://localhost/api/cms/pages');
    const res = await handler(req, {});
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ items: [], total: 0 });
  });

  it('applies Zod defaults on the query string', async () => {
    let seenPage: number | undefined;
    let seenLimit: number | undefined;
    const handler = defineCmsRoute('listPages', async ({ query }) => {
      seenPage = query.page;
      seenLimit = query.limit;
      return { items: [], total: 0 };
    });
    await handler(new Request('http://localhost/api/cms/pages'), {});
    expect(seenPage).toBe(1);
    expect(seenLimit).toBe(25);
  });

  it('invalid query → 422 validation_failed with issues[]', async () => {
    const handler = defineCmsRoute('listPages', async () => ({
      items: [],
      total: 0,
    }));
    const res = await handler(
      new Request('http://localhost/api/cms/pages?page=abc'),
      {},
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('validation_failed');
    expect(body.error.issues[0].path).toBe('page');
  });

  it('does not require Origin on GET', async () => {
    const handler = defineCmsRoute('listPages', async () => ({
      items: [],
      total: 0,
    }));
    const res = await handler(
      new Request('http://localhost/api/cms/pages'),
      {},
    );
    expect(res.status).toBe(200);
  });
});

/* -------------------------------------- 3–4: POST body / JSON validation */

describe('POST body parsing', () => {
  it('malformed JSON → 422 with a JSON message', async () => {
    const handler = defineCmsRoute('revalidate', async () => ({
      revalidated: 0,
    }));
    const req = new Request('http://localhost/api/cms/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not-json',
    });
    const res = await handler(req, {});
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('validation_failed');
    expect(JSON.stringify(body)).toMatch(/JSON/i);
  });

  it('missing required field → 422 with the field path', async () => {
    const handler = defineCmsRoute('revalidate', async () => ({
      revalidated: 0,
    }));
    const req = new Request('http://localhost/api/cms/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ keys: [] }), // collection omitted
    });
    const res = await handler(req, {});
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.issues[0].path).toBe('collection');
  });
});

/* -------------------------------------------------------- 5–9: Origin */

describe('Origin check', () => {
  it('wrong Origin → 403 bad_origin', async () => {
    const handler = defineCmsRoute('logout', async () => undefined);
    const req = new Request('http://localhost/api/cms/auth/logout', {
      method: 'POST',
      headers: { origin: 'http://evil.example', host: 'localhost' },
    });
    const res = await handler(req, {});
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('bad_origin');
  });

  it('missing Origin → 403 bad_origin', async () => {
    const handler = defineCmsRoute('logout', async () => undefined);
    const req = new Request('http://localhost/api/cms/auth/logout', {
      method: 'POST',
      headers: { host: 'localhost' },
    });
    const res = await handler(req, {});
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('bad_origin');
  });

  it('matching Origin → handler invoked', async () => {
    let invoked = false;
    const handler = defineCmsRoute('logout', async () => {
      invoked = true;
    });
    const req = new Request('http://localhost/api/cms/auth/logout', {
      method: 'POST',
      headers: postHeaders(),
    });
    const res = await handler(req, {});
    expect(invoked).toBe(true);
    expect(res.status).toBe(204);
  });

  it('HMAC endpoint skips the Origin check', async () => {
    const handler = defineCmsRoute('revalidate', async () => ({
      revalidated: 0,
    }));
    const req = new Request('http://localhost/api/cms/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ collection: 'cms_pages', keys: [] }),
    });
    const res = await handler(req, {});
    expect(res.status).toBe(200);
  });

  it('respects X-Forwarded-* when present', async () => {
    const handler = defineCmsRoute('logout', async () => undefined);
    const req = new Request('http://internal:3000/api/cms/auth/logout', {
      method: 'POST',
      headers: {
        origin: 'https://public.example',
        host: 'internal:3000',
        'x-forwarded-host': 'public.example',
        'x-forwarded-proto': 'https',
      },
    });
    const res = await handler(req, {});
    expect(res.status).toBe(204);
  });
});

/* ------------------------------------------------ 10–12: Handler throws */

describe('handler exceptions', () => {
  it('CmsError → mapped status', async () => {
    const handler = defineCmsRoute('listPages', async () => {
      throw new CmsError(
        'self_approval',
        'Pengajuan Anda sendiri tidak dapat disetujui.',
      );
    });
    const res = await handler(
      new Request('http://localhost/api/cms/pages'),
      {},
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('self_approval');
    expect(body.error.message).toBe(
      'Pengajuan Anda sendiri tidak dapat disetujui.',
    );
  });

  it('DirectusRequestError → mapped status and body', async () => {
    const handler = defineCmsRoute('listPages', async () => {
      throw new DirectusRequestError(
        'forbidden',
        'Anda tidak memiliki izin untuk tindakan ini.',
      );
    });
    const res = await handler(
      new Request('http://localhost/api/cms/pages'),
      {},
    );
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe('forbidden');
  });

  it('unknown Error → 500 without leaking the message', async () => {
    const handler = defineCmsRoute('listPages', async () => {
      throw new Error('boom-secret-internal');
    });
    const res = await handler(
      new Request('http://localhost/api/cms/pages'),
      {},
    );
    expect(res.status).toBe(500);
    const text = await res.text();
    expect(text).not.toContain('boom-secret-internal');
    const body = JSON.parse(text);
    expect(body.error.code).toBe('internal');
    expect(body.error.message).toBe('Terjadi kesalahan pada server.');
  });
});

/* ----------------------------------------- 13–14: Response validation */

describe('response validation', () => {
  it('invalid response body in test → 500 internal', async () => {
    const handler = defineCmsRoute('listPages', async () => {
      return { items: 'not an array', total: 0 } as unknown as {
        items: never[];
        total: number;
      };
    });
    const res = await handler(
      new Request('http://localhost/api/cms/pages'),
      {},
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('internal');
    // Logged for the operator, but not exposed to the client.
    expect(JSON.stringify(body)).not.toMatch(/items/);
  });

  it('skips response validation in production', async () => {
    const original = process.env.NODE_ENV;
    setNodeEnv('production');
    try {
      const handler = defineCmsRoute('listPages', async () => {
        return { items: 'not an array', total: 0 } as unknown as {
          items: never[];
          total: number;
        };
      });
      const res = await handler(
        new Request('http://localhost/api/cms/pages'),
        {},
      );
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.items).toBe('not an array');
    } finally {
      setNodeEnv(original ?? 'test');
    }
  });

  it('ResponseSchemaMismatchError is not treated as a ZodError', () => {
    // Guard rail: the class exists and is discriminated by name, so the
    // mapping above cannot accidentally fall into the ZodError branch.
    const e = new ResponseSchemaMismatchError('listPages', {
      issues: [],
    } as unknown as ZodError);
    expect(e).toBeInstanceOf(ResponseSchemaMismatchError);
    expect(e).not.toBeInstanceOf(ZodError);
  });
});

/* ------------------------------------------------------- 15–16: 204 path */

describe('204 endpoints', () => {
  it('handler returns undefined → 204 with an empty body', async () => {
    const handler = defineCmsRoute('logout', async () => undefined);
    const res = await handler(
      new Request('http://localhost/api/cms/auth/logout', {
        method: 'POST',
        headers: postHeaders(),
      }),
      {},
    );
    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('handler returns a value on a 204 endpoint → 500 internal', async () => {
    const handler = defineCmsRoute('logout', async () => {
      return { leaked: true } as unknown as undefined;
    });
    const res = await handler(
      new Request('http://localhost/api/cms/auth/logout', {
        method: 'POST',
        headers: postHeaders(),
      }),
      {},
    );
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error.code).toBe('internal');
    expect(JSON.stringify(body)).not.toContain('leaked');
  });
});

/* ------------------------------------- 17–18: params + multipart parsing */

describe('params and multipart', () => {
  it('invalid UUID param → 422 with the field path', async () => {
    const handler = defineCmsRoute('getPage', async () => {
      throw new Error('should not reach');
    });
    const res = await handler(
      new Request('http://localhost/api/cms/pages/not-a-uuid'),
      { params: { id: 'not-a-uuid' } },
    );
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('validation_failed');
    expect(body.error.issues[0].path).toBe('id');
  });

  it('multipart endpoint receives FormData instead of body', async () => {
    let received: FormData | undefined;
    const handler = defineCmsRoute(
      'uploadAsset',
      async ({ formData, body }) => {
        received = formData;
        // `body` must be undefined for multipart endpoints.
        expect(body).toBeUndefined();
        return {
          asset: {
            id: UUID,
            title: null,
            type: 'image/png',
            width: 100,
            height: 100,
            filesize: 1234,
          },
        };
      },
    );
    const form = new FormData();
    form.append('file', new Blob(['x'], { type: 'image/png' }), 'x.png');
    const req = new Request('http://localhost/api/cms/assets', {
      method: 'POST',
      headers: { origin: 'http://localhost', host: 'localhost' },
      body: form,
    });
    const res = await handler(req, {});
    expect(res.status).toBe(201);
    expect(received).toBeInstanceOf(FormData);
  });
});

/* ------------------------------------------------- 19: editing gate (N9) */

describe('CMS_EDITING_ENABLED gate', () => {
  it('blocks content mutations when editing is disabled', async () => {
    process.env.CMS_EDITING_ENABLED = 'false';
    resetCmsEnvForTests();

    const handler = defineCmsRoute('submitPage', async () => {
      throw new Error('should not reach');
    });
    const req = new Request(`http://localhost/api/cms/pages/${UUID}/submit`, {
      method: 'POST',
      headers: postHeaders(),
      body: JSON.stringify({ expectedUpdatedAt: ISO }),
    });
    const res = await handler(req, { params: { id: UUID } });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.code).toBe('editing_disabled');
  });

  it('does not block auth endpoints (logout) when editing is disabled', async () => {
    process.env.CMS_EDITING_ENABLED = 'false';
    resetCmsEnvForTests();

    const handler = defineCmsRoute('logout', async () => undefined);
    const res = await handler(
      new Request('http://localhost/api/cms/auth/logout', {
        method: 'POST',
        headers: postHeaders(),
      }),
      {},
    );
    expect(res.status).toBe(204);
  });
});

/* ------------------------------------------------------ Sanity check */

describe('status code table', () => {
  it('every CmsErrorCode maps to a status', () => {
    for (const [code, status] of Object.entries(CMS_ERROR_STATUS)) {
      expect(typeof status).toBe('number');
      expect(status).toBeGreaterThanOrEqual(400);
      expect(code).toMatch(/^[a-z_]+$/);
    }
  });
});
