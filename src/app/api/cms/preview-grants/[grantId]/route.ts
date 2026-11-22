import { revokePreviewGrant } from '@/lib/directus/preview-grants';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

export const DELETE = defineCmsRoute(
  'revokePreviewGrant',
  async ({ params }) => {
    const session = await requireSession();
    await revokePreviewGrant(session, params.grantId);
  },
);
