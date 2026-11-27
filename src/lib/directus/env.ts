/**
 * HMTC CMS — the only place the Directus credentials are read.
 *
 * Parsing is **lazy**: importing this module must not fail a non-CMS page,
 * because CI builds the image without the tokens and `generateStaticParams`
 * returns `[]` (see `docs/hmtc-cms-integration-plan.md` §5). The error is only
 * raised when a CMS code path calls `getCmsEnv()`.
 *
 * Every other module in `src/lib/directus/**` reads config through this
 * function, never through `process.env` directly.
 */
import 'server-only';

import { z } from 'zod';

const directusUrlSchema = z
  .string()
  .min(1, 'DIRECTUS_URL wajib diisi')
  .refine((value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }, 'DIRECTUS_URL harus URL yang valid (mis. https://directus.hmtc-its.com atau http://directus:8055)');

const schema = z.object({
  DIRECTUS_URL: directusUrlSchema,
  DIRECTUS_READ_TOKEN: z.string().min(1, 'DIRECTUS_READ_TOKEN wajib diisi'),
  CMS_REVALIDATE_SECRET: z.string().min(1, 'CMS_REVALIDATE_SECRET wajib diisi'),
  CMS_EDITING_ENABLED: z
    .string()
    .default('true')
    .refine((value) => value === 'true' || value === 'false', {
      message: 'CMS_EDITING_ENABLED harus "true" atau "false"',
    }),
  CMS_SESSION_COOKIE_DOMAIN: z
    .string()
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
});

export type CmsEnv = {
  /** Base URL of the Directus instance, trailing slashes stripped. */
  directusUrl: string;
  /** Static token of the `nextjs-reader` policy. Public reads only. */
  readToken: string;
  /** Shared with the Directus revalidate Flow (HMAC-SHA256). */
  revalidateSecret: string;
  /** `false` on staging: every mutation returns `403 editing_disabled` (N9). */
  editingEnabled: boolean;
  /** Optional cookie domain; `undefined` means host-only. */
  sessionCookieDomain: string | undefined;
};

let cached: CmsEnv | null = null;

/**
 * Parse the CMS env once. Throws a readable error listing every missing var.
 *
 * The error message is intentionally not a `CmsErrorBody`: this is a
 * deployment misconfiguration, not a request-time failure.
 */
export function getCmsEnv(): CmsEnv {
  if (cached) return cached;

  const result = schema.safeParse({
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    DIRECTUS_READ_TOKEN: process.env.DIRECTUS_READ_TOKEN,
    CMS_REVALIDATE_SECRET: process.env.CMS_REVALIDATE_SECRET,
    CMS_EDITING_ENABLED: process.env.CMS_EDITING_ENABLED,
    CMS_SESSION_COOKIE_DOMAIN: process.env.CMS_SESSION_COOKIE_DOMAIN,
  });

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Konfigurasi CMS belum lengkap:\n${issues}`);
  }

  cached = {
    directusUrl: result.data.DIRECTUS_URL.replace(/\/+$/, ''),
    readToken: result.data.DIRECTUS_READ_TOKEN,
    revalidateSecret: result.data.CMS_REVALIDATE_SECRET,
    editingEnabled: result.data.CMS_EDITING_ENABLED === 'true',
    sessionCookieDomain: result.data.CMS_SESSION_COOKIE_DOMAIN,
  };

  return cached;
}

/**
 * Reset the cached parse. **Test-only** — production code never calls this.
 *
 * Exists so tests can set `process.env` per case without touching module
 * state. It is exported rather than hidden behind a jest-only helper so the
 * test file does not need a custom transform.
 */
export function resetCmsEnvForTests(): void {
  cached = null;
}
