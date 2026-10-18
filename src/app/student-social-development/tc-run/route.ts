import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { PROKER_BASE_PATHS, prokerHref } from '@/lib/config';

const PROKER_BASE_PATH = PROKER_BASE_PATHS.tcRun;

/**
 * Legacy year-less URL.
 *
 * Answers with a real permanent redirect (HTTP 301) to the edition configured
 * as `PROKER_DEFAULT_YEAR`, keeping the incoming query string.
 *
 * This is a route handler instead of a page because the root <Suspense> in
 * `src/app/providers.tsx` flushes a 200 shell before a page body renders, so a
 * page-level `permanentRedirect()` can only produce a client-side redirect.
 */
function legacyRedirect(request: NextRequest) {
  const target = new URL(prokerHref(PROKER_BASE_PATH), request.nextUrl.origin);
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 301);
}

export { legacyRedirect as GET, legacyRedirect as HEAD };
