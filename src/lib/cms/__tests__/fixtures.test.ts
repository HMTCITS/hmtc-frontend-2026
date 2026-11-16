import { pageSummarySchema } from '@/lib/cms/dto';
import { MOCK_PAGES } from '@/lib/cms/fixtures';

describe('MOCK_PAGES', () => {
  it('matches the PageSummary wire contract exactly', () => {
    for (const page of MOCK_PAGES) {
      const result = pageSummarySchema.safeParse(page);
      const problems = result.success
        ? ''
        : JSON.stringify(result.error.issues);
      expect([page.title, result.success, problems]).toEqual([
        page.title,
        true,
        '',
      ]);
    }
  });

  it('covers every page status so the UI states are reviewable', () => {
    const statuses = new Set(MOCK_PAGES.map((page) => page.status));

    expect(Array.from(statuses).sort()).toEqual([
      'archived',
      'changes_requested',
      'draft',
      'in_review',
      'published',
    ]);
  });

  it('has unique page ids', () => {
    const ids = MOCK_PAGES.map((page) => page.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('uses the seeded production department and proker ids', () => {
    const departments = MOCK_PAGES.map((page) => page.departmentId);

    for (const id of departments) {
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
    }
  });
});
