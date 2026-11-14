/**
 * Unit tests for the Directus error normalisation.
 *
 * The DoD requires coverage of 401 / 403 / 404 / 409 / 422 and the unique
 * violation → duplicate mapping. Two of those reach the client differently
 * (Directus uses 400 for a Postgres unique violation in some versions, 409 in
 * others), so both shapes are covered.
 *
 * `jest.mock('server-only', () => ({}))` must run before the imports; Jest's
 * transformer hoists it above them automatically.
 *
 * @jest-environment node
 *
 */
import { CMS_ERROR_STATUS } from '@/lib/cms/errors';
import {
  directusRead,
  DirectusRequestError,
  mapDirectusError,
} from '@/lib/directus/client';
import { resetCmsEnvForTests } from '@/lib/directus/env';

jest.mock('server-only', () => ({}));

/* ------------------------------------------------------- mapDirectusError */

describe('mapDirectusError', () => {
  it('401 → unauthenticated', () => {
    expect(mapDirectusError(401, null)).toEqual({ code: 'unauthenticated' });
  });

  it('403 → forbidden', () => {
    expect(mapDirectusError(403, null)).toEqual({ code: 'forbidden' });
  });

  it('404 → not_found', () => {
    expect(mapDirectusError(404, null)).toEqual({ code: 'not_found' });
  });

  it('409 → duplicate (Directus has no workflow 409 in this app)', () => {
    expect(mapDirectusError(409, null)).toEqual({ code: 'duplicate' });
  });

  it('422 → validation_failed', () => {
    expect(mapDirectusError(422, null)).toEqual({ code: 'validation_failed' });
  });

  it('429 → rate_limited', () => {
    expect(mapDirectusError(429, null)).toEqual({ code: 'rate_limited' });
  });

  it('5xx → internal', () => {
    expect(mapDirectusError(500, null).code).toBe('internal');
    expect(mapDirectusError(502, null).code).toBe('internal');
  });

  it('maps a raw Postgres unique violation to duplicate', () => {
    const body = {
      errors: [
        {
          message:
            'duplicate key value violates unique constraint "cms_pages_department_proker_year_unique"',
        },
      ],
    };
    expect(mapDirectusError(400, body)).toEqual({ code: 'duplicate' });
  });

  it('maps RECORD_NOT_UNIQUE to duplicate', () => {
    const body = {
      errors: [
        {
          message: 'Value must be unique',
          extensions: { code: 'RECORD_NOT_UNIQUE' },
        },
      ],
    };
    expect(mapDirectusError(400, body)).toEqual({ code: 'duplicate' });
  });

  it('extracts field-level issues from Directus validation errors', () => {
    const body = {
      errors: [
        {
          message: 'Title is required',
          extensions: { field: 'title', collection: 'cms_pages' },
        },
      ],
    };
    const result = mapDirectusError(400, body);
    expect(result.code).toBe('validation_failed');
    expect(result.issues).toEqual([
      { path: 'title', message: 'Title is required' },
    ]);
  });

  it('scrubs a message that leaks a constraint name', () => {
    const body = {
      errors: [
        {
          message:
            'constraint cms_pages_department_proker_year_unique violated',
          extensions: { field: 'proker' },
        },
      ],
    };
    const result = mapDirectusError(400, body);
    expect(result.issues).toEqual([
      { path: 'proker', message: 'nilai tidak valid' },
    ]);
  });
});

/* --------------------------------------------------- DirectusRequestError */

describe('DirectusRequestError', () => {
  it('reports a status that matches CMS_ERROR_STATUS', () => {
    expect(new DirectusRequestError('unauthenticated', 'x').status).toBe(401);
    expect(new DirectusRequestError('forbidden', 'x').status).toBe(403);
    expect(new DirectusRequestError('not_found', 'x').status).toBe(404);
    expect(new DirectusRequestError('duplicate', 'x').status).toBe(409);
    expect(new DirectusRequestError('validation_failed', 'x').status).toBe(422);
    expect(new DirectusRequestError('rate_limited', 'x').status).toBe(429);
    expect(new DirectusRequestError('internal', 'x').status).toBe(500);
  });

  it.each(
    Object.entries(CMS_ERROR_STATUS) as Array<
      [keyof typeof CMS_ERROR_STATUS, number]
    >,
  )('%s → %i (matches the shared table)', (code, status) => {
    expect(new DirectusRequestError(code, 'x').status).toBe(status);
  });

  it('serialises to a CmsErrorBody with message and issues', () => {
    const error = new DirectusRequestError(
      'validation_failed',
      'Data tidak valid',
      [{ path: 'title', message: 'wajib diisi' }],
    );
    expect(error.toBody()).toEqual({
      error: {
        code: 'validation_failed',
        message: 'Data tidak valid',
        issues: [{ path: 'title', message: 'wajib diisi' }],
      },
    });
  });

  it('omits optional fields rather than emitting undefined', () => {
    const body = new DirectusRequestError('forbidden', 'x').toBody();
    expect(Object.keys(body.error).sort()).toEqual(['code', 'message']);
    expect(JSON.stringify(body)).not.toMatch(/cms_/);
    expect(JSON.stringify(body)).not.toMatch(/unique constraint/i);
  });
});

/* -------------------------------------------- Full flow through directusRead */

describe('directusRead error normalisation', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env.DIRECTUS_URL = 'http://directus:8055';
    process.env.DIRECTUS_READ_TOKEN = 'test-token';
    process.env.CMS_REVALIDATE_SECRET = 'test-secret';
    process.env.CMS_EDITING_ENABLED = 'true';
    resetCmsEnvForTests();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetCmsEnvForTests();
    jest.restoreAllMocks();
  });

  it('turns a 403 into a DirectusRequestError with a safe message', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [{ message: 'You don\u2019t have access' }],
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(directusRead('/items/cms_pages')).rejects.toMatchObject({
      code: 'forbidden',
    });
    // The raw Directus message must not survive.
    await expect(directusRead('/items/cms_pages')).rejects.not.toMatchObject({
      message: expect.stringContaining('access'),
    });
  });

  it('turns a unique violation into duplicate without leaking the constraint', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: [
            {
              message:
                'duplicate key value violates unique constraint "cms_pages_department_proker_year_unique"',
            },
          ],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const error = await directusRead('/items/cms_pages').catch((e) => e);
    expect(error).toBeInstanceOf(DirectusRequestError);
    if (!(error instanceof DirectusRequestError)) {
      throw new Error('expected DirectusRequestError');
    }
    expect(error.code).toBe('duplicate');
    expect(error.status).toBe(409);
    expect(error.message).not.toMatch(
      /cms_pages_department_proker_year_unique/,
    );
  });
});
