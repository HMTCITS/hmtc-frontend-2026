import { getProkerEditionYears, PROKER_BASE_PATHS } from '@/lib/config';

import PageContent from '../PageContent';

const PROKER_BASE_PATH = PROKER_BASE_PATHS.tcRun;

/**
 * Reject any year that is not a published edition.
 *
 * Hardcoded editions use router-level validation via `dynamicParams = false`.
 * CMS editions can instead call `notFound()` before the first response flush.
 */
export const dynamicParams = false;

/** Pre-render every published edition of this proker. */
export function generateStaticParams() {
  return getProkerEditionYears(PROKER_BASE_PATH).map((year) => ({
    year: String(year),
  }));
}

export default function TcRunYearPage() {
  return <PageContent />;
}
