import { useQuery } from '@tanstack/react-query';

import { cmsQuery } from '@/lib/cms-client';
import { cmsKeys } from '@/lib/query-keys';

/** Prokers rarely change during a session, so they are cached longer. */
const PROKERS_STALE_TIME_MS = 10 * 60 * 1000;

/**
 * Prokers, optionally narrowed to one department. Without a department it
 * returns every proker the user may see, which the list uses for name lookups.
 */
export function useCmsProkers(departmentId?: string) {
  return useQuery({
    ...cmsQuery('listProkers', [...cmsKeys.all, 'prokers'], {
      query: { departmentId },
    }),
    staleTime: PROKERS_STALE_TIME_MS,
  });
}

export type UseCmsProkersResult = ReturnType<typeof useCmsProkers>;
