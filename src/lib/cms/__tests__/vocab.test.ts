import fs from 'node:fs';
import path from 'node:path';

import {
  isActionAllowedFrom,
  MEMBERSHIP_ROLES,
  nextStatus,
  PAGE_ACTIONS,
  PAGE_STATUSES,
  PAGE_TYPES,
  type PageAction,
  REVIEW_ACTIONS,
  roleAllows,
  TEMPLATE_STATUSES,
} from '@/lib/cms/vocab';

const migration = fs.readFileSync(
  path.join(
    process.cwd(),
    'scripts/directus-schema/003-revisions-preview-grants.up.sql',
  ),
  'utf8',
);

/** Values listed in `CONSTRAINT <name> CHECK (<column> IN (...))`. */
function checkValues(constraint: string): string[] {
  const match = new RegExp(
    `${constraint}\\s+CHECK \\(\\w+ IN \\(([^)]*)\\)\\)`,
  ).exec(migration);
  if (!match) throw new Error(`constraint ${constraint} not found in 003`);
  return match[1].split(',').map((v) => v.trim().replace(/^'|'$/g, ''));
}

describe('vocabularies match the database CHECK constraints (migration 003)', () => {
  it.each([
    ['cms_pages_status_check', PAGE_STATUSES],
    ['cms_pages_page_type_check', PAGE_TYPES],
    ['cms_review_events_action_check', REVIEW_ACTIONS],
    ['cms_templates_status_check', TEMPLATE_STATUSES],
    ['cms_department_memberships_role_check', MEMBERSHIP_ROLES],
  ])('%s', (constraint, values) => {
    expect(checkValues(constraint)).toEqual([...values]);
  });
});

describe('page workflow', () => {
  const draft = { status: 'draft', isLive: false } as const;
  const liveEdited = { status: 'draft', isLive: true } as const;
  const inReview = { status: 'in_review', isLive: false } as const;
  const published = { status: 'published', isLive: true } as const;
  const archived = { status: 'archived', isLive: false } as const;

  it('follows draft → in_review → published', () => {
    expect(isActionAllowedFrom('submit', draft)).toBe(true);
    expect(nextStatus('submit', 'draft')).toBe('in_review');
    expect(isActionAllowedFrom('publish', inReview)).toBe(true);
    expect(nextStatus('publish', 'in_review')).toBe('published');
  });

  it('cannot publish without review', () => {
    expect(isActionAllowedFrom('publish', draft)).toBe(false);
    expect(isActionAllowedFrom('publish', published)).toBe(false);
  });

  it('locks the working copy while in review', () => {
    expect(isActionAllowedFrom('edit', inReview)).toBe(false);
  });

  it('editing a published page moves the working copy back to draft (C4)', () => {
    expect(isActionAllowedFrom('edit', published)).toBe(true);
    expect(nextStatus('edit', 'published')).toBe('draft');
    expect(nextStatus('edit', 'changes_requested')).toBe('changes_requested');
  });

  it('unpublish needs a live revision and keeps the working copy', () => {
    expect(isActionAllowedFrom('unpublish', draft)).toBe(false);
    expect(isActionAllowedFrom('unpublish', liveEdited)).toBe(true);
    expect(nextStatus('unpublish', 'published')).toBe('draft');
    expect(nextStatus('unpublish', 'in_review')).toBe('in_review');
  });

  it('archived pages can only be restored', () => {
    const allowed = (Object.keys(PAGE_ACTIONS) as PageAction[]).filter((a) =>
      isActionAllowedFrom(a, archived),
    );
    expect(allowed).toEqual(['restore']);
    expect(nextStatus('restore', 'archived')).toBe('draft');
  });

  it('splits review duties by role', () => {
    expect(roleAllows('editor', 'publish')).toBe(false);
    expect(roleAllows('reviewer', 'publish')).toBe(false);
    expect(roleAllows('reviewer', 'request_changes')).toBe(true);
    expect(roleAllows('publisher', 'publish')).toBe(true);
    expect(roleAllows('template_maintainer', 'edit')).toBe(false);
  });

  it('every action that writes a review event uses a known action', () => {
    for (const rule of Object.values(PAGE_ACTIONS)) {
      if (rule.event) expect(REVIEW_ACTIONS).toContain(rule.event);
    }
  });
});
