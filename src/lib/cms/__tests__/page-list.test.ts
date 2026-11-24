import {
  clearFilters,
  DEFAULT_PAGE_LIST_QUERY,
  editionYearOptions,
  hasActiveFilters,
  lastPageOf,
  PAGE_LIST_MIN_YEAR,
  type PageListQuery,
  parsePageListParams,
  refreshHref,
  resolvePageListState,
  toPageListParams,
  withFilters,
} from '@/lib/cms/page-list';

const DEPARTMENT_ID = '6f1c2d3e-4b5a-4c7d-8e9f-0a1b2c3d4e5f';

const params = (init: Record<string, string>) => new URLSearchParams(init);

describe('parsePageListParams', () => {
  it('returns the defaults for an empty URL', () => {
    expect(parsePageListParams(params({}))).toEqual(DEFAULT_PAGE_LIST_QUERY);
  });

  it('reads every valid field', () => {
    expect(
      parsePageListParams(
        params({
          department: DEPARTMENT_ID,
          status: 'in_review',
          year: '2026',
          q: '  bluecamp  ',
          page: '3',
          limit: '50',
        }),
      ),
    ).toEqual({
      departmentId: DEPARTMENT_ID,
      status: 'in_review',
      editionYear: 2026,
      q: 'bluecamp',
      page: 3,
      limit: 50,
    });
  });

  it('drops invalid values instead of throwing', () => {
    expect(
      parsePageListParams(
        params({
          department: 'not-a-uuid',
          status: 'deleted',
          year: 'twenty',
          q: 'x'.repeat(101),
          page: '0',
          limit: '30',
        }),
      ),
    ).toEqual(DEFAULT_PAGE_LIST_QUERY);
  });

  it('treats a blank search as no search', () => {
    expect(parsePageListParams(params({ q: '   ' })).q).toBeUndefined();
  });
});

describe('toPageListParams', () => {
  it('leaves defaults and empty values out', () => {
    expect(
      toPageListParams({ ...DEFAULT_PAGE_LIST_QUERY, q: '  ' }).toString(),
    ).toBe('');
  });

  it('round-trips through parsePageListParams', () => {
    const query: PageListQuery = {
      departmentId: DEPARTMENT_ID,
      status: 'draft',
      editionYear: 2025,
      q: 'tc run',
      page: 2,
      limit: 10,
    };

    expect(parsePageListParams(toPageListParams(query))).toEqual(query);
  });
});

describe('withFilters', () => {
  it('applies the change and resets to the first page', () => {
    const query: PageListQuery = { ...DEFAULT_PAGE_LIST_QUERY, page: 4 };

    expect(withFilters(query, { status: 'published' })).toEqual({
      ...DEFAULT_PAGE_LIST_QUERY,
      status: 'published',
      page: 1,
    });
  });

  it('clears a filter set to undefined', () => {
    const query: PageListQuery = {
      ...DEFAULT_PAGE_LIST_QUERY,
      editionYear: 2026,
    };

    expect(withFilters(query, { editionYear: undefined }).editionYear).toBe(
      undefined,
    );
  });
});

describe('clearFilters', () => {
  it('removes filters and search but keeps the page size', () => {
    expect(
      clearFilters({
        departmentId: DEPARTMENT_ID,
        status: 'draft',
        editionYear: 2026,
        q: 'seminar',
        page: 5,
        limit: 50,
      }),
    ).toEqual({ page: 1, limit: 50 });
  });
});

describe('hasActiveFilters', () => {
  it('is false for the defaults and a blank search', () => {
    expect(hasActiveFilters(DEFAULT_PAGE_LIST_QUERY)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_PAGE_LIST_QUERY, q: ' ' })).toBe(
      false,
    );
  });

  it.each<Partial<PageListQuery>>([
    { departmentId: DEPARTMENT_ID },
    { status: 'archived' },
    { editionYear: 2024 },
    { q: 'magang' },
  ])('is true when %o is set', (filter) => {
    expect(hasActiveFilters({ ...DEFAULT_PAGE_LIST_QUERY, ...filter })).toBe(
      true,
    );
  });

  it('ignores paging', () => {
    expect(hasActiveFilters({ page: 3, limit: 50 })).toBe(false);
  });
});

describe('editionYearOptions', () => {
  it('lists next year down to the minimum year, newest first', () => {
    const years = editionYearOptions(new Date('2026-11-24T00:00:00Z'));

    expect(years[0]).toBe(2027);
    expect(years.at(-1)).toBe(PAGE_LIST_MIN_YEAR);
    expect(years).toHaveLength(2027 - PAGE_LIST_MIN_YEAR + 1);
  });
});

describe('refreshHref', () => {
  it('sends the current view as next, encoded', () => {
    expect(refreshHref('/dashboard/cms', 'status=draft&page=2')).toBe(
      '/api/cms/auth/refresh?next=%2Fdashboard%2Fcms%3Fstatus%3Ddraft%26page%3D2',
    );
  });

  it('leaves out an empty query string', () => {
    expect(refreshHref('/dashboard/cms', '')).toBe(
      '/api/cms/auth/refresh?next=%2Fdashboard%2Fcms',
    );
  });
});

describe('lastPageOf', () => {
  it('rounds a partial page up', () => {
    expect(lastPageOf(26, 25)).toBe(2);
    expect(lastPageOf(25, 25)).toBe(1);
  });

  it('is 1 for an empty list', () => {
    expect(lastPageOf(0, 25)).toBe(1);
  });
});

describe('resolvePageListState', () => {
  const base = {
    isLoading: false,
    error: null,
    total: 3,
    filtered: false,
    page: 1,
    limit: 25,
  };

  it('is loading while the first response is pending', () => {
    expect(
      resolvePageListState({ ...base, isLoading: true, total: undefined }),
    ).toBe('loading');
  });

  it('is unauthenticated for a 401 error', () => {
    expect(
      resolvePageListState({ ...base, error: { status: 401 }, total: 0 }),
    ).toBe('unauthenticated');
  });

  it('is denied for a 403 error', () => {
    expect(
      resolvePageListState({ ...base, error: { status: 403 }, total: 0 }),
    ).toBe('denied');
  });

  it('is error for any other failure', () => {
    expect(resolvePageListState({ ...base, error: new Error('network') })).toBe(
      'error',
    );
    expect(resolvePageListState({ ...base, error: { status: 500 } })).toBe(
      'error',
    );
  });

  it('prefers the error over loading', () => {
    expect(
      resolvePageListState({
        ...base,
        isLoading: true,
        error: { status: 403 },
      }),
    ).toBe('denied');
  });

  it('is empty when there are no pages and no filters', () => {
    expect(resolvePageListState({ ...base, total: 0 })).toBe('empty');
  });

  it('is no-matches when filters exclude every page', () => {
    expect(resolvePageListState({ ...base, total: 0, filtered: true })).toBe(
      'no-matches',
    );
  });

  it('is ready when there are pages', () => {
    expect(resolvePageListState(base)).toBe('ready');
  });

  it('is ready on the last page', () => {
    expect(resolvePageListState({ ...base, total: 26, page: 2 })).toBe('ready');
  });

  it('is out-of-range past the last page', () => {
    expect(resolvePageListState({ ...base, total: 26, page: 3 })).toBe(
      'out-of-range',
    );
  });
});
