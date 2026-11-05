/**
 * HMTC CMS — cache tags (D7: tag-based invalidation only, no time-based revalidate).
 *
 * Every published read is tagged with these; publish, unpublish, archive and
 * the Directus webhook invalidate them with `revalidateTag(tag, { expire: 0 })`.
 */
export const cmsTags = {
  /** One published page, by public route identity. */
  page: (departmentSlug: string, prokerSlug: string, editionYear: number) =>
    `cms:page:${departmentSlug}/${prokerSlug}/${editionYear}`,
  /** The same read keyed by page ID, for the webhook. */
  pageId: (pageId: string) => `cms:page-id:${pageId}`,
  /** `listPublishedRoutes()`, sitemap and navigation listings. */
  routes: 'cms:routes',
  redirects: 'cms:redirects',
  settings: 'cms:settings',
} as const;
