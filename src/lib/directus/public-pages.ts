/**
 * HMTC CMS — public, read-only page accessors.
 *
 * What the public site renders is the page's **published revision**, an
 * immutable snapshot in `cms_page_revisions`. `cms_pages.blocks` is the
 * working copy and is never selected here (C4 / Q9): reading it would put an
 * unreviewed draft live the moment an editor saves. The `nextjs-reader` policy
 * (migration 004) withholds that field too, so the rule is enforced twice.
 *
 * Every read goes through `directusRead` (static `DIRECTUS_READ_TOKEN`,
 * `force-cache`) and carries `cmsTags`, so publish/unpublish/archive and the
 * Directus webhook can invalidate it. No time-based `revalidate` (D7).
 *
 * Return contract:
 *  - `null`  → nothing public at this address; the caller runs `notFound()`.
 *  - throw   → Directus is unreachable or misbehaving; the error boundary
 *              renders. An outage must never turn into a 404.
 *
 * See `docs/hmtc-cms-integration-plan.md` §4 and
 * `docs/plans/221-public-page-accessors.md`.
 */

import 'server-only';

import { z } from 'zod';

import { cmsTags } from '@/lib/cms/cache-tags';
import { pageTypeSchema } from '@/lib/cms/vocab';
import { type Block, parseBlocksForRead } from '@/lib/directus/blocks';
import { directusRead, DirectusRequestError } from '@/lib/directus/client';
import { logError, logWarn } from '@/lib/directus/logger';

const LOG_SCOPE = 'directus/public-pages';

/* -------------------------------------------------------------- Constants */

/** Kebab-case, the same shape as the slug canonicalisation in migration 002. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YEAR_MIN = 2000;
const YEAR_MAX = 2100;

/**
 * Fields read from `cms_pages`: identity only. **Never `blocks`, never `*`.**
 * Exported so the tests can assert on them directly.
 */
export const PUBLIC_PAGE_FIELDS = [
  'id',
  'slug',
  'page_type',
  'edition_year',
  'published_revision',
  'published_at',
  'canonical_url',
  'department.slug',
  'proker.slug',
] as const;

/** Fields read from `cms_page_revisions`, the only source of `blocks`. */
export const PUBLIC_REVISION_FIELDS = [
  'id',
  'page',
  'revision_number',
  'title',
  'blocks',
  'blocks_schema_version',
  'excerpt',
  'featured_image',
  'seo_title',
  'seo_description',
] as const;

/** Fields read from `cms_pages` for the route listing. */
export const PUBLIC_ROUTE_FIELDS = [
  'id',
  'edition_year',
  'published_at',
  'department.slug',
  'proker.slug',
] as const;

/* ------------------------------------------------------------------ Types */

export type PublishedPage = {
  id: string;
  revisionId: string;
  revisionNumber: number;
  departmentSlug: string;
  prokerSlug: string;
  editionYear: number;
  slug: string;
  pageType: z.infer<typeof pageTypeSchema>;
  title: string;
  excerpt: string | null;
  /** `directus_files` UUID. */
  featuredImage: string | null;
  seo: { title: string | null; description: string | null };
  canonicalUrl: string | null;
  /** ISO timestamp. */
  publishedAt: string | null;
  /** Validated; invalid blocks are dropped and logged. */
  blocks: Block[];
};

export type PublishedRoute = {
  departmentSlug: string;
  prokerSlug: string;
  editionYear: number;
  pageId: string;
  publishedAt: string | null;
};

/* -------------------------------------------------------------- Schemas */

const slugRelation = z.object({ slug: z.string().min(1) });

const pageIdentitySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  page_type: pageTypeSchema,
  edition_year: z.number().int(),
  published_revision: z.string().min(1),
  published_at: z.string().nullable(),
  canonical_url: z.string().nullable(),
  department: slugRelation,
  proker: slugRelation,
});

const revisionSchema = z.object({
  id: z.string().min(1),
  page: z.string().min(1),
  revision_number: z.number().int().positive(),
  title: z.string(),
  blocks: z.unknown(),
  blocks_schema_version: z.number().int().positive(),
  excerpt: z.string().nullable(),
  featured_image: z.string().nullable(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
});

const routeRowSchema = z.object({
  id: z.string().min(1),
  edition_year: z.number().int(),
  published_at: z.string().nullable(),
  // `null` when the department/proker is inactive and hidden by the policy.
  department: slugRelation.nullable(),
  proker: slugRelation.nullable(),
});

const listEnvelope = z.object({ data: z.array(z.unknown()) });
const itemEnvelope = z.object({ data: z.unknown() });

/* --------------------------------------------------------------- Helpers */

function isValidRouteInput(
  departmentSlug: string,
  prokerSlug: string,
  editionYear: number,
): boolean {
  return (
    SLUG_RE.test(departmentSlug) &&
    SLUG_RE.test(prokerSlug) &&
    Number.isInteger(editionYear) &&
    editionYear >= YEAR_MIN &&
    editionYear <= YEAR_MAX
  );
}

function buildQuery(params: Record<string, string>): string {
  return new URLSearchParams(params).toString();
}

/** A response that does not match the expected shape is a schema-drift bug. */
function schemaDrift(what: string, error: z.ZodError): DirectusRequestError {
  logError(LOG_SCOPE, `respons Directus tidak sesuai skema: ${what}`, {
    issues: error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    ),
  });
  return new DirectusRequestError('internal', 'Terjadi kesalahan pada server.');
}

function parseOrThrow<T>(
  schema: z.ZodType<T>,
  input: unknown,
  what: string,
): T {
  const result = schema.safeParse(input);
  if (!result.success) throw schemaDrift(what, result.error);
  return result.data;
}

/* ---------------------------------------------------------------- Public */

/**
 * The published page at `/{department}/{proker}/{year}`, or `null`.
 *
 * Two cached reads, so the revision can carry `cmsTags.pageId` (the page ID is
 * only known after the first read). Revisions are immutable, so after the
 * first render both reads are cache hits until a tag is invalidated.
 */
export async function getPublishedPage(
  departmentSlug: string,
  prokerSlug: string,
  editionYear: number,
): Promise<PublishedPage | null> {
  if (!isValidRouteInput(departmentSlug, prokerSlug, editionYear)) return null;

  const pageTag = cmsTags.page(departmentSlug, prokerSlug, editionYear);

  // 1. Identity → published_revision. Never `blocks`.
  const pageQuery = buildQuery({
    'filter[department][slug][_eq]': departmentSlug,
    'filter[proker][slug][_eq]': prokerSlug,
    'filter[edition_year][_eq]': String(editionYear),
    'filter[published_revision][_nnull]': 'true',
    fields: PUBLIC_PAGE_FIELDS.join(','),
    limit: '1',
  });
  const pageResponse = parseOrThrow(
    listEnvelope,
    await directusRead<unknown>(`/items/cms_pages?${pageQuery}`, {
      tags: [pageTag],
    }),
    'cms_pages',
  );
  if (pageResponse.data.length === 0) return null;
  const page = parseOrThrow(
    pageIdentitySchema,
    pageResponse.data[0],
    'cms_pages',
  );

  // 2. The immutable published revision.
  const revisionQuery = buildQuery({
    fields: PUBLIC_REVISION_FIELDS.join(','),
  });
  let revisionRaw: unknown;
  try {
    revisionRaw = await directusRead<unknown>(
      `/items/cms_page_revisions/${encodeURIComponent(page.published_revision)}?${revisionQuery}`,
      { tags: [pageTag, cmsTags.pageId(page.id)] },
    );
  } catch (error) {
    // Raced with an unpublish: the page is no longer public.
    if (error instanceof DirectusRequestError && error.code === 'not_found') {
      return null;
    }
    throw error;
  }
  const revision = parseOrThrow(
    revisionSchema,
    parseOrThrow(itemEnvelope, revisionRaw, 'cms_page_revisions').data,
    'cms_page_revisions',
  );

  if (revision.page !== page.id) {
    logError(LOG_SCOPE, 'published_revision milik halaman lain', {
      pageId: page.id,
      revisionId: revision.id,
      revisionPage: revision.page,
    });
    throw new DirectusRequestError(
      'internal',
      'Terjadi kesalahan pada server.',
    );
  }

  // 3. Validate blocks. Invalid ones are logged, never rendered.
  const { blocks, invalid } = parseBlocksForRead(revision.blocks);
  if (blocks.length === 0) {
    logError(LOG_SCOPE, 'revisi terbit tidak punya blok yang valid', {
      pageId: page.id,
      revisionId: revision.id,
      invalid,
    });
    return null;
  }
  if (invalid.length > 0) {
    logWarn(
      LOG_SCOPE,
      `blok tidak valid dilewati pada page=${page.id} revision=${revision.id}: ${JSON.stringify(invalid)}`,
    );
  }

  return {
    id: page.id,
    revisionId: revision.id,
    revisionNumber: revision.revision_number,
    departmentSlug: page.department.slug,
    prokerSlug: page.proker.slug,
    editionYear: page.edition_year,
    slug: page.slug,
    pageType: page.page_type,
    title: revision.title,
    excerpt: revision.excerpt,
    featuredImage: revision.featured_image,
    seo: { title: revision.seo_title, description: revision.seo_description },
    canonicalUrl: page.canonical_url,
    publishedAt: page.published_at,
    blocks,
  };
}

/**
 * Every published `(department, proker, year)`, for the sitemap and the
 * webhook's id → route lookup. Tagged `cms:routes`.
 *
 * Rows hidden behind an inactive department/proker come back with a `null`
 * relation and are skipped (they 404 anyway). A malformed row is logged and
 * skipped so one bad record cannot break the sitemap.
 */
export async function listPublishedRoutes(): Promise<PublishedRoute[]> {
  const query = buildQuery({
    'filter[published_revision][_nnull]': 'true',
    fields: PUBLIC_ROUTE_FIELDS.join(','),
    sort: 'department.slug,proker.slug,-edition_year',
    limit: '-1',
  });

  const response = parseOrThrow(
    listEnvelope,
    await directusRead<unknown>(`/items/cms_pages?${query}`, {
      tags: [cmsTags.routes],
    }),
    'cms_pages (routes)',
  );

  return response.data.flatMap((raw, index) => {
    const result = routeRowSchema.safeParse(raw);
    if (!result.success) {
      logWarn(LOG_SCOPE, `baris rute tidak valid dilewati (index ${index})`);
      return [];
    }
    const row = result.data;
    if (!row.department || !row.proker) return [];
    return [
      {
        departmentSlug: row.department.slug,
        prokerSlug: row.proker.slug,
        editionYear: row.edition_year,
        pageId: row.id,
        publishedAt: row.published_at,
      },
    ];
  });
}
