/**
 * Unit tests for global middleware (`proxy`).
 *
 * Covers CMS session cookie routing, preview bypass behavior, and
 * production admin route blocking.
 *
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { proxy } from '@/proxy'; // adjust path if your proxy file lives elsewhere

/* ------------------------------------------------------------------ Helpers */

function makeRequest(
  path: string,
  options?: {
    method?: string;
    cookies?: Record<string, string>;
  },
): NextRequest {
  const url = `http://localhost:3000${path}`;
  const req = new NextRequest(url, {
    method: options?.method ?? 'GET',
  });

  if (options?.cookies) {
    for (const [name, value] of Object.entries(options.cookies)) {
      req.cookies.set(name, value);
    }
  }

  return req;
}

function isNextResponsePassThrough(res: Response): boolean {
  // NextResponse.next() sets the internal x-middleware-next header to '1'
  return res.headers.get('x-middleware-next') === '1' && res.status === 200;
}

/* -------------------------------------------------------------------- Tests */

describe('proxy middleware', () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    jest.restoreAllMocks();
  });

  it('/dashboard/cms tanpa cookie → redirect ke login, dengan next terisi', async () => {
    const req = makeRequest('/dashboard/cms');
    const res = await proxy(req);

    expect(res.status).toBe(307);

    const location = res.headers.get('location');
    expect(location).not.toBeNull();

    const redirectUrl = new URL(location!);
    expect(redirectUrl.pathname).toBe('/dashboard/cms/login');
    expect(redirectUrl.searchParams.get('next')).toBe('/dashboard/cms');
  });

  it('/dashboard/cms dengan cms_rt saja → lolos (next())', async () => {
    const req = makeRequest('/dashboard/cms', {
      cookies: { cms_rt: 'valid-refresh-token' },
    });
    const res = await proxy(req);

    expect(isNextResponsePassThrough(res)).toBe(true);
    expect(res.headers.get('location')).toBeNull();
  });

  it('/dashboard/cms/login tanpa cookie → lolos, nggak redirect loop', async () => {
    const req = makeRequest('/dashboard/cms/login');
    const res = await proxy(req);

    expect(isNextResponsePassThrough(res)).toBe(true);
    expect(res.headers.get('location')).toBeNull();
  });

  it('/preview/abc → lolos tanpa period gating atau /coming-soon', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    const req = makeRequest('/preview/abc');
    const res = await proxy(req);

    expect(isNextResponsePassThrough(res)).toBe(true);
    expect(res.headers.get('location')).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('/dashboard/lain di production → tetap diarahkan ke /coming-soon', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    delete process.env.DISABLE_ADMIN_ROUTES;

    const req = makeRequest('/dashboard/lain');
    const res = await proxy(req);

    expect(res.status).toBe(307);

    const location = res.headers.get('location');
    expect(location).not.toBeNull();

    const redirectUrl = new URL(location!);
    expect(redirectUrl.pathname).toBe('/coming-soon');
  });
});
