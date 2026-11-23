import { submitPage } from '@/lib/directus/pages';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

export const POST = defineCmsRoute('submitPage', async ({ params, body }) => {
  const session = await requireSession();
  const page = await submitPage(session, params.id, body);
  return { page };
});
