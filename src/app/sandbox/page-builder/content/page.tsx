/**
 * HMTC CMS — Posts & Pages UI reference (static design prototype).
 *
 * Scope: visual reference only. No Directus, GrapesJS, API, auth, search,
 * filtering, pagination or persistence. Every control is a placeholder that
 * renders from the typed mock data in this file.
 *
 * Visual language follows the sibling dashboard reference
 * (../dashboard.tsx) and DESIGN.md §8 (L4 Admin): white surfaces on a neutral
 * page background, Satoshi body text, navy + cerulean as the only accents.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
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
  Search,
  SlidersHorizontal,
  Star,
  UsersRound,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Posts & Pages — Page Builder Sandbox',
};

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

const ACTIVE_NAV_ITEM = 'Posts & Pages';

type MetricTone = 'neutral' | 'warning';

type Metric = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: MetricTone;
};

/** 8 published + 3 drafts + 1 pending review = 12 total pages. */
const METRICS: readonly Metric[] = [
  {
    label: 'All Content',
    value: 12,
    hint: 'Across your department',
    icon: FileStack,
    tone: 'neutral',
  },
  {
    label: 'Published',
    value: 8,
    hint: 'Live on the website',
    icon: CircleCheck,
    tone: 'neutral',
  },
  {
    label: 'Drafts',
    value: 3,
    hint: 'Unpublished content',
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

type ContentType = 'Event Page' | 'Proker Page' | 'Standard Page';

type ContentItem = {
  title: string;
  slug: string;
  type: ContentType;
  department: string;
  updatedAt: string;
  status: ContentStatus;
  featured?: boolean;
};

const CONTENT: readonly ContentItem[] = [
  {
    title: 'Seminar Dosen 2026',
    slug: '/research-and-technology/seminar-dosen',
    type: 'Event Page',
    department: 'Keprofesian',
    updatedAt: '18 Oct 2026, 09:42',
    status: 'published',
    featured: true,
  },
  {
    title: 'Syukuran Wisudawan',
    slug: '/internal-affairs/syukuran-wisudawan',
    type: 'Event Page',
    department: 'Keprofesian',
    updatedAt: '18 Oct 2026, 08:15',
    status: 'pending',
  },
  {
    title: 'Workshop UI/UX',
    slug: '/proker/workshop-ui-ux',
    type: 'Proker Page',
    department: 'Keprofesian',
    updatedAt: '17 Oct 2026, 14:30',
    status: 'draft',
  },
  {
    title: 'Open Recruitment Staff',
    slug: '/proker/open-recruitment-staff',
    type: 'Proker Page',
    department: 'PSDM',
    updatedAt: '14 Oct 2026, 11:20',
    status: 'published',
  },
  {
    title: 'Study Jam Informatika',
    slug: '/proker/study-jam-informatika',
    type: 'Proker Page',
    department: 'Keilmiahan',
    updatedAt: '12 Oct 2026, 16:05',
    status: 'draft',
  },
  {
    title: 'Company Visit 2026',
    slug: '/event/company-visit-2026',
    type: 'Event Page',
    department: 'Hubungan Luar',
    updatedAt: '11 Oct 2026, 10:00',
    status: 'published',
  },
  {
    title: 'Tech Talk: AI',
    slug: '/event/tech-talk-ai',
    type: 'Event Page',
    department: 'Keilmiahan',
    updatedAt: '10 Oct 2026, 13:15',
    status: 'published',
  },
  {
    title: 'HMTC Anniversary',
    slug: '/proker/hmtc-anniversary',
    type: 'Proker Page',
    department: 'Internal',
    updatedAt: '9 Oct 2026, 15:40',
    status: 'published',
    featured: true,
  },
  {
    title: 'Workshop Leadership',
    slug: '/proker/workshop-leadership',
    type: 'Proker Page',
    department: 'PSDM',
    updatedAt: '8 Oct 2026, 09:10',
    status: 'draft',
  },
  {
    title: 'Informatics Competition',
    slug: '/event/informatics-competition',
    type: 'Event Page',
    department: 'Keilmiahan',
    updatedAt: '7 Oct 2026, 12:25',
    status: 'published',
  },
  {
    title: 'Alumni Sharing Session',
    slug: '/event/alumni-sharing-session',
    type: 'Event Page',
    department: 'Hubungan Luar',
    updatedAt: '6 Oct 2026, 14:00',
    status: 'published',
  },
  {
    title: 'Department Introduction',
    slug: '/departemen/keprofesian',
    type: 'Standard Page',
    department: 'Keprofesian',
    updatedAt: '5 Oct 2026, 08:30',
    status: 'published',
  },
];

/** Visual page size: the mock table renders the first page of the dataset. */
const PAGE_SIZE = 8;
const VISIBLE_CONTENT = CONTENT.slice(0, PAGE_SIZE);

const TYPE_OPTIONS = [
  'All Content',
  'Event Page',
  'Proker Page',
  'Standard Page',
] as const;

const STATUS_OPTIONS = [
  'All Statuses',
  'Published',
  'Draft',
  'Pending Review',
] as const;

const DEPARTMENT_OPTIONS = [
  'All Departments',
  'Keprofesian',
  'PSDM',
  'Keilmiahan',
  'Hubungan Luar',
  'Internal',
] as const;

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
                  Dashboard
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
                  Posts &amp; Pages
                </Typography>
              </li>
            </ol>
          </nav>
          <Typography
            as='p'
            font='satoshi'
            weight='semibold'
            variant='s1'
            className='mt-0.5 truncate text-gray-900'
          >
            Posts &amp; Pages
          </Typography>
        </div>

        <div className='flex shrink-0 items-center gap-1.5 sm:gap-2.5'>
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
 * Page heading
 * ------------------------------------------------------------------------- */

function PageHeading() {
  return (
    <section
      aria-labelledby='page-title'
      className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'
    >
      <div className='min-w-0'>
        <Typography
          as='h1'
          id='page-title'
          font='satoshi'
          weight='semibold'
          variant='h1'
          className='text-xl text-gray-900 md:text-2xl'
        >
          Posts &amp; Pages
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='mt-1 max-w-2xl leading-5 text-gray-500'
        >
          Create, organize, and manage your department&apos;s website content.
        </Typography>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <Button
          type='button'
          className='h-9 w-full gap-1.5 rounded-lg bg-navy px-3.5 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30 sm:w-auto'
        >
          <Plus className='size-4' aria-hidden='true' />
          Create Content
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-9 w-full gap-1.5 rounded-lg border-gray-200 bg-white px-3.5 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50 sm:w-auto'
        >
          <LayoutTemplate className='size-4' aria-hidden='true' />
          Templates
        </Button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Summary metrics
 * ------------------------------------------------------------------------- */

function SummaryMetric({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  const isWarning = metric.tone === 'warning';

  return (
    <Card
      className={cn(
        'h-full gap-0 rounded-xl px-3.5 py-3 shadow-none',
        isWarning
          ? 'border-amber-200 bg-amber-50/40'
          : 'border-gray-200 bg-white',
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <Typography
          as='p'
          font='satoshi'
          weight='medium'
          variant='c2'
          className='min-w-0 truncate tracking-[0.06em] text-gray-500 uppercase'
        >
          {metric.label}
        </Typography>
        <Icon
          className={cn(
            'size-3.5 shrink-0',
            isWarning ? 'text-amber-600' : 'text-gray-400',
          )}
          strokeWidth={1.75}
          aria-hidden='true'
        />
      </div>

      <Typography
        as='p'
        font='satoshi'
        weight='semibold'
        variant='i2'
        className={cn(
          'mt-1 leading-none tabular-nums',
          isWarning ? 'text-amber-900' : 'text-gray-900',
        )}
      >
        {metric.value}
      </Typography>

      <Typography
        as='p'
        font='satoshi'
        variant='c2'
        className='mt-1 leading-4 text-gray-500'
      >
        {metric.hint}
      </Typography>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Toolbar
 * ------------------------------------------------------------------------- */

function SelectControl({
  label,
  defaultValue,
  options,
}: {
  label: string;
  defaultValue: string;
  options: readonly string[];
}) {
  return (
    <div className='relative w-full sm:w-auto'>
      <select
        aria-label={label}
        defaultValue={defaultValue}
        className='h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white pr-8 pl-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none sm:w-auto'
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className='pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-gray-400'
        strokeWidth={1.75}
        aria-hidden='true'
      />
    </div>
  );
}

function ContentToolbar() {
  return (
    <div className='flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between'>
      <div className='relative w-full lg:max-w-xs'>
        <Search
          className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400'
          strokeWidth={1.75}
          aria-hidden='true'
        />
        <input
          type='search'
          aria-label='Search by title or slug'
          placeholder='Search by title or slug...'
          autoComplete='off'
          className='h-9 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 transition-colors placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none'
        />
      </div>

      <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center'>
        <SelectControl
          label='Content type'
          defaultValue='All Content'
          options={TYPE_OPTIONS}
        />
        <SelectControl
          label='Status'
          defaultValue='All Statuses'
          options={STATUS_OPTIONS}
        />
        <SelectControl
          label='Department'
          defaultValue='All Departments'
          options={DEPARTMENT_OPTIONS}
        />
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-9 w-full gap-1.5 rounded-lg border-gray-200 bg-white px-3 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50 sm:w-auto'
        >
          <SlidersHorizontal className='size-4' aria-hidden='true' />
          More Filters
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Content table
 * ------------------------------------------------------------------------- */

type ColumnHeader = {
  label: string;
  className?: string;
};

const COLUMNS: readonly ColumnHeader[] = [
  { label: 'Title' },
  { label: 'Content Type' },
  { label: 'Department' },
  { label: 'Last Updated' },
  { label: 'Status' },
];

function SelectionIndicator({ label }: { label?: string }) {
  return (
    <>
      <span
        aria-hidden='true'
        className='inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-gray-300 bg-white'
      />
      {label && <span className='sr-only'>{label}</span>}
    </>
  );
}

function ContentRow({ item }: { item: ContentItem }) {
  return (
    <TableRow className='border-gray-100 hover:bg-gray-50/60'>
      <TableCell className='w-10 px-4 py-3 align-top'>
        <SelectionIndicator label={`Select ${item.title}`} />
      </TableCell>

      <TableCell className='px-4 py-3'>
        <div className='flex items-center gap-1.5'>
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='s3'
            className='text-gray-900'
          >
            {item.title}
          </Typography>
          {item.featured && (
            <span className='inline-flex items-center'>
              <Star
                className='size-3 fill-amber-400 text-amber-500'
                strokeWidth={1.5}
                aria-hidden='true'
              />
              <span className='sr-only'>Featured</span>
            </span>
          )}
        </div>
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='mt-0.5 block max-w-[20rem] truncate text-gray-500'
        >
          {item.slug}
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
            {item.type}
          </Typography>
        </span>
      </TableCell>

      <TableCell className='px-4 py-3'>
        <Typography
          as='span'
          font='satoshi'
          variant='b4'
          className='block max-w-[9rem] truncate text-gray-600'
        >
          {item.department}
        </Typography>
      </TableCell>

      <TableCell className='px-4 py-3 whitespace-nowrap'>
        <Typography
          as='span'
          font='satoshi'
          variant='b4'
          className='text-gray-600'
        >
          {item.updatedAt}
        </Typography>
      </TableCell>

      <TableCell className='px-4 py-3 whitespace-nowrap'>
        <StatusBadge status={item.status} />
      </TableCell>

      <TableCell className='px-4 py-3 text-right'>
        <button
          type='button'
          aria-label={`Actions for ${item.title}`}
          className='inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
        >
          <Ellipsis className='size-4' strokeWidth={1.75} aria-hidden='true' />
        </button>
      </TableCell>
    </TableRow>
  );
}

function PaginationFooter() {
  return (
    <div className='flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
      <Typography as='p' font='satoshi' variant='c0' className='text-gray-500'>
        Showing{' '}
        <span className='font-medium text-gray-900'>
          1–{VISIBLE_CONTENT.length}
        </span>{' '}
        of <span className='font-medium text-gray-900'>{CONTENT.length}</span>{' '}
        entries
      </Typography>

      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Previous page'
          disabled
          className='size-8 rounded-md border-gray-200 bg-white text-gray-500 shadow-none hover:bg-gray-50'
        >
          <ChevronLeft className='size-4' aria-hidden='true' />
        </Button>

        <button
          type='button'
          aria-label='Page 1'
          aria-current='page'
          className='inline-flex size-8 items-center justify-center rounded-md bg-navy text-white focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
        >
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='s3'
            className='leading-none'
          >
            1
          </Typography>
        </button>

        <button
          type='button'
          aria-label='Page 2'
          className='inline-flex size-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
        >
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='s3'
            className='leading-none'
          >
            2
          </Typography>
        </button>

        <Button
          type='button'
          variant='outline'
          size='icon'
          aria-label='Next page'
          className='size-8 rounded-md border-gray-200 bg-white text-gray-700 shadow-none hover:bg-gray-50'
        >
          <ChevronRight className='size-4' aria-hidden='true' />
        </Button>
      </div>
    </div>
  );
}

function ContentTable() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <ContentToolbar />

      <Table aria-label='Posts and pages' className='min-w-[54rem]'>
        <TableHeader>
          <TableRow className='border-gray-100 bg-gray-50/60 hover:bg-gray-50/60'>
            <TableHead className='h-9 w-10 px-4'>
              <SelectionIndicator label='Select all content' />
            </TableHead>
            {COLUMNS.map((column) => (
              <TableHead key={column.label} className='h-9 px-4'>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='tracking-[0.08em] text-gray-500 uppercase'
                >
                  {column.label}
                </Typography>
              </TableHead>
            ))}
            <TableHead className='h-9 w-12 px-4'>
              <span className='sr-only'>Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {VISIBLE_CONTENT.map((item) => (
            <ContentRow key={item.title} item={item} />
          ))}
        </TableBody>
      </Table>

      <PaginationFooter />
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function PostsAndPagesPage() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <MobileNav />

      <div className='lg:flex'>
        <Sidebar />

        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar />

          <main className='mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8'>
            <PageHeading />

            <section aria-label='Content summary'>
              <ul className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
                {METRICS.map((metric) => (
                  <li key={metric.label} className='h-full'>
                    <SummaryMetric metric={metric} />
                  </li>
                ))}
              </ul>
            </section>

            <ContentTable />
          </main>
        </div>
      </div>
    </div>
  );
}
