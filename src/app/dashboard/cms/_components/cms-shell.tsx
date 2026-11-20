'use client';

import { FileText, Images, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import Typography from '@/components/Typography';
import { cn } from '@/lib/utils';

/**
 * L4 shell for `/dashboard/cms/**` (DESIGN.md §8): shadcn tokens only, no L1
 * palette. Live entries link to routes that exist; planned entries render as
 * placeholders so the navigation shows the intended structure without 404s.
 */
const NAV_ITEMS = [
  { href: '/dashboard/cms', label: 'Posts & Pages', icon: FileText },
] as const;

const PLANNED_ITEMS = [
  { label: 'Media', icon: Images },
  { label: 'Pengguna', icon: Users },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CmsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const renderNavItem = (item: (typeof NAV_ITEMS)[number]) => {
    const active = isActive(pathname, item.href);
    const icon = <item.icon className='size-4 shrink-0' aria-hidden='true' />;

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 transition-colors',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          active
            ? 'bg-accent font-medium text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        )}
      >
        {icon}
        <Typography as='span' font='satoshi' variant='b4'>
          {item.label}
        </Typography>
      </Link>
    );
  };

  const renderPlannedItem = (item: (typeof PLANNED_ITEMS)[number]) => (
    <span
      key={item.label}
      className='flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground/50'
      aria-disabled='true'
    >
      <item.icon className='size-4 shrink-0' aria-hidden='true' />
      <Typography as='span' font='satoshi' variant='b4'>
        {item.label}
      </Typography>
      <span className='ml-auto rounded-full border border-border px-1.5 py-0.5 text-[10px] leading-none text-muted-foreground'>
        Segera
      </span>
    </span>
  );

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <aside className='fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card md:flex'>
        <div className='flex h-14 items-center gap-2 border-b border-border px-4'>
          <span className='flex size-7 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground'>
            C
          </span>
          <Typography as='span' font='satoshi' weight='medium' variant='s2'>
            CMS HMTC
          </Typography>
        </div>

        <nav
          aria-label='Navigasi CMS'
          className='flex-1 space-y-1 overflow-y-auto p-3'
        >
          {NAV_ITEMS.map(renderNavItem)}
          <div className='my-2 border-t border-border' aria-hidden='true' />
          {PLANNED_ITEMS.map(renderPlannedItem)}
        </nav>

        <div className='border-t border-border p-3'>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='text-muted-foreground'
          >
            Data mock — belum tersambung ke Directus.
          </Typography>
        </div>
      </aside>

      <div className='flex min-h-screen flex-col md:pl-60'>
        <header className='sticky top-0 z-20 border-b border-border bg-card md:hidden'>
          <nav
            aria-label='Navigasi CMS'
            className='flex items-center gap-1 overflow-x-auto px-3 py-2'
          >
            <Typography
              as='span'
              font='satoshi'
              weight='medium'
              variant='s3'
              className='pr-2'
            >
              CMS
            </Typography>
            {NAV_ITEMS.map(renderNavItem)}
          </nav>
        </header>

        <main className='flex-1'>
          <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
