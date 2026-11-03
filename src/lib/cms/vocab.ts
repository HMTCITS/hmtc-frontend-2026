/**
 * HMTC CMS — vocabularies and the page workflow.
 *
 * Every list here is mirrored by a CHECK constraint in
 * `scripts/directus-schema/003-revisions-preview-grants.up.sql`; the test
 * `src/lib/cms/__tests__/vocab.test.ts` fails if the two drift apart.
 *
 * Isomorphic: no secrets, safe to import from client components.
 */
import { z } from 'zod';

export const PAGE_STATUSES = [
  'draft',
  'in_review',
  'changes_requested',
  'published',
  'archived',
] as const;
export const pageStatusSchema = z.enum(PAGE_STATUSES);
export type PageStatus = z.infer<typeof pageStatusSchema>;

/**
 * Decision N3.
 *  - `event`   dated activity: registration, schedule, venue (Seminar Dosen, TC Run, Bluecamp)
 *  - `program` ongoing programme or service without a single date (Academic Resources)
 */
export const PAGE_TYPES = ['event', 'program'] as const;
export const pageTypeSchema = z.enum(PAGE_TYPES);
export type PageType = z.infer<typeof pageTypeSchema>;

export const REVIEW_ACTIONS = [
  'submitted',
  'approved',
  'changes_requested',
  'unpublished',
  'archived',
] as const;
export const reviewActionSchema = z.enum(REVIEW_ACTIONS);
export type ReviewAction = z.infer<typeof reviewActionSchema>;

export const TEMPLATE_STATUSES = ['draft', 'published', 'archived'] as const;
export const templateStatusSchema = z.enum(TEMPLATE_STATUSES);
export type TemplateStatus = z.infer<typeof templateStatusSchema>;

/**
 * Decision N7. Granted per department in `cms_department_memberships`.
 *  - `editor`              create and edit drafts, submit, restore, mint previews
 *  - `reviewer`            request changes on submissions
 *  - `publisher`           everything a reviewer can do, plus publish/unpublish/archive
 *  - `template_maintainer` manage templates for the department
 * `(user, department)` is unique, so a user holds one role per department.
 */
export const MEMBERSHIP_ROLES = [
  'editor',
  'reviewer',
  'publisher',
  'template_maintainer',
] as const;
export const membershipRoleSchema = z.enum(MEMBERSHIP_ROLES);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;

/**
 * Page workflow.
 *
 * `status` describes the **working copy** (`cms_pages.blocks` and fields).
 * What the public sees is `published_revision`, which only `publish`,
 * `unpublish` and `archive` change — so editing a live page never changes
 * public output until it is republished (C4).
 */
export type PageAction =
  | 'edit'
  | 'submit'
  | 'request_changes'
  | 'publish'
  | 'unpublish'
  | 'archive'
  | 'restore'
  | 'create_preview';

type ActionRule = {
  /** Working-copy statuses the action may start from. */
  from: readonly PageStatus[];
  /**
   * Status after the action. `null` = unchanged, except that `edit` on a
   * `published` working copy moves it to `draft` (see `nextStatus`).
   */
  to: PageStatus | null;
  /** Roles (in the page's department) allowed to perform it. Admins always may. */
  roles: readonly MembershipRole[];
  /** Review event written to `cms_review_events`, if any. */
  event: ReviewAction | null;
  /** Requires a live `published_revision`. */
  requiresLive?: boolean;
};

export const PAGE_ACTIONS: Record<PageAction, ActionRule> = {
  edit: {
    from: ['draft', 'changes_requested', 'published'],
    to: null,
    roles: ['editor'],
    event: null,
  },
  submit: {
    from: ['draft', 'changes_requested'],
    to: 'in_review',
    roles: ['editor'],
    event: 'submitted',
  },
  request_changes: {
    from: ['in_review'],
    to: 'changes_requested',
    roles: ['reviewer', 'publisher'],
    event: 'changes_requested',
  },
  publish: {
    from: ['in_review'],
    to: 'published',
    roles: ['publisher'],
    event: 'approved',
  },
  unpublish: {
    from: ['draft', 'in_review', 'changes_requested', 'published'],
    to: null,
    roles: ['publisher'],
    event: 'unpublished',
    requiresLive: true,
  },
  archive: {
    from: ['draft', 'in_review', 'changes_requested', 'published'],
    to: 'archived',
    roles: ['publisher'],
    event: 'archived',
  },
  restore: {
    from: ['draft', 'changes_requested', 'published', 'archived'],
    to: 'draft',
    roles: ['editor'],
    event: null,
  },
  create_preview: {
    from: ['draft', 'in_review', 'changes_requested', 'published'],
    to: null,
    roles: ['editor', 'reviewer', 'publisher'],
    event: null,
  },
};

export type PageState = { status: PageStatus; isLive: boolean };

/** Whether `action` may start from `state` (ignores who is acting). */
export function isActionAllowedFrom(action: PageAction, state: PageState) {
  const rule = PAGE_ACTIONS[action];
  if (!rule.from.includes(state.status)) return false;
  if (rule.requiresLive && !state.isLive) return false;
  return true;
}

/** Working-copy status after `action`. Call only when the action is allowed. */
export function nextStatus(
  action: PageAction,
  current: PageStatus,
): PageStatus {
  if (action === 'edit') return current === 'published' ? 'draft' : current;
  if (action === 'unpublish')
    return current === 'published' ? 'draft' : current;
  return PAGE_ACTIONS[action].to ?? current;
}

/** Whether a holder of `role` may perform `action`. */
export function roleAllows(role: MembershipRole, action: PageAction) {
  return PAGE_ACTIONS[action].roles.includes(role);
}

/** Preview links: bearer grants, 72 h by default (C5). */
export const PREVIEW_GRANT_DEFAULT_TTL_HOURS = 72;
export const PREVIEW_GRANT_MAX_TTL_HOURS = 72;
