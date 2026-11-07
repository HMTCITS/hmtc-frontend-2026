/**
 * HMTC CMS — server-side read queries.
 *
 * One function per read the CMS UI or the public site needs. Each function:
 *  - is `server-only` (importing this from a client component fails the build),
 *  - names the collections and fields it touches,
 *  - applies the correct cache mode (tagged for published, `no-store` for drafts),
 *  - returns DTO shapes from `src/lib/cms/dto.ts`, not raw Directus rows.
 *
 * The actual `directusRead` / `directusAsUser` implementations live in
 * `src/lib/directus/client.ts`. This module does not read env vars directly.
 *
 * `CMS_PAGE_QUERIES` is the page → query registry used by
 * `docs/hmtc-cms-data-access-and-permissions.md` §5. Keep it in sync when a
 * screen changes.
 */
import 'server-only';

import { cache } from 'react';

import { cmsTags } from '@/lib/cms/cache-tags';
import type {
  AssetDto,
  DepartmentDto,
  PageDetail,
  PageSummary,
  PreviewGrantDto,
  ProkerDto,
  RevisionSummary,
  SessionUser,
} from '@/lib/cms/dto';
import { PAGE_ACTIONS, type PageAction, type PageStatus } from '@/lib/cms/vocab';
import { parseBlocksForRead } from '@/lib/directus/blocks';

/* ------------------------------------------------------------------ Client */

/**
 * Implemented in `client.ts`. Reproduced here as a type so this file is
 * self-contained and reviewable.
 *
 * - `directusRead` uses `DIRECTUS_READ_TOKEN`, `cache: 'force-cache'` and the
 *   supplied `tags`.
 * - `directusAsUser` uses the acting user's access token and
 *   `cache: 'no-store'`.
 * - Both normalise Directus errors; they never return a raw Directus body.
 */
export type DirectusRead = <T>(
  path: string,
  options: { tags?: string[]; searchParams?: Record<string, string> },
) => Promise<T>;

export type DirectusAsUser = <T>(
  accessToken: string,
  path: string,
  init?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown },
) => Promise<T>;

/* --------------------------------------------------------------- Registry */

export type PageQuerySpec = {
  /** Route in the CMS or on the public site. */
  route: string;
  /** Collections read by the page. */
  collections: string[];
  /** Fields requested, per collection. */
  fields: Record<string, string[]>;
  /** Cache mode. Editor reads are always `no-store`. */
  cache: 'tagged' | 'no-store';
  /** Tags applied when `cache` is `tagged`. */
  tags?: (params: Record<string, string | number>) => string[];
  /** Workflow action the screen requires, if any. */
  action?: PageAction;
  /** Free-form note for the implementer. */
  note?: string;
};

export const CMS_PAGE_QUERIES = {
  dashboard: {
    route: '/dashboard/cms',
    collections: ['cms_pages', 'cms_review_events'],
    fields: {
      cms_pages: ['id', 'status', 'department', 'date_updated'],
      cms_review_events: ['id', 'action', 'actor', 'date_created'],
    },
    cache: 'no-store',
    note: 'Counts by status, filtered to readable departments. Latest 10 review events.',
  },
  pagesList: {
    route: '/dashboard/cms/pages',
    collections: ['cms_pages', 'cms_departments', 'cms_prokers'],
    fields: {
      cms_pages: [
        'id',
        'title',
        'slug',
        'page_type',
        'status',
        'edition_year',
        'published_at',
        'date_updated',
        'published_revision',
      ],
      cms_departments: ['id', 'name', 'slug'],
      cms_prokers: ['id', 'title', 'slug'],
    },
    cache: 'no-store',
    note: 'Filter by readable departments; optional status/year/q; paginate 25.',
  },
  pageEditor: {
    route: '/dashboard/cms/pages/:id',
    collections: [
      'cms_pages',
      'cms_departments',
      'cms_prokers',
      'cms_review_events',
      'cms_page_revisions',
    ],
    fields: {
      cms_pages: [
        'id',
        'title',
        'slug',
        'page_type',
        'status',
        'department',
        'proker',
        'edition_year',
        'blocks',
        'published_revision',
        'current_revision',
        'published_at',
        'date_updated',
        'excerpt',
        'featured_image',
        'seo_title',
        'seo_description',
        'template',
      ],
      cms_review_events: [
        'id',
        'action',
        'from_status',
        'to_status',
        'comment',
        'actor',
        'date_created',
      ],
      cms_page_revisions: ['id', 'revision_number', 'author', 'date_created'],
    },
    cache: 'no-store',
    action: 'edit',
    note: 'Validate blocks with parseBlocksForRead; compute allowedActions from PAGE_ACTIONS.',
  },
  revisions: {
    route: '/dashboard/cms/pages/:id/revisions',
    collections: ['cms_page_revisions', 'directus_users'],
    fields: {
      cms_page_revisions: [
        'id',
        'revision_number',
        'title',
        'author',
        'change_note',
        'date_created',
      ],
      directus_users: ['id', 'first_name', 'last_name'],
    },
    cache: 'no-store',
    note: 'Sort revision_number desc.',
  },
  reviews: {
    route: '/dashboard/cms/reviews',
    collections: ['cms_pages', 'cms_review_events'],
    fields: {
      cms_pages: [
        'id',
        'title',
        'status',
        'department',
        'proker',
        'edition_year',
        'date_updated',
      ],
      cms_review_events: ['id', 'action', 'actor', 'date_created'],
    },
    cache: 'no-store',
    action: 'request_changes',
    note: 'status = in_review in departments where the user is reviewer/publisher; latest submitted event for self-approval display.',
  },
  media: {
    route: '/dashboard/cms/media',
    collections: ['directus_files', 'directus_folders'],
    fields: {
      directus_files: ['id', 'title', 'type', 'width', 'height', 'filesize', 'folder'],
      directus_folders: ['id', 'name'],
    },
    cache: 'no-store',
    note: 'Filter folder = Public Assets.',
  },
  templates: {
    route: '/dashboard/cms/templates',
    collections: ['cms_templates', 'cms_departments'],
    fields: {
      cms_templates: ['id', 'name', 'status', 'department', 'date_updated', 'blocks'],
      cms_departments: ['id', 'name', 'slug'],
    },
    cache: 'no-store',
    note: 'Filter readable departments; status != archived.',
  },
  previewManagement: {
    route: '/dashboard/cms/pages/:id/preview',
    collections: ['cms_preview_grants', 'cms_page_revisions'],
    fields: {
      cms_preview_grants: [
        'id',
        'page',
        'revision',
        'created_by',
        'date_created',
        'expires_at',
        'revoked_at',
      ],
      cms_page_revisions: ['id', 'revision_number', 'title'],
    },
    cache: 'no-store',
    action: 'create_preview',
    note: 'List grants including expired/revoked; sort date_created desc.',
  },
  publicPage: {
    route: '/:dept/:proker/:year',
    collections: ['cms_pages', 'cms_page_revisions'],
    fields: {
      cms_pages: ['id', 'published_revision', 'department', 'proker', 'edition_year'],
      cms_page_revisions: [
        'id',
        'title',
        'blocks',
        'blocks_schema_version',
        'excerpt',
        'featured_image',
        'seo_title',
        'seo_description',
      ],
    },
    cache: 'tagged',
    tags: ({ dept, proker, year }) => [
      cmsTags.page(String(dept), String(proker), Number(year)),
    ],
    note: 'Resolve published_revision, then read that revision. Never read cms_pages.blocks.',
  },
  previewRender: {
    route: '/preview/:token',
    collections: ['cms_preview_grants', 'cms_page_revisions'],
    fields: {
      cms_preview_grants: ['id', 'page', 'revision', 'expires_at', 'revoked_at'],
      cms_page_revisions: ['id', 'title', 'blocks', 'blocks_schema_version'],
    },
    cache: 'no-store',
    note: 'Hash the path token (SHA-256 hex); require unexpired and unrevoked.',
  },
  sitemap: {
    route: '/sitemap.xml',
    collections: ['cms_pages'],
    fields: {
      cms_pages: ['department.slug', 'proker.slug', 'edition_year', 'date_updated'],
    },
    cache: 'tagged',
    tags: () => [cmsTags.routes],
    note: 'published_revision IS NOT NULL and status != archived.',
  },
} as const satisfies Record<string, PageQuerySpec>;

/* ------------------------------------------------------------ Read shapes */

type DirectusList<T> = { data: T[] };

type RawPageRow = {
  id: string;
  title: string;
  slug: string;
  page_type: 'event' | 'program';
  status: PageStatus;
  department: string | { id: string; slug: string };
  proker: string | { id: string; slug: string; title: string };
  edition_year: number;
  blocks: unknown;
  published_revision: string | null;
  current_revision: string | null;
  published_at: string | null;
  date_updated: string;
  excerpt: string | null;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  template: number | null;
};

type RawRevisionRow = {
  id: string;
  revision_number: number;
  title: string;
  blocks: unknown;
  blocks_schema_version: number;
  author: string | null;
  change_note: string | null;
  date_created: string;
  page: string;
};

type RawReviewEvent = {
  id: number;
  action: string;
  from_status: PageStatus | null;
  to_status: PageStatus;
  comment: string | null;
  actor: string;
  date_created: string;
};

type RawMembership = {
  department: string | { id: string; slug: string };
  membership_role: 'editor' | 'reviewer' | 'publisher' | 'template_maintainer';
  is_active: boolean;
};

/* ------------------------------------------------------------- Helpers */

function relationSlug(value: string | { slug: string }): string {
  return typeof value === 'string' ? value : value.slug;
}

function relationId(value: string | { id: string }): string {
  return typeof value === 'string' ? value : value.id;
}

function buildPath(
  collection: string,
  fields: string[],
  searchParams: Record<string, string> = {},
): string {
  const params = new URLSearchParams({
    fields: fields.join(','),
    ...searchParams,
  });
  return `/items/${collection}?${params.toString()}`;
}

/**
 * Compute the actions a user may take on a page.
 *
 * This is the same rule as the Route Handlers; the UI uses it only to hide
 * buttons. The server remains authoritative.
 */
export function computeAllowedActions(
  user: SessionUser,
  page: Pick<RawPageRow, 'status' | 'published_revision' | 'department'>,
  latestSubmissionActorId: string | null,
): PageAction[] {
  const departmentId = relationId(page.department);
  const membership = user.isAdmin
    ? null
    : user.memberships.find((m) => m.departmentId === departmentId);

  return (Object.keys(PAGE_ACTIONS) as PageAction[]).filter((action) => {
    const rule = PAGE_ACTIONS[action];
    if (!rule.from.includes(page.status)) return false;
    if (rule.requiresLive && !page.published_revision) return false;
    if (action === 'publish' && latestSubmissionActorId === user.id) {
      return false;
    }
    if (user.isAdmin) return true;
    return membership ? rule.roles.includes(membership.role) : false;
  });
}

/* ---------------------------------------------------------- Public reads */

/**
 * Published page by route identity.
 *
 * Reads `cms_pages` only to resolve `published_revision`, then reads that
 * immutable revision. `cms_pages.blocks` is never selected (R2).
 */
export function getPublishedPageByRoute(
  directusRead: DirectusRead,
  deptSlug: string,
  prokerSlug: string,
  year: number,
): Promise<{ page: RawPageRow; revision: RawRevisionRow } | null> {
  return cache(async () => {
    const tags = [cmsTags.page(deptSlug, prokerSlug, year)];
    const pageQuery = buildPath(
      'cms_pages',
      ['id', 'published_revision', 'department.slug', 'proker.slug', 'edition_year'],
      {
        'filter[department][slug][_eq]': deptSlug,
        'filter[proker][slug][_eq]': prokerSlug,
        'filter[edition_year][_eq]': String(year),
        'filter[published_revision][_nnull]': 'true',
        limit: '1',
      },
    );
    const pages = await directusRead<DirectusList<RawPageRow>>(pageQuery, { tags });
    const page = pages.data[0];
    if (!page?.published_revision) return null;

    const revisionQuery = buildPath(
      'cms_page_revisions',
      [
        'id',
        'title',
        'blocks',
        'blocks_schema_version',
        'excerpt',
        'featured_image',
        'seo_title',
        'seo_description',
      ],
      { 'filter[id][_eq]': page.published_revision, limit: '1' },
    );
    const revisions = await directusRead<DirectusList<RawRevisionRow>>(revisionQuery, {
      tags,
    });
    const revision = revisions.data[0];
    return revision ? { page, revision } : null;
  })();
}

/** Routes for the sitemap. Excludes archived and unpublished pages. */
export function listPublishedRoutes(directusRead: DirectusRead) {
  return cache(async () => {
    const query = buildPath(
      'cms_pages',
      ['department.slug', 'proker.slug', 'edition_year', 'date_updated'],
      {
        'filter[published_revision][_nnull]': 'true',
        'filter[status][_neq]': 'archived',
        limit: '-1',
      },
    );
    return directusRead<DirectusList<RawPageRow>>(query, {
      tags: [cmsTags.routes],
    });
  })();
}

/* ---------------------------------------------------------- Editor reads */

/**
 * Editor page detail. `cache: 'no-store'` — drafts must never enter a shared
 * cache.
 */
export async function getPageForEditor(
  directusAsUser: DirectusAsUser,
  accessToken: string,
  pageId: string,
  user: SessionUser,
): Promise<PageDetail | null> {
  const pageQuery = buildPath(
    'cms_pages',
    [
      'id',
      'title',
      'slug',
      'page_type',
      'status',
      'department',
      'proker',
      'edition_year',
      'blocks',
      'published_revision',
      'current_revision',
      'published_at',
      'date_updated',
      'excerpt',
      'featured_image',
      'seo_title',
      'seo_description',
      'template',
    ],
    { 'filter[id][_eq]': pageId, limit: '1' },
  );
  const pages = await directusAsUser<DirectusList<RawPageRow>>(
    accessToken,
    pageQuery,
  );
  const page = pages.data[0];
  if (!page) return null;

  const historyQuery = buildPath(
    'cms_review_events',
    ['id', 'action', 'from_status', 'to_status', 'comment', 'actor', 'date_created'],
    { 'filter[page][_eq]': pageId, sort: '-date_created', limit: '50' },
  );
  const history = await directusAsUser<DirectusList<RawReviewEvent>>(
    accessToken,
    historyQuery,
  );

  const latestSubmission = history.data.find((event) => event.action === 'submitted');
  const parsed = parseBlocksForRead(page.blocks);
  const departmentId = relationId(page.department);
  const departmentSlug = relationSlug(page.department);
  const prokerSlug = relationSlug(page.proker);

  const summary: PageSummary = {
    id: page.id,
    title: page.title,
    slug: page.slug,
    pageType: page.page_type,
    status: page.status,
    departmentId,
    prokerId: relationId(page.proker),
    editionYear: page.edition_year,
    isLive: Boolean(page.published_revision),
    publishedAt: page.published_at,
    updatedAt: page.date_updated,
    path: `/${departmentSlug}/${prokerSlug}/${page.edition_year}`,
  };

  return {
    ...summary,
    blocks: parsed.blocks,
    invalidBlocks: parsed.invalid,
    excerpt: page.excerpt,
    featuredImageId: page.featured_image,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    templateId: page.template,
    publishedRevisionId: page.published_revision,
    currentRevisionId: page.current_revision,
    lastSubmission: latestSubmission
      ? { actorId: latestSubmission.actor, at: latestSubmission.date_created }
      : null,
    history: history.data.map((event) => ({
      id: event.id,
      action: event.action as PageDetail['history'][number]['action'],
      fromStatus: event.from_status,
      toStatus: event.to_status,
      comment: event.comment,
      actorId: event.actor,
      actorName: '', // resolved by the Route Handler from directus_users
      createdAt: event.date_created,
    })),
    allowedActions: computeAllowedActions(user, page, latestSubmission?.actor ?? null),
  };
}

/** Pages the user may read, paginated. */
export async function listPagesForUser(
  directusAsUser: DirectusAsUser,
  accessToken: string,
  user: SessionUser,
  filters: {
    departmentId?: string;
    status?: PageStatus;
    editionYear?: number;
    q?: string;
    page?: number;
    limit?: number;
  },
): Promise<{ items: PageSummary[]; total: number }> {
  const params: Record<string, string> = {
    fields:
      'id,title,slug,page_type,status,department,proker,edition_year,published_revision,published_at,date_updated',
    sort: '-date_updated',
    limit: String(filters.limit ?? 25),
    page: String(filters.page ?? 1),
    meta: 'total_count',
  };
  if (filters.departmentId) params['filter[department][_eq]'] = filters.departmentId;
  if (filters.status) params['filter[status][_eq]'] = filters.status;
  if (filters.editionYear) {
    params['filter[edition_year][_eq]'] = String(filters.editionYear);
  }
  if (filters.q) params['filter[title][_icontains]'] = filters.q;

  // Non-admin users only see their departments. Admins see everything.
  if (!user.isAdmin) {
    const ids = user.memberships.map((m) => m.departmentId);
    if (ids.length === 0) return { items: [], total: 0 };
    params['filter[department][_in]'] = ids.join(',');
  }

  const query = `/items/cms_pages?${new URLSearchParams(params).toString()}`;
  const result = await directusAsUser<{
    data: RawPageRow[];
    meta?: { total_count?: number };
  }>(accessToken, query);

  return {
    items: result.data.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      pageType: page.page_type,
      status: page.status,
      departmentId: relationId(page.department),
      prokerId: relationId(page.proker),
      editionYear: page.edition_year,
      isLive: Boolean(page.published_revision),
      publishedAt: page.published_at,
      updatedAt: page.date_updated,
      path: `/${relationSlug(page.department)}/${relationSlug(page.proker)}/${page.edition_year}`,
    })),
    total: result.meta?.total_count ?? result.data.length,
  };
}

/** Revisions for one page, newest first. */
export async function listRevisions(
  directusAsUser: DirectusAsUser,
  accessToken: string,
  pageId: string,
): Promise<RevisionSummary[]> {
  const query = buildPath(
    'cms_page_revisions',
    ['id', 'revision_number', 'title', 'author', 'change_note', 'date_created', 'page'],
    { 'filter[page][_eq]': pageId, sort: '-revision_number', limit: '-1' },
  );
  const result = await directusAsUser<DirectusList<RawRevisionRow>>(
    accessToken,
    query,
  );
  return result.data.map((revision) => ({
    id: revision.id,
    revisionNumber: revision.revision_number,
    title: revision.title,
    authorId: revision.author,
    authorName: null,
    changeNote: revision.change_note,
    createdAt: revision.date_created,
    isPublished: false, // resolved by the Route Handler against cms_pages
  }));
}

/** Preview grants for one page, including expired and revoked. */
export async function listPreviewGrants(
  directusAsUser: DirectusAsUser,
  accessToken: string,
  pageId: string,
): Promise<PreviewGrantDto[]> {
  const query = buildPath(
    'cms_preview_grants',
    ['id', 'page', 'revision', 'created_by', 'date_created', 'expires_at', 'revoked_at'],
    { 'filter[page][_eq]': pageId, sort: '-date_created', limit: '-1' },
  );
  const result = await directusAsUser<
    DirectusList<{
      id: string;
      page: string;
      revision: string;
      created_by: string | null;
      date_created: string;
      expires_at: string;
      revoked_at: string | null;
    }>
  >(accessToken, query);

  return result.data.map((grant) => ({
    id: grant.id,
    pageId: grant.page,
    revisionId: grant.revision,
    createdById: grant.created_by,
    createdAt: grant.date_created,
    expiresAt: grant.expires_at,
    revokedAt: grant.revoked_at,
  }));
}

/* ------------------------------------------------------------- Lookups */

export function listDepartments(
  directusAsUser: DirectusAsUser,
  accessToken: string,
): Promise<DepartmentDto[]> {
  const query = buildPath(
    'cms_departments',
    ['id', 'name', 'slug'],
    { 'filter[is_active][_eq]': 'true', sort: 'name', limit: '-1' },
  );
  return directusAsUser<DirectusList<DepartmentDto>>(accessToken, query).then(
    (r) => r.data,
  );
}

export function listProkers(
  directusAsUser: DirectusAsUser,
  accessToken: string,
  departmentId?: string,
): Promise<ProkerDto[]> {
  const params: Record<string, string> = {
    fields: 'id,department,title,slug,is_active',
    'filter[is_active][_eq]': 'true',
    sort: 'title',
    limit: '-1',
  };
  if (departmentId) params['filter[department][_eq]'] = departmentId;
  const query = `/items/cms_prokers?${new URLSearchParams(params).toString()}`;
  return directusAsUser<
    DirectusList<{
      id: string;
      department: string;
      title: string;
      slug: string;
      is_active: boolean;
    }>
  >(accessToken, query).then((r) =>
    r.data.map((proker) => ({
      id: proker.id,
      departmentId: proker.department,
      title: proker.title,
      slug: proker.slug,
      isActive: proker.is_active,
    })),
  );
}

export function listMediaAssets(
  directusAsUser: DirectusAsUser,
  accessToken: string,
): Promise<AssetDto[]> {
  const query = buildPath(
    'directus_files',
    ['id', 'title', 'type', 'width', 'height', 'filesize', 'folder'],
    { 'filter[folder][name][_eq]': 'Public Assets', sort: '-date_created', limit: '-1' },
  );
  return directusAsUser<
    DirectusList<{
      id: string;
      title: string | null;
      type: string;
      width: number | null;
      height: number | null;
      filesize: number;
    }>
  >(accessToken, query).then((r) =>
    r.data.map((asset) => ({
      id: asset.id,
      title: asset.title,
      type: asset.type,
      width: asset.width,
      height: asset.height,
      filesize: asset.filesize,
    })),
  );
}

/* ----------------------------------------------------- Membership bridge */

/**
 * Resolve the session user's memberships. Used by `session.ts`; exposed here
 * so the query shape lives next to the other reads.
 */
export function getMembershipsForUser(
  directusAsUser: DirectusAsUser,
  accessToken: string,
  userId: string,
): Promise<
  Array<{ departmentId: string; departmentSlug: string; role: RawMembership['membership_role'] }>
> {
  const query = buildPath(
    'cms_department_memberships',
    ['department.id', 'department.slug', 'membership_role', 'is_active'],
    { 'filter[user][_eq]': userId, 'filter[is_active][_eq]': 'true', limit: '-1' },
  );
  return directusAsUser<DirectusList<RawMembership>>(accessToken, query).then((r) =>
    r.data.map((membership) => ({
      departmentId: relationId(membership.department),
      departmentSlug: relationSlug(membership.department),
      role: membership.membership_role,
    })),
  );
}

