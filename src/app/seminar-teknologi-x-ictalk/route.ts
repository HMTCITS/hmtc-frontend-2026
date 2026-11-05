import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { PROKER_BASE_PATHS, prokerHref } from '@/lib/config';

/**
 * Short, year-less URL `/seminar-teknologi-x-ictalk`.
 *
 * Answers with a permanent redirect (HTTP 301) to the current edition page,
 * `PROKER_DEFAULT_YEAR`, keeping the incoming query string.
 *
 * Route handler, not a page, for the same reason as the legacy redirects under
 * `src/app/research-and-technology/`: `providers.tsx` flushes a 200 shell before
 * a page body renders.
 */
function legacyRedirect(request: NextRequest) {
  const target = new URL(
    prokerHref(PROKER_BASE_PATHS.seminarDosen4),
    request.nextUrl.origin,
  );
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 301);
}

export { legacyRedirect as GET, legacyRedirect as HEAD };
