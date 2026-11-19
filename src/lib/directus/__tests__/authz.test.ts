import type { SessionUser } from '@/lib/cms/dto';
import {
  MEMBERSHIP_ROLES,
  type MembershipRole,
  PAGE_ACTIONS,
  PAGE_STATUSES,
  type PageAction,
} from '@/lib/cms/vocab';
import {
  allowedActions,
  authorize,
  type AuthzPage,
  can,
} from '@/lib/directus/authz';

const DEPT_A = '00000000-0000-4000-8000-00000000000a';
const DEPT_B = '00000000-0000-4000-8000-00000000000b';
const ACTIONS = Object.keys(PAGE_ACTIONS) as PageAction[];

let nextId = 1;
function user(
  memberships: { departmentId: string; role: MembershipRole }[] = [],
  isAdmin = false,
): SessionUser {
  const n = String(nextId++).padStart(12, '0');
  return {
    id: `10000000-0000-4000-8000-${n}`,
    email: `u${n}@example.com`,
    name: `User ${n}`,
    isAdmin,
    memberships: memberships.map((m) => ({ ...m, departmentSlug: 'x' })),
  };
}

function page(overrides: Partial<AuthzPage> = {}): AuthzPage {
  return {
    departmentId: DEPT_A,
    status: 'draft',
    isLive: false,
    lastSubmission: null,
    ...overrides,
  };
}

const submitter = user([{ departmentId: DEPT_A, role: 'editor' }]);
const inReview = page({
  status: 'in_review',
  lastSubmission: { actorId: submitter.id, at: '2026-11-13T00:00:00+07:00' },
});

describe('can — role matrix within the page department', () => {
  for (const role of MEMBERSHIP_ROLES) {
    for (const action of ACTIONS) {
      const expected = PAGE_ACTIONS[action].roles.includes(role);
      it(`${role} ${expected ? 'may' : 'may not'} ${action}`, () => {
        const u = user([{ departmentId: DEPT_A, role }]);
        const status = PAGE_ACTIONS[action].from[0];
        const p = page({
          status,
          isLive: true,
          lastSubmission:
            status === 'in_review' ? inReview.lastSubmission : null,
        });
        expect(can(u, action, p)).toBe(expected);
      });
    }
  }
});

describe('can — department scope', () => {
  it('rejects an editor from another department', () => {
    const u = user([{ departmentId: DEPT_B, role: 'editor' }]);
    expect(can(u, 'edit', page())).toBe(false);
    expect(allowedActions(u, page())).toEqual([]);
  });

  it('uses the role held in the page department only', () => {
    const u = user([
      { departmentId: DEPT_A, role: 'reviewer' },
      { departmentId: DEPT_B, role: 'publisher' },
    ]);
    expect(can(u, 'publish', inReview)).toBe(false);
    expect(can(u, 'request_changes', inReview)).toBe(true);
  });

  it('rejects a user with no memberships', () => {
    expect(allowedActions(user(), inReview)).toEqual([]);
  });
});

describe('can — publishing and self-approval', () => {
  it('a reviewer cannot publish', () => {
    const u = user([{ departmentId: DEPT_A, role: 'reviewer' }]);
    expect(can(u, 'publish', inReview)).toBe(false);
  });

  it('a different publisher can publish', () => {
    const u = user([{ departmentId: DEPT_A, role: 'publisher' }]);
    expect(can(u, 'publish', inReview)).toBe(true);
  });

  it('a publisher cannot publish their own submission', () => {
    const u = user([{ departmentId: DEPT_A, role: 'publisher' }]);
    const own = page({
      status: 'in_review',
      lastSubmission: { actorId: u.id, at: '2026-11-13T00:00:00+07:00' },
    });
    expect(can(u, 'publish', own)).toBe(false);
    expect(can(u, 'request_changes', own)).toBe(true);
  });

  it('an admin cannot publish their own submission either', () => {
    const admin = user([], true);
    const own = page({
      status: 'in_review',
      lastSubmission: { actorId: admin.id, at: '2026-11-13T00:00:00+07:00' },
    });
    expect(can(admin, 'publish', own)).toBe(false);
    expect(allowedActions(admin, own)).not.toContain('publish');
  });

  it('no one can publish when the submission is not recorded', () => {
    const u = user([{ departmentId: DEPT_A, role: 'publisher' }]);
    const unattributed = page({ status: 'in_review', lastSubmission: null });
    expect(can(u, 'publish', unattributed)).toBe(false);
    expect(can(user([], true), 'publish', unattributed)).toBe(false);
    expect(can(u, 'request_changes', unattributed)).toBe(true);
  });
});

describe('authorize — denial reasons', () => {
  it('returns null when allowed', () => {
    const u = user([{ departmentId: DEPT_A, role: 'publisher' }]);
    expect(authorize(u, 'publish', inReview)).toBeNull();
  });

  it('not a member of the page department → not_found', () => {
    const u = user([{ departmentId: DEPT_B, role: 'publisher' }]);
    expect(authorize(u, 'publish', inReview)).toBe('not_found');
    expect(authorize(user(), 'edit', page())).toBe('not_found');
  });

  it('member without the role → forbidden', () => {
    const u = user([{ departmentId: DEPT_A, role: 'reviewer' }]);
    expect(authorize(u, 'publish', inReview)).toBe('forbidden');
  });

  it('wrong state → invalid_transition', () => {
    const u = user([{ departmentId: DEPT_A, role: 'publisher' }]);
    expect(authorize(u, 'publish', page({ status: 'draft' }))).toBe(
      'invalid_transition',
    );
    expect(authorize(u, 'unpublish', page({ status: 'published' }))).toBe(
      'invalid_transition',
    );
  });

  it('own or unattributed submission → self_approval', () => {
    const u = user([{ departmentId: DEPT_A, role: 'publisher' }]);
    const own = page({
      status: 'in_review',
      lastSubmission: { actorId: u.id, at: '2026-11-13T00:00:00+07:00' },
    });
    expect(authorize(u, 'publish', own)).toBe('self_approval');
    expect(
      authorize(
        u,
        'publish',
        page({ status: 'in_review', lastSubmission: null }),
      ),
    ).toBe('self_approval');
  });

  it('checks run in contract order: membership, role, state, self-approval', () => {
    // Not a member and wrong state: membership wins (no existence leak).
    const outsider = user([{ departmentId: DEPT_B, role: 'publisher' }]);
    expect(authorize(outsider, 'publish', page())).toBe('not_found');
    // Wrong role and wrong state: role wins.
    const editor = user([{ departmentId: DEPT_A, role: 'editor' }]);
    expect(authorize(editor, 'publish', page())).toBe('forbidden');
  });

  it('admins skip membership and role but not state or self-approval', () => {
    const admin = user([], true);
    expect(authorize(admin, 'edit', page({ departmentId: DEPT_B }))).toBeNull();
    expect(authorize(admin, 'publish', page())).toBe('invalid_transition');
    const own = page({
      status: 'in_review',
      lastSubmission: { actorId: admin.id, at: '2026-11-13T00:00:00+07:00' },
    });
    expect(authorize(admin, 'publish', own)).toBe('self_approval');
  });

  it('agrees with can() for every role, action and status', () => {
    for (const role of MEMBERSHIP_ROLES) {
      const u = user([{ departmentId: DEPT_A, role }]);
      for (const status of PAGE_STATUSES) {
        const p = page({
          status,
          isLive: true,
          lastSubmission: inReview.lastSubmission,
        });
        for (const action of ACTIONS) {
          expect(can(u, action, p)).toBe(authorize(u, action, p) === null);
        }
      }
    }
  });
});

describe('can — admin', () => {
  it('acts in every department without a membership', () => {
    const admin = user([], true);
    expect(can(admin, 'edit', page({ departmentId: DEPT_B }))).toBe(true);
    expect(can(admin, 'publish', inReview)).toBe(true);
  });

  it('is still bound by the workflow', () => {
    const admin = user([], true);
    for (const status of PAGE_STATUSES) {
      const p = page({
        status,
        isLive: false,
        lastSubmission: status === 'in_review' ? inReview.lastSubmission : null,
      });
      for (const action of ACTIONS) {
        const rule = PAGE_ACTIONS[action];
        const fromOk =
          rule.from.includes(status) && !(rule.requiresLive ?? false);
        expect(can(admin, action, p)).toBe(fromOk);
      }
    }
  });
});

describe('allowedActions', () => {
  it('lists editor actions on a draft', () => {
    const u = user([{ departmentId: DEPT_A, role: 'editor' }]);
    expect(allowedActions(u, page())).toEqual([
      'edit',
      'submit',
      'restore',
      'create_preview',
    ]);
  });

  it('gives an archived page only restore', () => {
    const u = user([{ departmentId: DEPT_A, role: 'editor' }]);
    expect(allowedActions(u, page({ status: 'archived' }))).toEqual([
      'restore',
    ]);
  });

  it('requires a live revision to unpublish', () => {
    const u = user([{ departmentId: DEPT_A, role: 'publisher' }]);
    expect(allowedActions(u, page({ status: 'published' }))).not.toContain(
      'unpublish',
    );
    expect(
      allowedActions(u, page({ status: 'published', isLive: true })),
    ).toContain('unpublish');
  });
});
