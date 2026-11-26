/**
 * HMTC CMS — `GET /api/cms/prokers` route handler.
 *
 * Lists prokers visible to the authenticated editor session, optionally
 * filtered by `departmentId`. Maps Directus `snake_case` columns to wire
 * `ProkerDto` shapes and delegates validation/errors to `defineCmsRoute`.
 */
import 'server-only';

import { z } from 'zod';

import type { ProkerDto } from '@/lib/cms/dto';
import { directusAsUser, DirectusRequestError } from '@/lib/directus/client';
import { logError } from '@/lib/directus/logger';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

const directusProkersSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      department: z.string(),
      title: z.string(),
      slug: z.string(),
      is_active: z.boolean(),
    }),
  ),
});

export const GET = defineCmsRoute('listProkers', async ({ query }) => {
  const session = await requireSession();

  const searchParams = new URLSearchParams({
    fields: 'id,department,title,slug,is_active',
    limit: '-1',
    sort: 'title',
  });

  if (query.departmentId) {
    searchParams.set('filter[department][_eq]', query.departmentId);
  }

  const raw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_prokers?${searchParams.toString()}`,
  );

  const parsed = directusProkersSchema.safeParse(raw);
  if (!parsed.success) {
    logError('listProkers', 'Directus response does not match schema', {
      issues: parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      ),
    });
    throw new DirectusRequestError(
      'internal',
      'Terjadi kesalahan pada server.',
    );
  }

  const items: ProkerDto[] = parsed.data.data.map((row) => ({
    id: row.id,
    departmentId: row.department,
    title: row.title,
    slug: row.slug,
    isActive: row.is_active,
  }));

  return { items };
});
