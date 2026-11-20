/**
 * Unit tests for the public page accessors.
 *
 * DoD coverage: reads `published_revision` with the read token, tagged per
 * `cmsTags`; never selects `cms_pages.blocks`; blocks go through
 * `parseBlocksForRead`.
 *
 * @jest-environment node
 */
import { createBlock } from '@/lib/directus/blocks';
import { DirectusRequestError } from '@/lib/directus/client';
import { resetCmsEnvForTests } from '@/lib/directus/env';
import {
  getPublishedPage,
  listPublishedRoutes,
  PUBLIC_PAGE_FIELDS,
  PUBLIC_ROUTE_FIELDS,
} from '@/lib/directus/pages';

import { logError, logWarn } from '../logger';

jest.mock('server-only', () => ({}));
jest.mock('../logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logInfo: jest.fn(),
}));

/* ------------------------------------------------------------- Fixtures */

const PAGE_ID = '11111111-1111-4111-8111-111111111111';
const REV_ID = '22222222-2222-4222-8222-222222222222';
const DEPT = 'research-and-technology';
const PROKER = 'bluecamp';
const YEAR = 2026;

function hero() {
  const block = createBlock('hero');
  return { ...block, props: { ...block.props, title: 'Bluecamp 2026' } };
}

const pageRow = {
  id: PAGE_ID,
  slug: 'bluecamp-2026',
  page_type: 'event',
  edition_year: YEAR,
  published_revision: REV_ID,
  published_at: '2026-11-01T00:00:00.000Z',
  canonical_url: null,
  department: { slug: DEPT },
  proker: { slug: PROKER },
};

function revisionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: REV_ID,
    page: PAGE_ID,
    revision_number: 3,
    title: 'Bluecamp 2026',
    blocks: [hero()],
    blocks_schema_version: 1,
    excerpt: 'Ringkasan',
    featured_image: null,
    seo_title: 'SEO title',
    seo_description: null,
    ...overrides,
  };
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();

type NextInit = RequestInit & { next?: { tags?: string[] } };

function call(n: number) {
  const [url, init] = fetchMock.mock.calls[n];
  return { url: new URL(url), init: init as NextInit };
}

function fieldsOf(url: URL): string[] {
  return (url.searchParams.get('fields') ?? '').split(',');
}

beforeEach(() => {
  process.env.DIRECTUS_URL = 'https://directus.test';
  process.env.DIRECTUS_READ_TOKEN = 'read-token';
  process.env.CMS_REVALIDATE_SECRET = 'secret';
  resetCmsEnvForTests();
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
  jest.mocked(logError).mockClear();
  jest.mocked(logWarn).mockClear();
});

function mockHappyPath(revision = revisionRow()) {
  fetchMock
    .mockResolvedValueOnce(json({ data: [pageRow] }))
    .mockResolvedValueOnce(json({ data: revision }));
}

/* ------------------------------------------------------ getPublishedPage */

describe('getPublishedPage', () => {
  it('resolves identity, then reads the published revision', async () => {
    mockHappyPath();

    const page = await getPublishedPage(DEPT, PROKER, YEAR);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const first = call(0).url;
    expect(first.pathname).toBe('/items/cms_pages');
    expect(first.searchParams.get('filter[department][slug][_eq]')).toBe(DEPT);
    expect(first.searchParams.get('filter[proker][slug][_eq]')).toBe(PROKER);
    expect(first.searchParams.get('filter[edition_year][_eq]')).toBe('2026');
    expect(first.searchParams.get('filter[published_revision][_nnull]')).toBe(
      'true',
    );
    expect(call(1).url.pathname).toBe(`/items/cms_page_revisions/${REV_ID}`);

    expect(page).toMatchObject({
      id: PAGE_ID,
      revisionId: REV_ID,
      revisionNumber: 3,
      departmentSlug: DEPT,
      prokerSlug: PROKER,
      editionYear: YEAR,
      pageType: 'event',
      title: 'Bluecamp 2026',
      excerpt: 'Ringkasan',
      seo: { title: 'SEO title', description: null },
      publishedAt: '2026-11-01T00:00:00.000Z',
    });
    expect(page?.blocks).toHaveLength(1);
    expect(page?.blocks[0].type).toBe('hero');
  });

  it('uses the read token and the force-cache data cache', async () => {
    mockHappyPath();
    await getPublishedPage(DEPT, PROKER, YEAR);

    for (const n of [0, 1]) {
      const { init } = call(n);
      expect((init.headers as Record<string, string>).Authorization).toBe(
        'Bearer read-token',
      );
      expect(init.cache).toBe('force-cache');
    }
  });

  it('tags the identity read with the page tag and the revision read with page + page-id', async () => {
    mockHappyPath();
    await getPublishedPage(DEPT, PROKER, YEAR);

    const pageTag = `cms:page:${DEPT}/${PROKER}/${YEAR}`;
    expect(call(0).init.next?.tags).toEqual([pageTag]);
    expect(call(1).init.next?.tags).toEqual([
      pageTag,
      `cms:page-id:${PAGE_ID}`,
    ]);
  });

  it('never selects the cms_pages working copy', async () => {
    mockHappyPath();
    await getPublishedPage(DEPT, PROKER, YEAR);

    const pageFields = fieldsOf(call(0).url);
    expect(pageFields).not.toContain('blocks');
    expect(pageFields).not.toContain('*');
    expect(pageFields.some((f) => f.includes('blocks'))).toBe(false);
    expect(PUBLIC_PAGE_FIELDS).not.toContain('blocks');
    // blocks only ever come from the immutable revision
    expect(fieldsOf(call(1).url)).toContain('blocks');
  });

  it('returns null when nothing is published', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: [] }));
    await expect(getPublishedPage(DEPT, PROKER, YEAR)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['bad department slug', 'Bad Slug', PROKER, YEAR],
    ['bad proker slug', DEPT, '../x', YEAR],
    ['NaN year', DEPT, PROKER, Number('abc')],
    ['non-integer year', DEPT, PROKER, 2026.5],
    ['out-of-range year', DEPT, PROKER, 1999],
  ])('returns null without fetching for %s', async (_, d, p, y) => {
    await expect(getPublishedPage(d, p, y)).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null when the revision 404s (raced with unpublish)', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: [pageRow] }))
      .mockResolvedValueOnce(json({ errors: [] }, 404));
    await expect(getPublishedPage(DEPT, PROKER, YEAR)).resolves.toBeNull();
  });

  it('throws when the revision belongs to another page', async () => {
    mockHappyPath(revisionRow({ page: 'someone-else' }));
    await expect(getPublishedPage(DEPT, PROKER, YEAR)).rejects.toMatchObject({
      code: 'internal',
    });
    expect(logError).toHaveBeenCalled();
  });

  it('drops invalid blocks, keeps valid ones and warns', async () => {
    mockHappyPath(
      revisionRow({ blocks: [hero(), { type: 'mystery', version: 1 }] }),
    );
    const page = await getPublishedPage(DEPT, PROKER, YEAR);

    expect(page?.blocks.map((b) => b.type)).toEqual(['hero']);
    expect(logWarn).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['all blocks invalid', [{ type: 'mystery' }]],
    ['blocks not an array', { nope: true }],
    ['empty blocks', []],
  ])('returns null and logs an error when %s', async (_, blocks) => {
    mockHappyPath(revisionRow({ blocks }));
    await expect(getPublishedPage(DEPT, PROKER, YEAR)).resolves.toBeNull();
    expect(logError).toHaveBeenCalled();
  });

  it('throws on a Directus 5xx in the identity read (outage ≠ 404)', async () => {
    fetchMock.mockResolvedValueOnce(json({ errors: [] }, 503));
    await expect(getPublishedPage(DEPT, PROKER, YEAR)).rejects.toBeInstanceOf(
      DirectusRequestError,
    );
  });

  it('throws on a Directus 5xx in the revision read', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ data: [pageRow] }))
      .mockResolvedValueOnce(json({ errors: [] }, 500));
    await expect(getPublishedPage(DEPT, PROKER, YEAR)).rejects.toMatchObject({
      code: 'internal',
    });
  });

  it('throws internal on shape drift', async () => {
    fetchMock.mockResolvedValueOnce(
      json({ data: [{ ...pageRow, edition_year: '2026' }] }),
    );
    await expect(getPublishedPage(DEPT, PROKER, YEAR)).rejects.toMatchObject({
      code: 'internal',
    });
    expect(logError).toHaveBeenCalled();
  });
});

/* --------------------------------------------------- listPublishedRoutes */

describe('listPublishedRoutes', () => {
  const route = (id: string, dept: unknown, proker: unknown, year = YEAR) => ({
    id,
    edition_year: year,
    published_at: null,
    department: dept,
    proker,
  });

  it('makes one cms:routes-tagged read without blocks', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: [] }));
    await listPublishedRoutes();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const { url, init } = call(0);
    expect(url.pathname).toBe('/items/cms_pages');
    expect(url.searchParams.get('filter[published_revision][_nnull]')).toBe(
      'true',
    );
    expect(init.next?.tags).toEqual(['cms:routes']);
    expect(fieldsOf(url)).not.toContain('blocks');
    expect(PUBLIC_ROUTE_FIELDS).not.toContain('blocks');
  });

  it('maps rows and skips inactive department/proker', async () => {
    fetchMock.mockResolvedValueOnce(
      json({
        data: [
          route('a', { slug: DEPT }, { slug: PROKER }),
          route('b', null, { slug: PROKER }),
          route('c', { slug: DEPT }, null),
        ],
      }),
    );

    await expect(listPublishedRoutes()).resolves.toEqual([
      {
        departmentSlug: DEPT,
        prokerSlug: PROKER,
        editionYear: YEAR,
        pageId: 'a',
        publishedAt: null,
      },
    ]);
  });

  it('skips and logs a malformed row without failing the rest', async () => {
    fetchMock.mockResolvedValueOnce(
      json({
        data: [
          route('a', { slug: DEPT }, { slug: PROKER }),
          { id: 'bad', edition_year: 'nope' },
        ],
      }),
    );

    const routes = await listPublishedRoutes();
    expect(routes.map((r) => r.pageId)).toEqual(['a']);
    expect(logWarn).toHaveBeenCalledTimes(1);
  });

  it('throws on a Directus 5xx', async () => {
    fetchMock.mockResolvedValueOnce(json({ errors: [] }, 502));
    await expect(listPublishedRoutes()).rejects.toBeInstanceOf(
      DirectusRequestError,
    );
  });
});
