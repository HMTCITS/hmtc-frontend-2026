import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import Typography from '@/components/Typography';

export const metadata: Metadata = {
  title: 'Page Builder — Sandbox Index',
};

type Entry = {
  /**
   * Route of an existing sandbox page. Leave undefined for entries that are
   * planned but not built yet — they render as non-interactive placeholders.
   */
  href?: string;
  label: string;
  desc: string;
};

const PAGES: readonly Entry[] = [
  {
    href: '/sandbox/page-builder/dashboard',
    label: 'CMS Dashboard',
    desc: 'Static admin dashboard prototype: sidebar, summary cards, recent content, review queue, quick actions and activity.',
  },
  {
    href: '/sandbox/page-builder/content',
    label: 'Posts & Pages',
    desc: 'Content management reference: compact metrics, search and filter toolbar, 12-item content table with statuses, and pagination.',
  },
  {
    href: '/sandbox/page-builder/reviews',
    label: 'Review & Approval',
    desc: 'Review queue reference: workflow metrics, submission queue, selected submission checklist, reviewer notes and decision actions.',
  },
  {
    href: '/sandbox/page-builder/media',
    label: 'Media Library',
    desc: 'Asset browser reference: storage summary, search and filter toolbar, generated thumbnails, upload affordance and asset details panel.',
  },
  {
    href: '/sandbox/page-builder/preview',
    label: 'Page Preview',
    desc: 'Preview workspace reference: CMS preview toolbar with viewport controls and a mock public Syukuran Wisudawan page.',
  },
  {
    href: '/sandbox/page-builder/users',
    label: 'Users & Roles',
    desc: 'Access management reference: user directory, account statuses, pending invitations, selected-user access summary and the role model.',
  },
  {
    href: '/sandbox/page-builder/editor',
    label: 'Visual Page Editor',
    desc: 'Editor workspace reference: block library and layers panel, page canvas with block selection affordances, and controlled block settings.',
  },
];

/** Building blocks the page builder and its rendered content rely on. */
const BUILDING_BLOCKS: readonly Entry[] = [
  {
    href: '/sandbox/typography',
    label: 'Typography',
    desc: 'The text scale approved content blocks must use.',
  },
  {
    href: '/sandbox/buttons',
    label: 'Buttons',
    desc: 'Primary, secondary and icon-only actions.',
  },
  {
    href: '/sandbox/cards',
    label: 'Cards',
    desc: 'Content surfaces and panels.',
  },
  {
    href: '/sandbox/table',
    label: 'Data Table',
    desc: 'Tabular listing patterns for CMS collections.',
  },
];

const PLANNED: readonly Entry[] = [
  {
    label: 'Page Canvas',
    desc: 'GrapesJS editing surface. Not implemented — design reference only.',
  },
  {
    label: 'Block Library',
    desc: 'Approved React content blocks mapped to CMS fields. Not implemented.',
  },
];

function EntryGrid({ entries }: { entries: readonly Entry[] }) {
  return (
    <ul className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
      {entries.map((entry) => {
        if (!entry.href) {
          return (
            <li key={entry.label}>
              <div className='flex h-full flex-col gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-100/60 p-4'>
                <div className='flex items-start justify-between gap-2'>
                  <Typography
                    as='p'
                    font='satoshi'
                    weight='medium'
                    variant='s3'
                    className='text-gray-700'
                  >
                    {entry.label}
                  </Typography>
                  <span className='shrink-0 rounded-full border border-gray-300 bg-white px-2 py-0.5'>
                    <Typography
                      as='span'
                      font='satoshi'
                      weight='medium'
                      variant='c2'
                      className='leading-none text-gray-500'
                    >
                      Planned
                    </Typography>
                  </span>
                </div>
                <Typography
                  as='p'
                  font='satoshi'
                  variant='c2'
                  className='leading-4 text-gray-500'
                >
                  {entry.desc}
                </Typography>
              </div>
            </li>
          );
        }

        return (
          <li key={entry.label}>
            <Link
              href={entry.href}
              className='group flex h-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-navy/20 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
            >
              <span className='flex items-start justify-between gap-2'>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='s3'
                  className='text-gray-900'
                >
                  {entry.label}
                </Typography>
                <ArrowUpRight
                  className='size-4 shrink-0 text-gray-400 transition-colors group-hover:text-navy'
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
              </span>
              <Typography
                as='span'
                font='satoshi'
                variant='c2'
                className='leading-4 text-gray-500'
              >
                {entry.desc}
              </Typography>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function PageBuilderIndexPage() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <main className='mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8'>
        <header className='space-y-2'>
          <Typography
            as='h1'
            font='satoshi'
            weight='semibold'
            variant='j2'
            className='text-gray-900'
          >
            Page Builder
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='max-w-2xl leading-6 text-gray-500'
          >
            Design references for the planned Directus + GrapesJS content
            workflow. Everything here is a static prototype — no CMS connection,
            API calls or authentication.
          </Typography>
        </header>

        <section aria-labelledby='page-builder-pages' className='space-y-3'>
          <Typography
            as='h2'
            id='page-builder-pages'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Pages
          </Typography>
          <EntryGrid entries={PAGES} />
        </section>

        <section aria-labelledby='page-builder-blocks' className='space-y-3'>
          <Typography
            as='h2'
            id='page-builder-blocks'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Building Blocks
          </Typography>
          <EntryGrid entries={BUILDING_BLOCKS} />
        </section>

        <section aria-labelledby='page-builder-planned' className='space-y-3'>
          <Typography
            as='h2'
            id='page-builder-planned'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Planned
          </Typography>
          <EntryGrid entries={PLANNED} />
        </section>
      </main>
    </div>
  );
}
