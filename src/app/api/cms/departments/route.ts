/**
 * HMTC CMS — `GET /api/cms/departments` route handler.
 *
 * Lists every department visible to the authenticated editor session so page
 * filters can populate department options. Delegates auth, response validation
 * in dev/test, and error normalisation to `defineCmsRoute`.
 */
import 'server-only';

import { z } from 'zod';

import { type DepartmentDto, departmentDtoSchema } from '@/lib/cms/dto';
import { directusAsUser, DirectusRequestError } from '@/lib/directus/client';
import { logError } from '@/lib/directus/logger';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

const directusDepartmentsSchema = z.object({
  data: z.array(departmentDtoSchema),
});

export const GET = defineCmsRoute('listDepartments', async () => {
  const session = await requireSession();

  const query = new URLSearchParams({
    fields: 'id,name,slug',
    limit: '-1',
    sort: 'name',
  }).toString();

  const raw = await directusAsUser<unknown>(
    session.accessToken,
    `/items/cms_departments?${query}`,
  );

  const parsed = directusDepartmentsSchema.safeParse(raw);
  if (!parsed.success) {
    logError('listDepartments', 'Directus response does not match schema', {
      issues: parsed.error.issues.map(
        (i) => `${i.path.join('.')}: ${i.message}`,
      ),
    });
    throw new DirectusRequestError(
      'internal',
      'Terjadi kesalahan pada server.',
    );
  }

  const items: DepartmentDto[] = parsed.data.data;
  return { items };
});
