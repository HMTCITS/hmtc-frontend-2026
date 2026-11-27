import { CmsError } from '@/lib/cms/errors';
import {
  assertLoginAllowed,
  recordLoginFailure,
  resetLoginFailures,
} from '@/lib/directus/rate-limit';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import {
  loadSessionUser,
  loginWithPassword,
  revokeRefreshToken,
  setSessionCookies,
  type TokenPair,
} from '@/lib/directus/session';

/**
 * Origin check (login CSRF), body validation and no-store come from
 * defineCmsRoute. The password is never logged.
 */
export const POST = defineCmsRoute('login', async ({ body, request }) => {
  assertLoginAllowed(request, body.email);

  let pair: TokenPair;
  try {
    pair = await loginWithPassword(body.email, body.password);
  } catch (error) {
    if (error instanceof CmsError && error.code === 'unauthenticated') {
      recordLoginFailure(request, body.email);
    }
    throw error;
  }
  resetLoginFailures(request, body.email);

  const user = await loadSessionUser(pair.accessToken);
  if (!user) {
    await revokeRefreshToken(pair.refreshToken); // no logged-in-but-powerless sessions
    throw new CmsError('forbidden', 'Akun ini tidak memiliki akses CMS.');
  }

  await setSessionCookies(pair);
  return { user }; // never tokens
});
