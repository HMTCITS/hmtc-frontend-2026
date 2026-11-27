import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

export const GET = defineCmsRoute('me', async () => {
  const { user } = await requireSession(); // may refresh and rewrite cookies
  return { user };
});
