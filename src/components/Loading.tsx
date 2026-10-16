'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingFallback() {
  return (
    <div
      role='status'
      aria-label='Loading content...'
      className='flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 p-6'
    >
      <div className='w-full max-w-4xl space-y-8'>
        {/* Skeleton Header */}
        <div className='space-y-2'>
          <Skeleton className='h-12 w-1/2 rounded' />
          <Skeleton className='h-6 w-1/3 rounded' />
        </div>
        {/* Skeleton Content */}
        <div className='space-y-4'>
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className='h-4 w-full rounded' />
          ))}
        </div>
      </div>
    </div>
  );
}
