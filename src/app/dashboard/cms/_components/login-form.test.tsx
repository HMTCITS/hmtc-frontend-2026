import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { LoginForm } from './login-form';

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, refresh: mockRefresh }),
}));

const USER = {
  id: 'd0000000-0000-4000-8000-000000000001',
  email: 'editor@example.com',
  name: 'Local Editor',
  isAdmin: false,
  memberships: [
    {
      departmentId: '7870e406-aaef-430e-8df8-1c7f8d2b3682',
      departmentSlug: 'research-and-technology',
      role: 'editor',
    },
  ],
};

const fetchMock = jest.fn();

/** Minimal stand-in for `Response`; jsdom does not provide one. */
function respond(status: number, body: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
}

beforeEach(() => {
  fetchMock.mockReset();
  mockReplace.mockClear();
  mockRefresh.mockClear();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('LoginForm', () => {
  it('posts the credentials and goes to next on success', async () => {
    respond(200, { user: USER });
    render(<LoginForm next='/dashboard/cms/pages/1' />);
    fillAndSubmit('editor@example.com', 'editor-local');

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/cms/pages/1'),
    );
    expect(mockRefresh).toHaveBeenCalled();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/cms/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({
      email: 'editor@example.com',
      password: 'editor-local',
    });
  });

  it('ignores an unsafe next', async () => {
    respond(200, { user: USER });
    render(<LoginForm next='https://evil.example' />);
    fillAndSubmit('editor@example.com', 'editor-local');

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/cms'),
    );
  });

  it.each([
    [401, 'unauthenticated', 'Email atau password salah.'],
    [403, 'forbidden', 'Akun ini tidak memiliki akses CMS.'],
    [429, 'rate_limited', 'Terlalu banyak percobaan.'],
  ])('shows the API message on %i %s', async (status, code, message) => {
    respond(status, { error: { code, message } });
    render(<LoginForm />);
    fillAndSubmit('editor@example.com', 'salah');

    expect((await screen.findByRole('alert')).textContent).toBe(message);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('validates the fields before calling the API', async () => {
    render(<LoginForm />);
    fillAndSubmit('bukan-email', '');

    expect(
      await screen.findByText('Masukkan alamat email yang valid.'),
    ).toBeTruthy();
    expect(screen.getByText('Password wajib diisi.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
