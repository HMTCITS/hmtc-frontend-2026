import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type CmsBodyOf, cmsFetch } from '@/lib/cms-client';
import { cmsKeys } from '@/lib/query-keys';

export type CreatePageInput = CmsBodyOf<'createPage'>;

/**
 * Create a draft page and refresh every page list.
 *
 * Feedback (toasts, field errors) is left to the caller: a `409 duplicate` or
 * `422 validation_failed` belongs on the form, not in a generic toast.
 */
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreatePageInput) => cmsFetch('createPage', { body }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: cmsKeys.pageLists() }),
  });
}

export type UseCreatePageResult = ReturnType<typeof useCreatePage>;
