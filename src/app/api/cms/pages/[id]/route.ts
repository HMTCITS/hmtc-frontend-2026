import { getPageDetail } from '@/lib/directus/pages';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

export const GET = defineCmsRoute('getPage', async ({ params }) => {
  const session = await requireSession();
  const page = await getPageDetail(session, params.id);
  return { page };
});
