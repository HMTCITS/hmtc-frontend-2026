import {
  createPreviewGrant,
  listPreviewGrants,
} from '@/lib/directus/preview-grants';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

import { assertPreviewMintAllowed, recordPreviewMint } from './_lib/rate-limit';

export const GET = defineCmsRoute('listPreviewGrants', async ({ params }) => {
  const session = await requireSession();
  const items = await listPreviewGrants(session, params.id);
  return { items };
});

export const POST = defineCmsRoute(
  'createPreviewGrant',
  async ({ params, body }) => {
    const session = await requireSession();
    assertPreviewMintAllowed(session.user.id);
    const result = await createPreviewGrant(session, params.id, body.ttlHours);
    recordPreviewMint(session.user.id);
    return result;
  },
);
