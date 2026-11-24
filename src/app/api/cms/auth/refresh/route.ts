/**
 * Refresh for Server Components, which cannot write cookies.
 * The CMS layout redirects here when getSession({ refresh: false }) returns
 * 'expired'. A redirect, not a JSON endpoint, so it is not in cmsEndpoints.
 */
import { NextResponse } from 'next/server';

import { CMS_LOGIN, safeNext } from '@/lib/cms/redirect';
import { getSession } from '@/lib/directus/session';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get('next'));

  let ok = false;
  try {
    ok = (await getSession({ refresh: true })).status === 'ok';
  } catch {
    ok = false; // Directus down: the login page shows its own error
  }

  const target = ok ? next : `${CMS_LOGIN}?next=${encodeURIComponent(next)}`;
  const response = NextResponse.redirect(new URL(target, url), 303);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
