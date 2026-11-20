/**
 * Refresh for Server Components, which cannot write cookies.
 * The CMS layout redirects here when getSession({ refresh: false }) returns
 * 'expired'. A redirect, not a JSON endpoint, so it is not in cmsEndpoints.
 */
import { NextResponse } from 'next/server';

import { getSession } from '@/lib/directus/session';

export const dynamic = 'force-dynamic';

const CMS_HOME = '/dashboard/cms';
const CMS_LOGIN = '/dashboard/cms/login';

/** Open-redirect guard: only same-site paths under /dashboard/cms. */
function safeNext(raw: string | null): string {
  if (!raw || raw.startsWith('//') || raw.includes('\\')) return CMS_HOME;
  const underCms =
    raw === CMS_HOME ||
    raw.startsWith(`${CMS_HOME}/`) ||
    raw.startsWith(`${CMS_HOME}?`);
  return underCms ? raw : CMS_HOME;
}

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
