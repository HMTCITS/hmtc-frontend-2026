import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { PageListQuery } from '@/lib/cms/page-list';
import { cmsQuery } from '@/lib/cms-client';
import { cmsKeys } from '@/lib/query-keys';

/**
 * Pages in departments the user may read, filtered and paged on the server.
 *
 * The previous page stays on screen while the next one loads, so changing a
 * filter or page does not flash the loading state.
 */
export function usePages(query: PageListQuery) {
  return useQuery({
    ...cmsQuery('listPages', cmsKeys.pageLists(), { query }),
    placeholderData: keepPreviousData,
  });
}

export type UsePagesResult = ReturnType<typeof usePages>;
