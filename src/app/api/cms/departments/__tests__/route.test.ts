/**
 * HMTC CMS — unit tests for `GET /api/cms/departments`.
 *
 * Verifies session enforcement, Directus lookup delegation, contract response
 * validation through `defineCmsRoute`, and `DirectusRequestError` mapping.
 *
 * @jest-environment node
 */

import { GET } from '@/app/api/cms/departments/route';
import { CmsError, cmsErrorBodySchema } from '@/lib/cms/errors';
import { directusAsUser, DirectusRequestError } from '@/lib/directus/client';
import { requireSession } from '@/lib/directus/session';

jest.mock('server-only', () => ({}));

jest.mock('@/lib/directus/session', () => ({
  requireSession: jest.fn(),
}));

jest.mock('@/lib/directus/client', () => {
  const actual = jest.requireActual<typeof import('@/lib/directus/client')>(
    '@/lib/directus/client',
  );
  return {
    ...actual,
    directusAsUser: jest.fn(),
  };
});

jest.mock('@/lib/directus/logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
}));

describe('GET /api/cms/departments', () => {
  const mockSession = {
    accessToken: 'test-access-token',
    user: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'editor@hmtc-its.com',
      name: 'Editor HMTC',
      isAdmin: false,
      memberships: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when session is missing or invalid', async () => {
    jest
      .mocked(requireSession)
      .mockRejectedValueOnce(
        new CmsError(
          'unauthenticated',
          'Sesi tidak valid. Silakan masuk kembali.',
        ),
      );

    const request = new Request('http://localhost:3000/api/cms/departments');
    const response = await GET(request);
    const body = cmsErrorBodySchema.parse(await response.json());

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('unauthenticated');
    expect(directusAsUser).not.toHaveBeenCalled();
  });

  it('returns 200 with departments matching contract schema', async () => {
    const items = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Internal Affairs',
        slug: 'internal',
      },
    ];

    jest.mocked(requireSession).mockResolvedValueOnce(mockSession);
    jest.mocked(directusAsUser).mockResolvedValueOnce({ data: items });

    const request = new Request('http://localhost:3000/api/cms/departments');
    const response = await GET(request);
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(directusAsUser).toHaveBeenCalledWith(
      'test-access-token',
      expect.stringContaining('/items/cms_departments?'),
    );
    expect(body).toEqual({ items });
  });

  it('propagates DirectusRequestError as CmsErrorBody', async () => {
    jest.mocked(requireSession).mockResolvedValueOnce(mockSession);
    jest
      .mocked(directusAsUser)
      .mockRejectedValueOnce(
        new DirectusRequestError(
          'forbidden',
          'Anda tidak memiliki izin untuk tindakan ini.',
        ),
      );

    const request = new Request('http://localhost:3000/api/cms/departments');
    const response = await GET(request);
    const body = cmsErrorBodySchema.parse(await response.json());

    expect(response.status).toBe(403);
    expect(body.error.code).toBe('forbidden');
  });
});
