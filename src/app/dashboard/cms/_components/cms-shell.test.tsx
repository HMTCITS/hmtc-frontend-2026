import { render, screen } from '@testing-library/react';

import { CmsShell } from './cms-shell';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/cms',
}));

jest.mock('lucide-react', () => ({
  FileText: () => null,
  Images: () => null,
  Users: () => null,
}));

describe('CmsShell', () => {
  it('renders the CMS navigation with the active entry', () => {
    render(
      <CmsShell>
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
      <CmsShell>
        <p>isi</p>
      </CmsShell>,
    );

    expect(screen.getByText('Media')).toBeTruthy();
    expect(screen.getByText('Pengguna')).toBeTruthy();
    expect(screen.queryByRole('link', { name: /media/i })).toBeNull();
  });

  it('mentions that the data is mock', () => {
    render(
      <CmsShell>
        <p>isi</p>
      </CmsShell>,
    );

    expect(screen.getByText(/belum tersambung ke directus/i)).toBeTruthy();
  });
});
