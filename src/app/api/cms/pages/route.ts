import { createPage, listPages } from '@/lib/directus/pages';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

export const GET = defineCmsRoute('listPages', async ({ query }) => {
  const session = await requireSession();
  return listPages(session, query);
});

export const POST = defineCmsRoute('createPage', async ({ body }) => {
  const session = await requireSession();
  const page = await createPage(session, body);
  return { page };
});
