/**
 * HMTC CMS — error model shared by `/api/cms/*` and the editor.
 *
 * Route Handlers return only this shape. Raw Directus errors are never
 * forwarded: they contain SQL, table names and constraint names.
 *
 * Isomorphic: safe to import from client components.
 */
import { z } from 'zod';

export const CMS_ERROR_STATUS = {
  /** No valid session. */
  unauthenticated: 401,
  /** Authenticated, but not allowed on this resource. */
  forbidden: 403,
  /** Publishing a submission you made yourself (C3). */
  self_approval: 403,
  /** `CMS_EDITING_ENABLED=false` (e.g. staging sharing production Directus). */
  editing_disabled: 403,
  /** Missing, or deliberately concealed because the caller may not see it. */
  not_found: 404,
  /** The workflow does not allow this action from the current status. */
  invalid_transition: 409,
  /** `expectedUpdatedAt` no longer matches — someone else saved first. */
  stale_write: 409,
  /** Unique conflict, e.g. a page already exists for (proker, year). */
  duplicate: 409,
  /** Body, params or query failed validation. */
  validation_failed: 422,
  /** Blocks are invalid for the requested mode (draft or publish). */
  invalid_blocks: 422,
  /** Origin check failed (CSRF). */
  bad_origin: 403,
  rate_limited: 429,
  internal: 500,
} as const;

export type CmsErrorCode = keyof typeof CMS_ERROR_STATUS;
export const cmsErrorCodeSchema = z.enum(
  Object.keys(CMS_ERROR_STATUS) as [CmsErrorCode, ...CmsErrorCode[]],
);

export const validationIssueSchema = z.object({
  /** Dotted path, e.g. `blocks.3.props.title`. Empty for a body-level issue. */
  path: z.string(),
  message: z.string(),
});
export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export const invalidBlockSchema = z.object({
  index: z.number().int(),
  type: z.string().nullable(),
  reason: z.string(),
});
export type InvalidBlock = z.infer<typeof invalidBlockSchema>;

export const cmsErrorBodySchema = z.object({
  error: z.object({
    code: cmsErrorCodeSchema,
    /** Human-readable, safe to show. Never contains internals. */
    message: z.string(),
    issues: z.array(validationIssueSchema).optional(),
    invalidBlocks: z.array(invalidBlockSchema).optional(),
  }),
});
export type CmsErrorBody = z.infer<typeof cmsErrorBodySchema>;

/** Build an error body (Route Handlers pair it with `CMS_ERROR_STATUS[code]`). */
export function cmsError(
  code: CmsErrorCode,
  message: string,
  extra: Pick<CmsErrorBody['error'], 'issues' | 'invalidBlocks'> = {},
): CmsErrorBody {
  return { error: { code, message, ...extra } };
}

/** Convert Zod issues to the wire format. */
export function toValidationIssues(error: z.ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
  }));
}
