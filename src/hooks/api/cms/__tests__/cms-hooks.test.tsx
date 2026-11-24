import {
  QueryClient,
  QueryClientProvider,
  type QueryKey,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useCmsDepartments } from '@/hooks/api/cms/useCmsDepartments';
import { useCmsProkers } from '@/hooks/api/cms/useCmsProkers';
import { useCreatePage } from '@/hooks/api/cms/useCreatePage';
import { usePages } from '@/hooks/api/cms/usePages';
import { MOCK_PAGES } from '@/lib/cms/fixtures';
import { DEFAULT_PAGE_LIST_QUERY } from '@/lib/cms/page-list';
import { CmsClientError } from '@/lib/cms-client';
import { cmsKeys } from '@/lib/query-keys';

const ID = '11111111-1111-4111-8111-111111111111';

/** Minimal stand-in for `Response`; jsdom does not provide one. */
type FakeResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type FetchMock = jest.Mock<Promise<FakeResponse>, [string, RequestInit?]>;

function mockFetch(body: unknown, status = 200): FetchMock {
  const fn = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  ) as unknown as FetchMock;
  global.fetch = fn as unknown as typeof fetch;
  return fn;
}

function requestedUrl(fn: FetchMock): string {
  return fn.mock.calls[0][0];
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

const createdPage = {
  ...MOCK_PAGES[0],
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
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('usePages', () => {
  it('requests the list with the given filters', async () => {
    const fetchMock = mockFetch({
      items: MOCK_PAGES,
      total: MOCK_PAGES.length,
    });
    const { wrapper } = setup();

    const { result } = renderHook(
      () =>
        usePages({
          ...DEFAULT_PAGE_LIST_QUERY,
          status: 'draft',
          editionYear: 2026,
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.total).toBe(MOCK_PAGES.length);
    expect(requestedUrl(fetchMock)).toBe(
      '/api/cms/pages?status=draft&editionYear=2026&page=1&limit=25',
    );
  });

  it('exposes a 403 as a CmsClientError with that status', async () => {
    mockFetch(
      { error: { code: 'forbidden', message: 'Tidak punya akses.' } },
      403,
    );
    const { wrapper } = setup();

    const { result } = renderHook(() => usePages(DEFAULT_PAGE_LIST_QUERY), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(CmsClientError);
    expect((result.current.error as CmsClientError).status).toBe(403);
  });
});

describe('lookups', () => {
  it('loads departments', async () => {
    const fetchMock = mockFetch({
      items: [{ id: ID, name: 'Riset dan Teknologi', slug: 'ristek' }],
    });
    const { wrapper } = setup();

    const { result } = renderHook(() => useCmsDepartments(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestedUrl(fetchMock)).toBe('/api/cms/departments');
    expect(result.current.data?.items).toHaveLength(1);
  });

  it('narrows prokers to a department when one is given', async () => {
    const fetchMock = mockFetch({ items: [] });
    const { wrapper } = setup();

    const { result } = renderHook(() => useCmsProkers(ID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestedUrl(fetchMock)).toBe(`/api/cms/prokers?departmentId=${ID}`);
  });

  it('loads every proker without a department', async () => {
    const fetchMock = mockFetch({ items: [] });
    const { wrapper } = setup();

    const { result } = renderHook(() => useCmsProkers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestedUrl(fetchMock)).toBe('/api/cms/prokers');
  });
});

describe('useCreatePage', () => {
  const body = {
    prokerId: ID,
    editionYear: 2026,
    title: 'Bluecamp 2026',
    pageType: 'event' as const,
  };

  it('posts the body and refreshes every page list', async () => {
    const fetchMock = mockFetch({ page: createdPage }, 201);
    const { queryClient, wrapper } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePage(), { wrapper });
    await act(() => result.current.mutateAsync(body));

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/cms/pages');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(init?.body as string)).toEqual(body);
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: cmsKeys.pageLists() as QueryKey,
    });
  });

  it('passes a duplicate error to the caller without refreshing', async () => {
    mockFetch(
      { error: { code: 'duplicate', message: 'Halaman sudah ada.' } },
      409,
    );
    const { queryClient, wrapper } = setup();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreatePage(), { wrapper });

    await expect(
      act(() => result.current.mutateAsync(body)),
    ).rejects.toMatchObject({ code: 'duplicate', status: 409 });
    expect(invalidate).not.toHaveBeenCalled();
  });
});
