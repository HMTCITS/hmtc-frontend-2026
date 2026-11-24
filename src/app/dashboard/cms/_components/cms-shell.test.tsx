import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { CmsShell } from './cms-shell';

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/cms',
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
}));

jest.mock('lucide-react', () => ({
  FileText: () => null,
  Images: () => null,
  LayoutDashboard: () => null,
  LogOut: () => null,
  Users: () => null,
}));

const USER = { name: 'Local Editor', email: 'editor@example.com' };

describe('CmsShell', () => {
  it('renders the CMS navigation with the active entry', () => {
    render(
      <CmsShell user={USER}>
        <p>isi halaman</p>
      </CmsShell>,
    );

    const active = screen.getAllByRole('link', { name: /posts & pages/i });
    expect(active).toHaveLength(2);
    for (const link of active) {
      expect(link.getAttribute('href')).toBe('/dashboard/cms');
      expect(link.getAttribute('aria-current')).toBe('page');
    }
    expect(screen.getByText('isi halaman')).toBeTruthy();
  });

  it('shows planned entries as placeholders, not links', () => {
    render(
      <CmsShell user={USER}>
        <p>isi</p>
      </CmsShell>,
    );

    expect(screen.getByText('Media')).toBeTruthy();
    expect(screen.getByText('Pengguna')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /media/i })).toBeNull();
  });

  it('shows the signed-in user', () => {
    render(
      <CmsShell user={USER}>
        <p>isi</p>
      </CmsShell>,
    );

    expect(screen.getByText('Local Editor')).toBeTruthy();
    expect(screen.getByText('editor@example.com')).toBeTruthy();
    expect(screen.queryByText(/belum tersambung ke directus/i)).toBeNull();
  });

  it.each([204, 500])(
    'logs out and returns to the login page (logout status %i)',
    async (status) => {
      // Minimal stand-in for `Response`; jsdom does not provide one.
      const fetchMock = jest.fn(async () => ({
        ok: status === 204,
        status,
        json: () =>
          Promise.resolve({ error: { code: 'internal', message: 'gagal' } }),
      }));
      global.fetch = fetchMock as unknown as typeof fetch;
      mockReplace.mockClear();
      mockRefresh.mockClear();

      render(
        <CmsShell user={USER}>
          <p>isi</p>
        </CmsShell>,
      );
      fireEvent.click(screen.getAllByRole('button', { name: /keluar/i })[0]);

      await waitFor(() =>
        expect(mockReplace).toHaveBeenCalledWith('/dashboard/cms/login'),
      );
      expect(mockRefresh).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/cms/auth/logout',
        expect.objectContaining({ method: 'POST' }),
      );
    },
  );
});
