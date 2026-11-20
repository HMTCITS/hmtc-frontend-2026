'use client';

import { RefreshCw, ShieldAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { CmsErrorCode } from '@/lib/cms/errors';

/**
 * The four UI states every CMS screen must render (audit F5: the
 * permission-denied state is the one that had no component at all).
 *
 * Copy for `CmsPermissionDenied` is keyed by the contract's `CmsErrorCode`, so
 * the message always matches what a Route Handler actually returned.
 */

const PERMISSION_COPY: Partial<
  Record<CmsErrorCode, { title: string; description: string }>
> = {
  unauthenticated: {
    title: 'Belum masuk',
    description: 'Masuk dengan akun CMS untuk melanjutkan.',
  },
  forbidden: {
    title: 'Akses ditolak',
    description: 'Peranmu tidak diizinkan melakukan aksi ini.',
  },
  self_approval: {
    title: 'Tidak dapat menyetujui sendiri',
    description: 'Pengajuan ini dibuat oleh akunmu. Minta reviewer lain.',
  },
  editing_disabled: {
    title: 'Editor sedang nonaktif',
    description:
      'Environment ini berbagi Directus production, jadi editor disetel hanya-baca.',
  },
  bad_origin: {
    title: 'Permintaan tidak sah',
    description: 'Permintaan tidak berasal dari situs ini.',
  },
};

const FALLBACK_COPY = {
  title: 'Akses ditolak',
  description: 'Kamu tidak memiliki izin untuk aksi ini.',
};

/** Copy for a permission-related contract error code. */
export function cmsPermissionCopy(code: CmsErrorCode): {
  title: string;
  description: string;
} {
  return PERMISSION_COPY[code] ?? FALLBACK_COPY;
}

export function CmsLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className='space-y-3' role='status' aria-label='Memuat'>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className='h-12 w-full' />
      ))}
      <Typography
        as='p'
        font='satoshi'
        variant='b4'
        className='text-muted-foreground'
      >
        Memuat data…
      </Typography>
    </div>
  );
}

export function CmsEmpty({
  title = 'Belum ada data',
  description = 'Data akan muncul di sini setelah dibuat.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className='flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center'>
      <Typography
        as='p'
        font='satoshi'
        weight='medium'
        variant='s2'
        className='text-foreground'
      >
        {title}
      </Typography>
      <Typography
        as='p'
        font='satoshi'
        variant='b4'
        className='max-w-sm text-muted-foreground'
      >
        {description}
      </Typography>
      {action ? <div className='mt-2'>{action}</div> : null}
    </div>
  );
}

export function CmsError({
  message = 'Terjadi kesalahan. Coba lagi.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role='alert'
      className='flex flex-col items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-6'
    >
      <Typography
        as='p'
        font='satoshi'
        weight='medium'
        variant='s2'
        className='text-destructive'
      >
        Terjadi kesalahan
      </Typography>
      <Typography
        as='p'
        font='satoshi'
        variant='b4'
        className='text-muted-foreground'
      >
        {message}
      </Typography>
      {onRetry ? (
        <Button variant='outline' size='sm' onClick={onRetry}>
          <RefreshCw aria-hidden='true' />
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}

export function CmsPermissionDenied({ code }: { code: CmsErrorCode }) {
  const copy = cmsPermissionCopy(code);

  return (
    <div className='flex flex-col items-center gap-2 rounded-lg border border-border p-8 text-center'>
      <ShieldAlert
        className='size-6 text-muted-foreground'
        aria-hidden='true'
      />
      <Typography
        as='p'
        font='satoshi'
        weight='medium'
        variant='s2'
        className='text-foreground'
      >
        {copy.title}
      </Typography>
      <Typography
        as='p'
        font='satoshi'
        variant='b4'
        className='max-w-sm text-muted-foreground'
      >
        {copy.description}
      </Typography>
      <Typography
        as='p'
        font='satoshi'
        variant='c2'
        className='text-muted-foreground/70'
      >
        Kode: {code}
      </Typography>
    </div>
  );
}
