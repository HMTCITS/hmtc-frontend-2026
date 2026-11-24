import { render, screen } from '@testing-library/react';

import { usePages } from '@/hooks/api/cms/usePages';
import { MOCK_PAGES } from '@/lib/cms/fixtures';

import { PagesList } from './pages-list';

const replace = jest.fn();
const push = jest.fn();
let search = '';

jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/cms',
  useRouter: () => ({ replace, push }),
  useSearchParams: () => new URLSearchParams(search),
}));

// Relative: the `@/` alias is resolved at compile time, not in jest.mock.
jest.mock('../../../../hooks/api/cms/usePages', () => ({
  usePages: jest.fn(),
}));

/** lucide-react ships ESM only; Jest does not transform node_modules here. */
jest.mock('lucide-react', () => ({
  RefreshCw: () => null,
  ShieldAlert: () => null,
}));

jest.mock('./pages-table', () => ({
  PagesTable: () => <table aria-label='daftar halaman' />,
}));

const mockedUsePages = usePages as jest.MockedFunction<typeof usePages>;

function listResult(total: number, items = MOCK_PAGES) {
  mockedUsePages.mockReturnValue({
    data: { items, total },
    error: null,
    isLoading: false,
    refetch: jest.fn(),
  } as unknown as ReturnType<typeof usePages>);
}

afterEach(() => {
  jest.clearAllMocks();
  search = '';
});

describe('PagesList', () => {
  it('moves a page past the end to the last page, without a history entry', () => {
    search = 'status=draft&page=99';
    listResult(26, []);

    render(<PagesList />);

    expect(replace).toHaveBeenCalledWith('/dashboard/cms?status=draft&page=2');
    expect(push).not.toHaveBeenCalled();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('stays on a page that exists', () => {
    search = 'page=2';
    listResult(26);

    render(<PagesList />);

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByText(/Halaman 2 dari 2/)).toBeTruthy();
  });
});
