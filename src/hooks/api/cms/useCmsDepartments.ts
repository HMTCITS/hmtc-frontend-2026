import { useQuery } from '@tanstack/react-query';

import { cmsQuery } from '@/lib/cms-client';
import { cmsKeys } from '@/lib/query-keys';

/** Departments rarely change during a session, so they are cached longer. */
const DEPARTMENTS_STALE_TIME_MS = 10 * 60 * 1000;

/** Departments the user may see, for filters and name lookups. */
export function useCmsDepartments() {
  return useQuery({
    ...cmsQuery('listDepartments', cmsKeys.departments()),
    staleTime: DEPARTMENTS_STALE_TIME_MS,
  });
}

export type UseCmsDepartmentsResult = ReturnType<typeof useCmsDepartments>;
