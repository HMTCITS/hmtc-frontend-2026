/**
 * HMTC CMS — Page Preview UI reference (static design prototype).
 *
 * Scope: visual reference only. No Directus, GrapesJS, API, auth, publishing,
 * preview tokens or clipboard access. Every control is a placeholder.
 *
 * Two layers:
 *  1. The CMS chrome (sidebar + compact preview toolbar) in the L4 admin style
 *     used by the sibling references.
 *  2. A mock public HMTC event page (L1 canonical: black surfaces, thin
 *     Helvetica Neue display type, one cerulean accent) rendered inside a
 *     framed canvas.
 */

import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ChevronRight,
  ChevronsUpDown,
  ClipboardCheck,
  Clock,
  FileText,
  History,
  Images,
  Info,
  LayoutDashboard,
  LayoutTemplate,
  MapPin,
  Menu,
  Monitor,
  Palette,
  PanelLeftClose,
  PencilLine,
  Rocket,
  Share2,
  Smartphone,
  Tablet,
  UsersRound,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { helveticaNeue } from '@/lib/font';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Page Preview — Page Builder Sandbox',
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

/** The preview workspace is not a sidebar destination. */
const ACTIVE_NAV_ITEM: string | null = null;

const EVENT = {
  title: 'Syukuran Wisudawan',
  eyebrow: 'Program Kerja HMTC ITS',
  description:
    'Merayakan perjalanan, pencapaian, dan langkah baru para wisudawan Teknik Informatika ITS.',
  date: 'Sabtu, 24 Oktober 2026',
  time: '09.00–12.00 WIB',
  location: 'Departemen Teknik Informatika ITS',
  organizer: 'Departemen Keprofesian HMTC ITS',
} as const;

const PUBLIC_NAV: readonly string[] = [
  'Beranda',
  'Tentang',
  'Program Kerja',
  'Kontak',
];

const EVENT_META: readonly {
  icon: LucideIcon;
  label: string;
  value: string;
}[] = [
  { icon: CalendarDays, label: 'Tanggal', value: EVENT.date },
  { icon: Clock, label: 'Waktu', value: EVENT.time },
  { icon: MapPin, label: 'Lokasi', value: EVENT.location },
];

const ABOUT_TEXT =
  'Syukuran Wisudawan merupakan momen kebersamaan untuk merayakan pencapaian mahasiswa Teknik Informatika ITS yang telah menyelesaikan perjalanan akademiknya. Kegiatan ini menjadi ruang untuk berbagi cerita, mempererat hubungan antarmahasiswa, dan menyambut langkah baru setelah kelulusan.';

const EVENT_INFO: readonly {
  icon: LucideIcon;
  label: string;
  value: string;
}[] = [
  { icon: CalendarDays, label: 'Tanggal', value: EVENT.date },
  { icon: Clock, label: 'Waktu', value: EVENT.time },
  { icon: MapPin, label: 'Lokasi', value: EVENT.location },
  { icon: Building2, label: 'Penyelenggara', value: EVENT.organizer },
];

const AGENDA: readonly { time: string; title: string }[] = [
  { time: '09.00', title: 'Registrasi peserta' },
  { time: '09.30', title: 'Pembukaan' },
  { time: '10.00', title: 'Sambutan dan apresiasi wisudawan' },
  { time: '11.00', title: 'Dokumentasi dan ramah tamah' },
  { time: '12.00', title: 'Penutupan' },
];

type GalleryVariant = 'cap' | 'confetti' | 'stage' | 'crowd';

const GALLERY: readonly { variant: GalleryVariant; alt: string }[] = [
  { variant: 'cap', alt: 'Ilustrasi toga wisudawan' },
  { variant: 'confetti', alt: 'Ilustrasi konfeti perayaan wisuda' },
  { variant: 'stage', alt: 'Ilustrasi panggung acara syukuran' },
  { variant: 'crowd', alt: 'Ilustrasi kebersamaan peserta acara' },
];

const VIEWPORTS: readonly {
  label: string;
  icon: LucideIcon;
  active: boolean;
}[] = [
  { label: 'Desktop', icon: Monitor, active: true },
  { label: 'Tablet', icon: Tablet, active: false },
  { label: 'Mobile', icon: Smartphone, active: false },
];

/* ---------------------------------------------------------------------------
 * CMS chrome primitives
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
 * Preview toolbar
 * ------------------------------------------------------------------------- */

function DraftBadge() {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800'>
      <PencilLine
        className='size-3 shrink-0'
        strokeWidth={2}
        aria-hidden='true'
      />
      <Typography
        as='span'
        font='satoshi'
        weight='medium'
        variant='c2'
        className='leading-none'
      >
        Draft
      </Typography>
    </span>
  );
}

function ViewportSwitch() {
  return (
    <div
      role='group'
      aria-label='Preview viewport'
      className='inline-flex shrink-0 items-center gap-0.5 self-start rounded-lg border border-gray-200 bg-white p-0.5 lg:self-auto'
    >
      {VIEWPORTS.map(({ label, icon: Icon, active }) => (
        <button
          key={label}
          type='button'
          aria-pressed={active}
          aria-label={`${label} preview`}
          className={cn(
            'flex size-7 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none',
            active
              ? 'bg-navy/5 text-navy'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
          )}
        >
          <Icon className='size-4' strokeWidth={1.75} aria-hidden='true' />
        </button>
      ))}
    </div>
  );
}

function PreviewToolbar() {
  return (
    <header className='sticky top-0 z-30 border-b border-gray-200 bg-white'>
      <div className='flex flex-col gap-2.5 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-8'>
        <div className='min-w-0'>
          <nav aria-label='Breadcrumb'>
            <ol className='flex items-center gap-1.5'>
              <li className='hidden sm:block'>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-gray-500'
                >
                  Posts &amp; Pages
                </Typography>
              </li>
              <li aria-hidden='true' className='hidden sm:block'>
                <ChevronRight
                  className='size-3 text-gray-400'
                  strokeWidth={2}
                />
              </li>
              <li className='min-w-0'>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='block truncate text-gray-500'
                >
                  Syukuran Wisudawan
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
                  Preview
                </Typography>
              </li>
            </ol>
          </nav>

          <div className='mt-0.5 flex flex-wrap items-center gap-2'>
            <Typography
              as='p'
              font='satoshi'
              weight='semibold'
              variant='s1'
              className='text-gray-900'
            >
              Preview
            </Typography>
            <DraftBadge />
            <Typography
              as='span'
              font='satoshi'
              variant='c2'
              className='text-gray-500'
            >
              Last saved 18 Oct 2026, 08:15
            </Typography>
          </div>
        </div>

        <ViewportSwitch />

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-8 gap-1.5 rounded-lg border-gray-200 bg-white px-2.5 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50'
          >
            <ArrowLeft className='size-4' aria-hidden='true' />
            Back to Editor
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-8 gap-1.5 rounded-lg bg-navy px-2.5 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30'
          >
            <Share2 className='size-4' aria-hidden='true' />
            Share Preview
          </Button>
        </div>
      </div>
    </header>
  );
}

function PreviewContextStrip() {
  const meta = ['Event Page', 'Departemen Keprofesian', 'Updated 18 Oct 2026'];

  return (
    <div className='flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex min-w-0 items-start gap-2'>
        <Info
          className='mt-px size-3.5 shrink-0 text-amber-700'
          strokeWidth={1.75}
          aria-hidden='true'
        />
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='leading-5 text-amber-900'
        >
          Draft preview — only authorized users can view this unpublished page.
        </Typography>
      </div>

      <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
        {meta.map((item) => (
          <span
            key={item}
            className='inline-flex items-center rounded-full border border-amber-200 bg-white/70 px-2 py-0.5'
          >
            <Typography
              as='span'
              font='satoshi'
              variant='c2'
              className='leading-none text-amber-900'
            >
              {item}
            </Typography>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Public page — shared bits
 * ------------------------------------------------------------------------- */

function PublicButton({
  children,
  variant,
  className,
}: {
  children: ReactNode;
  variant: 'light' | 'ghost';
  className?: string;
}) {
  return (
    <button
      type='button'
      className={cn(
        'inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        variant === 'light'
          ? 'bg-white text-black hover:bg-white/90 focus-visible:ring-white/60 focus-visible:ring-offset-black'
          : 'border border-white/20 text-white/80 hover:border-white/40 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-black',
        className,
      )}
    >
      <Typography
        as='span'
        font='satoshi'
        weight='medium'
        variant='s3'
        className='leading-none'
      >
        {children}
      </Typography>
    </button>
  );
}

function PublicHeader() {
  return (
    <header className='border-b border-white/10 bg-black'>
      <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:px-8'>
        <div className='flex min-w-0 items-center gap-3'>
          <span
            aria-hidden='true'
            className='flex size-8 shrink-0 items-center justify-center rounded-sm bg-white'
          >
            <Typography
              as='span'
              font='helveticaNeue'
              weight='bold'
              variant='h5'
              className='text-black'
            >
              H
            </Typography>
          </span>
          <div className='min-w-0'>
            <Typography
              as='p'
              font='libre'
              weight='bold'
              variant='s3'
              className='truncate tracking-[0.16em] text-white uppercase'
            >
              HMTC <span className='text-cerulean-blue'>ITS</span>
            </Typography>
            <Typography
              as='p'
              font='satoshi'
              variant='c2'
              className='truncate text-white/50'
            >
              Himpunan Mahasiswa Teknik Computer-Informatika
            </Typography>
          </div>
        </div>

        <nav aria-label='Navigasi situs publik' className='hidden md:block'>
          <ul className='flex items-center gap-6'>
            {PUBLIC_NAV.map((item) => (
              <li key={item}>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='s3'
                  className='text-white/60'
                >
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </nav>

        <PublicButton variant='light' className='h-8 shrink-0 px-3.5'>
          Daftar Sekarang
        </PublicButton>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
 * Public page — hero artwork
 * ------------------------------------------------------------------------- */

function HeroArt() {
  return (
    <div
      role='img'
      aria-label='Ilustrasi banner Syukuran Wisudawan 2026'
      className='relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-navy via-black to-black'
    >
      <svg
        viewBox='0 0 480 360'
        preserveAspectRatio='xMidYMid slice'
        aria-hidden='true'
        className='absolute inset-0 size-full'
      >
        <g fill='none' strokeWidth={1.5} className='stroke-cerulean-blue/30'>
          <circle cx='392' cy='300' r='120' />
          <circle cx='392' cy='300' r='78' />
          <circle cx='392' cy='300' r='36' />
        </g>

        <text
          x='240'
          y='232'
          textAnchor='middle'
          fontSize='118'
          fill='white'
          fillOpacity='0.06'
          fontFamily='sans-serif'
          fontWeight='700'
        >
          2026
        </text>

        <g>
          <path
            d='M240 92 L344 134 L240 176 L136 134 Z'
            className='fill-white/10 stroke-white/30'
            strokeWidth={1.6}
          />
          <path
            d='M196 156 L196 196 C196 212 284 212 284 196 L284 156'
            fill='none'
            className='stroke-white/25'
            strokeWidth={1.6}
          />
          <path
            d='M344 134 L344 178'
            className='stroke-cerulean-blue'
            strokeWidth={1.6}
          />
          <circle cx='344' cy='184' r='4' className='fill-cerulean-blue' />
        </g>

        <g className='fill-white/20'>
          <circle cx='96' cy='64' r='2.5' />
          <circle cx='132' cy='44' r='2' />
          <circle cx='382' cy='72' r='2.5' />
          <circle cx='414' cy='104' r='2' />
          <circle cx='64' cy='268' r='2' />
        </g>
      </svg>

      <div className='absolute top-3 left-3 rounded-md border border-white/15 bg-black/40 px-2 py-1'>
        <Typography
          as='span'
          font='satoshi'
          weight='medium'
          variant='c2'
          className='tracking-[0.14em] text-white/70'
        >
          24 · 10 · 2026
        </Typography>
      </div>

      <div className='absolute inset-x-3 bottom-3 flex items-end justify-between gap-2'>
        <Typography
          as='span'
          font='satoshi'
          variant='c2'
          className='max-w-[70%] leading-4 text-white/50'
        >
          Teknik Informatika ITS
        </Typography>
        <Typography
          as='span'
          font='satoshi'
          weight='medium'
          variant='c2'
          className='tracking-[0.14em] text-white/70 uppercase'
        >
          Syukuran
        </Typography>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Public page — sections
 * ------------------------------------------------------------------------- */

function PublicHero() {
  return (
    <section className='relative overflow-hidden bg-black'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -top-32 -right-24 size-80 rounded-full bg-cerulean-blue/10'
      />
      <div className='relative mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-16'>
        <div className='min-w-0'>
          <Typography
            as='p'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='tracking-[0.22em] text-cerulean-blue uppercase'
          >
            {EVENT.eyebrow}
          </Typography>

          <Typography
            as='h2'
            font='helveticaNeue'
            weight='thin'
            variant='k2'
            className='mt-3 leading-[1.05] text-white'
          >
            {EVENT.title}
          </Typography>

          <Typography
            as='p'
            font='satoshi'
            variant='b2'
            className='mt-4 max-w-md leading-7 text-white/60'
          >
            {EVENT.description}
          </Typography>

          <dl className='mt-6 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3'>
            {EVENT_META.map(({ icon: Icon, label, value }) => (
              <div key={label} className='min-w-0'>
                <dt className='flex items-center gap-1.5'>
                  <Icon
                    className='size-3.5 shrink-0 text-white/40'
                    strokeWidth={1.75}
                    aria-hidden='true'
                  />
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='c2'
                    className='tracking-[0.08em] text-white/40 uppercase'
                  >
                    {label}
                  </Typography>
                </dt>
                <dd className='mt-1'>
                  <Typography
                    as='span'
                    font='satoshi'
                    weight='medium'
                    variant='c0'
                    className='block text-white/80'
                  >
                    {value}
                  </Typography>
                </dd>
              </div>
            ))}
          </dl>

          <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:items-center'>
            <PublicButton variant='light' className='h-10 px-5'>
              Lihat Informasi Acara
            </PublicButton>
            <PublicButton variant='ghost' className='h-10 px-5'>
              Bagikan Acara
            </PublicButton>
          </div>
        </div>

        <HeroArt />
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className='bg-white'>
      <div className='mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12 lg:py-14'>
        <div className='min-w-0'>
          <Typography
            as='h2'
            font='helveticaNeue'
            weight='light'
            variant='j2'
            className='text-text-black'
          >
            Tentang Acara
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b1'
            className='mt-3 max-w-prose leading-8 text-gray-600'
          >
            {ABOUT_TEXT}
          </Typography>
        </div>

        <aside
          aria-label='Informasi acara'
          className='h-fit rounded-lg border border-gray-200 bg-gray-50/70 p-4'
        >
          <Typography
            as='h3'
            font='satoshi'
            weight='semibold'
            variant='h5'
            className='text-gray-900'
          >
            Informasi Acara
          </Typography>

          <dl className='mt-3 space-y-3'>
            {EVENT_INFO.map(({ icon: Icon, label, value }) => (
              <div key={label} className='flex items-start gap-2.5'>
                <span className='mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500'>
                  <Icon
                    className='size-3'
                    strokeWidth={1.75}
                    aria-hidden='true'
                  />
                </span>
                <div className='min-w-0'>
                  <dt>
                    <Typography
                      as='span'
                      font='satoshi'
                      variant='c2'
                      className='tracking-[0.06em] text-gray-500 uppercase'
                    >
                      {label}
                    </Typography>
                  </dt>
                  <dd>
                    <Typography
                      as='span'
                      font='satoshi'
                      weight='medium'
                      variant='c0'
                      className='mt-0.5 block leading-4 text-gray-800'
                    >
                      {value}
                    </Typography>
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}

function AgendaSection() {
  return (
    <section className='border-y border-gray-100 bg-gray-50'>
      <div className='mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:py-14'>
        <Typography
          as='h2'
          font='helveticaNeue'
          weight='light'
          variant='j2'
          className='text-text-black'
        >
          Rangkaian Acara
        </Typography>

        <ol className='mt-5 max-w-2xl'>
          {AGENDA.map((item, index) => {
            const isLast = index === AGENDA.length - 1;

            return (
              <li key={item.time} className='flex gap-3'>
                <span
                  aria-hidden='true'
                  className='relative flex w-3 shrink-0 justify-center'
                >
                  <span className='mt-1.5 size-2.5 rounded-full bg-french-blue' />
                  {!isLast && (
                    <span className='absolute top-5 bottom-0 w-px bg-gray-200' />
                  )}
                </span>

                <div className='flex min-w-0 flex-1 flex-wrap items-baseline gap-x-4 pb-5'>
                  <Typography
                    as='span'
                    font='satoshi'
                    weight='medium'
                    variant='s3'
                    className='w-12 text-gray-900 tabular-nums'
                  >
                    {item.time}
                  </Typography>
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='b4'
                    className='text-gray-600'
                  >
                    {item.title}
                  </Typography>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function GalleryTile({
  variant,
  alt,
}: {
  variant: GalleryVariant;
  alt: string;
}) {
  const gradients: Record<GalleryVariant, string> = {
    cap: 'from-navy via-black to-black',
    confetti: 'from-french-blue via-navy to-black',
    stage: 'from-black via-navy to-french-blue',
    crowd: 'from-black via-black to-navy',
  };

  return (
    <div
      role='img'
      aria-label={alt}
      className={cn(
        'relative aspect-[4/3] overflow-hidden rounded-md border border-gray-200 bg-gradient-to-br',
        gradients[variant],
      )}
    >
      <svg
        viewBox='0 0 160 120'
        preserveAspectRatio='xMidYMid slice'
        aria-hidden='true'
        className='absolute inset-0 size-full'
      >
        {variant === 'cap' && (
          <g>
            <path
              d='M80 38 L124 56 L80 74 L36 56 Z'
              className='fill-white/15 stroke-white/30'
              strokeWidth={1.2}
            />
            <path
              d='M60 66 L60 82 C60 88 100 88 100 82 L100 66'
              fill='none'
              className='stroke-white/25'
              strokeWidth={1.2}
            />
          </g>
        )}

        {variant === 'confetti' && (
          <g className='fill-white/30'>
            <rect x='28' y='24' width='6' height='2' rx='1' />
            <rect x='58' y='16' width='6' height='2' rx='1' />
            <rect x='96' y='30' width='6' height='2' rx='1' />
            <rect x='124' y='18' width='6' height='2' rx='1' />
            <rect x='42' y='58' width='6' height='2' rx='1' />
            <rect x='110' y='62' width='6' height='2' rx='1' />
            <rect x='70' y='88' width='6' height='2' rx='1' />
            <circle cx='76' cy='46' r='2' />
            <circle cx='132' cy='70' r='1.6' />
            <circle cx='36' cy='90' r='1.6' />
          </g>
        )}

        {variant === 'stage' && (
          <g>
            <path d='M52 0 L30 120 L66 120 L78 0 Z' className='fill-white/8' />
            <path
              d='M112 0 L134 120 L98 120 L86 0 Z'
              className='fill-white/8'
            />
            <rect
              x='16'
              y='96'
              width='128'
              height='24'
              className='fill-black/40'
            />
            <circle cx='80' cy='52' r='12' className='fill-white/20' />
          </g>
        )}

        {variant === 'crowd' && (
          <g className='fill-white/15'>
            <circle cx='34' cy='72' r='9' />
            <circle cx='62' cy='64' r='9' />
            <circle cx='92' cy='72' r='9' />
            <circle cx='120' cy='62' r='9' />
            <rect x='22' y='80' width='24' height='40' rx='10' />
            <rect x='50' y='72' width='24' height='48' rx='10' />
            <rect x='80' y='80' width='24' height='40' rx='10' />
            <rect x='108' y='70' width='24' height='50' rx='10' />
          </g>
        )}
      </svg>
    </div>
  );
}

function GallerySection() {
  return (
    <section className='bg-white'>
      <div className='mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12 lg:py-14'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <Typography
            as='h2'
            font='helveticaNeue'
            weight='light'
            variant='j2'
            className='text-text-black'
          >
            Dokumentasi
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='text-gray-500'
          >
            Arsip Syukuran Wisudawan 2025
          </Typography>
        </div>

        <ul className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {GALLERY.map((tile) => (
            <li key={tile.variant}>
              <GalleryTile variant={tile.variant} alt={tile.alt} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className='bg-[#121212] px-5 py-12 text-center sm:px-8 lg:py-16'>
      <Typography
        as='h2'
        font='helveticaNeue'
        weight='thin'
        variant='j1'
        className='mx-auto max-w-2xl leading-tight text-white'
      >
        Sampai Jumpa di Perayaan Wisuda
      </Typography>
      <Typography
        as='p'
        font='satoshi'
        variant='b2'
        className='mx-auto mt-3 max-w-xl leading-7 text-white/60'
      >
        Bersama merayakan pencapaian dan menyambut perjalanan baru.
      </Typography>
      <div className='mt-5 flex justify-center'>
        <PublicButton variant='light' className='h-10 px-5'>
          Lihat Informasi Acara
        </PublicButton>
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className='bg-text-black'>
      <div className='mx-auto max-w-6xl px-5 py-10 sm:px-8'>
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]'>
          <div className='min-w-0'>
            <Typography
              as='p'
              font='libre'
              weight='bold'
              variant='s3'
              className='tracking-[0.16em] text-white uppercase'
            >
              HMTC <span className='text-cerulean-blue'>ITS</span>
            </Typography>
            <Typography
              as='p'
              font='satoshi'
              variant='c2'
              className='mt-2 max-w-xs leading-5 text-white/50'
            >
              Himpunan Mahasiswa Teknik Computer-Informatika ITS. Wadah
              pengembangan minat, keilmiahan, dan kebersamaan mahasiswa.
            </Typography>
          </div>

          <nav aria-label='Navigasi footer'>
            <Typography
              as='h3'
              font='satoshi'
              weight='semibold'
              variant='c2'
              className='tracking-[0.1em] text-white/70 uppercase'
            >
              Navigasi
            </Typography>
            <ul className='mt-3 space-y-2'>
              {PUBLIC_NAV.map((item) => (
                <li key={item}>
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='c2'
                    className='text-white/50'
                  >
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <Typography
              as='h3'
              font='satoshi'
              weight='semibold'
              variant='c2'
              className='tracking-[0.1em] text-white/70 uppercase'
            >
              Kontak
            </Typography>
            <ul className='mt-3 space-y-2'>
              <li>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-white/50'
                >
                  Departemen Teknik Informatika ITS
                </Typography>
              </li>
              <li>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-white/50'
                >
                  Surabaya, Jawa Timur
                </Typography>
              </li>
              <li>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-white/50'
                >
                  hmtc@its.ac.id
                </Typography>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between'>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='text-white/40'
          >
            © 2026 HMTC ITS. Seluruh hak cipta dilindungi.
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='text-white/40'
          >
            Dirancang dan dikembangkan oleh HMTC ITS
          </Typography>
        </div>
      </div>
    </footer>
  );
}

function PublicPage() {
  return (
    <div className={cn('bg-black antialiased', helveticaNeue.variable)}>
      <PublicHeader />
      <PublicHero />
      <AboutSection />
      <AgendaSection />
      <GallerySection />
      <CallToAction />
      <PublicFooter />
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function PagePreviewPage() {
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <MobileNav />

      <div className='lg:flex'>
        <Sidebar />

        <div className='flex min-w-0 flex-1 flex-col'>
          <PreviewToolbar />

          <main className='mx-auto w-full max-w-7xl flex-1 space-y-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-8'>
            <PreviewContextStrip />

            <div className='flex flex-wrap items-center justify-between gap-2 px-0.5'>
              <Typography
                as='p'
                font='satoshi'
                variant='c2'
                className='text-gray-500'
              >
                Public page preview · draft
              </Typography>
              <Typography
                as='p'
                font='satoshi'
                variant='c2'
                className='flex items-center gap-1.5 text-gray-500'
              >
                <Monitor
                  className='size-3'
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
                Desktop · 1440px
              </Typography>
            </div>

            <div className='overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm'>
              <PublicPage />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
