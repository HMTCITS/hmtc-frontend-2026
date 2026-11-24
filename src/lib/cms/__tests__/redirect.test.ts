import { CMS_HOME, CMS_LOGIN, loginUrl, safeNext } from '@/lib/cms/redirect';

describe('safeNext', () => {
  it.each([
    '/dashboard/cms',
    '/dashboard/cms/pages/1',
    '/dashboard/cms?status=draft',
  ])('keeps %s', (path) => {
    expect(safeNext(path)).toBe(path);
  });

  it.each([
    [null],
    [undefined],
    [''],
    ['//evil.example/dashboard/cms'],
    ['https://evil.example/dashboard/cms'],
    ['/dashboard/cms\\@evil.example'],
    ['/dashboard/cmsx'],
    ['/dashboard'],
    ['/'],
  ])('falls back to the CMS home for %p', (raw) => {
    expect(safeNext(raw)).toBe(CMS_HOME);
  });
});

describe('loginUrl', () => {
  it('omits next when it is the CMS home', () => {
    expect(loginUrl()).toBe(CMS_LOGIN);
    expect(loginUrl(CMS_HOME)).toBe(CMS_LOGIN);
  });

  it('keeps a safe next and drops an unsafe one', () => {
    expect(loginUrl('/dashboard/cms/pages/1')).toBe(
      `${CMS_LOGIN}?next=%2Fdashboard%2Fcms%2Fpages%2F1`,
    );
    expect(loginUrl('https://evil.example')).toBe(CMS_LOGIN);
  });
});
