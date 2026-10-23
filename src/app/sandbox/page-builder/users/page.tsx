/**
 * HMTC CMS — Users & Roles UI reference (static design prototype).
 *
 * Scope: visual reference only. No Directus, auth, invitations, account or
 * permission changes, API requests or persistence. Every control is a
 * placeholder that renders from the typed mock data in this file.
 *
 * Visual language follows the sibling references (../dashboard.tsx,
 * ../content/page.tsx, ../reviews/page.tsx, ../media/page.tsx) and
 * DESIGN.md §8 (L4 Admin).
 */

import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  CircleMinus,
  ClipboardCheck,
  Clock,
  Ellipsis,
  FileText,
  History,
  Images,
  LayoutDashboard,
  LayoutTemplate,
  Lock,
  MailPlus,
  Menu,
  Palette,
  PanelLeftClose,
  PencilLine,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  UserCheck,
  UserRoundX,
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
  title: 'Users & Roles — Page Builder Sandbox',
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

const ACTIVE_NAV_ITEM = 'Users & Roles';

type Metric = {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: 'neutral' | 'warning';
};

const METRICS: readonly Metric[] = [
  {
    label: 'Total Users',
    value: 24,
    hint: 'Registered CMS users',
    icon: UsersRound,
    tone: 'neutral',
  },
  {
    label: 'Active Users',
    value: 21,
    hint: 'Accounts currently active',
    icon: UserCheck,
    tone: 'neutral',
  },
  {
    label: 'Pending Invitations',
    value: 2,
    hint: 'Awaiting account setup',
    icon: MailPlus,
    tone: 'warning',
  },
  {
    label: 'Administrators',
    value: 3,
    hint: 'Users with administrative access',
    icon: ShieldCheck,
    tone: 'neutral',
  },
];

type Role =
  | 'Administrator'
  | 'Department Admin'
  | 'Contributor'
  | 'Reviewer / Publisher';

const ROLE_STYLES: Record<Role, string> = {
  Administrator: 'border-navy/15 bg-navy/5 text-navy',
  'Department Admin': 'border-blue-200 bg-blue-50 text-blue-700',
  Contributor: 'border-gray-200 bg-gray-100 text-gray-600',
  'Reviewer / Publisher': 'border-violet-200 bg-violet-50 text-violet-700',
};

type AccountStatus = 'active' | 'inactive' | 'invited';

const STATUS_STYLES: Record<
  AccountStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  active: {
    label: 'Active',
    icon: CircleCheck,
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  inactive: {
    label: 'Inactive',
    icon: CircleMinus,
    className: 'border-gray-200 bg-gray-100 text-gray-600',
  },
  invited: {
    label: 'Invitation Pending',
    icon: Clock,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
};

type DirectoryUser = {
  name: string;
  email: string;
  initials: string;
  role: Role;
  department: string;
  status: AccountStatus;
  lastActive: string;
};

const USERS: readonly DirectoryUser[] = [
  {
    name: 'Alya Pratama',
    email: 'alya@hmtc-its.com',
    initials: 'AP',
    role: 'Administrator',
    department: 'Keprofesian',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    name: 'Bima Saputra',
    email: 'bima@hmtc-its.com',
    initials: 'BS',
    role: 'Contributor',
    department: 'Keprofesian',
    status: 'active',
    lastActive: '15 minutes ago',
  },
  {
    name: 'Nadia Putri',
    email: 'nadia@hmtc-its.com',
    initials: 'NP',
    role: 'Reviewer / Publisher',
    department: 'Keilmiahan',
    status: 'active',
    lastActive: '1 hour ago',
  },
  {
    name: 'Fajar Ramadhan',
    email: 'fajar@hmtc-its.com',
    initials: 'FR',
    role: 'Contributor',
    department: 'Hubungan Luar',
    status: 'active',
    lastActive: 'Today',
  },
  {
    name: 'Dinda Maharani',
    email: 'dinda@hmtc-its.com',
    initials: 'DM',
    role: 'Contributor',
    department: 'PSDM',
    status: 'active',
    lastActive: 'Today',
  },
  {
    name: 'Rizky Aditya',
    email: 'rizky@hmtc-its.com',
    initials: 'RA',
    role: 'Department Admin',
    department: 'Internal',
    status: 'active',
    lastActive: 'Yesterday',
  },
  {
    name: 'Siti Rahma',
    email: 'siti@hmtc-its.com',
    initials: 'SR',
    role: 'Contributor',
    department: 'Keilmiahan',
    status: 'inactive',
    lastActive: '7 days ago',
  },
  {
    name: 'Arif Wibowo',
    email: 'arif@hmtc-its.com',
    initials: 'AW',
    role: 'Reviewer / Publisher',
    department: 'Keprofesian',
    status: 'active',
    lastActive: '2 days ago',
  },
];

const SELECTED_EMAIL = 'bima@hmtc-its.com';

const ROLE_OPTIONS = [
  'All Roles',
  'Administrator',
  'Department Admin',
  'Contributor',
  'Reviewer / Publisher',
] as const;

const DEPARTMENT_OPTIONS = [
  'All Departments',
  'Keprofesian',
  'Keilmiahan',
  'Hubungan Luar',
  'PSDM',
  'Internal',
] as const;

const STATUS_OPTIONS = [
  'All Statuses',
  'Active',
  'Inactive',
  'Invitation Pending',
] as const;

const SORT_OPTIONS = [
  'Recently Active',
  'Name A–Z',
  'Role',
  'Department',
] as const;

type SelectedUser = {
  name: string;
  email: string;
  initials: string;
  role: Role;
  department: string;
  joined: string;
  lastActive: string;
  contentCreated: number;
  publishedPages: number;
  pendingSubmissions: number;
  access: readonly { allowed: boolean; label: string }[];
};

const SELECTED_USER: SelectedUser = {
  name: 'Bima Saputra',
  email: 'bima@hmtc-its.com',
  initials: 'BS',
  role: 'Contributor',
  department: 'Departemen Keprofesian',
  joined: '12 Aug 2026',
  lastActive: '18 Oct 2026, 09:15',
  contentCreated: 8,
  publishedPages: 3,
  pendingSubmissions: 1,
  access: [
    { allowed: true, label: 'Can edit permitted department content' },
    { allowed: true, label: 'Can upload and select permitted media' },
    { allowed: true, label: 'Can submit content for review' },
    {
      allowed: false,
      label: 'Cannot approve or publish content independently',
    },
  ],
};

type Invitation = {
  name: string;
  email: string;
  initials: string;
  role: Role;
  department: string;
  invited: string;
};

const INVITATIONS: readonly Invitation[] = [
  {
    name: 'Raka Pratama',
    email: 'raka@hmtc-its.com',
    initials: 'RP',
    role: 'Contributor',
    department: 'PSDM',
    invited: '17 Oct 2026',
  },
  {
    name: 'Yusuf Hidayat',
    email: 'yusuf@hmtc-its.com',
    initials: 'YH',
    role: 'Contributor',
    department: 'Keilmiahan',
    invited: '16 Oct 2026',
  },
];

type RoleCard = {
  name: Role;
  icon: LucideIcon;
  description: string;
  permissions: readonly string[];
};

const ROLES: readonly RoleCard[] = [
  {
    name: 'Administrator',
    icon: ShieldCheck,
    description:
      'Manage CMS configuration, users, permissions, and all content.',
    permissions: [
      'Manage users and roles',
      'Manage department settings',
      'Access all content',
      'Configure global design settings',
    ],
  },
  {
    name: 'Department Admin',
    icon: Building2,
    description:
      'Manage content and contributors within an assigned department.',
    permissions: [
      'Manage department content',
      'Manage department contributors where authorized',
      'Submit and manage department pages',
      'View department media',
    ],
  },
  {
    name: 'Contributor',
    icon: PencilLine,
    description: 'Create and edit content within an assigned department.',
    permissions: [
      'Create and edit permitted department drafts',
      'Upload and select permitted media',
      'Preview content',
      'Submit content for review',
    ],
  },
  {
    name: 'Reviewer / Publisher',
    icon: ClipboardCheck,
    description: 'Review submitted content and approve publication.',
    permissions: [
      'View submitted content assigned for review',
      'Request changes',
      'Approve and publish content',
      'Inspect review history',
    ],
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

function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5',
        ROLE_STYLES[role],
      )}
    >
      <Typography
        as='span'
        font='satoshi'
        weight='medium'
        variant='c2'
        className='leading-none whitespace-nowrap'
      >
        {role}
      </Typography>
    </span>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
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
      <SidebarNavGroup label='Administration' items={ADMIN_NAV} />
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
          Administrator
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
              <li className='hidden sm:block'>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-gray-500'
                >
                  Dashboard
                </Typography>
              </li>
              <li aria-hidden='true' className='hidden sm:block'>
                <ChevronRight
                  className='size-3 text-gray-400'
                  strokeWidth={2}
                />
              </li>
              <li>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-gray-500'
                >
                  Settings
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
                  Users &amp; Roles
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
            Users &amp; Roles
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
              Signed in as Alya Pratama, Administrator
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
          Users &amp; Roles
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='mt-1 max-w-2xl leading-5 text-gray-500'
        >
          Manage CMS access, department membership, and content
          responsibilities.
        </Typography>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <Button
          type='button'
          className='h-9 w-full gap-1.5 rounded-lg bg-navy px-3.5 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30 sm:w-auto'
        >
          <Plus className='size-4' aria-hidden='true' />
          Add User
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-9 w-full gap-1.5 rounded-lg border-gray-200 bg-white px-3.5 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50 sm:w-auto'
        >
          <ShieldCheck className='size-4' aria-hidden='true' />
          Roles &amp; Permissions
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

function UserToolbar() {
  return (
    <div className='flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:px-5'>
      <div className='relative w-full lg:max-w-sm'>
        <Search
          className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400'
          strokeWidth={1.75}
          aria-hidden='true'
        />
        <input
          type='search'
          aria-label='Search by name or email'
          placeholder='Search by name or email...'
          autoComplete='off'
          className='h-9 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 transition-colors placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none'
        />
      </div>

      <div className='grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center'>
        <SelectControl
          label='Role'
          defaultValue='All Roles'
          options={ROLE_OPTIONS}
        />
        <SelectControl
          label='Department'
          defaultValue='All Departments'
          options={DEPARTMENT_OPTIONS}
        />
        <SelectControl
          label='Account status'
          defaultValue='All Statuses'
          options={STATUS_OPTIONS}
        />
        <SelectControl
          label='Sort by'
          defaultValue='Recently Active'
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * User directory
 * ------------------------------------------------------------------------- */

function UserRow({ user }: { user: DirectoryUser }) {
  const isSelected = user.email === SELECTED_EMAIL;

  return (
    <TableRow
      aria-current={isSelected ? 'true' : undefined}
      className={cn(
        'border-gray-100',
        isSelected ? 'bg-navy/5 hover:bg-navy/5' : 'hover:bg-gray-50/60',
      )}
    >
      <TableCell className='px-4 py-3'>
        <div className='flex items-center gap-2.5'>
          <Avatar
            initials={user.initials}
            className='size-8 bg-gray-100 text-[11px] text-gray-700'
          />
          <div className='min-w-0'>
            <div className='flex flex-wrap items-center gap-1.5'>
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='s3'
                className='text-gray-900'
              >
                {user.name}
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
            <Typography
              as='span'
              font='satoshi'
              variant='c2'
              className='mt-0.5 block truncate text-gray-500'
            >
              {user.email}
            </Typography>
          </div>
        </div>
      </TableCell>

      <TableCell className='px-4 py-3 whitespace-nowrap'>
        <RoleBadge role={user.role} />
      </TableCell>

      <TableCell className='px-4 py-3'>
        <Typography
          as='span'
          font='satoshi'
          variant='b4'
          className='block max-w-[9rem] truncate text-gray-600'
        >
          {user.department}
        </Typography>
      </TableCell>

      <TableCell className='px-4 py-3 whitespace-nowrap'>
        <StatusBadge status={user.status} />
      </TableCell>

      <TableCell className='px-4 py-3 whitespace-nowrap'>
        <Typography
          as='span'
          font='satoshi'
          variant='b4'
          className='text-gray-600'
        >
          {user.lastActive}
        </Typography>
      </TableCell>

      <TableCell className='px-4 py-3 text-right'>
        <button
          type='button'
          aria-label={`More actions for ${user.name}`}
          className='inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
        >
          <Ellipsis className='size-4' strokeWidth={1.75} aria-hidden='true' />
        </button>
      </TableCell>
    </TableRow>
  );
}

function UserDirectory() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <div className='flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <div className='min-w-0'>
          <Typography
            as='h2'
            id='all-users-heading'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            All Users
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c0'
            className='mt-0.5 text-gray-500'
          >
            Accounts with access to the HMTC CMS
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
            {USERS.length} shown
          </Typography>
        </span>
      </div>

      <UserToolbar />

      <Table aria-label='Users and roles' className='min-w-[52rem]'>
        <TableHeader>
          <TableRow className='border-gray-100 bg-gray-50/60 hover:bg-gray-50/60'>
            {[
              'User',
              'Role',
              'Department',
              'Account Status',
              'Last Active',
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
            <TableHead className='h-9 w-12 px-4 text-right'>
              <span className='sr-only'>Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {USERS.map((user) => (
            <UserRow key={user.email} user={user} />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Selected user
 * ------------------------------------------------------------------------- */

const ACCOUNT_DETAILS: readonly { label: string; value: string }[] = [
  { label: 'Joined', value: SELECTED_USER.joined },
  { label: 'Last active', value: SELECTED_USER.lastActive },
  { label: 'Content created', value: String(SELECTED_USER.contentCreated) },
  { label: 'Published pages', value: String(SELECTED_USER.publishedPages) },
  {
    label: 'Pending submissions',
    value: String(SELECTED_USER.pendingSubmissions),
  },
];

function SelectedUserPanel() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <div className='flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <Typography
          as='h2'
          font='satoshi'
          weight='semibold'
          variant='h3'
          className='text-gray-900'
        >
          User details
        </Typography>
        <StatusBadge status='active' />
      </div>

      <div className='space-y-4 px-4 py-4 sm:px-5'>
        <div className='flex items-start gap-3'>
          <Avatar initials={SELECTED_USER.initials} className='size-10' />
          <div className='min-w-0 flex-1'>
            <Typography
              as='p'
              font='satoshi'
              weight='semibold'
              variant='s1'
              className='truncate text-gray-900'
            >
              {SELECTED_USER.name}
            </Typography>
            <Typography
              as='p'
              font='satoshi'
              variant='c2'
              className='mt-0.5 truncate text-gray-500'
            >
              {SELECTED_USER.email}
            </Typography>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              <RoleBadge role={SELECTED_USER.role} />
              <span className='inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5'>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='leading-none text-gray-600'
                >
                  {SELECTED_USER.department}
                </Typography>
              </span>
            </div>
          </div>
        </div>

        <dl className='grid grid-cols-2 gap-x-4 gap-y-3 border-t border-gray-100 pt-3 sm:grid-cols-3'>
          {ACCOUNT_DETAILS.map((item) => (
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

        <div className='rounded-lg border border-gray-200 bg-gray-50/60 p-3'>
          <div className='flex items-center gap-1.5'>
            <Lock
              className='size-3.5 shrink-0 text-gray-500'
              strokeWidth={1.75}
              aria-hidden='true'
            />
            <Typography
              as='p'
              font='satoshi'
              weight='medium'
              variant='c2'
              className='tracking-[0.06em] text-gray-600 uppercase'
            >
              Access summary
            </Typography>
          </div>

          <ul className='mt-2 space-y-1.5'>
            {SELECTED_USER.access.map((item) => (
              <li key={item.label} className='flex items-start gap-2'>
                {item.allowed ? (
                  <CircleCheck
                    className='mt-0.5 size-3.5 shrink-0 text-green-600'
                    strokeWidth={2}
                    aria-hidden='true'
                  />
                ) : (
                  <CircleMinus
                    className='mt-0.5 size-3.5 shrink-0 text-gray-400'
                    strokeWidth={2}
                    aria-hidden='true'
                  />
                )}
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='leading-4 text-gray-700'
                >
                  {item.label}
                </Typography>
              </li>
            ))}
          </ul>
        </div>

        <div className='flex flex-col gap-2 sm:flex-row'>
          <Button
            type='button'
            size='sm'
            className='h-8 w-full gap-1.5 rounded-md bg-navy px-2.5 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30 sm:w-auto'
          >
            <PencilLine className='size-3.5' aria-hidden='true' />
            Edit User
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 w-full gap-1.5 rounded-md border-gray-200 bg-white px-2.5 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50 sm:w-auto'
          >
            <RefreshCw className='size-3.5' aria-hidden='true' />
            Change Role
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 w-full gap-1.5 rounded-md border-red-200 bg-white px-2.5 font-medium text-red-700 shadow-none hover:border-red-300 hover:bg-red-50 sm:ml-auto sm:w-auto'
          >
            <UserRoundX className='size-3.5' aria-hidden='true' />
            Deactivate Account
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Pending invitations
 * ------------------------------------------------------------------------- */

function InvitationCard({ invitation }: { invitation: Invitation }) {
  return (
    <li className='rounded-lg border border-amber-200 bg-amber-50/40 p-3'>
      <div className='flex items-start gap-2.5'>
        <Avatar
          initials={invitation.initials}
          className='size-8 bg-white text-[11px] text-amber-800 ring-1 ring-amber-200'
        />
        <div className='min-w-0 flex-1'>
          <Typography
            as='p'
            font='satoshi'
            weight='medium'
            variant='s3'
            className='truncate text-gray-900'
          >
            {invitation.name}
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='truncate text-gray-500'
          >
            {invitation.email}
          </Typography>
        </div>
      </div>

      <div className='mt-2 flex flex-wrap items-center gap-2'>
        <RoleBadge role={invitation.role} />
        <span className='inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5'>
          <Typography
            as='span'
            font='satoshi'
            variant='c2'
            className='leading-none text-gray-600'
          >
            {invitation.department}
          </Typography>
        </span>
      </div>

      <div className='mt-2 flex flex-wrap items-center gap-2'>
        <StatusBadge status='invited' />
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='text-gray-500'
        >
          Invited {invitation.invited}
        </Typography>
      </div>

      <div className='mt-3 grid grid-cols-2 gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='h-8 gap-1 rounded-md border-amber-300 bg-white px-2 font-medium text-amber-900 shadow-none hover:bg-amber-50'
        >
          <MailPlus className='size-3.5' aria-hidden='true' />
          Resend
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-8 gap-1 rounded-md px-2 font-medium text-gray-600 hover:bg-gray-100'
        >
          Cancel
        </Button>
      </div>
    </li>
  );
}

function PendingInvitations() {
  return (
    <Card className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none'>
      <div className='flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 sm:px-5'>
        <div className='min-w-0'>
          <Typography
            as='h2'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='truncate text-gray-900'
          >
            Pending Invitations
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='mt-0.5 text-gray-500'
          >
            Users awaiting account setup
          </Typography>
        </div>
        <span
          aria-label={`${INVITATIONS.length} pending invitations`}
          className='inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50'
        >
          <Typography
            as='span'
            font='satoshi'
            weight='semibold'
            variant='c2'
            className='leading-none text-amber-800'
          >
            {INVITATIONS.length}
          </Typography>
        </span>
      </div>

      <ul className='space-y-2.5 px-4 py-4 sm:px-5'>
        {INVITATIONS.map((invitation) => (
          <InvitationCard key={invitation.email} invitation={invitation} />
        ))}
      </ul>

      <div className='border-t border-gray-100 px-4 py-2.5 sm:px-5'>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='leading-4 text-gray-500'
        >
          Invitation actions are visual only — no email is sent from this
          prototype.
        </Typography>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Roles & permissions
 * ------------------------------------------------------------------------- */

function RolesOverview() {
  return (
    <section aria-labelledby='roles-heading' className='space-y-3'>
      <div className='flex flex-wrap items-end justify-between gap-2'>
        <div className='min-w-0'>
          <Typography
            as='h2'
            id='roles-heading'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Roles &amp; Permissions
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c0'
            className='mt-0.5 text-gray-500'
          >
            Intended access model for the HMTC CMS
          </Typography>
        </div>
        <span className='inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5'>
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

      <ul className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        {ROLES.map(({ name, icon: Icon, description, permissions }) => (
          <li key={name} className='h-full'>
            <Card className='flex h-full flex-col gap-0 rounded-xl border-gray-200 bg-white p-4 shadow-none'>
              <div className='flex items-start justify-between gap-2'>
                <Typography
                  as='h3'
                  font='satoshi'
                  weight='semibold'
                  variant='h5'
                  className='text-gray-900'
                >
                  {name}
                </Typography>
                <span className='flex size-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500'>
                  <Icon
                    className='size-3.5'
                    strokeWidth={1.75}
                    aria-hidden='true'
                  />
                </span>
              </div>

              <Typography
                as='p'
                font='satoshi'
                variant='c2'
                className='mt-1.5 leading-4 text-gray-500'
              >
                {description}
              </Typography>

              <ul className='mt-3 space-y-1.5 border-t border-gray-100 pt-3'>
                {permissions.map((permission) => (
                  <li key={permission} className='flex items-start gap-1.5'>
                    <CircleCheck
                      className='mt-0.5 size-3 shrink-0 text-green-600'
                      strokeWidth={2}
                      aria-hidden='true'
                    />
                    <Typography
                      as='span'
                      font='satoshi'
                      variant='c2'
                      className='leading-4 text-gray-600'
                    >
                      {permission}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SecurityNote() {
  return (
    <div className='flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5'>
      <ShieldCheck
        className='mt-px size-4 shrink-0 text-gray-500'
        strokeWidth={1.75}
        aria-hidden='true'
      />
      <Typography
        as='p'
        font='satoshi'
        variant='b4'
        className='leading-5 text-gray-600'
      >
        Users can only manage content permitted by their assigned role and
        department. Actual access restrictions are enforced by the CMS backend.
      </Typography>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function UsersAndRolesPage() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <MobileNav />

      <div className='lg:flex'>
        <Sidebar />

        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar />

          <main className='mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8'>
            <PageHeading />

            <section aria-label='User summary'>
              <ul className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
                {METRICS.map((metric) => (
                  <li key={metric.label} className='h-full'>
                    <SummaryMetric metric={metric} />
                  </li>
                ))}
              </ul>
            </section>

            <UserDirectory />

            <div className='grid items-start gap-5 lg:grid-cols-3'>
              <div className='min-w-0 lg:col-span-2'>
                <SelectedUserPanel />
              </div>
              <div className='min-w-0 lg:col-span-1'>
                <PendingInvitations />
              </div>
            </div>

            <RolesOverview />

            <SecurityNote />
          </main>
        </div>
      </div>
    </div>
  );
}
