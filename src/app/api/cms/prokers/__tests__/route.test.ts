/**
 * HMTC CMS — unit tests for `GET /api/cms/prokers`.
 *
 * Verifies session enforcement, `departmentId` UUID query validation via
 * `defineCmsRoute`, unfiltered vs filtered Directus queries, and contract
 * response validation.
 *
 * @jest-environment node
 */

import { GET } from '@/app/api/cms/prokers/route';
import { CmsError, cmsErrorBodySchema } from '@/lib/cms/errors';
import { directusAsUser } from '@/lib/directus/client';
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

describe('GET /api/cms/prokers', () => {
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

    const request = new Request('http://localhost:3000/api/cms/prokers');
    const response = await GET(request);
    const body = cmsErrorBodySchema.parse(await response.json());

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('unauthenticated');
    expect(directusAsUser).not.toHaveBeenCalled();
  });

  it('returns 422 validation_failed when departmentId is not a valid UUID', async () => {
    const request = new Request(
      'http://localhost:3000/api/cms/prokers?departmentId=invalid-uuid',
    );
    const response = await GET(request);
    const body = cmsErrorBodySchema.parse(await response.json());

    expect(response.status).toBe(422);
    expect(body.error.code).toBe('validation_failed');
    expect(requireSession).not.toHaveBeenCalled();
    expect(directusAsUser).not.toHaveBeenCalled();
  });

  it('returns 200 with all prokers mapped to ProkerDto when departmentId is omitted', async () => {
    const departmentId = '11111111-1111-4111-8111-111111111111';
    const prokerId = '22222222-2222-4222-8222-222222222222';

    jest.mocked(requireSession).mockResolvedValueOnce(mockSession);
    jest.mocked(directusAsUser).mockResolvedValueOnce({
      data: [
        {
          id: prokerId,
          department: departmentId,
          title: 'Upgrading HMTC',
          slug: 'upgrading-hmtc',
          is_active: true,
        },
      ],
    });

    const request = new Request('http://localhost:3000/api/cms/prokers');
    const response = await GET(request);
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    const calledPath = jest.mocked(directusAsUser).mock.calls[0]?.[1] ?? '';
    expect(calledPath).toContain('/items/cms_prokers?');
    expect(calledPath).not.toContain('filter%5Bdepartment%5D');
    expect(body).toEqual({
      items: [
        {
          id: prokerId,
          departmentId,
          title: 'Upgrading HMTC',
          slug: 'upgrading-hmtc',
          isActive: true,
        },
      ],
    });
  });

  it('filters by departmentId and returns 200', async () => {
    const departmentId = '11111111-1111-4111-8111-111111111111';
    const prokerId = '22222222-2222-4222-8222-222222222222';

    jest.mocked(requireSession).mockResolvedValueOnce(mockSession);
    jest.mocked(directusAsUser).mockResolvedValueOnce({
      data: [
        {
          id: prokerId,
          department: departmentId,
          title: 'Upgrading HMTC',
          slug: 'upgrading-hmtc',
          is_active: true,
        },
      ],
    });

    const request = new Request(
      `http://localhost:3000/api/cms/prokers?departmentId=${departmentId}`,
    );
    const response = await GET(request);
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    const calledPath = jest.mocked(directusAsUser).mock.calls[0]?.[1] ?? '';
    expect(calledPath).toContain(
      `filter%5Bdepartment%5D%5B_eq%5D=${departmentId}`,
    );
    expect(body).toEqual({
      items: [
        {
          id: prokerId,
          departmentId,
          title: 'Upgrading HMTC',
          slug: 'upgrading-hmtc',
          isActive: true,
        },
      ],
    });
  });
});
