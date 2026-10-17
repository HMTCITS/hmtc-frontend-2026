/**
 * HMTC CMS — Review & Approval UI reference (static design prototype).
 *
 * Scope: visual reference only. No Directus, GrapesJS, API, auth, approval,
 * publishing or persistence. Every control is a placeholder that renders from
 * the typed mock data in this file.
 *
 * Visual language follows the sibling dashboard and content references
 * (../dashboard.tsx, ../content/page.tsx) and DESIGN.md §8 (L4 Admin).
 */

import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Ellipsis,
  Eye,
  FileText,
  History,
  Images,
  Info,
  LayoutDashboard,
  LayoutTemplate,
  Menu,
  MessageSquareText,
  Palette,
  PanelLeftClose,
  Rocket,
  RotateCcw,
  Search,
  ShieldCheck,
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
  title: 'Review & Approval — Page Builder Sandbox',
};

/* ---------------------------------------------------------------------------
 * Mock data
 * ------------------------------------------------------------------------- */

type NavItem = {
  label: string;
  icon: LucideIcon;
  /** Only implemented routes get an `href`; the rest render disabled. */
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
    badge: '4',
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

const ACTIVE_NAV_ITEM = 'Review & Approval';

type MetricTone = 'amber' | 'blue' | 'red' | 'green';

type Metric = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: MetricTone;
};

const METRICS: readonly Metric[] = [
  {
    label: 'Pending Review',
    value: 4,
    hint: 'Awaiting your decision',
    icon: Clock,
    tone: 'amber',
  },
  {
    label: 'In Review',
    value: 2,
    hint: 'Currently being reviewed',
    icon: Eye,
    tone: 'blue',
  },
  {
    label: 'Changes Requested',
    value: 3,
    hint: 'Returned to contributors',
    icon: CircleAlert,
    tone: 'red',
  },
  {
    label: 'Approved This Week',
    value: 8,
    hint: 'Ready or already published',
    icon: CircleCheck,
    tone: 'green',
  },
];

type ReviewStatus = 'pending' | 'in-review' | 'changes' | 'approved';

type StatusStyle = {
  label: string;
  icon: LucideIcon;
  className: string;
  iconClassName: string;
};

const STATUS_STYLES: Record<ReviewStatus, StatusStyle> = {
  pending: {
    label: 'Pending Review',
    icon: Clock,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    iconClassName: 'text-amber-600',
  },
  'in-review': {
    label: 'In Review',
    icon: Eye,
    className: 'border-blue-200 bg-blue-50 text-blue-700',
    iconClassName: 'text-blue-600',
  },
  changes: {
    label: 'Changes Requested',
    icon: CircleAlert,
    className: 'border-red-200 bg-red-50 text-red-700',
    iconClassName: 'text-red-600',
  },
  approved: {
    label: 'Approved',
    icon: CircleCheck,
    className: 'border-green-200 bg-green-50 text-green-700',
    iconClassName: 'text-green-600',
  },
};

const TONE_ICON_CLASSES: Record<MetricTone, string> = {
  amber: 'text-amber-600',
  blue: 'text-blue-600',
  red: 'text-red-600',
  green: 'text-green-600',
};

type ContentType = 'Event Page' | 'Proker Page';

type Submission = {
  title: string;
  type: ContentType;
  submittedBy: string;
  department: string;
  submitted: string;
  status: ReviewStatus;
};

const SUBMISSIONS: readonly Submission[] = [
  {
    title: 'Syukuran Wisudawan',
    type: 'Event Page',
    submittedBy: 'Bima Saputra',
    department: 'Keprofesian',
    submitted: 'Today, 08:15',
    status: 'pending',
  },
  {
    title: 'Seminar Nasional Informatika',
    type: 'Event Page',
    submittedBy: 'Nadia Putri',
    department: 'Keilmiahan',
    submitted: 'Today, 07:30',
    status: 'pending',
  },
  {
    title: 'Company Visit 2026',
    type: 'Event Page',
    submittedBy: 'Fajar Ramadhan',
    department: 'Hubungan Luar',
    submitted: 'Yesterday',
    status: 'in-review',
  },
  {
    title: 'Open Recruitment Staff',
    type: 'Proker Page',
    submittedBy: 'Dinda Maharani',
    department: 'PSDM',
    submitted: '16 Oct 2026',
    status: 'changes',
  },
  {
    title: 'Workshop UI/UX',
    type: 'Proker Page',
    submittedBy: 'Alya Pratama',
    department: 'Keprofesian',
    submitted: '15 Oct 2026',
    status: 'pending',
  },
  {
    title: 'HMTC Anniversary',
    type: 'Proker Page',
    submittedBy: 'Rizky Aditya',
    department: 'Internal',
    submitted: '14 Oct 2026',
    status: 'approved',
  },
];

/** The row rendered as "currently open" in the review panel below the queue. */
const SELECTED_TITLE = 'Syukuran Wisudawan';

const STATUS_OPTIONS = [
  'All Statuses',
  'Pending Review',
  'In Review',
  'Changes Requested',
  'Approved',
] as const;

const TYPE_OPTIONS = [
  'All Content Types',
  'Event Page',
  'Proker Page',
] as const;

const DEPARTMENT_OPTIONS = [
  'All Departments',
  'Keprofesian',
  'Keilmiahan',
  'Hubungan Luar',
  'PSDM',
  'Internal',
] as const;

const SORT_OPTIONS = [
  'Newest First',
  'Oldest First',
  'Recently Updated',
  'Title A–Z',
] as const;

const CHECKLIST: readonly string[] = [
  'Content completeness',
  'Image quality',
  'Correct event information',
  'Mobile layout',
  'Appropriate links and calls to action',
];

type ActivityItem = {
  initials: string;
  actor: string;
  action: string;
  time: string;
};

const ACTIVITY: readonly ActivityItem[] = [
  {
    initials: 'BS',
    actor: 'Bima Saputra',
    action: 'submitted this page for review',
    time: 'Today, 08:15',
  },
  {
    initials: 'AP',
    actor: 'Alya Pratama',
    action: 'updated the event banner',
    time: 'Yesterday, 16:40',
  },
  {
    initials: 'BS',
    actor: 'Bima Saputra',
    action: 'saved a draft',
    time: 'Yesterday, 15:20',
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

function StatusBadge({ status }: { status: ReviewStatus }) {
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

function TypeChip({ type }: { type: ContentType }) {
  return (
    <span className='inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5'>
      <Typography
        as='span'
        font='satoshi'
        variant='c2'
        className='leading-none text-gray-600'
      >
        {type}
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
                  Review &amp; Approval
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
            Review &amp; Approval
          </Typography>
        </div>

        <div className='flex shrink-0 items-center gap-1.5 sm:gap-2.5'>
          <button
            type='button'
            aria-label='Notifications, 4 unread'
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
    <section aria-labelledby='page-title' className='min-w-0'>
      <div className='flex flex-wrap items-center gap-2'>
        <Typography
          as='h1'
          id='page-title'
          font='satoshi'
          weight='semibold'
          variant='h1'
          className='text-xl text-gray-900 md:text-2xl'
        >
          Review &amp; Approval
        </Typography>
        <span className='inline-flex items-center gap-1 rounded-full border border-navy/15 bg-navy/5 px-2 py-0.5'>
          <ShieldCheck
            className='size-3 text-navy'
            strokeWidth={1.75}
            aria-hidden='true'
          />
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='leading-none text-navy'
          >
            Reviewer Workspace
          </Typography>
        </span>
      </div>
      <Typography
        as='p'
        font='satoshi'
        variant='b4'
        className='mt-1 max-w-2xl leading-5 text-gray-500'
      >
        Review submitted content before it goes live on the HMTC website.
      </Typography>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Summary metrics
 * ------------------------------------------------------------------------- */

function SummaryMetric({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <Card className='h-full gap-0 rounded-xl border-gray-200 bg-white px-3.5 py-3 shadow-none'>
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
          className={cn('size-3.5 shrink-0', TONE_ICON_CLASSES[metric.tone])}
          strokeWidth={1.75}
          aria-hidden='true'
        />
      </div>

      <Typography
        as='p'
        font='satoshi'
        weight='semibold'
        variant='i2'
        className='mt-1 leading-none text-gray-900 tabular-nums'
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
 * Queue toolbar
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
    <div className='relative w-full'>
      <select
        aria-label={label}
        defaultValue={defaultValue}
        className='h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white pr-8 pl-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none'
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

function QueueToolbar() {
  return (
    <div className='flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:px-5'>
      <div className='relative w-full'>
        <Search
          className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400'
          strokeWidth={1.75}
          aria-hidden='true'
        />
        <input
          type='search'
          aria-label='Search submissions'
          placeholder='Search submissions...'
          autoComplete='off'
          className='h-9 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 transition-colors placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none'
        />
      </div>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
        <SelectControl
          label='Status'
          defaultValue='All Statuses'
          options={STATUS_OPTIONS}
        />
        <SelectControl
          label='Content type'
          defaultValue='All Content Types'
          options={TYPE_OPTIONS}
        />
        <SelectControl
          label='Department'
          defaultValue='All Departments'
          options={DEPARTMENT_OPTIONS}
        />
        <SelectControl
          label='Sort by'
          defaultValue='Newest First'
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Review queue
 * ------------------------------------------------------------------------- */

function SubmissionRow({ item }: { item: Submission }) {
  const isSelected = item.title === SELECTED_TITLE;

  return (
    <TableRow
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'border-gray-100',
        isSelected ? 'bg-navy/5 hover:bg-navy/5' : 'hover:bg-gray-50/60',
      )}
    >
      <TableCell className='px-4 py-3'>
        <div className='flex flex-wrap items-center gap-2'>
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='s3'
            className='text-gray-900'
          >
            {item.title}
          </Typography>
          {isSelected && (
            <span className='inline-flex items-center rounded-full border border-cerulean-blue/30 bg-cerulean-blue/10 px-1.5 py-0.5'>
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='leading-none text-navy'
              >
                Selected
              </Typography>
            </span>
          )}
        </div>
        <span className='mt-1 inline-flex'>
          <TypeChip type={item.type} />
        </span>
      </TableCell>

      <TableCell className='px-4 py-3'>
        <Typography
          as='span'
          font='satoshi'
          variant='b4'
          className='block max-w-[11rem] truncate text-gray-700'
        >
          {item.submittedBy}
        </Typography>
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
          {item.submitted}
        </Typography>
      </TableCell>

      <TableCell className='px-4 py-3 whitespace-nowrap'>
        <StatusBadge status={item.status} />
      </TableCell>

      <TableCell className='px-4 py-3'>
        <div className='flex items-center justify-end gap-1'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 gap-1 rounded-md border-gray-200 bg-white px-2.5 font-medium text-navy shadow-none hover:border-navy/25 hover:bg-navy/5'
          >
            Review
          </Button>
          <button
            type='button'
            aria-label={`More actions for ${item.title}`}
            className='inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
          >
            <Ellipsis
              className='size-4'
              strokeWidth={1.75}
              aria-hidden='true'
            />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ReviewQueue() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <div className='flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <div className='min-w-0'>
          <Typography
            as='h2'
            id='submissions-heading'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Submissions
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c0'
            className='mt-0.5 text-gray-500'
          >
            Content waiting for a reviewer decision
          </Typography>
        </div>
        <span className='inline-flex shrink-0 items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5'>
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='leading-none whitespace-nowrap text-gray-600'
          >
            {SUBMISSIONS.length} in queue
          </Typography>
        </span>
      </div>

      <QueueToolbar />

      <Table aria-label='Review submissions' className='min-w-[52rem]'>
        <TableHeader>
          <TableRow className='border-gray-100 bg-gray-50/60 hover:bg-gray-50/60'>
            {[
              'Content',
              'Submitted By',
              'Department',
              'Submitted',
              'Status',
            ].map((label) => (
              <TableHead key={label} className='h-9 px-4'>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='tracking-[0.08em] text-gray-500 uppercase'
                >
                  {label}
                </Typography>
              </TableHead>
            ))}
            <TableHead className='h-9 px-4 text-right'>
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='tracking-[0.08em] text-gray-500 uppercase'
              >
                Actions
              </Typography>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {SUBMISSIONS.map((item) => (
            <SubmissionRow key={item.title} item={item} />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Selected submission
 * ------------------------------------------------------------------------- */

const DETAIL_META: readonly { label: string; value: string }[] = [
  { label: 'Department', value: 'Departemen Keprofesian' },
  { label: 'Submitted by', value: 'Bima Saputra' },
  { label: 'Submitted', value: '18 Oct 2026, 08:15' },
];

function SelectedSubmission() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <div className='flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <div className='min-w-0'>
          <Typography
            as='p'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='tracking-[0.1em] text-gray-500 uppercase'
          >
            Selected submission
          </Typography>
          <div className='mt-0.5 flex flex-wrap items-center gap-2'>
            <Typography
              as='h2'
              font='satoshi'
              weight='semibold'
              variant='h3'
              className='text-gray-900'
            >
              Syukuran Wisudawan
            </Typography>
            <StatusBadge status='pending' />
          </div>
        </div>
      </div>

      <div className='space-y-5 px-4 py-4 sm:px-5'>
        <dl className='grid gap-x-4 gap-y-3 sm:grid-cols-3'>
          {DETAIL_META.map((item) => (
            <div key={item.label} className='min-w-0'>
              <Typography
                as='dt'
                font='satoshi'
                variant='c2'
                className='text-gray-500'
              >
                {item.label}
              </Typography>
              <Typography
                as='dd'
                font='satoshi'
                weight='medium'
                variant='s3'
                className='mt-0.5 truncate text-gray-900'
              >
                {item.value}
              </Typography>
            </div>
          ))}
        </dl>

        <div>
          <Typography
            as='h3'
            font='satoshi'
            weight='semibold'
            variant='h5'
            className='text-gray-900'
          >
            Submission summary
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='mt-1 leading-5 text-gray-600'
          >
            A celebration event for graduating HMTC students, including event
            information, registration details, and a photo gallery.
          </Typography>
        </div>

        <div>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Typography
              as='h3'
              font='satoshi'
              weight='semibold'
              variant='h5'
              className='text-gray-900'
            >
              Review checklist
            </Typography>
            <span className='inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5'>
              <Typography
                as='span'
                font='satoshi'
                variant='c2'
                className='leading-none text-gray-500'
              >
                Illustrative
              </Typography>
            </span>
          </div>
          <ul className='mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
            {CHECKLIST.map((item) => (
              <li
                key={item}
                className='flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2'
              >
                <CircleCheck
                  className='mt-0.5 size-4 shrink-0 text-green-600'
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
                <Typography
                  as='span'
                  font='satoshi'
                  variant='b4'
                  className='leading-5 text-gray-700'
                >
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </div>

        <div className='rounded-lg border border-amber-200 bg-amber-50/50 p-3'>
          <div className='flex items-center gap-1.5'>
            <MessageSquareText
              className='size-3.5 shrink-0 text-amber-700'
              strokeWidth={1.75}
              aria-hidden='true'
            />
            <Typography
              as='p'
              font='satoshi'
              weight='medium'
              variant='c2'
              className='tracking-[0.06em] text-amber-800 uppercase'
            >
              Reviewer note (mock)
            </Typography>
          </div>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='mt-1.5 leading-5 text-gray-700'
          >
            Please verify the registration deadline and confirm that the event
            banner uses the approved HMTC branding.
          </Typography>
        </div>

        <div className='border-t border-gray-100 pt-4'>
          <Typography
            as='h3'
            font='satoshi'
            weight='semibold'
            variant='h5'
            className='text-gray-900'
          >
            Submission activity
          </Typography>
          <ol className='mt-1 divide-y divide-gray-100'>
            {ACTIVITY.map((item) => (
              <li
                key={`${item.actor}-${item.action}`}
                className='flex items-start gap-3 py-2.5'
              >
                <span
                  aria-hidden='true'
                  className='flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600'
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
                <div className='min-w-0 flex-1'>
                  <Typography
                    as='p'
                    font='satoshi'
                    variant='c0'
                    className='leading-5 text-gray-600'
                  >
                    <span className='font-medium text-gray-900'>
                      {item.actor}
                    </span>{' '}
                    {item.action}
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
        </div>
      </div>

      <div className='flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between'>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='flex max-w-md items-start gap-1.5 leading-4 text-gray-500'
        >
          <Info
            className='mt-px size-3.5 shrink-0'
            strokeWidth={1.75}
            aria-hidden='true'
          />
          Approval and publication permissions will be enforced by the CMS.
        </Typography>

        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-8 w-full gap-1.5 rounded-md px-2.5 font-medium text-gray-600 hover:bg-gray-100 sm:w-auto'
          >
            <Eye className='size-4' aria-hidden='true' />
            Preview Page
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 w-full gap-1.5 rounded-md border-gray-200 bg-white px-3 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50 sm:w-auto'
          >
            <RotateCcw className='size-4' aria-hidden='true' />
            Request Changes
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-8 w-full gap-1.5 rounded-md bg-navy px-3 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30 sm:w-auto'
          >
            <CircleCheck className='size-4' aria-hidden='true' />
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function ReviewAndApprovalPage() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <MobileNav />

      <div className='lg:flex'>
        <Sidebar />

        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar />

          <main className='mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8'>
            <PageHeading />

            <section aria-label='Review summary'>
              <ul className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
                {METRICS.map((metric) => (
                  <li key={metric.label} className='h-full'>
                    <SummaryMetric metric={metric} />
                  </li>
                ))}
              </ul>
            </section>

            <ReviewQueue />

            <SelectedSubmission />
          </main>
        </div>
      </div>
    </div>
  );
}
