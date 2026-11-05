/**
 * HMTC CMS — wire DTOs for `/api/cms/*`.
 *
 * These are the shapes the browser sees. They are deliberately not the
 * Directus row shapes: field names are camelCase, internal columns are left
 * out, and every value the UI depends on is explicit.
 *
 * Isomorphic: safe to import from client components.
 */
import { z } from 'zod';

import { invalidBlockSchema } from '@/lib/cms/errors';
import {
  membershipRoleSchema,
  type PageAction,
  pageStatusSchema,
  pageTypeSchema,
  reviewActionSchema,
} from '@/lib/cms/vocab';

const id = z.uuid();
const timestamp = z.iso.datetime({ offset: true });
const year = z.number().int().min(2000).max(2100);

export const PAGE_ACTION_VALUES = [
  'edit',
  'submit',
  'request_changes',
  'publish',
  'unpublish',
  'archive',
  'restore',
  'create_preview',
] as const satisfies readonly PageAction[];
export const pageActionSchema = z.enum(PAGE_ACTION_VALUES);

/* ------------------------------------------------------------------ Session */

export const membershipDtoSchema = z.object({
  departmentId: id,
  departmentSlug: z.string(),
  role: membershipRoleSchema,
});

export const sessionUserSchema = z.object({
  id,
  email: z.email(),
  name: z.string(),
  /** Directus admin: may act in every department; self-approval still applies. */
  isAdmin: z.boolean(),
  memberships: z.array(membershipDtoSchema),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

/* ---------------------------------------------------------------- Lookups */

export const departmentDtoSchema = z.object({
  id,
  name: z.string(),
  slug: z.string(),
});
export type DepartmentDto = z.infer<typeof departmentDtoSchema>;

export const prokerDtoSchema = z.object({
  id,
  departmentId: id,
  title: z.string(),
  slug: z.string(),
  isActive: z.boolean(),
});
export type ProkerDto = z.infer<typeof prokerDtoSchema>;

export const assetDtoSchema = z.object({
  id,
  title: z.string().nullable(),
  type: z.string(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  filesize: z.number().int(),
});
export type AssetDto = z.infer<typeof assetDtoSchema>;

/* ------------------------------------------------------------------- Pages */

export const pageSummarySchema = z.object({
  id,
  title: z.string(),
  slug: z.string(),
  pageType: pageTypeSchema,
  status: pageStatusSchema,
  departmentId: id,
  prokerId: id,
  editionYear: year,
  /** A published revision is live on the public site. */
  isLive: z.boolean(),
  publishedAt: timestamp.nullable(),
  updatedAt: timestamp,
  /** Public URL, e.g. `/research-and-technology/bluecamp/2026`. */
  path: z.string(),
});
export type PageSummary = z.infer<typeof pageSummarySchema>;

export const reviewEventDtoSchema = z.object({
  id: z.number().int(),
  action: reviewActionSchema,
  fromStatus: pageStatusSchema.nullable(),
  toStatus: pageStatusSchema,
  comment: z.string().nullable(),
  actorId: id,
  actorName: z.string(),
  createdAt: timestamp,
});
export type ReviewEventDto = z.infer<typeof reviewEventDtoSchema>;

export const pageDetailSchema = pageSummarySchema.extend({
  /**
   * Working copy as stored. Validated on read with `parseBlocksForRead`, so
   * the editor always receives `blocks` plus a list of what was invalid.
   */
  blocks: z.array(z.unknown()),
  invalidBlocks: z.array(invalidBlockSchema),
  excerpt: z.string().nullable(),
  featuredImageId: id.nullable(),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  templateId: z.number().int().nullable(),
  publishedRevisionId: id.nullable(),
  currentRevisionId: id.nullable(),
  /** Latest `submitted` event, used to show who may (not) approve. */
  lastSubmission: z.object({ actorId: id, at: timestamp }).nullable(),
  history: z.array(reviewEventDtoSchema),
  /** Computed server-side for the current user; the UI only hides buttons. */
  allowedActions: z.array(pageActionSchema),
});
export type PageDetail = z.infer<typeof pageDetailSchema>;

/* --------------------------------------------------------------- Revisions */

export const revisionSummarySchema = z.object({
  id,
  revisionNumber: z.number().int().positive(),
  title: z.string(),
  authorId: id.nullable(),
  authorName: z.string().nullable(),
  changeNote: z.string().nullable(),
  createdAt: timestamp,
  /** This revision is the page's live `published_revision`. */
  isPublished: z.boolean(),
});
export type RevisionSummary = z.infer<typeof revisionSummarySchema>;

/* ---------------------------------------------------------- Preview grants */

export const previewGrantDtoSchema = z.object({
  id,
  pageId: id,
  revisionId: id,
  createdById: id.nullable(),
  createdAt: timestamp,
  expiresAt: timestamp,
  revokedAt: timestamp.nullable(),
});
export type PreviewGrantDto = z.infer<typeof previewGrantDtoSchema>;
