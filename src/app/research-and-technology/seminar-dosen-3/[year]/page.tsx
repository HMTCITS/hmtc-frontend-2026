import { getProkerEditionYears, PROKER_BASE_PATHS } from '@/lib/config';

import PageContent from '../PageContent';

const PROKER_BASE_PATH = PROKER_BASE_PATHS.seminarDosen3;

/**
 * Reject any year that is not a published edition.
 *
 * This has to be enforced by the router rather than a render-time
 * `notFound()`: the root <Suspense> in `src/app/providers.tsx` flushes a 200
 * shell before a page body renders, which would turn the 404 into a soft-404.
 */
export const dynamicParams = false;

/** Pre-render every published edition of this proker. */
export function generateStaticParams() {
  return getProkerEditionYears(PROKER_BASE_PATH).map((year) => ({
    year: String(year),
  }));
}

export default function SeminarDosen3YearPage() {
  return <PageContent />;
}
