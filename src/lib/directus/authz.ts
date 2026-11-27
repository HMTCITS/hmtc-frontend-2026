/**
 * HMTC CMS — page authorization.
 *
 * Pure functions, no I/O: the caller loads the session user and the page,
 * then asks `authorize()` before forwarding a mutation to Directus and maps a
 * denial to its HTTP error with `cmsError()`. The UI only receives
 * `allowedActions()` to hide buttons; the Route Handler is what enforces it
 * (decisions C3, R6, R7; docs/hmtc-cms-api-contract.md, rules 4–6).
 *
 * `SessionUser.memberships` must contain active memberships only: the session
 * loader filters `is_active`, this module does not.
 */
import type { PageDetail, SessionUser } from '@/lib/cms/dto';
import type { CmsErrorCode } from '@/lib/cms/errors';
import {
  isActionAllowedFrom,
  type MembershipRole,
  PAGE_ACTIONS,
  type PageAction,
  roleAllows,
} from '@/lib/cms/vocab';

/** The parts of a page that authorization depends on. */
export type AuthzPage = Pick<
  PageDetail,
  'departmentId' | 'status' | 'isLive' | 'lastSubmission'
>;

/** The user's role in `departmentId`, or `null` if they are not a member. */
export function roleInDepartment(
  user: SessionUser,
  departmentId: string,
): MembershipRole | null {
  return (
    user.memberships.find((m) => m.departmentId === departmentId)?.role ?? null
  );
}

/**
 * Self-approval (C3): nobody — admins included — may publish a submission
 * they made themselves. Only `publish` is the approval step.
 *
 * Fails closed: if the page has no recorded submission (missing or legacy
 * event without an actor), nobody can prove they are not the submitter, so
 * publishing is refused.
 */
function isSelfApproval(
  user: SessionUser,
  action: PageAction,
  page: AuthzPage,
): boolean {
  if (action !== 'publish') return false;
  return (
    page.lastSubmission === null || page.lastSubmission.actorId === user.id
  );
}

/** Why `authorize()` refused an action; each maps to a `CmsErrorCode`. */
export type AuthzDenial = Extract<
  CmsErrorCode,
  'not_found' | 'forbidden' | 'invalid_transition' | 'self_approval'
>;

/**
 * Whether `user` may perform `action` on `page` right now, and if not, why.
 * Returns `null` when allowed. Checks run in the API contract's order:
 *
 * 1. not a member of the page's department → `not_found` (404, the page's
 *    existence is not revealed);
 * 2. member, but the role may not do this → `forbidden` (403);
 * 3. the page's state does not allow it → `invalid_transition` (409);
 * 4. publishing one's own (or an unattributed) submission → `self_approval` (403).
 *
 * Directus admins skip 1 and 2 but not 3 and 4.
 */
export function authorize(
  user: SessionUser,
  action: PageAction,
  page: AuthzPage,
): AuthzDenial | null {
  if (!user.isAdmin) {
    const role = roleInDepartment(user, page.departmentId);
    if (role === null) return 'not_found';
    if (!roleAllows(role, action)) return 'forbidden';
  }
  if (!isActionAllowedFrom(action, page)) return 'invalid_transition';
  if (isSelfApproval(user, action, page)) return 'self_approval';
  return null;
}

/** Whether `user` may perform `action` on `page` right now. */
export function can(
  user: SessionUser,
  action: PageAction,
  page: AuthzPage,
): boolean {
  return authorize(user, action, page) === null;
}

/** Every action `user` may perform on `page`, for `PageDetail.allowedActions`. */
export function allowedActions(
  user: SessionUser,
  page: AuthzPage,
): PageAction[] {
  return (Object.keys(PAGE_ACTIONS) as PageAction[]).filter((action) =>
    can(user, action, page),
  );
}
