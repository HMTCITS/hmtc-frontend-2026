/**
 * HMTC CMS — Media Library UI reference (static design prototype).
 *
 * Scope: visual reference only. No Directus, GrapesJS, API, auth, uploads,
 * file handling or persistence. Every control is a placeholder that renders
 * from the typed mock data in this file.
 *
 * Thumbnails are generated from Tailwind gradients + inline SVG so the page
 * ships no new image files and makes no external requests.
 *
 * Visual language follows the sibling references (../dashboard.tsx,
 * ../content/page.tsx, ../reviews/page.tsx) and DESIGN.md §8 (L4 Admin).
 */

import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCheck,
  Copy,
  Ellipsis,
  FileSpreadsheet,
  FileText,
  HardDrive,
  History,
  Images,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  List,
  Menu,
  Palette,
  PanelLeftClose,
  Rocket,
  Search,
  Trash2,
  Upload,
  UsersRound,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Media Library — Page Builder Sandbox',
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

const ACTIVE_NAV_ITEM = 'Media Library';

type StorageMetric = {
  label: string;
  value: string;
};

const STORAGE_METRICS: readonly StorageMetric[] = [
  { label: 'Total Assets', value: '128' },
  { label: 'Images', value: '104' },
  { label: 'Documents', value: '16' },
  { label: 'Other Files', value: '8' },
];

const STORAGE_USED = '640 MB';
const STORAGE_AVAILABLE = '1 GB';
/** 640 MB of 1 GB — illustrative only. */
const STORAGE_BAR_WIDTH = 'w-3/5';

const TYPE_OPTIONS = [
  'All Types',
  'Images',
  'Documents',
  'Other Files',
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
  'Name A–Z',
  'Largest First',
] as const;

type AssetKind = 'image' | 'pdf' | 'spreadsheet';

type PreviewPattern = 'arcs' | 'orb' | 'bars' | 'grid' | 'wave';

type AssetPreview = {
  /** Literal Tailwind gradient stop classes. */
  gradient: string;
  pattern: PreviewPattern;
  caption?: string;
};

type MediaAsset = {
  id: string;
  fileName: string;
  kind: AssetKind;
  typeLabel: string;
  extension: string;
  dimensions?: string;
  size: string;
  department: string;
  uploadedBy: string;
  uploaded: string;
  usedIn: string;
  alt: string;
  preview?: AssetPreview;
};

const MEDIA_ASSETS: readonly MediaAsset[] = [
  {
    id: 'media-001',
    fileName: 'seminar-dosen-banner.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1920 × 1080',
    size: '1.8 MB',
    department: 'Keprofesian',
    uploadedBy: 'Alya Pratama',
    uploaded: '18 Oct 2026',
    usedIn: 'Seminar Dosen 2026',
    alt: 'Banner for Seminar Dosen 2026',
    preview: {
      gradient: 'from-navy via-french-blue to-cerulean-blue',
      pattern: 'arcs',
      caption: 'Seminar Dosen',
    },
  },
  {
    id: 'media-002',
    fileName: 'syukuran-wisudawan-cover.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1600 × 900',
    size: '1.4 MB',
    department: 'Keprofesian',
    uploadedBy: 'Bima Saputra',
    uploaded: '18 Oct 2026',
    usedIn: 'Syukuran Wisudawan',
    alt: 'Cover image for Syukuran Wisudawan',
    preview: {
      gradient: 'from-amber-700 via-orange-500 to-amber-300',
      pattern: 'orb',
      caption: 'Syukuran Wisudawan',
    },
  },
  {
    id: 'media-003',
    fileName: 'workshop-ui-ux-poster.png',
    kind: 'image',
    typeLabel: 'PNG Image',
    extension: 'PNG',
    dimensions: '1080 × 1350',
    size: '980 KB',
    department: 'Keprofesian',
    uploadedBy: 'Alya Pratama',
    uploaded: '17 Oct 2026',
    usedIn: 'Workshop UI/UX',
    alt: 'Poster for the UI/UX workshop',
    preview: {
      gradient: 'from-indigo-700 via-purple-600 to-indigo-400',
      pattern: 'bars',
      caption: 'Workshop UI/UX',
    },
  },
  {
    id: 'media-004',
    fileName: 'hmtc-anniversary-banner.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1920 × 1080',
    size: '2.1 MB',
    department: 'Internal',
    uploadedBy: 'Rizky Aditya',
    uploaded: '14 Oct 2026',
    usedIn: 'HMTC Anniversary',
    alt: 'Banner for the HMTC anniversary',
    preview: {
      gradient: 'from-slate-900 via-navy to-french-blue',
      pattern: 'wave',
      caption: 'HMTC Anniversary',
    },
  },
  {
    id: 'media-005',
    fileName: 'company-visit-gallery-01.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1600 × 1067',
    size: '1.2 MB',
    department: 'Hubungan Luar',
    uploadedBy: 'Fajar Ramadhan',
    uploaded: '11 Oct 2026',
    usedIn: 'Company Visit 2026',
    alt: 'Photo from the 2026 company visit',
    preview: {
      gradient: 'from-teal-800 via-emerald-600 to-emerald-400',
      pattern: 'grid',
    },
  },
  {
    id: 'media-006',
    fileName: 'open-recruitment-poster.png',
    kind: 'image',
    typeLabel: 'PNG Image',
    extension: 'PNG',
    dimensions: '1080 × 1350',
    size: '850 KB',
    department: 'PSDM',
    uploadedBy: 'Dinda Maharani',
    uploaded: '14 Oct 2026',
    usedIn: 'Open Recruitment Staff',
    alt: 'Poster for open recruitment of staff',
    preview: {
      gradient: 'from-rose-700 via-red-500 to-orange-400',
      pattern: 'orb',
      caption: 'Open Recruitment',
    },
  },
  {
    id: 'media-007',
    fileName: 'study-jam-cover.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1600 × 900',
    size: '1.1 MB',
    department: 'Keilmiahan',
    uploadedBy: 'Nadia Putri',
    uploaded: '12 Oct 2026',
    usedIn: 'Study Jam Informatika',
    alt: 'Cover image for Study Jam Informatika',
    preview: {
      gradient: 'from-emerald-800 via-teal-600 to-cyan-400',
      pattern: 'arcs',
      caption: 'Study Jam',
    },
  },
  {
    id: 'media-008',
    fileName: 'tech-talk-ai-thumbnail.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1280 × 720',
    size: '720 KB',
    department: 'Keilmiahan',
    uploadedBy: 'Nadia Putri',
    uploaded: '10 Oct 2026',
    usedIn: 'Tech Talk: AI',
    alt: 'Thumbnail for the Tech Talk on AI',
    preview: {
      gradient: 'from-blue-900 via-indigo-700 to-sky-500',
      pattern: 'grid',
      caption: 'Tech Talk: AI',
    },
  },
  {
    id: 'media-009',
    fileName: 'department-profile-photo.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1400 × 933',
    size: '900 KB',
    department: 'Keprofesian',
    uploadedBy: 'Alya Pratama',
    uploaded: '8 Oct 2026',
    usedIn: 'Department Introduction',
    alt: 'Profile photo of the Keprofesian department',
    preview: {
      gradient: 'from-gray-700 via-slate-500 to-gray-400',
      pattern: 'wave',
    },
  },
  {
    id: 'media-010',
    fileName: 'event-documentation-02.jpg',
    kind: 'image',
    typeLabel: 'JPEG Image',
    extension: 'JPG',
    dimensions: '1600 × 1067',
    size: '1.5 MB',
    department: 'Internal',
    uploadedBy: 'Rizky Aditya',
    uploaded: '6 Oct 2026',
    usedIn: 'HMTC Anniversary',
    alt: 'Second documentation photo from an HMTC event',
    preview: {
      gradient: 'from-amber-900 via-amber-700 to-yellow-500',
      pattern: 'bars',
    },
  },
  {
    id: 'media-011',
    fileName: 'proposal-seminar.pdf',
    kind: 'pdf',
    typeLabel: 'PDF Document',
    extension: 'PDF',
    size: '2.4 MB',
    department: 'Keprofesian',
    uploadedBy: 'Bima Saputra',
    uploaded: '16 Oct 2026',
    usedIn: 'Seminar Dosen 2026',
    alt: 'Proposal document for Seminar Dosen 2026',
  },
  {
    id: 'media-012',
    fileName: 'event-budget-template.xlsx',
    kind: 'spreadsheet',
    typeLabel: 'XLSX Spreadsheet',
    extension: 'XLSX',
    size: '120 KB',
    department: 'Internal',
    uploadedBy: 'Rizky Aditya',
    uploaded: '12 Oct 2026',
    usedIn: 'Event planning',
    alt: 'Spreadsheet template for event budgets',
  },
];

const SELECTED_ASSET_ID = 'media-001';

const SELECTED_ASSET =
  MEDIA_ASSETS.find((asset) => asset.id === SELECTED_ASSET_ID) ??
  MEDIA_ASSETS[0];

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
                  Media Library
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
            Media Library
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
          Media Library
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='mt-1 max-w-2xl leading-5 text-gray-500'
        >
          Browse and organize images and other assets used across your
          department&apos;s pages.
        </Typography>
      </div>

      <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
        <Button
          type='button'
          className='h-9 w-full gap-1.5 rounded-lg bg-navy px-3.5 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30 sm:w-auto'
        >
          <Upload className='size-4' aria-hidden='true' />
          Upload Media
        </Button>

        <Button
          type='button'
          variant='outline'
          className='h-9 w-full gap-1.5 rounded-lg border-gray-200 bg-white px-3.5 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50 sm:w-auto'
        >
          <Check className='size-4' aria-hidden='true' />
          Select Media
        </Button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Storage summary
 * ------------------------------------------------------------------------- */

function StorageSummary() {
  return (
    <section aria-label='Storage summary'>
      <Card className='gap-0 rounded-xl border-gray-200 bg-white px-4 py-3 shadow-none'>
        <div className='flex flex-wrap items-center gap-x-6 gap-y-3'>
          {STORAGE_METRICS.map((metric) => (
            <div key={metric.label} className='min-w-20'>
              <Typography
                as='p'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='tracking-[0.06em] text-gray-500 uppercase'
              >
                {metric.label}
              </Typography>
              <Typography
                as='p'
                font='satoshi'
                weight='semibold'
                variant='s1'
                className='mt-0.5 leading-none text-gray-900 tabular-nums'
              >
                {metric.value}
              </Typography>
            </div>
          ))}

          <div className='flex min-w-0 flex-1 items-center gap-3 sm:justify-end'>
            <span className='flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500'>
              <HardDrive
                className='size-3.5'
                strokeWidth={1.75}
                aria-hidden='true'
              />
            </span>
            <div className='min-w-0'>
              <Typography
                as='p'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='tracking-[0.06em] text-gray-500 uppercase'
              >
                Storage
              </Typography>
              <div className='mt-0.5 flex items-center gap-2'>
                <Typography
                  as='p'
                  font='satoshi'
                  weight='medium'
                  variant='c0'
                  className='whitespace-nowrap text-gray-700'
                >
                  {STORAGE_USED}{' '}
                  <span className='font-normal text-gray-500'>
                    of {STORAGE_AVAILABLE} used
                  </span>
                </Typography>
                <span
                  aria-hidden='true'
                  className='h-1.5 w-16 overflow-hidden rounded-full bg-gray-100'
                >
                  <span
                    className={cn(
                      'block h-full rounded-full bg-navy',
                      STORAGE_BAR_WIDTH,
                    )}
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Upload panel
 * ------------------------------------------------------------------------- */

function UploadPanel() {
  return (
    <div className='flex flex-col gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-0 items-center gap-3'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500'>
          <Upload className='size-4' strokeWidth={1.75} aria-hidden='true' />
        </span>
        <div className='min-w-0'>
          <Typography
            as='p'
            font='satoshi'
            weight='medium'
            variant='s3'
            className='text-gray-900'
          >
            Upload media
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='mt-0.5 text-gray-500'
          >
            Drag files here or browse to upload
          </Typography>
        </div>
      </div>

      <div className='min-w-0 sm:text-right'>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-gray-500'
        >
          JPG, PNG, WebP, SVG, PDF
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='mt-0.5 text-gray-500'
        >
          Maximum 10 MB per file
        </Typography>
      </div>
    </div>
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

function MediaToolbar() {
  return (
    <div className='flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 lg:flex-row lg:items-center lg:justify-between'>
      <div className='relative w-full lg:max-w-xs'>
        <Search
          className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400'
          strokeWidth={1.75}
          aria-hidden='true'
        />
        <input
          type='search'
          aria-label='Search files by name'
          placeholder='Search files by name...'
          autoComplete='off'
          className='h-9 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm text-gray-900 transition-colors placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none'
        />
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <div className='grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center'>
          <SelectControl
            label='File type'
            defaultValue='All Types'
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

        <div
          role='group'
          aria-label='View mode'
          className='inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5'
        >
          <button
            type='button'
            aria-pressed='true'
            aria-label='Grid view'
            className='flex size-7 items-center justify-center rounded-md bg-navy/5 text-navy focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
          >
            <LayoutGrid
              className='size-4'
              strokeWidth={1.75}
              aria-hidden='true'
            />
          </button>
          <button
            type='button'
            aria-pressed='false'
            aria-label='List view'
            className='flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
          >
            <List className='size-4' strokeWidth={1.75} aria-hidden='true' />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Thumbnails
 * ------------------------------------------------------------------------- */

function PatternArt({ pattern }: { pattern: PreviewPattern }) {
  return (
    <svg
      viewBox='0 0 160 120'
      preserveAspectRatio='xMidYMid slice'
      aria-hidden='true'
      className='absolute inset-0 size-full'
    >
      {pattern === 'arcs' && (
        <g fill='none' strokeWidth={9} className='stroke-white/20'>
          <circle cx='134' cy='112' r='64' />
          <circle cx='134' cy='112' r='40' />
          <circle cx='134' cy='112' r='18' />
        </g>
      )}

      {pattern === 'orb' && (
        <g>
          <circle cx='120' cy='30' r='44' className='fill-white/15' />
          <circle cx='38' cy='98' r='26' className='fill-white/10' />
          <path d='M0 76 L96 12' strokeWidth={12} className='stroke-white/10' />
        </g>
      )}

      {pattern === 'bars' && (
        <g className='fill-white/15'>
          <rect x='18' y='62' width='16' height='58' rx='8' />
          <rect x='44' y='40' width='16' height='80' rx='8' />
          <rect x='70' y='70' width='16' height='50' rx='8' />
          <rect x='96' y='26' width='16' height='94' rx='8' />
          <rect x='122' y='54' width='16' height='66' rx='8' />
        </g>
      )}

      {pattern === 'grid' && (
        <g strokeWidth={10} className='stroke-white/12'>
          <path d='M-30 30 L50 -30' />
          <path d='M-10 90 L110 -10' />
          <path d='M50 130 L170 30' />
          <path d='M110 140 L190 60' />
        </g>
      )}

      {pattern === 'wave' && (
        <g>
          <path
            d='M0 96 C 32 60, 62 112, 96 78 S 140 52, 160 64 L160 120 L0 120 Z'
            className='fill-white/12'
          />
          <path
            d='M0 108 C 40 82, 70 122, 104 94 S 142 76, 160 86'
            fill='none'
            strokeWidth={6}
            className='stroke-white/15'
          />
        </g>
      )}
    </svg>
  );
}

function DocumentPreview({ asset }: { asset: MediaAsset }) {
  const isPdf = asset.kind === 'pdf';

  return (
    <div
      aria-hidden='true'
      className='absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gray-50'
    >
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-lg border',
          isPdf
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-green-200 bg-green-50 text-green-700',
        )}
      >
        {isPdf ? (
          <FileText className='size-4' strokeWidth={1.75} />
        ) : (
          <FileSpreadsheet className='size-4' strokeWidth={1.75} />
        )}
      </span>
      <Typography
        as='span'
        font='satoshi'
        weight='medium'
        variant='c2'
        className='tracking-[0.08em] text-gray-500 uppercase'
      >
        {asset.extension}
      </Typography>
    </div>
  );
}

function AssetPreview({
  asset,
  className,
}: {
  asset: MediaAsset;
  className?: string;
}) {
  if (!asset.preview) {
    return (
      <div className={cn('relative', className)}>
        <DocumentPreview asset={asset} />
      </div>
    );
  }

  const { gradient, pattern, caption } = asset.preview;

  return (
    <div
      role='img'
      aria-label={asset.alt}
      className={cn('relative', className)}
    >
      <div
        aria-hidden='true'
        className={cn('absolute inset-0 bg-gradient-to-br', gradient)}
      >
        <PatternArt pattern={pattern} />
        {caption && (
          <>
            <span className='absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/35 to-transparent' />
            <Typography
              as='span'
              font='satoshi'
              weight='semibold'
              variant='c2'
              className='absolute bottom-2 left-2.5 max-w-[calc(100%-1.25rem)] truncate tracking-[0.1em] text-white/95 uppercase'
            >
              {caption}
            </Typography>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Media grid
 * ------------------------------------------------------------------------- */

function MediaCard({ asset }: { asset: MediaAsset }) {
  const isSelected = asset.id === SELECTED_ASSET_ID;

  return (
    <li
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-white transition-colors',
        isSelected
          ? 'border-navy/30 ring-2 ring-navy/20'
          : 'border-gray-200 hover:border-gray-300',
      )}
    >
      <button
        type='button'
        aria-label={`View ${asset.fileName}`}
        aria-pressed={isSelected}
        className='block w-full text-left focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none focus-visible:ring-inset'
      >
        <div className='relative aspect-[4/3] overflow-hidden bg-gray-100'>
          <AssetPreview asset={asset} className='absolute inset-0' />
          {isSelected && (
            <span className='absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-navy px-1.5 py-0.5'>
              <Check
                className='size-3 text-white'
                strokeWidth={2.5}
                aria-hidden='true'
              />
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='leading-none text-white'
              >
                Selected
              </Typography>
            </span>
          )}
        </div>

        <div className='p-2.5'>
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='s3'
            className='block truncate text-gray-900'
          >
            {asset.fileName}
          </Typography>
          <span className='mt-1 flex items-center gap-1.5'>
            <span className='inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-px'>
              <Typography
                as='span'
                font='satoshi'
                variant='c2'
                className='leading-none text-gray-600'
              >
                {asset.extension}
              </Typography>
            </span>
            <Typography
              as='span'
              font='satoshi'
              variant='c2'
              className='truncate text-gray-500'
            >
              {asset.size}
            </Typography>
          </span>
          <Typography
            as='span'
            font='satoshi'
            variant='c2'
            className='mt-1 block truncate text-gray-500'
          >
            {asset.department}
          </Typography>
        </div>
      </button>

      <button
        type='button'
        aria-label={`More actions for ${asset.fileName}`}
        className='absolute top-2 right-2 flex size-7 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
      >
        <Ellipsis className='size-4' strokeWidth={1.75} aria-hidden='true' />
      </button>
    </li>
  );
}

function MediaGrid() {
  return (
    <section aria-label='Media assets' className='space-y-3'>
      <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
        {MEDIA_ASSETS.map((asset) => (
          <MediaCard key={asset.id} asset={asset} />
        ))}
      </ul>

      <div className='flex flex-wrap items-center justify-between gap-2 px-0.5'>
        <Typography
          as='p'
          font='satoshi'
          variant='c0'
          className='text-gray-500'
        >
          Showing{' '}
          <span className='font-medium text-gray-900'>
            {MEDIA_ASSETS.length}
          </span>{' '}
          of{' '}
          <span className='font-medium text-gray-900'>
            {STORAGE_METRICS[0].value}
          </span>{' '}
          assets
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-gray-500'
        >
          Grid view · newest first
        </Typography>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
 * Selected asset details
 * ------------------------------------------------------------------------- */

const ASSET_ACTIONS: readonly { label: string; icon: LucideIcon }[] = [
  { label: 'Copy URL', icon: Copy },
  { label: 'Replace File', icon: Upload },
];

function AssetDetails({ asset }: { asset: MediaAsset }) {
  const meta = [
    { label: 'Type', value: asset.typeLabel },
    { label: 'Dimensions', value: asset.dimensions ?? '—' },
    { label: 'File size', value: asset.size },
    { label: 'Department', value: asset.department },
    { label: 'Uploaded by', value: asset.uploadedBy },
    { label: 'Uploaded', value: asset.uploaded },
    { label: 'Used in', value: asset.usedIn },
  ];

  return (
    <Card
      aria-labelledby='asset-details-heading'
      className='gap-0 overflow-hidden rounded-xl border-gray-200 py-0 shadow-none xl:sticky xl:top-24'
    >
      <div className='flex items-center justify-between gap-2 border-b border-gray-100 px-4 py-3'>
        <Typography
          as='h2'
          id='asset-details-heading'
          font='satoshi'
          weight='semibold'
          variant='h5'
          className='text-gray-900'
        >
          Asset details
        </Typography>
        <span className='inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5'>
          <Typography
            as='span'
            font='satoshi'
            variant='c2'
            className='leading-none text-gray-600'
          >
            {asset.extension}
          </Typography>
        </span>
      </div>

      <div className='px-4 py-4'>
        <div className='overflow-hidden rounded-lg border border-gray-200 bg-gray-100'>
          <AssetPreview asset={asset} className='aspect-video' />
        </div>

        <Typography
          as='p'
          font='satoshi'
          weight='medium'
          variant='s3'
          className='mt-3 break-words text-gray-900'
        >
          {asset.fileName}
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='mt-0.5 text-gray-500'
        >
          {asset.typeLabel}
          {asset.dimensions ? ` · ${asset.dimensions}` : ''} · {asset.size}
        </Typography>

        <dl className='mt-4 space-y-2 border-t border-gray-100 pt-3'>
          {meta.map((item) => (
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

        <div className='mt-3 rounded-lg border border-gray-200 bg-gray-50/60 p-3'>
          <Typography
            as='p'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='tracking-[0.06em] text-gray-500 uppercase'
          >
            Alt text
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='mt-1 leading-4 text-gray-700'
          >
            {asset.alt}
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='mt-2 text-gray-500'
          >
            Asset ID · {asset.id}
          </Typography>
        </div>

        <div className='mt-3 grid grid-cols-2 gap-2'>
          {ASSET_ACTIONS.map(({ label, icon: Icon }) => (
            <Button
              key={label}
              type='button'
              variant='outline'
              size='sm'
              className='h-8 gap-1.5 rounded-md border-gray-200 bg-white px-2 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50'
            >
              <Icon className='size-3.5' aria-hidden='true' />
              {label}
            </Button>
          ))}
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='mt-2 h-8 w-full gap-1.5 rounded-md border-red-200 bg-white px-2 font-medium text-red-700 shadow-none hover:border-red-300 hover:bg-red-50'
        >
          <Trash2 className='size-3.5' aria-hidden='true' />
          Delete Asset
        </Button>

        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='mt-2 leading-4 text-gray-500'
        >
          Actions are visual only. This prototype does not modify, replace or
          delete assets.
        </Typography>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function MediaLibraryPage() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <MobileNav />

      <div className='lg:flex'>
        <Sidebar />

        <div className='flex min-w-0 flex-1 flex-col'>
          <TopBar />

          <main className='mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-6 sm:px-6 lg:px-8'>
            <PageHeading />

            <StorageSummary />

            <div className='grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]'>
              <div className='min-w-0 space-y-4'>
                <UploadPanel />
                <MediaToolbar />
                <MediaGrid />
              </div>

              <AssetDetails asset={SELECTED_ASSET} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
