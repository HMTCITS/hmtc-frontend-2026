/**
 * HMTC CMS — preview grants: revocable bearer links to one page revision.
 *
 * A grant is a bearer link to one immutable revision of one page. The token
 * is 32 random bytes (base64url); only its SHA-256 hex is stored, so a
 * database leak does not leak working links. The plain token exists only in
 * the `createPreviewGrant` return value: it is never stored, listed or logged.
 *
 * Every Directus call uses the acting user's token, so the access policies
 * and department triggers in scripts/directus-schema/004-access-policies.up.sql
 * are the second layer behind the checks here.
 */
import 'server-only';

import { z, ZodError } from 'zod';

import type { PreviewGrantDto } from '@/lib/cms/dto';
import { CmsError, toValidationIssues } from '@/lib/cms/errors';
import { pageStatusSchema } from '@/lib/cms/vocab';
import { authorize, roleInDepartment } from '@/lib/directus/authz';
import {
  BLOCKS_SCHEMA_VERSION,
  parseBlocksForRead,
  parseBlocksForWrite,
} from '@/lib/directus/blocks';
import { directusAsUser, DirectusRequestError } from '@/lib/directus/client';
import { logInfo } from '@/lib/directus/logger';
import {
  canRead,
  isHidden,
  iso,
  itemSchema,
  listSchema,
  NOT_FOUND_MESSAGE,
  parseRow,
  query,
} from '@/lib/directus/pages';
import {
  hashPreviewToken,
  mintPreviewToken,
  previewUrl,
} from '@/lib/directus/preview-token';
import type { CmsSession } from '@/lib/directus/session';

const LOG_SCOPE = 'directus/preview-grants';

const GRANT_NOT_FOUND_MESSAGE = 'Tautan pratinjau tidak ditemukan.';

/* ------------------------------------------------------------ Row shapes */

const timestamp = z.string().min(1);

const grantRowSchema = z.object({
  id: z.uuid(),
  page: z.uuid(),
  revision: z.uuid(),
  created_by: z.uuid().nullable(),
  date_created: timestamp,
  expires_at: timestamp,
  revoked_at: timestamp.nullable(),
});
type GrantRow = z.infer<typeof grantRowSchema>;

/** Never includes `token_hash`: the hash has no use outside the preview lookup. */
const GRANT_FIELDS =
  'id,page,revision,created_by,date_created,expires_at,revoked_at';

/** The content a revision snapshots; also what "changed" is compared on. */
const SNAPSHOT_FIELDS = [
  'title',
  'blocks',
  'excerpt',
  'featured_image',
  'seo_title',
  'seo_description',
] as const;

const snapshotShape = {
  title: z.string(),
  blocks: z.unknown(),
  excerpt: z.string().nullable(),
  featured_image: z.uuid().nullable(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
};
type Snapshot = {
  [K in (typeof SNAPSHOT_FIELDS)[number]]: z.infer<(typeof snapshotShape)[K]>;
};

const pageRowSchema = z.object({
  id: z.uuid(),
  status: pageStatusSchema,
  department: z.uuid(),
  published_revision: z.uuid().nullable(),
  ...snapshotShape,
});
type PageRow = z.infer<typeof pageRowSchema>;

const revisionRowSchema = z.object({
  id: z.uuid(),
  revision_number: z.number().int().positive(),
  ...snapshotShape,
});
type RevisionRow = z.infer<typeof revisionRowSchema>;

function toDto(row: GrantRow): PreviewGrantDto {
  return {
    id: row.id,
    pageId: row.page,
    revisionId: row.revision,
    createdById: row.created_by,
    createdAt: iso(row.date_created),
    expiresAt: iso(row.expires_at),
    revokedAt: row.revoked_at ? iso(row.revoked_at) : null,
  };
}

/* ----------------------------------------------------------------- Pages */

const pageRefSchema = z.object({ id: z.uuid(), department: z.uuid() });

async function loadPage<T extends { department: string }>(
  session: CmsSession,
  pageId: string,
  schema: z.ZodType<T>,
  fields: readonly string[],
): Promise<T> {
  let raw: unknown;
  try {
    raw = await directusAsUser<unknown>(
      session.accessToken,
      `/items/cms_pages/${encodeURIComponent(pageId)}?${query({
        fields: fields.join(','),
      })}`,
    );
  } catch (error) {
    if (isHidden(error)) throw new CmsError('not_found', NOT_FOUND_MESSAGE);
    throw error;
  }
  const row = parseRow(itemSchema(schema), raw, 'cms_pages item').data;
  // First layer: Directus already filtered by policy, but the app decides too.
  if (!canRead(session.user, row.department)) {
    throw new CmsError('not_found', NOT_FOUND_MESSAGE);
  }
  return row;
}

/* ------------------------------------------------------------------ List */

/** Every grant of the page, newest first, including expired and revoked ones. */
export async function listPreviewGrants(
  session: CmsSession,
  pageId: string,
): Promise<PreviewGrantDto[]> {
  const page = await loadPage(session, pageId, pageRefSchema, [
    'id',
    'department',
  ]);
  const raw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_preview_grants?${query({
      fields: GRANT_FIELDS,
      filter: { page: { _eq: page.id } },
      sort: '-date_created',
      limit: '-1',
    })}`,
  );
  return parseRow(
    listSchema(grantRowSchema),
    raw,
    'cms_preview_grants',
  ).data.map(toDto);
}

/* ---------------------------------------------------------------- Create */

/** JSON with object keys sorted, so key order never counts as a change. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, inner: unknown) =>
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? Object.fromEntries(
          Object.entries(inner as Record<string, unknown>).sort(([a], [b]) =>
            a < b ? -1 : a > b ? 1 : 0,
          ),
        )
      : inner,
  );
}

function snapshotOf(row: Snapshot): Snapshot {
  return {
    title: row.title,
    blocks: row.blocks ?? [],
    excerpt: row.excerpt,
    featured_image: row.featured_image,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
  };
}

function sameContent(a: Snapshot, b: Snapshot): boolean {
  return canonical(snapshotOf(a)) === canonical(snapshotOf(b));
}

async function latestRevision(
  session: CmsSession,
  pageId: string,
): Promise<RevisionRow | null> {
  const raw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_page_revisions?${query({
      fields: ['id', 'revision_number', ...SNAPSHOT_FIELDS].join(','),
      filter: { page: { _eq: pageId } },
      sort: '-revision_number',
      limit: '1',
    })}`,
  );
  return (
    parseRow(listSchema(revisionRowSchema), raw, 'cms_page_revisions latest')
      .data[0] ?? null
  );
}

/** A preview must render, so the working copy is held to the write rules. */
function assertSnapshotBlocks(blocks: unknown): void {
  const { invalid } = parseBlocksForRead(blocks ?? []);
  if (invalid.length > 0) {
    throw new CmsError('invalid_blocks', 'Ada blok yang tidak valid.', {
      invalidBlocks: invalid,
    });
  }
  try {
    parseBlocksForWrite(blocks ?? [], 'draft');
  } catch (error) {
    if (error instanceof ZodError) {
      throw new CmsError('invalid_blocks', 'Ada blok yang tidak valid.', {
        issues: toValidationIssues(error),
      });
    }
    throw error;
  }
}

async function insertRevision(
  session: CmsSession,
  page: PageRow,
  revisionNumber: number,
): Promise<string> {
  const raw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_page_revisions?${query({ fields: 'id' })}`,
    {
      method: 'POST',
      body: {
        page: page.id,
        revision_number: revisionNumber,
        ...snapshotOf(page),
        blocks_schema_version: BLOCKS_SCHEMA_VERSION,
        change_note: null,
      },
    },
  );
  return parseRow(
    itemSchema(z.object({ id: z.uuid() })),
    raw,
    'cms_page_revisions create',
  ).data.id;
}

/**
 * The revision a new grant points at: the latest one if the working copy has
 * not changed since, otherwise a new snapshot. `current_revision` is left to
 * save and restore: reviewers may not write it, and touching `cms_pages`
 * would bump `date_updated` and turn the editor's next save into a stale write.
 */
async function ensureWorkingCopyRevision(
  session: CmsSession,
  page: PageRow,
): Promise<{ revisionId: string; created: boolean }> {
  for (let attempt = 0; ; attempt += 1) {
    const latest = await latestRevision(session, page.id);
    if (latest && sameContent(latest, page)) {
      return { revisionId: latest.id, created: false };
    }
    if (attempt === 0) assertSnapshotBlocks(page.blocks);
    try {
      const revisionId = await insertRevision(
        session,
        page,
        (latest?.revision_number ?? 0) + 1,
      );
      return { revisionId, created: true };
    } catch (error) {
      // A concurrent mint took this revision number: re-read once.
      const raced =
        error instanceof DirectusRequestError && error.code === 'duplicate';
      if (!raced) throw error;
      if (attempt >= 1) {
        throw new CmsError(
          'duplicate',
          'Revisi sedang dibuat bersamaan. Coba lagi.',
        );
      }
    }
  }
}

/**
 * Snapshot the working copy if it changed and mint a grant to that revision.
 * The returned `url` carries the only copy of the token.
 */
export async function createPreviewGrant(
  session: CmsSession,
  pageId: string,
  ttlHours: number,
): Promise<{ grant: PreviewGrantDto; url: string }> {
  const page = await loadPage(session, pageId, pageRowSchema, [
    'id',
    'status',
    'department',
    'published_revision',
    ...SNAPSHOT_FIELDS,
  ]);

  const denial = authorize(session.user, 'create_preview', {
    departmentId: page.department,
    status: page.status,
    isLive: page.published_revision !== null,
    lastSubmission: null,
  });
  if (denial === 'not_found') {
    throw new CmsError('not_found', NOT_FOUND_MESSAGE);
  }
  if (denial === 'invalid_transition') {
    throw new CmsError(
      'invalid_transition',
      'Halaman yang diarsipkan tidak dapat dipratinjau.',
    );
  }
  if (denial !== null) {
    throw new CmsError(
      'forbidden',
      'Anda tidak dapat membuat tautan pratinjau untuk halaman ini.',
    );
  }

  const { revisionId, created } = await ensureWorkingCopyRevision(
    session,
    page,
  );

  const token = mintPreviewToken();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  const raw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_preview_grants?${query({ fields: GRANT_FIELDS })}`,
    {
      method: 'POST',
      body: {
        page: page.id,
        revision: revisionId,
        token_hash: hashPreviewToken(token),
        expires_at: expiresAt.toISOString(),
      },
    },
  );
  const grant = toDto(
    parseRow(itemSchema(grantRowSchema), raw, 'cms_preview_grants create').data,
  );

  logInfo(
    LOG_SCOPE,
    `grant created id=${grant.id} page=${page.id} revision=${revisionId} snapshot=${created}`,
  );

  return { grant, url: previewUrl(token) };
}

/* ---------------------------------------------------------------- Revoke */

const revokeRowSchema = z.object({
  id: z.uuid(),
  created_by: z.uuid().nullable(),
  revoked_at: timestamp.nullable(),
  page: z.object({ id: z.uuid(), department: z.uuid() }),
});

/**
 * Revoke a grant. Allowed for its creator, a publisher of the page's
 * department, or an admin. Revoking an already revoked grant is a no-op, so
 * the first `revoked_at` / `revoked_by` stay on record.
 */
export async function revokePreviewGrant(
  session: CmsSession,
  grantId: string,
): Promise<void> {
  const path = `/items/cms_preview_grants/${encodeURIComponent(grantId)}`;

  let raw: unknown;
  try {
    raw = await directusAsUser<unknown>(
      session.accessToken,
      `${path}?${query({
        fields: 'id,created_by,revoked_at,page.id,page.department',
      })}`,
    );
  } catch (error) {
    if (isHidden(error)) {
      throw new CmsError('not_found', GRANT_NOT_FOUND_MESSAGE);
    }
    throw error;
  }
  const grant = parseRow(
    itemSchema(revokeRowSchema),
    raw,
    'cms_preview_grants item',
  ).data;

  const { user } = session;
  if (!canRead(user, grant.page.department)) {
    throw new CmsError('not_found', GRANT_NOT_FOUND_MESSAGE);
  }

  const allowed =
    user.isAdmin ||
    grant.created_by === user.id ||
    roleInDepartment(user, grant.page.department) === 'publisher';
  if (!allowed) {
    throw new CmsError(
      'forbidden',
      'Hanya pembuat tautan atau publisher departemen yang dapat mencabutnya.',
    );
  }

  if (grant.revoked_at !== null) return;

  await directusAsUser<unknown>(
    session.accessToken,
    `${path}?${query({ fields: 'id' })}`,
    {
      method: 'PATCH',
      body: { revoked_at: new Date().toISOString(), revoked_by: user.id },
    },
  );

  logInfo(LOG_SCOPE, `grant revoked id=${grant.id} page=${grant.page.id}`);
}
