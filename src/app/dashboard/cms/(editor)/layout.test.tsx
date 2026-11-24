import { render, screen } from '@testing-library/react';

import { getSession } from '../../../../lib/directus/session';
import CmsEditorLayout from './layout';
import CmsPostsAndPagesPage from './page';

jest.mock('server-only', () => ({}));
jest.mock('../../../../lib/directus/session', () => ({
  getSession: jest.fn(),
}));

class RedirectSignal extends Error {
  constructor(readonly url: string) {
    super(`redirect ${url}`);
  }
}
jest.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new RedirectSignal(url);
  },
  usePathname: () => '/dashboard/cms',
  useRouter: () => ({ replace: jest.fn(), refresh: jest.fn() }),
}));

jest.mock('lucide-react', () => ({
  FileText: () => null,
  Images: () => null,
  LogOut: () => null,
  RefreshCw: () => null,
  ShieldAlert: () => null,
  Users: () => null,
}));

const session = jest.mocked(getSession);

const USER = {
  id: 'd0000000-0000-4000-8000-000000000001',
  email: 'editor@example.com',
  name: 'Local Editor',
  isAdmin: false,
  memberships: [],
};

async function renderLayout() {
  render(await CmsEditorLayout({ children: <p>isi editor</p> }));
}

async function redirectOf(): Promise<string> {
  try {
    await CmsEditorLayout({ children: <p>isi editor</p> });
  } catch (error) {
    if (error instanceof RedirectSignal) return error.url;
    throw error;
  }
  throw new Error('expected a redirect');
}

beforeEach(() => session.mockReset());

describe('CMS editor layout guard', () => {
  it('checks the session without refreshing (Server Component)', async () => {
    session.mockResolvedValue({
      status: 'ok',
      session: { user: USER, accessToken: 'at' },
    });
    await renderLayout();
    expect(session).toHaveBeenCalledWith({ refresh: false });
  });

  it('renders the shell and the page for a verified session', async () => {
    session.mockResolvedValue({
      status: 'ok',
      session: { user: USER, accessToken: 'at' },
    });
    await renderLayout();
    expect(screen.getByText('isi editor')).toBeTruthy();
    expect(screen.getByText('Local Editor')).toBeTruthy();
  });

  it('sends an expired session through the refresh route', async () => {
    session.mockResolvedValue({ status: 'expired' });
    expect(await redirectOf()).toBe(
      '/api/cms/auth/refresh?next=%2Fdashboard%2Fcms',
    );
  });

  it('sends a missing or invalid session to the login page', async () => {
    session.mockResolvedValue({ status: 'none' });
    expect(await redirectOf()).toBe('/dashboard/cms/login');
  });

  it('shows an error, not the login page, when Directus is down', async () => {
    session.mockRejectedValue(new Error('ECONNREFUSED'));
    await renderLayout();
    expect(screen.getByText(/directus tidak merespons/i)).toBeTruthy();
    expect(screen.queryByText('isi editor')).toBeNull();
  });

  it('the page redirects on its own, so it never renders without a session', async () => {
    session.mockResolvedValue({ status: 'none' });
    await expect(CmsPostsAndPagesPage()).rejects.toMatchObject({
      url: '/dashboard/cms/login',
    });
  });
});
