import { getPageDetail, savePage } from '@/lib/directus/pages';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

export const GET = defineCmsRoute('getPage', async ({ params }) => {
  const session = await requireSession();
  const page = await getPageDetail(session, params.id);
  return { page };
});

/** Editing gate (`CMS_EDITING_ENABLED`) and Origin check come from defineCmsRoute. */
export const PATCH = defineCmsRoute('savePage', async ({ params, body }) => {
  const session = await requireSession();
  const page = await savePage(session, params.id, body);
  return { page };
});
