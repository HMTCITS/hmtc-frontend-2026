/**
 * HMTC CMS — the single Directus fetch wrapper.
 *
 * Two functions, two credential paths:
 *
 *  - `directusRead` uses the static `DIRECTUS_READ_TOKEN` (nextjs-reader
 *    policy), `cache: 'force-cache'` and `next: { tags }`. Public reads only.
 *
 *  - `directusAsUser` uses the acting user's access token, `cache: 'no-store'`.
 *    Route Handlers and `/dashboard/cms` Server Components only. Directus
 *    policies are the second layer beneath the Next.js resource check.
 *
 * Every error is normalised to a `DirectusRequestError` whose `code` is one of
 * `CmsErrorCode` in `src/lib/cms/errors.ts`. **The raw Directus body is never
 * forwarded** — it contains SQL, table names and constraint names.
 *
 * No `@directus/sdk` (D6). No catch-all proxy (D2).
 */
import 'server-only';

import {
  CMS_ERROR_STATUS,
  cmsError,
  type CmsErrorBody,
  type CmsErrorCode,
  type InvalidBlock,
  type ValidationIssue,
} from '@/lib/cms/errors';

import { getCmsEnv } from './env';

/* ------------------------------------------------------------------ Error */

/**
 * Safe, user-visible messages. The Route Handler may override the message,
 * but it must not compose one from the Directus body.
 */
const SAFE_MESSAGES: Record<CmsErrorCode, string> = {
  unauthenticated: 'Sesi tidak valid. Silakan masuk kembali.',
  forbidden: 'Anda tidak memiliki izin untuk tindakan ini.',
  self_approval: 'Pengajuan Anda sendiri tidak dapat Anda setujui.',
  editing_disabled: 'Editing dinonaktifkan di lingkungan ini.',
  not_found: 'Data tidak ditemukan.',
  invalid_transition: 'Aksi ini tidak diizinkan pada status halaman saat ini.',
  stale_write: 'Halaman sudah diubah orang lain. Muat ulang sebelum menyimpan.',
  duplicate: 'Data dengan nilai unik tersebut sudah ada.',
  validation_failed: 'Data yang dikirim tidak valid.',
  invalid_blocks: 'Blok halaman tidak valid.',
  bad_origin: 'Permintaan lintas-origin ditolak.',
  rate_limited: 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
  internal: 'Terjadi kesalahan pada server.',
};

/**
 * The only error `directusRead` / `directusAsUser` throw.
 *
 * - `code` maps to `CMS_ERROR_STATUS`.
 * - `message` is always one of `SAFE_MESSAGES`, never a raw Directus string.
 * - `issues` / `invalidBlocks` carry field-level detail when Directus supplied
 *   it, so the editor can focus the offending field.
 */
export class DirectusRequestError extends Error {
  constructor(
    public readonly code: CmsErrorCode,
    message: string,
    public readonly issues?: ValidationIssue[],
    public readonly invalidBlocks?: InvalidBlock[],
  ) {
    super(message);
    this.name = 'DirectusRequestError';
  }

  get status(): number {
    return CMS_ERROR_STATUS[this.code];
  }

  toBody(): CmsErrorBody {
    // Build `extra` conditionally so undefined fields never appear in the
    // serialised body (keeps `toEqual` tests and wire output clean).
    const extra: {
      issues?: ValidationIssue[];
      invalidBlocks?: InvalidBlock[];
    } = {};
    if (this.issues) extra.issues = this.issues;
    if (this.invalidBlocks) extra.invalidBlocks = this.invalidBlocks;
    return cmsError(this.code, this.message, extra);
  }
}

/* -------------------------------------------------------- Directus body */

type DirectusErrorEntry = {
  message: string;
  code: string | null;
  field: string | null;
  collection: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readDirectusErrors(body: unknown): DirectusErrorEntry[] {
  if (!isRecord(body) || !Array.isArray(body.errors)) return [];
  return body.errors.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    const extensions = isRecord(entry.extensions) ? entry.extensions : {};
    return [
      {
        message: typeof entry.message === 'string' ? entry.message : '',
        code: typeof extensions.code === 'string' ? extensions.code : null,
        field: typeof extensions.field === 'string' ? extensions.field : null,
        collection:
          typeof extensions.collection === 'string'
            ? extensions.collection
            : null,
      },
    ];
  });
}

/**
 * A unique violation surfaces as **either**
 *  - `extensions.code === 'RECORD_NOT_UNIQUE'`, or
 *  - a 400 whose message embeds the Postgres constraint name
 *    (`duplicate key value violates unique constraint "cms_…_unique"`).
 *
 * See `docs/hmtc-cms-decisions.md` Q11: composite unique indexes are not
 * visible to Directus, so the constraint name appears in the message.
 */
function isUniqueViolation(entries: DirectusErrorEntry[]): boolean {
  return entries.some(
    (entry) =>
      entry.code === 'RECORD_NOT_UNIQUE' ||
      /duplicate key value violates unique constraint/i.test(entry.message),
  );
}

/**
 * Reject field messages that leak schema internals. A Directus validation
 * message like `"Title is required"` is fine; anything that names a constraint,
 * table, column, relation or SQL state is replaced with a generic phrase.
 */
const UNSAFE_FIELD_MESSAGE =
  /constraint|table|column|relation|postgres|sqlstate|duplicate key|pg_/i;

function safeFieldMessage(raw: string): string {
  if (!raw || UNSAFE_FIELD_MESSAGE.test(raw)) return 'nilai tidak valid';
  return raw;
}

function toValidationIssues(entries: DirectusErrorEntry[]): ValidationIssue[] {
  return entries.flatMap((entry) => {
    if (!entry.field) return [];
    return [{ path: entry.field, message: safeFieldMessage(entry.message) }];
  });
}

/* ---------------------------------------------------------------- Mapping */

/**
 * Map a Directus error response to a `CmsErrorCode` and optional issues.
 *
 * Pure function so it can be unit-tested without mocking `fetch` or the env.
 * `buildError` is the only caller in production code.
 *
 * Mapping:
 *  - 400 / 422           → `validation_failed` (+ issues, if any)
 *  - 401                 → `unauthenticated`
 *  - 403                 → `forbidden`
 *  - 404                 → `not_found`
 *  - 409                 → `duplicate` (Directus uses 409 for uniqueness on
 *                          some versions; workflow 409 is emitted by our own
 *                          Route Handlers and never reaches this branch)
 *  - 429                 → `rate_limited`
 *  - any unique violation → `duplicate` (regardless of status)
 *  - 5xx                 → `internal`
 *  - any other 4xx       → `validation_failed` (conservative)
 */
export function mapDirectusError(
  status: number,
  body: unknown,
): { code: CmsErrorCode; issues?: ValidationIssue[] } {
  const entries = readDirectusErrors(body);

  if (isUniqueViolation(entries)) {
    return { code: 'duplicate' };
  }

  switch (status) {
    case 400:
    case 422: {
      const issues = toValidationIssues(entries);
      return issues.length > 0
        ? { code: 'validation_failed', issues }
        : { code: 'validation_failed' };
    }
    case 401:
      return { code: 'unauthenticated' };
    case 403:
      return { code: 'forbidden' };
    case 404:
      return { code: 'not_found' };
    case 409:
      return { code: 'duplicate' };
    case 429:
      return { code: 'rate_limited' };
    default:
      return status >= 500
        ? { code: 'internal' }
        : { code: 'validation_failed' };
  }
}

/* --------------------------------------------------------------- Helpers */

async function buildError(response: Response): Promise<DirectusRequestError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON error body (upstream proxy, empty body). Status still maps.
  }

  const { code, issues } = mapDirectusError(response.status, body);
  return new DirectusRequestError(code, SAFE_MESSAGES[code], issues);
}

function joinUrl(base: string, path: string): string {
  const trimmedBase = base.replace(/\/+$/, '');
  const trimmedPath = path.startsWith('/') ? path : `/${path}`;
  return `${trimmedBase}${trimmedPath}`;
}

/* ---------------------------------------------------------------- Public */

/**
 * Read with the static `nextjs-reader` token, cached and tagged.
 *
 * Every call must be tag-invalidatable: publish, unpublish, archive and the
 * Directus revalidate webhook all call `revalidateTag` on the same tags
 * (`src/lib/cms/cache-tags.ts`). No time-based `revalidate` (D7).
 *
 * Drafts never go through this function — the editor uses `directusAsUser`
 * with the user's own token and `cache: 'no-store'`.
 */
export async function directusRead<T>(
  path: string,
  options: { tags?: string[] } = {},
): Promise<T> {
  const env = getCmsEnv();
  const url = joinUrl(env.directusUrl, path);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${env.readToken}`,
    },
    cache: 'force-cache',
    next: { tags: options.tags ?? [] },
  });

  if (!response.ok) throw await buildError(response);

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/**
 * Read or write with the acting user's access token, never cached.
 *
 * `body` may be a JSON-serialisable value (default) or a `FormData` for asset
 * uploads; `fetch` sets the multipart boundary automatically when it receives
 * a `FormData`.
 *
 * The access token is passed in rather than read from a cookie here: the
 * cookie is decoded by `session.ts`, which is the only module that should know
 * about cookie names.
 */
export async function directusAsUser<T>(
  accessToken: string,
  path: string,
  init: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
  } = {},
): Promise<T> {
  if (!accessToken) {
    throw new DirectusRequestError(
      'unauthenticated',
      SAFE_MESSAGES.unauthenticated,
    );
  }

  const env = getCmsEnv();
  const url = joinUrl(env.directusUrl, path);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };

  let body: BodyInit | undefined;
  if (init.body instanceof FormData) {
    // Let fetch set `Content-Type: multipart/form-data; boundary=…`.
    body = init.body;
  } else if (init.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(init.body);
  }

  const response = await fetch(url, {
    method: init.method ?? 'GET',
    headers,
    body,
    cache: 'no-store',
  });

  if (!response.ok) throw await buildError(response);

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
