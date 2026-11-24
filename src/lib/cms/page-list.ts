/**
 * HMTC CMS — state helpers for the dashboard page list.
 *
 * Pure functions only: the URL ↔ query mapping, filter changes, the year
 * options, paging and the choice of which screen state to render. Field rules come
 * from the `listPages` query schema, so the URL can never carry a value the
 * API would reject.
 *
 * Isomorphic: no React, no secrets, safe to import from client components.
 */
import type { z } from 'zod';

import { cmsEndpoints } from '@/lib/cms/api-contract';
import type { PageStatus, PageType } from '@/lib/cms/vocab';

/**
 * Rows-per-page choices offered in the table's page-size menu. Sent to the API
 * as `limit` (the contract caps it at 100). A `limit` in the URL that is not
 * one of these falls back to the default.
 */
export const PAGE_LIST_PAGE_SIZES = [10, 25, 50] as const;

/** One of the allowed rows-per-page values: `10 | 25 | 50`. */
export type PageListPageSize = (typeof PAGE_LIST_PAGE_SIZES)[number];

/** Rows per page when the URL does not choose one; matches the API default. */
export const PAGE_LIST_DEFAULT_PAGE_SIZE: PageListPageSize = 25;

/** Oldest edition year offered in the year filter. */
export const PAGE_LIST_MIN_YEAR = 2020;

export const PAGE_STATUS_LABELS: Record<PageStatus, string> = {
  draft: 'Draft',
  in_review: 'In review',
  changes_requested: 'Perlu revisi',
  published: 'Published',
  archived: 'Archived',
};

export const PAGE_TYPE_LABELS: Record<PageType, string> = {
  event: 'Event',
  program: 'Program',
};

export type PageListFilters = {
  departmentId?: string;
  status?: PageStatus;
  editionYear?: number;
  q?: string;
};

export type PageListQuery = PageListFilters & {
  page: number;
  limit: number;
};

export const DEFAULT_PAGE_LIST_QUERY: PageListQuery = {
  page: 1,
  limit: PAGE_LIST_DEFAULT_PAGE_SIZE,
};

/** URL parameter names, kept short and readable in shared links. */
const PARAM = {
  departmentId: 'department',
  status: 'status',
  editionYear: 'year',
  q: 'q',
  page: 'page',
  limit: 'limit',
} as const satisfies Record<keyof PageListQuery, string>;

const fields = cmsEndpoints.listPages.query.shape;

type Field = keyof typeof fields;

/** Validate one raw value with its contract field; invalid or empty → undefined. */
function readField<K extends Field>(
  key: K,
  raw: string | null,
): z.output<(typeof fields)[K]> | undefined {
  if (raw === null || raw.trim() === '') return undefined;
  const result = (fields[key] as z.ZodType).safeParse(raw);
  return result.success
    ? (result.data as z.output<(typeof fields)[K]>)
    : undefined;
}

function isPageSize(value: number): boolean {
  return (PAGE_LIST_PAGE_SIZES as readonly number[]).includes(value);
}

/** URL → query. Invalid values are dropped, never thrown. */
export function parsePageListParams(params: URLSearchParams): PageListQuery {
  const page = readField('page', params.get(PARAM.page));
  const limit = readField('limit', params.get(PARAM.limit));
  const q = readField('q', params.get(PARAM.q));

  return {
    departmentId: readField('departmentId', params.get(PARAM.departmentId)),
    status: readField('status', params.get(PARAM.status)),
    editionYear: readField('editionYear', params.get(PARAM.editionYear)),
    q: q === '' ? undefined : q,
    page: page && page >= 1 ? page : DEFAULT_PAGE_LIST_QUERY.page,
    limit: limit && isPageSize(limit) ? limit : DEFAULT_PAGE_LIST_QUERY.limit,
  };
}

/** Query → URL. Defaults and empty values are left out. */
export function toPageListParams(query: PageListQuery): URLSearchParams {
  const params = new URLSearchParams();
  const q = query.q?.trim();

  if (query.departmentId) params.set(PARAM.departmentId, query.departmentId);
  if (query.status) params.set(PARAM.status, query.status);
  if (query.editionYear !== undefined) {
    params.set(PARAM.editionYear, String(query.editionYear));
  }
  if (q) params.set(PARAM.q, q);
  if (query.page !== DEFAULT_PAGE_LIST_QUERY.page) {
    params.set(PARAM.page, String(query.page));
  }
  if (query.limit !== DEFAULT_PAGE_LIST_QUERY.limit) {
    params.set(PARAM.limit, String(query.limit));
  }

  return params;
}

/** Apply filter changes. Any change sends the list back to the first page. */
export function withFilters(
  query: PageListQuery,
  next: Partial<PageListFilters>,
): PageListQuery {
  return { ...query, ...next, page: DEFAULT_PAGE_LIST_QUERY.page };
}

/** Clear every filter and the search, keeping the page size. */
export function clearFilters(query: PageListQuery): PageListQuery {
  return { page: DEFAULT_PAGE_LIST_QUERY.page, limit: query.limit };
}

export function hasActiveFilters(query: PageListQuery): boolean {
  return Boolean(
    query.departmentId ||
      query.status ||
      query.editionYear !== undefined ||
      query.q?.trim(),
  );
}

/** Edition years to offer, newest first: next year down to the minimum. */
export function editionYearOptions(now: Date = new Date()): number[] {
  const newest = now.getFullYear() + 1;
  const years: number[] = [];
  for (let year = newest; year >= PAGE_LIST_MIN_YEAR; year -= 1) {
    years.push(year);
  }
  return years;
}

/** Server route that rotates the session cookie, then redirects to `next`. */
const CMS_REFRESH_ROUTE = '/api/cms/auth/refresh';

/** Where to send an expired session so it comes back to the same view. */
export function refreshHref(pathname: string, search: string): string {
  const here = search ? `${pathname}?${search}` : pathname;
  return `${CMS_REFRESH_ROUTE}?next=${encodeURIComponent(here)}`;
}

/** Last page that has rows; at least 1 so an empty list still has a page. */
export function lastPageOf(total: number, limit: number): number {
  return Math.max(1, Math.ceil(total / limit));
}

export type PageListState =
  | 'loading'
  | 'unauthenticated'
  | 'denied'
  | 'error'
  | 'empty'
  | 'no-matches'
  | 'out-of-range'
  | 'ready';

type PageListStateInput = {
  isLoading: boolean;
  error: unknown;
  total: number | undefined;
  filtered: boolean;
  page: number;
  limit: number;
};

function hasStatus(error: unknown, status: number): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === status
  );
}

/** The single place that decides what the page list screen shows. */
export function resolvePageListState({
  isLoading,
  error,
  total,
  filtered,
  page,
  limit,
}: PageListStateInput): PageListState {
  if (error) {
    if (hasStatus(error, 401)) return 'unauthenticated';
    return hasStatus(error, 403) ? 'denied' : 'error';
  }
  if (isLoading || total === undefined) return 'loading';
  if (total === 0) return filtered ? 'no-matches' : 'empty';
  if (page > lastPageOf(total, limit)) return 'out-of-range';
  return 'ready';
}
