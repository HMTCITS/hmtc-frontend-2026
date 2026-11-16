import { fireEvent, render, screen } from '@testing-library/react';

import type { CmsErrorCode } from '@/lib/cms/errors';

import {
  CmsEmpty,
  CmsError,
  CmsLoading,
  CmsPermissionDenied,
} from './cms-states';

/** lucide-react ships ESM only; Jest does not transform node_modules here. */
jest.mock('lucide-react', () => ({
  RefreshCw: () => null,
  ShieldAlert: () => null,
}));

describe('CmsLoading', () => {
  it('renders the requested number of skeleton rows', () => {
    const { container } = render(<CmsLoading rows={4} />);

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(
      4,
    );
  });

  it('announces itself as a loading status', () => {
    render(<CmsLoading rows={1} />);

    expect(screen.getByRole('status')).toBeTruthy();
  });
});

describe('CmsEmpty', () => {
  it('shows custom copy and an optional action', () => {
    render(
      <CmsEmpty
        title='Belum ada halaman'
        description='Buat halaman pertama.'
        action={<button type='button'>Halaman baru</button>}
      />,
    );

    expect(screen.getByText('Belum ada halaman')).toBeTruthy();
    expect(screen.getByText('Buat halaman pertama.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Halaman baru' })).toBeTruthy();
  });

  it('renders defaults without an action', () => {
    render(<CmsEmpty />);

    expect(screen.getByText('Belum ada data')).toBeTruthy();
  });
});

describe('CmsError', () => {
  it('shows the message without a retry button by default', () => {
    render(<CmsError message='Directus tidak merespons.' />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Directus tidak merespons.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /coba lagi/i })).toBeNull();
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = jest.fn();
    render(<CmsError onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('CmsPermissionDenied', () => {
  it.each([
    ['unauthenticated', 'Belum masuk'],
    ['forbidden', 'Akses ditolak'],
    ['self_approval', 'Tidak dapat menyetujui sendiri'],
    ['editing_disabled', 'Editor sedang nonaktif'],
    ['bad_origin', 'Permintaan tidak sah'],
  ] as const satisfies readonly [CmsErrorCode, string][])(
    'shows the contract copy for %s',
    (code, title) => {
      render(<CmsPermissionDenied code={code} />);

      expect(screen.getByText(title)).toBeTruthy();
      expect(screen.getByText(`Kode: ${code}`)).toBeTruthy();
    },
  );

  it('falls back to a generic denial for unrelated codes', () => {
    const { rerender } = render(<CmsPermissionDenied code='not_found' />);
    expect(screen.getByText('Akses ditolak')).toBeTruthy();

    rerender(<CmsPermissionDenied code='internal' />);
    expect(screen.getByText('Akses ditolak')).toBeTruthy();
  });
});
