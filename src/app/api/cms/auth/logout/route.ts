import { cookies } from 'next/headers';

import { defineCmsRoute } from '@/lib/directus/route-handler';
import {
  clearSessionCookies,
  CMS_REFRESH_COOKIE,
  revokeRefreshToken,
} from '@/lib/directus/session';

/**
 * Logging out never fails for the user: always 204 and always clears both
 * cookies, even with no or an expired session. Revoking in Directus is best
 * effort.
 */
export const POST = defineCmsRoute('logout', async () => {
  const refreshToken = (await cookies()).get(CMS_REFRESH_COOKIE)?.value;
  if (refreshToken) await revokeRefreshToken(refreshToken);
  await clearSessionCookies();
  return undefined;
});
