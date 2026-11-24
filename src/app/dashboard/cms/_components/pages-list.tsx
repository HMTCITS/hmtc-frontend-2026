'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { usePages } from '@/hooks/api/cms/usePages';
import {
  clearFilters,
  hasActiveFilters,
  lastPageOf,
  type PageListQuery,
  parsePageListParams,
  refreshHref,
  resolvePageListState,
  toPageListParams,
} from '@/lib/cms/page-list';
import { CmsClientError } from '@/lib/cms-client';

import {
  CmsEmpty,
  CmsError,
  CmsLoading,
  CmsPermissionDenied,
} from './cms-states';
import { PagesTable } from './pages-table';

/**
 * Page list backed by `GET /api/cms/pages`. The URL is the source of truth for
 * the query, so a filtered or paged view can be shared and survives reload.
 */
export function PagesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = parsePageListParams(new URLSearchParams(searchParams));

  const { data, error, isLoading, refetch } = usePages(query);
  const filtered = hasActiveFilters(query);
  const total = data?.total ?? 0;
  const lastPage = lastPageOf(total, query.limit);
  const state = resolvePageListState({
    isLoading,
    error,
    total: data?.total,
    filtered,
    page: query.page,
    limit: query.limit,
  });

  function hrefFor(next: PageListQuery): string {
    const params = toPageListParams(next).toString();
    return params ? `${pathname}?${params}` : pathname;
  }

  function navigate(next: PageListQuery) {
    router.push(hrefFor(next));
  }

  const refreshTo =
    state === 'unauthenticated'
      ? refreshHref(pathname, searchParams.toString())
      : null;
  const lastPageHref =
    state === 'out-of-range' ? hrefFor({ ...query, page: lastPage }) : null;

  useEffect(() => {
    // Full navigation: the refresh route sets cookies, then redirects back.
    if (refreshTo) window.location.assign(refreshTo);
  }, [refreshTo]);

  useEffect(() => {
    // replace, not push: the page that does not exist stays out of history.
    if (lastPageHref) router.replace(lastPageHref);
  }, [lastPageHref, router]);

  switch (state) {
    case 'loading':
    case 'unauthenticated':
    case 'out-of-range':
      return <CmsLoading rows={3} />;
    case 'denied':
      return (
        <CmsPermissionDenied
          code={error instanceof CmsClientError ? error.code : 'forbidden'}
        />
      );
    case 'error':
      return (
        <CmsError
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => void refetch()}
        />
      );
    case 'empty':
      return (
        <CmsEmpty
          title='Belum ada halaman'
          description='Buat halaman pertama untuk satu proker, lalu kirim untuk direview.'
        />
      );
    case 'no-matches':
      return (
        <CmsEmpty
          title='Tidak ada halaman yang cocok'
          description='Ubah atau hapus filter untuk melihat halaman lain.'
          action={
            <Button
              size='sm'
              variant='outline'
              type='button'
              onClick={() => navigate(clearFilters(query))}
            >
              Hapus filter
            </Button>
          }
        />
      );
    case 'ready':
      return (
        <div className='space-y-3'>
          <PagesTable pages={data?.items ?? []} />
          <div className='flex items-center justify-between gap-3'>
            <Typography
              as='p'
              font='satoshi'
              variant='c2'
              className='text-muted-foreground'
            >
              Halaman {query.page} dari {lastPage} · {total} halaman
            </Typography>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='outline'
                type='button'
                disabled={query.page <= 1}
                onClick={() => navigate({ ...query, page: query.page - 1 })}
              >
                Sebelumnya
              </Button>
              <Button
                size='sm'
                variant='outline'
                type='button'
                disabled={query.page >= lastPage}
                onClick={() => navigate({ ...query, page: query.page + 1 })}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        </div>
      );
  }
}
