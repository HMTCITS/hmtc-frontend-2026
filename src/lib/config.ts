/**
 * Central application configuration.
 *
 * Current scope: **proker (program kerja) URL routing**.
 *
 * Proker pages are published per edition year and are served from
 * `/{department-slug}/{proker-slug}/{year}` — e.g.
 * `/internal-affairs/syukuran-wisudawan/2026`.
 *
 * The edition year must never be hardcoded in a page, component or route
 * handler: every year route (`[year]/page.tsx`), legacy redirect
 * (`route.ts`) and internal link derives it from the constants below. Rolling
 * the site to the next edition means editing `PROKER_DEFAULT_YEAR` in this file
 * only.
 */

/**
 * Proker base paths, without the edition year.
 *
 * The route folders under `src/app/` use these exact slugs. They are named
 * here so the navigation content and the route files share one literal
 * instead of repeating the slug in every file.
 */
export const PROKER_BASE_PATHS = {
  syukuranWisudawan: '/internal-affairs/syukuran-wisudawan',
  academicResources: '/student-welfare/academic-resources',
  seminarDosen: '/research-and-technology/seminar-dosen',
  seminarDosen2: '/research-and-technology/seminar-dosen-2',
  seminarDosen3: '/research-and-technology/seminar-dosen-3',
  bluecamp: '/research-and-technology/bluecamp',
  tcRun: '/student-social-development/tc-run',
} as const;

export type ProkerBasePath =
  (typeof PROKER_BASE_PATHS)[keyof typeof PROKER_BASE_PATHS];

/**
 * Edition year used by the year-less (legacy) proker URLs.
 *
 * `/internal-affairs/syukuran-wisudawan` permanently redirects to
 * `/internal-affairs/syukuran-wisudawan/{PROKER_DEFAULT_YEAR}`.
 *
 * Change this single value to move every legacy redirect to another edition.
 */
export const PROKER_DEFAULT_YEAR = 2026;

/**
 * Proker base path -> edition years that **actually have a published page**.
 *
 * A proker that is absent from this map is published for
 * `PROKER_DEFAULT_YEAR` only, which is the current state of every proker.
 *
 * Add a year here as soon as that edition's page exists, e.g.
 *
 * ```ts
 * export const PROKER_EDITION_YEARS = {
 *   [PROKER_BASE_PATHS.seminarDosen]: [2025, 2026],
 * };
 * ```
 *
 * `[year]/page.tsx` feeds this list to `generateStaticParams` and sets
 * `dynamicParams = false`, so a year that is not listed is answered with a real
 * 404 instead of silently rendering another edition's content.
 */
export const PROKER_EDITION_YEARS: Partial<
  Record<ProkerBasePath, readonly number[]>
> = {};

/**
 * Edition years published for a proker, oldest first.
 *
 * @param basePath Proker base path, e.g. `/internal-affairs/syukuran-wisudawan`.
 * @returns The published years, or `[PROKER_DEFAULT_YEAR]` when the proker has
 *   no explicit entry in {@link PROKER_EDITION_YEARS}.
 */
export function getProkerEditionYears(basePath: string): readonly number[] {
  return (
    PROKER_EDITION_YEARS[basePath as ProkerBasePath] ?? [PROKER_DEFAULT_YEAR]
  );
}

/**
 * Year-suffixed URL of a proker page.
 *
 * @param basePath Proker base path.
 * @param year Edition year, defaults to {@link PROKER_DEFAULT_YEAR} — which is
 *   what every legacy (year-less) redirect resolves to.
 */
export function prokerHref(
  basePath: string,
  year: number = PROKER_DEFAULT_YEAR,
): string {
  return `${basePath}/${year}`;
}
