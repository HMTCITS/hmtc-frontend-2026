import { CmsClientError, cmsFetch, cmsQuery, cmsUrl } from './cms-client';

const PAGE_ID = '11111111-1111-4111-8111-111111111111';

/** Minimal stand-in for `Response`; jsdom does not provide one. */
type FakeResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type FetchMock = jest.Mock<Promise<FakeResponse>, [string, RequestInit?]>;

function mockFetch(response: FakeResponse): FetchMock {
  const fn = jest.fn(() => Promise.resolve(response)) as unknown as FetchMock;
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

function jsonResponse(body: unknown, status = 200): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  };
}

function nonJsonResponse(status: number): FakeResponse {
  return {
    ok: false,
    status,
    json: () => Promise.reject(new SyntaxError('not json')),
  };
}

function emptyResponse(status: number): FakeResponse {
  return { ok: true, status, json: () => Promise.resolve(null) };
}

const pageFixture = {
  id: PAGE_ID,
  title: 'Syukuran',
  slug: 'syukuran-wisudawan',
  pageType: 'event',
  status: 'draft',
  departmentId: PAGE_ID,
  prokerId: PAGE_ID,
  editionYear: 2026,
  isLive: false,
  publishedAt: null,
  updatedAt: '2026-11-10T00:00:00.000Z',
  path: '/internal-affairs/syukuran-wisudawan/2026',
  blocks: [],
  invalidBlocks: [],
  excerpt: null,
  featuredImageId: null,
  seoTitle: null,
  seoDescription: null,
  templateId: null,
  publishedRevisionId: null,
  currentRevisionId: null,
  lastSubmission: null,
  history: [],
  allowedActions: [],
} as const;

function calledWith(fn: FetchMock) {
  return fn.mock.calls[0] as [string, RequestInit];
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('cmsUrl', () => {
  it('fills path params and url-encodes them', () => {
    expect(cmsUrl('getPage', { params: { id: PAGE_ID } })).toBe(
      `/api/cms/pages/${PAGE_ID}`,
    );
  });

  it('throws when a required path param is missing', () => {
    expect(() => cmsUrl('getPage', { params: {} as { id: string } })).toThrow();
  });

  it('applies contract defaults to an empty query', () => {
    expect(cmsUrl('listPages')).toBe('/api/cms/pages?page=1&limit=25');
  });

  it('serializes a query and drops undefined values', () => {
    const url = cmsUrl('listPages', {
      query: { status: 'draft', departmentId: PAGE_ID, q: undefined },
    });

    expect(url).toContain('status=draft');
    expect(url).toContain(`departmentId=${PAGE_ID}`);
    expect(url).toContain('page=1');
    expect(url).not.toContain('q=');
  });

  it('rejects a query that violates the contract before sending', () => {
    expect(() =>
      cmsUrl('listPages', { query: { limit: 500 } as { limit: number } }),
    ).toThrow();
  });

  it('returns the bare path for an endpoint with no params or query', () => {
    expect(cmsUrl('logout')).toBe('/api/cms/auth/logout');
  });
});

describe('cmsFetch request shape', () => {
  it('sends credentials, no-store and json body only when present', async () => {
    const fetchMock = mockFetch(jsonResponse({ page: pageFixture }));

    await cmsFetch('savePage', {
      params: { id: PAGE_ID },
      body: { expectedUpdatedAt: '2026-11-10T00:00:00.000Z' },
    });

    const [url, init] = calledWith(fetchMock);
    expect(url).toBe(`/api/cms/pages/${PAGE_ID}`);
    expect(init.method).toBe('PATCH');
    expect(init.credentials).toBe('same-origin');
    expect(init.cache).toBe('no-store');
    expect(init.headers).toMatchObject({ 'content-type': 'application/json' });
    expect(JSON.parse(String(init.body))).toEqual({
      expectedUpdatedAt: '2026-11-10T00:00:00.000Z',
    });
  });

  it('omits content-type for a GET', async () => {
    const fetchMock = mockFetch(jsonResponse({ items: [], total: 0 }));

    await cmsFetch('listPages');

    const [, init] = calledWith(fetchMock);
    expect(init.headers).not.toHaveProperty('content-type');
    expect(init.body).toBeUndefined();
  });

  it('sends FormData without a content-type so the boundary is set', async () => {
    const fetchMock = mockFetch(
      jsonResponse(
        {
          asset: {
            id: PAGE_ID,
            title: null,
            type: 'image/png',
            width: 1,
            height: 1,
            filesize: 12,
          },
        },
        201,
      ),
    );
    const form = new FormData();
    form.set('file', new Blob(['x']), 'x.png');

    await cmsFetch('uploadAsset', { body: form });

    const [, init] = calledWith(fetchMock);
    expect(init.body).toBe(form);
    expect(init.headers).not.toHaveProperty('content-type');
  });

  it('returns undefined for a 204 endpoint', async () => {
    mockFetch(emptyResponse(204));

    await expect(cmsFetch('logout')).resolves.toBeUndefined();
  });
});

describe('cmsFetch error parsing', () => {
  it('reads a contract error body into a typed error', async () => {
    mockFetch(
      jsonResponse(
        { error: { code: 'unauthenticated', message: 'Sesi berakhir.' } },
        401,
      ),
    );

    const error = await cmsFetch('me').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CmsClientError);
    const typed = error as CmsClientError;
    expect(typed.code).toBe('unauthenticated');
    expect(typed.status).toBe(401);
    expect(typed.message).toBe('Sesi berakhir.');
    expect(typed.body.error.code).toBe('unauthenticated');
  });

  it('keeps a duplicate conflict distinguishable from a stale write', async () => {
    mockFetch(
      jsonResponse(
        { error: { code: 'duplicate', message: 'Halaman sudah ada.' } },
        409,
      ),
    );

    const error = (await cmsFetch('createPage', {
      body: {
        prokerId: PAGE_ID,
        editionYear: 2026,
        title: 'Syukuran Wisudawan',
        pageType: 'event',
      },
    }).catch((e: unknown) => e)) as CmsClientError;

    expect(error.code).toBe('duplicate');
    expect(error.status).toBe(409);
  });

  it('falls back to the status when the body is not a contract error', async () => {
    mockFetch(nonJsonResponse(502));

    const error = (await cmsFetch('me').catch(
      (e: unknown) => e,
    )) as CmsClientError;

    expect(error.code).toBe('internal');
    expect(error.status).toBe(502);
    expect(error.message).not.toContain('html');
  });

  it('treats an out-of-contract success body as internal, not success', async () => {
    mockFetch(jsonResponse({ unexpected: true }));

    const error = (await cmsFetch('me').catch(
      (e: unknown) => e,
    )) as CmsClientError;

    expect(error).toBeInstanceOf(CmsClientError);
    expect(error.code).toBe('internal');
  });

  it('never surfaces the raw response body in the message', async () => {
    const secretish = 'duplicate key value violates unique constraint "x"';
    mockFetch(jsonResponse({ errors: [{ message: secretish }] }, 400));

    const error = (await cmsFetch('me').catch(
      (e: unknown) => e,
    )) as CmsClientError;

    expect(error.message).not.toContain('unique constraint');
  });
});

describe('cmsQuery', () => {
  it('always provides a queryFn that calls the endpoint', async () => {
    const fetchMock = mockFetch(jsonResponse({ items: [], total: 0 }));

    const options = cmsQuery('listPages', ['cms', 'pages']);
    expect(options.queryKey).toEqual(['cms', 'pages']);
    expect(typeof options.queryFn).toBe('function');

    await options.queryFn({ signal: undefined });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(calledWith(fetchMock)[0]).toBe('/api/cms/pages?page=1&limit=25');
  });
});
