/**
 * HMTC CMS — Dashboard UI prototype (static design reference).
 *
 * Scope: visual prototype only. No Directus, GrapesJS, API, auth or persistence.
 * Everything renders from the mock constants below; every control is a
 * placeholder (`type='button'`, no handlers).
 *
 * Layer: L4 Admin (DESIGN.md §8) — light surfaces, `ui/*` primitives,
 * Satoshi body text, navy (`--color-navy`) + cerulean (`--color-cerulean-blue`)
 * as the only HMTC accents.
 *
 * Rendered by the sibling route at ./dashboard/page.tsx, which also owns the
 * route metadata. Index: ../page.tsx.
 */

import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Ellipsis,
  FilePen,
  FileStack,
  FileText,
  History,
  Images,
  LayoutDashboard,
  LayoutTemplate,
  Menu,
  Palette,
  PanelLeftClose,
  Plus,
  Rocket,
  UsersRound,
} from 'lucide-react';
import Link from 'next/link';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

/* ---------------------------------------------------------------------------
 * Mock data
 * ------------------------------------------------------------------------- */

type NavItem = {
  label: string;
  icon: LucideIcon;
  /** Only implemented sandbox routes get an `href`; the rest render disabled. */
  href?: string;
  badge?: string;
};

const PRIMARY_NAV: readonly NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/sandbox/page-builder/dashboard',
  },
  {
    label: 'Posts & Pages',
    icon: FileText,
    href: '/sandbox/page-builder/content',
  },
  { label: 'Proker Management', icon: Rocket },
  {
    label: 'Media Library',
    icon: Images,
    href: '/sandbox/page-builder/media',
  },
  { label: 'Templates', icon: LayoutTemplate },
  {
    label: 'Review & Approval',
    icon: ClipboardCheck,
    href: '/sandbox/page-builder/reviews',
    badge: '1',
  },
  { label: 'Revision History', icon: History },
];

const ADMIN_NAV: readonly NavItem[] = [
  {
    label: 'Users & Roles',
    icon: UsersRound,
    href: '/sandbox/page-builder/users',
  },
  { label: 'Design Settings', icon: Palette },
];

const ACTIVE_NAV_ITEM = 'Dashboard';

type StatTone = 'neutral' | 'warning';

type Stat = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: StatTone;
};

/** 8 published + 3 drafts + 1 pending review = 12 total pages. */
const STATS: readonly Stat[] = [
  {
    label: 'Total Pages',
    value: 12,
    hint: 'Across your department',
    icon: FileStack,
    tone: 'neutral',
  },
  {
    label: 'Published',
    value: 8,
    hint: 'Live on the public website',
    icon: CircleCheck,
    tone: 'neutral',
  },
  {
    label: 'Drafts',
    value: 3,
    hint: 'Saved but not published',
    icon: FilePen,
    tone: 'neutral',
  },
  {
    label: 'Pending Review',
    value: 1,
    hint: 'Awaiting approval',
    icon: Clock,
    tone: 'warning',
  },
];

type ContentStatus = 'published' | 'draft' | 'pending';

type StatusStyle = {
  label: string;
  icon: LucideIcon;
  className: string;
};

const STATUS_STYLES: Record<ContentStatus, StatusStyle> = {
  published: {
    label: 'Published',
    icon: CircleCheck,
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  draft: {
    label: 'Draft',
    icon: FilePen,
    className: 'border-gray-200 bg-gray-100 text-gray-600',
  },
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
};

type ContentRow = {
  title: string;
  path: string;
  type: string;
  updatedAt: string;
  status: ContentStatus;
};

const RECENT_CONTENT: readonly ContentRow[] = [
  {
    title: 'Seminar Dosen 2026',
    path: '/research-and-technology/seminar-dosen',
    type: 'Event Page',
    updatedAt: 'Today, 09:42',
    status: 'published',
  },
  {
    title: 'Syukuran Wisudawan',
    path: '/internal-affairs/syukuran-wisudawan',
    type: 'Event Page',
    updatedAt: 'Today, 08:15',
    status: 'pending',
  },
  {
    title: 'Workshop UI/UX',
    path: '/proker/workshop-ui-ux',
    type: 'Proker Page',
    updatedAt: 'Yesterday',
    status: 'draft',
  },
  {
    title: 'Open Recruitment Staff',
    path: '/proker/open-recruitment-staff',
    type: 'Proker Page',
    updatedAt: '14 Oct 2026',
    status: 'published',
  },
  {
    title: 'Study Jam Informatika',
    path: '/proker/study-jam-informatika',
    type: 'Proker Page',
    updatedAt: '12 Oct 2026',
    status: 'draft',
  },
];

type QuickAction = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    title: 'Create New Page',
    description: 'Start with a blank page or template.',
    icon: Plus,
  },
  {
    title: 'Browse Templates',
    description: 'Use an approved layout for your next proker.',
    icon: LayoutTemplate,
  },
  {
    title: 'Open Media Library',
    description: 'Find and manage images for your pages.',
    icon: Images,
  },
];

type ActivityItem = {
  initials: string;
  actor: string;
  action: string;
  target: string;
  time: string;
};

const ACTIVITY: readonly ActivityItem[] = [
  {
    initials: 'AP',
    actor: 'Alya Pratama',
    action: 'updated',
    target: 'Workshop UI/UX',
    time: '20 minutes ago',
  },
  {
    initials: 'BS',
    actor: 'Bima Saputra',
    action: 'submitted',
    target: 'Syukuran Wisudawan',
    time: '1 hour ago',
  },
  {
    initials: 'AP',
    actor: 'Alya Pratama',
    action: 'edited',
    target: 'Seminar Dosen 2026',
    time: 'Yesterday',
  },
];

/* ---------------------------------------------------------------------------
 * Shared primitives
 * ------------------------------------------------------------------------- */

function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-white',
        className,
      )}
    >
      <Typography
        as='span'
        font='satoshi'
        weight='semibold'
        variant='c2'
        className='leading-none'
      >
        {initials}
      </Typography>
    </span>
  );
}

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy',
        className,
      )}
    >
      <Typography
        as='span'
        font='satoshi'
        weight='bold'
        variant='h4'
        className='text-white'
      >
        H
      </Typography>
      <span className='absolute right-1 bottom-1 size-1 rounded-full bg-cerulean-blue' />
    </span>
  );
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const { label, icon: Icon, className } = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
        className,
      )}
    >
      <Icon className='size-3 shrink-0' strokeWidth={2} aria-hidden='true' />
      <Typography
        as='span'
        font='satoshi'
        weight='medium'
        variant='c2'
        className='leading-none whitespace-nowrap'
      >
        {label}
      </Typography>
    </span>
  );
}

/* ---------------------------------------------------------------------------
 * Sidebar
 * ------------------------------------------------------------------------- */

function SidebarNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;
  const isActive = item.label === ACTIVE_NAV_ITEM;

  if (!item.href) {
    return (
      <button
        type='button'
        disabled
        className='flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-gray-400'
      >
        <Icon
          className='size-4 shrink-0 text-gray-300'
          strokeWidth={1.75}
          aria-hidden='true'
        />
        <Typography
          as='span'
          font='satoshi'
          variant='s3'
          className='min-w-0 flex-1 truncate'
        >
          {item.label}
        </Typography>
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='shrink-0 text-gray-400'
        >
          Soon
        </Typography>
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none',
        isActive
          ? 'bg-navy/5 text-navy'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      {isActive && (
        <span
          aria-hidden='true'
          className='absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-cerulean-blue'
        />
      )}
      <Icon
        className={cn(
          'size-4 shrink-0',
          isActive ? 'text-navy' : 'text-gray-500 group-hover:text-gray-700',
        )}
        strokeWidth={1.75}
        aria-hidden='true'
      />
      <Typography
        as='span'
        font='satoshi'
        weight={isActive ? 'medium' : 'regular'}
        variant='s3'
        className='min-w-0 flex-1 truncate'
      >
        {item.label}
      </Typography>
      {item.badge && (
        <span className='inline-flex min-w-5 items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-1.5 py-px'>
          <Typography
            as='span'
            font='satoshi'
            weight='semibold'
            variant='c2'
            className='leading-none text-amber-800'
          >
            {item.badge}
          </Typography>
        </span>
      )}
    </Link>
  );
}

function SidebarNavGroup({
  label,
  items,
}: {
  label: string;
  items: readonly NavItem[];
}) {
  return (
    <div>
      <Typography
        as='p'
        font='satoshi'
        weight='medium'
        variant='c2'
        className='mb-1.5 px-2.5 tracking-[0.12em] text-gray-500 uppercase'
      >
        {label}
      </Typography>
      <ul className='space-y-0.5'>
        {items.map((item) => (
          <li key={item.label}>
            <SidebarNavItem item={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav aria-label='CMS sections' className='space-y-6'>
      <SidebarNavGroup label='Main' items={PRIMARY_NAV} />
      <SidebarNavGroup label='Settings' items={ADMIN_NAV} />
    </nav>
  );
}

function UserCard() {
  return (
    <button
      type='button'
      className='flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
    >
      <Avatar initials='AP' />
      <span className='min-w-0 flex-1'>
        <Typography
          as='span'
          font='satoshi'
          weight='medium'
          variant='s3'
          className='block truncate text-gray-900'
        >
          Alya Pratama
        </Typography>
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='block truncate text-gray-500'
        >
          Content Contributor
        </Typography>
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='block truncate text-gray-500'
        >
          Departemen Keprofesian
        </Typography>
      </span>
      <ChevronsUpDown
        className='size-4 shrink-0 text-gray-500'
        strokeWidth={1.75}
        aria-hidden='true'
      />
    </button>
  );
}

function Sidebar() {
  return (
    <aside className='hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white'>
      <div className='flex items-center gap-2.5 border-b border-gray-200 px-3.5 py-3.5'>
        <BrandMark />
        <div className='min-w-0 flex-1'>
          <Typography
            as='p'
            font='satoshi'
            weight='semibold'
            variant='s3'
            className='truncate text-gray-900'
          >
            HMTC CMS
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='truncate text-gray-500'
          >
            Content Management
          </Typography>
        </div>
        <button
          type='button'
          aria-label='Collapse sidebar'
          className='flex size-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
        >
          <PanelLeftClose
            className='size-4'
            strokeWidth={1.75}
            aria-hidden='true'
          />
        </button>
      </div>

      <div className='flex-1 overflow-y-auto px-3 py-4'>
        <SidebarNav />
      </div>

      <div className='border-t border-gray-200 p-3'>
        <UserCard />
      </div>
    </aside>
  );
}

/** Below `lg`, the sidebar becomes a CSS-only disclosure panel. */
function MobileNav() {
  return (
    <div className='sticky top-0 z-40 border-b border-gray-200 bg-white lg:hidden'>
      <div className='flex h-14 items-center justify-between gap-3 px-4'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <BrandMark className='size-8' />
          <div className='min-w-0'>
            <Typography
              as='p'
              font='satoshi'
              weight='semibold'
              variant='s3'
              className='truncate text-gray-900'
            >
              HMTC CMS
            </Typography>
            <Typography
              as='p'
              font='satoshi'
              variant='c2'
              className='truncate text-gray-500'
            >
              Content Management
            </Typography>
          </div>
        </div>

        <details className='relative shrink-0'>
          <summary className='flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors select-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none [&::-webkit-details-marker]:hidden'>
            <Menu className='size-4' strokeWidth={1.75} aria-hidden='true' />
            <span className='sr-only'>Toggle navigation menu</span>
          </summary>

          <div className='absolute top-full right-0 z-50 mt-2 w-72 max-w-[calc(100vw_-_2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg'>
            <div className='max-h-[calc(100vh_-_7rem)] overflow-y-auto px-3 py-4'>
              <SidebarNav />
            </div>
            <div className='border-t border-gray-200 p-3'>
              <UserCard />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Header
 * ------------------------------------------------------------------------- */

function TopBar() {
  return (
    <header className='border-b border-gray-200 bg-white lg:sticky lg:top-0 lg:z-30'>
      <div className='flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8'>
        <div className='min-w-0 flex-1'>
          <nav aria-label='Breadcrumb'>
            <ol className='flex items-center gap-1.5'>
              <li>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-gray-500'
                >
                  HMTC CMS
                </Typography>
              </li>
              <li aria-hidden='true'>
                <ChevronRight
                  className='size-3 text-gray-400'
                  strokeWidth={2}
                />
              </li>
              <li>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  aria-current='page'
                  className='text-gray-700'
                >
                  Dashboard
                </Typography>
              </li>
            </ol>
          </nav>
          <Typography
            as='h1'
            font='satoshi'
            weight='semibold'
            variant='h1'
            className='mt-0.5 truncate text-lg text-gray-900 md:text-xl'
          >
            Content Dashboard
          </Typography>
        </div>

        <div className='flex shrink-0 items-center gap-1.5 sm:gap-2.5'>
          <Typography
            as='span'
            font='satoshi'
            variant='c0'
            className='hidden items-center gap-1.5 text-gray-500 md:inline-flex'
          >
            <CalendarDays
              className='size-3.5'
              strokeWidth={1.75}
              aria-hidden='true'
            />
            Sunday, 18 October 2026
          </Typography>

          <button
            type='button'
            aria-label='Notifications, 1 unread'
            className='relative flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
          >
            <Bell
              className='size-[18px]'
              strokeWidth={1.75}
              aria-hidden='true'
            />
            <span
              aria-hidden='true'
              className='absolute top-2 right-2 size-2 rounded-full border-2 border-white bg-cerulean-blue'
            />
          </button>

          <span
            aria-hidden='true'
            className='hidden h-6 w-px bg-gray-200 sm:block'
          />

          <div className='flex items-center gap-2'>
            <Avatar initials='AP' className='size-8 sm:size-9' />
            <span className='sr-only'>
              Signed in as Alya Pratama, Content Contributor
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
 * Summary statistics
 * ------------------------------------------------------------------------- */

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  const isWarning = stat.tone === 'warning';

  return (
    <Card
      className={cn(
        'h-full gap-0 rounded-xl px-4 py-3.5 shadow-none',
        isWarning
          ? 'border-amber-200 bg-amber-50/40'
          : 'border-gray-200 bg-white',
      )}
    >
      <div className='flex items-start justify-between gap-2'>
        <Typography
          as='p'
          font='satoshi'
          weight='medium'
          variant='c0'
          className='text-gray-500'
        >
          {stat.label}
        </Typography>
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-md border',
            isWarning
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-gray-200 bg-gray-50 text-gray-500',
          )}
        >
          <Icon className='size-3.5' strokeWidth={1.75} aria-hidden='true' />
        </span>
      </div>

      <Typography
        as='p'
        font='satoshi'
        weight='semibold'
        variant='j2'
        className={cn(
          'mt-1.5 leading-none tabular-nums',
          isWarning ? 'text-amber-900' : 'text-gray-900',
        )}
      >
        {stat.value}
      </Typography>

      <Typography
        as='p'
        font='satoshi'
        variant='c2'
        className='mt-1.5 text-gray-500'
      >
        {stat.hint}
      </Typography>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Recent content
 * ------------------------------------------------------------------------- */

function RecentContentSection() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <CardHeader className='flex flex-row items-start justify-between gap-3 space-y-0 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <div className='min-w-0'>
          <Typography
            as='h2'
            id='recent-content-heading'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Recent Content
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c0'
            className='mt-0.5 text-gray-500'
          >
            Your department&apos;s latest page activity
          </Typography>
        </div>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='-mr-2 h-7 shrink-0 gap-1 px-2 font-medium text-navy hover:bg-navy/5'
        >
          View All
          <ArrowRight className='size-3.5' aria-hidden='true' />
        </Button>
      </CardHeader>

      <CardContent className='p-0'>
        <Table aria-label='Recent content' className='min-w-[36rem]'>
          <TableHeader>
            <TableRow className='border-gray-100 bg-gray-50/60 hover:bg-gray-50/60'>
              <TableHead className='h-9 px-4'>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='tracking-[0.08em] text-gray-500 uppercase'
                >
                  Page
                </Typography>
              </TableHead>
              <TableHead className='h-9 px-4'>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='tracking-[0.08em] text-gray-500 uppercase'
                >
                  Type
                </Typography>
              </TableHead>
              <TableHead className='h-9 px-4'>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='tracking-[0.08em] text-gray-500 uppercase'
                >
                  Last Updated
                </Typography>
              </TableHead>
              <TableHead className='h-9 px-4'>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='tracking-[0.08em] text-gray-500 uppercase'
                >
                  Status
                </Typography>
              </TableHead>
              <TableHead className='h-9 w-12 px-4'>
                <span className='sr-only'>Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {RECENT_CONTENT.map((row) => (
              <TableRow
                key={row.title}
                className='border-gray-100 hover:bg-gray-50/60'
              >
                <TableCell className='px-4 py-3'>
                  <Typography
                    as='span'
                    font='satoshi'
                    weight='medium'
                    variant='s3'
                    className='block text-gray-900'
                  >
                    {row.title}
                  </Typography>
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='c2'
                    className='mt-0.5 block max-w-[18rem] truncate text-gray-500'
                  >
                    {row.path}
                  </Typography>
                </TableCell>

                <TableCell className='px-4 py-3 whitespace-nowrap'>
                  <span className='inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5'>
                    <Typography
                      as='span'
                      font='satoshi'
                      variant='c2'
                      className='leading-none text-gray-600'
                    >
                      {row.type}
                    </Typography>
                  </span>
                </TableCell>

                <TableCell className='px-4 py-3 whitespace-nowrap'>
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='b4'
                    className='text-gray-600'
                  >
                    {row.updatedAt}
                  </Typography>
                </TableCell>

                <TableCell className='px-4 py-3 whitespace-nowrap'>
                  <StatusBadge status={row.status} />
                </TableCell>

                <TableCell className='px-4 py-3 text-right'>
                  <button
                    type='button'
                    aria-label={`Actions for ${row.title}`}
                    className='inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
                  >
                    <Ellipsis
                      className='size-4'
                      strokeWidth={1.75}
                      aria-hidden='true'
                    />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Review queue
 * ------------------------------------------------------------------------- */

const REVIEW_META: readonly { label: string; value: string }[] = [
  { label: 'Submitted by', value: 'Bima Saputra' },
  { label: 'Department', value: 'Departemen Keprofesian' },
  { label: 'Submitted', value: 'Today, 08:15' },
];

function ReviewQueueSection() {
  return (
    <Card className='gap-0 rounded-xl border-gray-200 py-0 shadow-none'>
      <CardHeader className='flex flex-row items-center justify-between gap-3 space-y-0 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='flex size-7 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-700'>
            <ClipboardCheck
              className='size-3.5'
              strokeWidth={1.75}
              aria-hidden='true'
            />
          </span>
          <Typography
            as='h2'
            id='review-queue-heading'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='truncate text-gray-900'
          >
            Needs Your Attention
          </Typography>
        </div>
        <span
          aria-label='1 item pending review'
          className='inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50'
        >
          <Typography
            as='span'
            font='satoshi'
            weight='semibold'
            variant='c2'
            className='leading-none text-amber-800'
          >
            1
          </Typography>
        </span>
      </CardHeader>

      <CardContent className='p-4 sm:p-5'>
        <div className='rounded-lg border border-gray-200 bg-gray-50/70 p-4'>
          <div className='flex items-start justify-between gap-2'>
            <div className='min-w-0'>
              <Typography
                as='h3'
                font='satoshi'
                weight='medium'
                variant='s3'
                className='truncate text-gray-900'
              >
                Syukuran Wisudawan
              </Typography>
              <Typography
                as='p'
                font='satoshi'
                variant='c2'
                className='mt-0.5 text-gray-500'
              >
                Event Page
              </Typography>
            </div>
            <StatusBadge status='pending' />
          </div>

          <dl className='mt-3 space-y-1.5 border-t border-gray-200/80 pt-3'>
            {REVIEW_META.map((item) => (
              <div
                key={item.label}
                className='flex items-baseline justify-between gap-3'
              >
                <Typography
                  as='dt'
                  font='satoshi'
                  variant='c2'
                  className='shrink-0 text-gray-500'
                >
                  {item.label}
                </Typography>
                <Typography
                  as='dd'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='min-w-0 truncate text-right text-gray-900'
                >
                  {item.value}
                </Typography>
              </div>
            ))}
          </dl>

          <div className='mt-4 grid grid-cols-2 gap-2'>
            <Button
              type='button'
              size='sm'
              className='h-8 gap-1.5 rounded-md bg-navy px-2 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30'
            >
              Review Page
            </Button>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 rounded-md border-gray-200 bg-white px-2 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50'
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Quick actions
 * ------------------------------------------------------------------------- */

function QuickActionsSection() {
  return (
    <Card className='gap-0 rounded-xl border-gray-200 py-0 shadow-none'>
      <CardHeader className='flex flex-row items-center justify-between gap-3 space-y-0 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <Typography
          as='h2'
          id='quick-actions-heading'
          font='satoshi'
          weight='semibold'
          variant='h3'
          className='text-gray-900'
        >
          Quick Actions
        </Typography>
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='shrink-0 text-gray-500'
        >
          3 available
        </Typography>
      </CardHeader>

      <CardContent className='p-4 sm:p-5'>
        <ul className='grid gap-3 sm:grid-cols-3'>
          {QUICK_ACTIONS.map(({ title, description, icon: Icon }) => (
            <li key={title} className='h-full'>
              <button
                type='button'
                className='group flex h-full w-full flex-col items-start rounded-lg border border-gray-200 bg-white p-3.5 text-left transition-colors hover:border-gray-300 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
              >
                <span className='flex w-full items-start justify-between gap-2'>
                  <span className='flex size-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-600 transition-colors group-hover:border-navy/20 group-hover:bg-navy/5 group-hover:text-navy'>
                    <Icon
                      className='size-4'
                      strokeWidth={1.75}
                      aria-hidden='true'
                    />
                  </span>
                  <ArrowUpRight
                    className='size-4 shrink-0 text-gray-400 transition-colors group-hover:text-navy'
                    strokeWidth={1.75}
                    aria-hidden='true'
                  />
                </span>

                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='s3'
                  className='mt-3 text-gray-900'
                >
                  {title}
                </Typography>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='mt-1 leading-4 text-gray-500'
                >
                  {description}
                </Typography>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Recent activity
 * ------------------------------------------------------------------------- */

function RecentActivitySection() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <CardHeader className='flex flex-row items-center justify-between gap-3 space-y-0 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <Typography
          as='h2'
          id='recent-activity-heading'
          font='satoshi'
          weight='semibold'
          variant='h3'
          className='text-gray-900'
        >
          Recent Activity
        </Typography>
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='shrink-0 text-gray-500'
        >
          Today
        </Typography>
      </CardHeader>

      <CardContent className='p-0'>
        <ol className='divide-y divide-gray-100'>
          {ACTIVITY.map((item) => (
            <li
              key={`${item.actor}-${item.target}`}
              className='flex gap-3 px-4 py-3 sm:px-5'
            >
              <span
                aria-hidden='true'
                className='flex size-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600'
              >
                <Typography
                  as='span'
                  font='satoshi'
                  weight='semibold'
                  variant='c2'
                  className='leading-none'
                >
                  {item.initials}
                </Typography>
              </span>

              <div className='min-w-0'>
                <Typography
                  as='p'
                  font='satoshi'
                  variant='c0'
                  className='leading-5 text-gray-600'
                >
                  <span className='font-medium text-gray-900'>
                    {item.actor}
                  </span>{' '}
                  {item.action}{' '}
                  <span className='font-medium text-gray-700'>
                    {item.target}
                  </span>
                </Typography>
                <Typography
                  as='p'
                  font='satoshi'
                  variant='c2'
                  className='mt-0.5 text-gray-500'
                >
                  {item.time}
                </Typography>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function PageBuilderDashboard() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <MobileNav />

      <div className='lg:flex'>
        <Sidebar />

        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar />

          <main className='mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8'>
            {/* Welcome */}
            <section
              aria-labelledby='welcome-heading'
              className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'
            >
              <div className='min-w-0'>
                <Typography
                  as='h2'
                  id='welcome-heading'
                  font='satoshi'
                  weight='semibold'
                  variant='h2'
                  className='text-gray-900'
                >
                  Good morning, Alya
                </Typography>
                <Typography
                  as='p'
                  font='satoshi'
                  variant='b4'
                  className='mt-1 leading-5 text-gray-500'
                >
                  Here&apos;s what&apos;s happening with your department&apos;s
                  content today.
                </Typography>
              </div>

              <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                <Button
                  type='button'
                  className='h-9 w-full gap-1.5 rounded-lg bg-navy px-3.5 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30 sm:w-auto'
                >
                  <Plus className='size-4' aria-hidden='true' />
                  Create New Page
                </Button>

                <Button
                  asChild
                  variant='outline'
                  className='h-9 w-full gap-1.5 rounded-lg border-gray-200 bg-white px-3.5 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50 sm:w-auto'
                >
                  <Link href='/'>
                    View Public Site
                    <ArrowUpRight className='size-4' aria-hidden='true' />
                  </Link>
                </Button>
              </div>
            </section>

            {/* Summary statistics */}
            <section aria-label='Content summary'>
              <ul className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
                {STATS.map((stat) => (
                  <li key={stat.label} className='h-full'>
                    <StatCard stat={stat} />
                  </li>
                ))}
              </ul>
            </section>

            {/* Recent content + review queue */}
            <div className='grid items-start gap-6 xl:grid-cols-3'>
              <div className='min-w-0 xl:col-span-2'>
                <RecentContentSection />
              </div>
              <div className='min-w-0 xl:col-span-1'>
                <ReviewQueueSection />
              </div>
            </div>

            {/* Quick actions + recent activity */}
            <div className='grid items-start gap-6 xl:grid-cols-3'>
              <div className='min-w-0 xl:col-span-2'>
                <QuickActionsSection />
              </div>
              <div className='min-w-0 xl:col-span-1'>
                <RecentActivitySection />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
