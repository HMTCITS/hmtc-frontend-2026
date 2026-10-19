'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import * as React from 'react';

import Loading from '@/components/Loading';
import { Toaster } from '@/components/ui/sonner';

/**
 * The single QueryClient for the application.
 *
 * Deliberately has no `defaultQueryFn`. Deriving the endpoint from
 * `queryKey[0]` meant that any hook which forgot to pass a `queryFn` silently
 * issued a request for whatever the first key segment happened to be. Every
 * hook must pass an explicit `queryFn` instead.
 *
 * `suspense` is deliberately not set here: in TanStack Query v5 it is an
 * observer-level option, so declaring it in client defaults had no reliable
 * effect. Use `useSuspenseQuery` where suspension is genuinely wanted.
 *
 * A second client used to live in `src/lib/query-client.ts` with different
 * `staleTime`/`gcTime`/`retry` values. It was never imported and has been
 * removed — two clients with contradictory defaults is worse than one.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: process.env.NODE_ENV === 'development' ? 0 : 3,
      staleTime: 1000 * 60 * 3,
    },
  },
});

type ProvidersProps = {
  children: React.ReactNode;
};

/**
 * Providers membungkus aplikasi dengan QueryClientProvider dan Toaster.
 * The Suspense boundary remains for page-level `next/dynamic` fallbacks.
 * React Query Devtools hanya ditampilkan saat development.
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position='top-center' />
      <React.Suspense fallback={<Loading />}>{children}</React.Suspense>
      {process.env.NEXT_PUBLIC_RUN_MODE === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
