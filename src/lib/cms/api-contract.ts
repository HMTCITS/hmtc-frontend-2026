/**
 * HMTC CMS — the `/api/cms/*` contract.
 *
 * Single source of truth for every CMS endpoint: method, path, params, query,
 * body and success response. Route Handlers validate against it; the editor's
 * fetchers and TanStack Query hooks are typed from it. Adding an endpoint
 * means adding it here first.
 *
 * Errors are not listed per endpoint: every endpoint may return any
 * `CmsErrorBody` (`src/lib/cms/errors.ts`). Mutations additionally require a
 * same-origin `Origin` header (CSRF) and a verified session, except
 * `revalidate`, which is authenticated by an HMAC signature instead.
 *
 * Isomorphic: safe to import from client components.
 */
import { z } from 'zod';

import {
  assetDtoSchema,
  departmentDtoSchema,
  pageDetailSchema,
  pageSummarySchema,
  previewGrantDtoSchema,
  prokerDtoSchema,
  revisionSummarySchema,
  sessionUserSchema,
} from '@/lib/cms/dto';
import {
  pageStatusSchema,
  pageTypeSchema,
  PREVIEW_GRANT_DEFAULT_TTL_HOURS,
  PREVIEW_GRANT_MAX_TTL_HOURS,
} from '@/lib/cms/vocab';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export type EndpointDef = {
  method: HttpMethod;
  /** Express-style template: `/api/cms/pages/:id`. */
  path: `/api/cms/${string}`;
  params?: z.ZodType;
  query?: z.ZodType;
  /** JSON body. `multipart` endpoints document their form fields instead. */
  body?: z.ZodType;
  multipart?: Record<string, string>;
  /** Success response body; `null` means 204 No Content. */
  response: z.ZodType | null;
  /** Success status code. */
  status: 200 | 201 | 204;
  /** How the caller is authenticated. */
  auth: 'none' | 'session' | 'hmac';
  summary: string;
};

const uuid = z.uuid();
const pageParams = z.object({ id: uuid });
const optionalText = (max: number) => z.string().trim().max(max).optional();

/**
 * Optimistic concurrency: the client echoes the `updatedAt` it last saw.
 * A mismatch returns `409 stale_write` instead of silently overwriting.
 */
const expectedUpdatedAt = z.iso.datetime({ offset: true });

export const cmsEndpoints = {
  /* ------------------------------------------------------------- Session */
  login: {
    method: 'POST',
    path: '/api/cms/auth/login',
    body: z.object({
      email: z.email(),
      password: z.string().min(1).max(256),
    }),
    response: z.object({ user: sessionUserSchema }),
    status: 200,
    auth: 'none',
    summary:
      'Log in with a Directus account; sets HttpOnly cms_at / cms_rt cookies. Rate-limited.',
  },
  logout: {
    method: 'POST',
    path: '/api/cms/auth/logout',
    response: null,
    status: 204,
    auth: 'session',
    summary: 'Revoke the Directus refresh token and clear both cookies.',
  },
  me: {
    method: 'GET',
    path: '/api/cms/auth/me',
    response: z.object({ user: sessionUserSchema }),
    status: 200,
    auth: 'session',
    summary: 'The verified session user and their department memberships.',
  },

  /* ------------------------------------------------------------- Lookups */
  listDepartments: {
    method: 'GET',
    path: '/api/cms/departments',
    response: z.object({ items: z.array(departmentDtoSchema) }),
    status: 200,
    auth: 'session',
    summary: 'Departments the user may see (all, for page filters).',
  },
  listProkers: {
    method: 'GET',
    path: '/api/cms/prokers',
    query: z.object({ departmentId: uuid.optional() }),
    response: z.object({ items: z.array(prokerDtoSchema) }),
    status: 200,
    auth: 'session',
    summary: 'Prokers, optionally filtered by department.',
  },
  uploadAsset: {
    method: 'POST',
    path: '/api/cms/assets',
    multipart: {
      file: 'image/jpeg | image/png | image/webp | image/avif, max 10 MB',
      title: 'optional alt text / title',
    },
    response: z.object({ asset: assetDtoSchema }),
    status: 201,
    auth: 'session',
    summary:
      'Upload an image into the Directus "Public Assets" folder. Editors only.',
  },

  /* --------------------------------------------------------------- Pages */
  listPages: {
    method: 'GET',
    path: '/api/cms/pages',
    query: z.object({
      departmentId: uuid.optional(),
      status: pageStatusSchema.optional(),
      editionYear: z.coerce.number().int().optional(),
      q: optionalText(100),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(25),
    }),
    response: z.object({
      items: z.array(pageSummarySchema),
      total: z.number().int().nonnegative(),
    }),
    status: 200,
    auth: 'session',
    summary: 'Pages in departments the user may read.',
  },
  createPage: {
    method: 'POST',
    path: '/api/cms/pages',
    body: z.object({
      prokerId: uuid,
      editionYear: z.number().int().min(2000).max(2100),
      title: z.string().trim().min(1).max(255),
      pageType: pageTypeSchema,
      /** Start from an approved template; otherwise blocks start with one hero. */
      templateId: z.number().int().positive().optional(),
    }),
    response: z.object({ page: pageDetailSchema }),
    status: 201,
    auth: 'session',
    summary:
      'Create a draft. Department and slug come from the proker. 409 duplicate if (proker, year) exists.',
  },
  getPage: {
    method: 'GET',
    path: '/api/cms/pages/:id',
    params: pageParams,
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary: 'Working copy, history and the actions this user may take.',
  },
  savePage: {
    method: 'PATCH',
    path: '/api/cms/pages/:id',
    params: pageParams,
    body: z.object({
      expectedUpdatedAt,
      title: z.string().trim().min(1).max(255).optional(),
      /** Validated with `parseBlocksForWrite(blocks, 'draft')`. */
      blocks: z.array(z.unknown()).optional(),
      excerpt: z.string().max(500).nullable().optional(),
      featuredImageId: uuid.nullable().optional(),
      seoTitle: z.string().max(70).nullable().optional(),
      seoDescription: z.string().max(160).nullable().optional(),
    }),
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary:
      'Save the working copy. Never changes public output; a published working copy becomes draft.',
  },
  submitPage: {
    method: 'POST',
    path: '/api/cms/pages/:id/submit',
    params: pageParams,
    body: z.object({ expectedUpdatedAt, comment: optionalText(1000) }),
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary:
      'draft | changes_requested → in_review. Writes a "submitted" event.',
  },
  requestChanges: {
    method: 'POST',
    path: '/api/cms/pages/:id/request-changes',
    params: pageParams,
    body: z.object({
      expectedUpdatedAt,
      comment: z.string().trim().min(1).max(1000),
    }),
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary:
      'in_review → changes_requested. Reviewer or publisher; comment required.',
  },
  publishPage: {
    method: 'POST',
    path: '/api/cms/pages/:id/publish',
    params: pageParams,
    body: z.object({ expectedUpdatedAt, changeNote: optionalText(500) }),
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary:
      'in_review → published. Publisher, not the submitter (403 self_approval). Snapshots a revision, points published_revision at it, revalidates.',
  },
  unpublishPage: {
    method: 'POST',
    path: '/api/cms/pages/:id/unpublish',
    params: pageParams,
    body: z.object({ expectedUpdatedAt, comment: optionalText(1000) }),
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary:
      'Take the live revision down (public URL → 404). Working copy is kept.',
  },
  archivePage: {
    method: 'POST',
    path: '/api/cms/pages/:id/archive',
    params: pageParams,
    body: z.object({ expectedUpdatedAt, comment: optionalText(1000) }),
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary: 'Archive instead of delete (C6). Also unpublishes.',
  },

  /* ----------------------------------------------------------- Revisions */
  listRevisions: {
    method: 'GET',
    path: '/api/cms/pages/:id/revisions',
    params: pageParams,
    response: z.object({ items: z.array(revisionSummarySchema) }),
    status: 200,
    auth: 'session',
    summary: 'Snapshots, newest first.',
  },
  restoreRevision: {
    method: 'POST',
    path: '/api/cms/pages/:id/revisions/:revisionId/restore',
    params: z.object({ id: uuid, revisionId: uuid }),
    body: z.object({ expectedUpdatedAt }),
    response: z.object({ page: pageDetailSchema }),
    status: 200,
    auth: 'session',
    summary:
      'Copy a snapshot into the working copy as a draft (C8). Never publishes; history is kept.',
  },

  /* ------------------------------------------------------ Preview grants */
  listPreviewGrants: {
    method: 'GET',
    path: '/api/cms/pages/:id/preview-grants',
    params: pageParams,
    response: z.object({ items: z.array(previewGrantDtoSchema) }),
    status: 200,
    auth: 'session',
    summary: 'Grants for this page, including expired and revoked ones.',
  },
  createPreviewGrant: {
    method: 'POST',
    path: '/api/cms/pages/:id/preview-grants',
    params: pageParams,
    body: z.object({
      ttlHours: z
        .number()
        .int()
        .min(1)
        .max(PREVIEW_GRANT_MAX_TTL_HOURS)
        .default(PREVIEW_GRANT_DEFAULT_TTL_HOURS),
    }),
    response: z.object({
      grant: previewGrantDtoSchema,
      /** `/preview/{token}` — returned once, never stored or logged. */
      url: z.string(),
    }),
    status: 201,
    auth: 'session',
    summary:
      'Snapshot the working copy if it changed and mint a bearer link to that revision.',
  },
  revokePreviewGrant: {
    method: 'DELETE',
    path: '/api/cms/preview-grants/:grantId',
    params: z.object({ grantId: uuid }),
    response: null,
    status: 204,
    auth: 'session',
    summary: 'Revoke a grant. Grant creator or a publisher of the department.',
  },

  /* ------------------------------------------------------------ Webhook */
  revalidate: {
    method: 'POST',
    path: '/api/cms/revalidate',
    body: z.object({
      collection: z.enum([
        'cms_pages',
        'cms_page_redirects',
        'cms_site_settings',
      ]),
      keys: z.array(z.union([uuid, z.number().int()])).max(100),
    }),
    response: z.object({ revalidated: z.number().int().nonnegative() }),
    status: 200,
    auth: 'hmac',
    summary:
      'Directus Flow → Next.js. Header X-CMS-Signature: hex HMAC-SHA256 of the raw body with CMS_REVALIDATE_SECRET. Tags are derived server-side; raw tag names are never accepted.',
  },
} as const satisfies Record<string, EndpointDef>;

export type CmsEndpointName = keyof typeof cmsEndpoints;

type Infer<T> = T extends z.ZodType ? z.infer<T> : never;
type InferInput<T> = T extends z.ZodType ? z.input<T> : never;

/** Response body type of an endpoint (`void` for 204). */
export type CmsResponse<N extends CmsEndpointName> =
  (typeof cmsEndpoints)[N]['response'] extends z.ZodType
    ? Infer<(typeof cmsEndpoints)[N]['response']>
    : void;

/** Request body type as the client sends it (before defaults are applied). */
export type CmsRequestBody<N extends CmsEndpointName> =
  (typeof cmsEndpoints)[N] extends { body: infer B } ? InferInput<B> : never;

/** Path params type of an endpoint. */
export type CmsParams<N extends CmsEndpointName> =
  (typeof cmsEndpoints)[N] extends { params: infer P } ? Infer<P> : never;

/** Fill `:param` placeholders, URL-encoding each value. */
export function cmsPath<N extends CmsEndpointName>(
  name: N,
  params?: Record<string, string>,
): string {
  return cmsEndpoints[name].path.replace(/:([A-Za-z]+)/g, (_, key: string) => {
    const value = params?.[key];
    if (value === undefined)
      throw new Error(`missing path param "${key}" for ${name}`);
    return encodeURIComponent(value);
  });
}

/** Header carrying the webhook signature. */
export const CMS_SIGNATURE_HEADER = 'x-cms-signature';
