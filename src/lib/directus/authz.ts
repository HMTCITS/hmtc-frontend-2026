/**
 * HMTC CMS — page authorization.
 *
 * Pure functions, no I/O: the caller loads the session user and the page,
 * then asks `can()` before forwarding a mutation to Directus. The UI only
 * receives `allowedActions()` to hide buttons; the Route Handler is what
 * enforces it (decisions C3, R6, R7).
 */
import type { PageDetail, SessionUser } from '@/lib/cms/dto';
import {
  isActionAllowedFrom,
  type MembershipRole,
  PAGE_ACTIONS,
  type PageAction,
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
 */
function isSelfApproval(
  user: SessionUser,
  action: PageAction,
  page: AuthzPage,
): boolean {
  return action === 'publish' && page.lastSubmission?.actorId === user.id;
}

/** Whether `user` may perform `action` on `page` right now. */
export function can(
  user: SessionUser,
  action: PageAction,
  page: AuthzPage,
): boolean {
  if (!isActionAllowedFrom(action, page)) return false;
  if (isSelfApproval(user, action, page)) return false;
  if (user.isAdmin) return true;

  const role = roleInDepartment(user, page.departmentId);
  return role !== null && PAGE_ACTIONS[action].roles.includes(role);
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
