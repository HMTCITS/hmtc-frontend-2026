import 'server-only';

import { redirect } from 'next/navigation';

import { CMS_HOME, CMS_LOGIN } from '@/lib/cms/redirect';
import {
  type CmsSession,
  getSession,
  type SessionResult,
} from '@/lib/directus/session';

/**
 * Session check for editor Server Components. It asks Directus, so a stale or
 * forged cookie does not get through.
 *
 * Call it in the editor layout AND in every editor page: a layout redirect
 * does not stop the page under it from rendering into the response, so a page
 * that reads data must check for itself. `getSession` is cached per request,
 * so the second call is free.
 *
 * - verified session: returns it;
 * - expired access token: redirects through the refresh route (Server
 *   Components cannot write cookies);
 * - no session or no CMS rights: redirects to the login page;
 * - Directus down: returns null. That is an outage, not a logout.
 */
export async function requireEditorSession(): Promise<CmsSession | null> {
  let result: SessionResult;
  try {
    result = await getSession({ refresh: false });
  } catch {
    return null;
  }

  if (result.status === 'expired') {
    redirect(`/api/cms/auth/refresh?next=${encodeURIComponent(CMS_HOME)}`);
  }
  if (result.status === 'none') redirect(CMS_LOGIN);
  return result.session;
}
