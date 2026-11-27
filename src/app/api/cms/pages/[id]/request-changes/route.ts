import { requestChangesPage } from '@/lib/directus/pages';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

export const POST = defineCmsRoute(
  'requestChanges',
  async ({ params, body }) => {
    const session = await requireSession();
    const page = await requestChangesPage(session, params.id, body);
    return { page };
  },
);
