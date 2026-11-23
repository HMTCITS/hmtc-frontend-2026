/**
 * HMTC CMS — page reads and creation for the editor (`/api/cms/pages*`).
 *
 * Every call uses the acting user's token (`directusAsUser`), so Directus
 * policies stay the second layer beneath the checks made here:
 *  - a page is readable when the user is a Directus admin or holds an
 *    editor, reviewer or publisher membership in its department;
 *  - a page the user may not read is reported as `not_found`, never
 *    `forbidden`, so its existence is not revealed;
 *  - only editors of the proker's department (or admins) may create a page.
 *
 * Rows are validated with Zod on the way in and mapped to the wire DTOs in
 * `src/lib/cms/dto.ts`; raw Directus shapes never leave this module.
 *
 * Server-only: a client component importing this fails the build.
 */
import 'server-only';

import { z, ZodError } from 'zod';

import type { CmsRequestBody } from '@/lib/cms/api-contract';
import type {
  PageDetail,
  PageSummary,
  ReviewEventDto,
  SessionUser,
} from '@/lib/cms/dto';
import { CmsError, toValidationIssues } from '@/lib/cms/errors';
import {
  type MembershipRole,
  nextStatus,
  type PageAction,
  type PageStatus,
  pageStatusSchema,
  pageTypeSchema,
  reviewActionSchema,
} from '@/lib/cms/vocab';
import {
  allowedActions,
  authorize,
  type AuthzDenial,
  roleInDepartment,
} from '@/lib/directus/authz';
import {
  BLOCK_LIMITS,
  createBlock,
  parseBlocksForRead,
  parseBlocksForWrite,
} from '@/lib/directus/blocks';
import { directusAsUser, DirectusRequestError } from '@/lib/directus/client';
import { logError, logWarn } from '@/lib/directus/logger';
import type { CmsSession } from '@/lib/directus/session';

const LOG_SCOPE = 'directus/pages';

/** Membership roles whose Directus policies grant read on `cms_pages`. */
const READ_ROLES: readonly MembershipRole[] = [
  'editor',
  'reviewer',
  'publisher',
];

/** Shown for review events by other users: members may only read their own user row. */
const OTHER_ACTOR_NAME = 'Anggota CMS';

const NOT_FOUND_MESSAGE = 'Halaman tidak ditemukan.';
const INTERNAL_MESSAGE = 'Terjadi kesalahan pada server.';

/* ------------------------------------------------------------ Row shapes */

const timestamp = z.string().min(1);

const pageSummaryRowSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  page_type: pageTypeSchema,
  status: pageStatusSchema,
  department: z.object({ id: z.uuid(), slug: z.string() }),
  proker: z.object({ id: z.uuid(), slug: z.string() }),
  edition_year: z.number().int(),
  published_revision: z.uuid().nullable(),
  published_at: timestamp.nullable(),
  date_created: timestamp.nullable(),
  date_updated: timestamp.nullable(),
});
type PageSummaryRow = z.infer<typeof pageSummaryRowSchema>;

const pageDetailRowSchema = pageSummaryRowSchema.extend({
  blocks: z.unknown(),
  excerpt: z.string().nullable(),
  featured_image: z.uuid().nullable(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  template: z.number().int().nullable(),
  current_revision: z.uuid().nullable(),
});
type PageDetailRow = z.infer<typeof pageDetailRowSchema>;

const SUMMARY_FIELDS = [
  'id',
  'title',
  'slug',
  'page_type',
  'status',
  'department.id',
  'department.slug',
  'proker.id',
  'proker.slug',
  'edition_year',
  'published_revision',
  'published_at',
  'date_created',
  'date_updated',
];

const DETAIL_FIELDS = [
  ...SUMMARY_FIELDS,
  'blocks',
  'excerpt',
  'featured_image',
  'seo_title',
  'seo_description',
  'template',
  'current_revision',
];

/** Lenient on purpose: legacy rows without an actor or status are skipped, not fatal. */
const reviewEventRowSchema = z.object({
  id: z.number().int(),
  action: z.string().nullable(),
  from_status: z.string().nullable(),
  to_status: z.string().nullable(),
  comment: z.string().nullable(),
  actor: z.string().nullable(),
  date_created: timestamp.nullable(),
});
type ReviewEventRow = z.infer<typeof reviewEventRowSchema>;

const prokerRowSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  is_active: z.boolean(),
  department: z.object({ id: z.uuid(), slug: z.string() }),
});

const templateRowSchema = z.object({
  id: z.number().int(),
  blocks: z.unknown(),
  department: z.uuid().nullable(),
  is_global: z.boolean().nullable(),
});

const itemSchema = <T extends z.ZodType>(schema: T) =>
  z.object({ data: schema });

const listSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    data: z.array(schema),
    meta: z
      .object({ filter_count: z.coerce.number().int().nonnegative() })
      .optional(),
  });

/* --------------------------------------------------------------- Helpers */

function parseRow<T>(schema: z.ZodType<T>, input: unknown, what: string): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    logError(LOG_SCOPE, `Directus response does not match schema: ${what}`, {
      issues: result.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      ),
    });
    throw new DirectusRequestError('internal', INTERNAL_MESSAGE);
  }
  return result.data;
}

function query(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
  return search.toString();
}

/** Directus timestamps → ISO-8601 with offset, as the DTOs require. */
function iso(value: string): string {
  return new Date(value).toISOString();
}

/** Departments whose pages `user` may read; `null` means every department. */
export function readableDepartmentIds(user: SessionUser): string[] | null {
  if (user.isAdmin) return null;
  return user.memberships
    .filter((m) => READ_ROLES.includes(m.role))
    .map((m) => m.departmentId);
}

function canRead(user: SessionUser, departmentId: string): boolean {
  if (user.isAdmin) return true;
  const role = roleInDepartment(user, departmentId);
  return role !== null && READ_ROLES.includes(role);
}

/** Public route: `/{department}/{proker}/{year}`. */
export function pagePath(
  departmentSlug: string,
  prokerSlug: string,
  editionYear: number,
): string {
  return `/${departmentSlug}/${prokerSlug}/${editionYear}`;
}

function toSummary(row: PageSummaryRow): PageSummary {
  const updated = row.date_updated ?? row.date_created;
  if (!updated) {
    logError(LOG_SCOPE, 'page has neither date_updated nor date_created', {
      id: row.id,
    });
    throw new DirectusRequestError('internal', INTERNAL_MESSAGE);
  }
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    pageType: row.page_type,
    status: row.status,
    departmentId: row.department.id,
    prokerId: row.proker.id,
    editionYear: row.edition_year,
    isLive: row.published_revision !== null,
    publishedAt: row.published_at ? iso(row.published_at) : null,
    updatedAt: iso(updated),
    path: pagePath(row.department.slug, row.proker.slug, row.edition_year),
  };
}

function toReviewEvents(
  rows: ReviewEventRow[],
  user: SessionUser,
): ReviewEventDto[] {
  return rows.flatMap((row) => {
    const action = reviewActionSchema.safeParse(row.action);
    const to = pageStatusSchema.safeParse(row.to_status);
    const from =
      row.from_status === null
        ? { success: true as const, data: null }
        : pageStatusSchema.safeParse(row.from_status);
    if (
      !action.success ||
      !to.success ||
      !from.success ||
      row.actor === null ||
      row.date_created === null
    ) {
      logWarn(LOG_SCOPE, `skipping malformed review event ${row.id}`);
      return [];
    }
    return [
      {
        id: row.id,
        action: action.data,
        fromStatus: from.data as PageStatus | null,
        toStatus: to.data,
        comment: row.comment,
        actorId: row.actor,
        actorName: row.actor === user.id ? user.name : OTHER_ACTOR_NAME,
        createdAt: iso(row.date_created),
      },
    ];
  });
}

/** Missing or hidden by Directus policy — both are a plain 404 to the caller. */
function isHidden(error: unknown): boolean {
  return (
    error instanceof DirectusRequestError &&
    (error.code === 'forbidden' || error.code === 'not_found')
  );
}

/* ------------------------------------------------------------------ List */

export type ListPagesQuery = {
  departmentId?: string;
  status?: PageStatus;
  editionYear?: number;
  q?: string;
  page: number;
  limit: number;
};

/** Pages in the departments `session.user` may read, newest change first. */
export async function listPages(
  session: CmsSession,
  input: ListPagesQuery,
): Promise<{ items: PageSummary[]; total: number }> {
  const readable = readableDepartmentIds(session.user);

  let departments: string[] | null = readable;
  if (input.departmentId) {
    if (readable !== null && !readable.includes(input.departmentId)) {
      return { items: [], total: 0 };
    }
    departments = [input.departmentId];
  }
  if (departments !== null && departments.length === 0) {
    return { items: [], total: 0 };
  }

  const and: Record<string, unknown>[] = [];
  if (departments !== null) and.push({ department: { _in: departments } });
  if (input.status) and.push({ status: { _eq: input.status } });
  if (input.editionYear !== undefined)
    and.push({ edition_year: { _eq: input.editionYear } });
  if (input.q) and.push({ title: { _icontains: input.q } });

  const path = `/items/cms_pages?${query({
    fields: SUMMARY_FIELDS.join(','),
    filter: and.length > 0 ? { _and: and } : undefined,
    sort: '-date_updated,-date_created',
    limit: String(input.limit),
    page: String(input.page),
    meta: 'filter_count',
  })}`;

  const raw = await directusAsUser<unknown>(session.accessToken, path);
  const { data, meta } = parseRow(
    listSchema(pageSummaryRowSchema),
    raw,
    'cms_pages list',
  );

  return {
    items: data.map(toSummary),
    total: meta?.filter_count ?? data.length,
  };
}

/* ------------------------------------------------------------------- Get */

/**
 * The editor view of one page: working copy (validated blocks plus what was
 * invalid), review history newest first, and the actions this user may take.
 * Throws `not_found` when the page is missing or not readable by the user.
 */
export async function getPageDetail(
  session: CmsSession,
  id: string,
): Promise<PageDetail> {
  let pageRaw: unknown;
  try {
    pageRaw = await directusAsUser<unknown>(
      session.accessToken,
      `/items/cms_pages/${encodeURIComponent(id)}?${query({
        fields: DETAIL_FIELDS.join(','),
      })}`,
    );
  } catch (error) {
    if (isHidden(error)) throw new CmsError('not_found', NOT_FOUND_MESSAGE);
    throw error;
  }

  const row: PageDetailRow = parseRow(
    itemSchema(pageDetailRowSchema),
    pageRaw,
    'cms_pages item',
  ).data;

  // First layer: Directus already filtered by policy, but the app decides too.
  if (!canRead(session.user, row.department.id)) {
    throw new CmsError('not_found', NOT_FOUND_MESSAGE);
  }

  const eventsRaw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_review_events?${query({
      fields: 'id,action,from_status,to_status,comment,actor,date_created',
      filter: { page: { _eq: row.id } },
      sort: '-date_created,-id',
      limit: '-1',
    })}`,
  );
  const history = toReviewEvents(
    parseRow(listSchema(reviewEventRowSchema), eventsRaw, 'cms_review_events')
      .data,
    session.user,
  );

  const submitted = history.find((event) => event.action === 'submitted');
  const lastSubmission = submitted
    ? { actorId: submitted.actorId, at: submitted.createdAt }
    : null;

  const summary = toSummary(row);
  const { blocks, invalid } = parseBlocksForRead(row.blocks ?? []);

  return {
    ...summary,
    blocks,
    invalidBlocks: invalid,
    excerpt: row.excerpt,
    featuredImageId: row.featured_image,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    templateId: row.template,
    publishedRevisionId: row.published_revision,
    currentRevisionId: row.current_revision,
    lastSubmission,
    history,
    allowedActions: allowedActions(session.user, {
      departmentId: summary.departmentId,
      status: summary.status,
      isLive: summary.isLive,
      lastSubmission,
    }),
  };
}

/* ---------------------------------------------------------------- Create */

export type CreatePageInput = CmsRequestBody<'createPage'>;

function invalidField(path: string, message: string): CmsError {
  return new CmsError('validation_failed', 'Data tidak valid.', {
    issues: [{ path, message }],
  });
}

async function loadProker(session: CmsSession, prokerId: string) {
  let raw: unknown;
  try {
    raw = await directusAsUser<unknown>(
      session.accessToken,
      `/items/cms_prokers/${encodeURIComponent(prokerId)}?${query({
        fields: 'id,slug,is_active,department.id,department.slug',
      })}`,
    );
  } catch (error) {
    if (isHidden(error))
      throw invalidField('prokerId', 'proker tidak ditemukan');
    throw error;
  }
  const proker = parseRow(itemSchema(prokerRowSchema), raw, 'cms_prokers').data;
  if (!proker.is_active) throw invalidField('prokerId', 'proker tidak aktif');
  return proker;
}

/** Blocks copied from an approved template usable in `departmentId`. */
async function loadTemplateBlocks(
  session: CmsSession,
  templateId: number,
  departmentId: string,
): Promise<unknown[]> {
  // A list query, not /items/:id: the status filter must also bind admins,
  // who bypass the policy that limits members to published templates.
  const raw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_templates?${query({
      fields: 'id,blocks,department,is_global',
      filter: {
        _and: [{ id: { _eq: templateId } }, { status: { _eq: 'published' } }],
      },
      limit: '1',
    })}`,
  );
  const [template] = parseRow(
    listSchema(templateRowSchema),
    raw,
    'cms_templates',
  ).data;

  if (!template) throw invalidField('templateId', 'template tidak ditemukan');
  if (template.is_global !== true && template.department !== departmentId) {
    throw invalidField(
      'templateId',
      'template tidak tersedia untuk departemen ini',
    );
  }

  try {
    return parseBlocksForWrite(template.blocks ?? [], 'draft');
  } catch (error) {
    if (error instanceof ZodError) {
      logWarn(
        LOG_SCOPE,
        `template ${templateId} has invalid blocks: ${toValidationIssues(error)
          .map((i) => i.path)
          .join(', ')}`,
      );
      throw new CmsError('invalid_blocks', 'Blok template tidak valid.');
    }
    throw error;
  }
}

function initialHero(title: string) {
  const hero = createBlock('hero');
  hero.props.title = title.slice(0, BLOCK_LIMITS.heroTitleChars);
  return [hero];
}

const DUPLICATE_MESSAGE =
  'Halaman untuk proker ini pada tahun tersebut sudah ada.';

/**
 * Create a draft page. Department and slug come from the proker; blocks come
 * from the template, or start as a single hero carrying the page title.
 * Throws `duplicate` when a page already exists for (proker, year).
 */
export async function createPage(
  session: CmsSession,
  input: CreatePageInput,
): Promise<PageDetail> {
  const proker = await loadProker(session, input.prokerId);
  const departmentId = proker.department.id;

  if (
    !session.user.isAdmin &&
    roleInDepartment(session.user, departmentId) !== 'editor'
  ) {
    throw new CmsError(
      'forbidden',
      'Hanya editor departemen ini yang dapat membuat halaman.',
    );
  }

  const existingRaw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_pages?${query({
      fields: 'id',
      filter: {
        _and: [
          { proker: { _eq: proker.id } },
          { edition_year: { _eq: input.editionYear } },
        ],
      },
      limit: '1',
    })}`,
  );
  const existing = parseRow(
    listSchema(z.object({ id: z.uuid() })),
    existingRaw,
    'cms_pages duplicate check',
  ).data;
  if (existing.length > 0) throw new CmsError('duplicate', DUPLICATE_MESSAGE);

  const blocks =
    input.templateId === undefined
      ? initialHero(input.title)
      : await loadTemplateBlocks(session, input.templateId, departmentId);

  let createdRaw: unknown;
  try {
    createdRaw = await directusAsUser<unknown>(
      session.accessToken,
      `/items/cms_pages?${query({ fields: 'id' })}`,
      {
        method: 'POST',
        body: {
          title: input.title,
          slug: proker.slug,
          page_type: input.pageType,
          department: departmentId,
          proker: proker.id,
          edition_year: input.editionYear,
          blocks,
          template: input.templateId ?? null,
          status: 'draft',
        },
      },
    );
  } catch (error) {
    // Lost a race with a concurrent create: the unique index caught it.
    if (error instanceof DirectusRequestError && error.code === 'duplicate') {
      throw new CmsError('duplicate', DUPLICATE_MESSAGE);
    }
    throw error;
  }

  const { id } = parseRow(
    itemSchema(z.object({ id: z.uuid() })),
    createdRaw,
    'cms_pages create',
  ).data;

  return getPageDetail(session, id);
}

/* ------------------------------------------------------- Workflow actions */

const STALE_WRITE_MESSAGE =
  'Halaman sudah diubah sejak terakhir kamu melihatnya. Muat ulang.';

const DENIAL_MESSAGE: Record<AuthzDenial, string> = {
  not_found: NOT_FOUND_MESSAGE,
  forbidden: 'Peranmu tidak diizinkan melakukan aksi ini.',
  invalid_transition: 'Aksi ini tidak tersedia pada status halaman saat ini.',
  self_approval: 'Pengajuan ini dibuat oleh akunmu. Minta reviewer lain.',
};

function assertAuthorized(
  user: SessionUser,
  action: PageAction,
  page: PageDetail,
): void {
  const denial = authorize(user, action, {
    departmentId: page.departmentId,
    status: page.status,
    isLive: page.isLive,
    lastSubmission: page.lastSubmission,
  });
  if (denial !== null) throw new CmsError(denial, DENIAL_MESSAGE[denial]);
}

function assertFresh(page: PageDetail, expectedUpdatedAt: string): void {
  if (page.updatedAt !== expectedUpdatedAt) {
    throw new CmsError('stale_write', STALE_WRITE_MESSAGE);
  }
}

/**
 * PATCH the working-copy status with the user's token.
 *
 * The Directus update policies (migration 004) pin the allowed *from* statuses,
 * so a rejection here means the row changed between the read above and this
 * write — the same stale-write race, caught by the second layer.
 */
async function patchStatus(
  session: CmsSession,
  id: string,
  to: PageStatus,
): Promise<void> {
  try {
    await directusAsUser(
      session.accessToken,
      `/items/cms_pages/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: { status: to },
      },
    );
  } catch (error) {
    if (error instanceof DirectusRequestError && error.code === 'forbidden') {
      throw new CmsError(
        'invalid_transition',
        DENIAL_MESSAGE.invalid_transition,
      );
    }
    throw error;
  }
}

/** `actor` is filled by the Directus preset (`$CURRENT_USER`) — never sent. */
async function createReviewEvent(
  session: CmsSession,
  pageId: string,
  action: 'submitted' | 'changes_requested',
  from: PageStatus,
  to: PageStatus,
  comment: string | null,
): Promise<void> {
  await directusAsUser(session.accessToken, '/items/cms_review_events', {
    method: 'POST',
    body: {
      page: pageId,
      action,
      from_status: from,
      to_status: to,
      comment,
    },
  });
}

async function transitionPage(
  session: CmsSession,
  action: PageAction,
  id: string,
  input: { expectedUpdatedAt: string; comment?: string | null },
  event: 'submitted' | 'changes_requested',
): Promise<PageDetail> {
  const page = await getPageDetail(session, id);
  assertAuthorized(session.user, action, page);
  assertFresh(page, input.expectedUpdatedAt);

  const to = nextStatus(action, page.status);
  await patchStatus(session, id, to);
  await createReviewEvent(
    session,
    id,
    event,
    page.status,
    to,
    input.comment ?? null,
  );

  return getPageDetail(session, id);
}

/** `draft | changes_requested → in_review`, editor only. Writes the event. */
export async function submitPage(
  session: CmsSession,
  id: string,
  input: CmsRequestBody<'submitPage'>,
): Promise<PageDetail> {
  return transitionPage(session, 'submit', id, input, 'submitted');
}

/** `in_review → changes_requested`, reviewer/publisher only. Comment required. */
export async function requestChangesPage(
  session: CmsSession,
  id: string,
  input: CmsRequestBody<'requestChanges'>,
): Promise<PageDetail> {
  return transitionPage(
    session,
    'request_changes',
    id,
    input,
    'changes_requested',
  );
}
