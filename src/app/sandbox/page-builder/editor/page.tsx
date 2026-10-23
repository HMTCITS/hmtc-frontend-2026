/**
 * HMTC CMS — Visual Page Editor UI reference (static design prototype).
 *
 * Scope: visual reference only. No GrapesJS, Directus, API, auth, persistence,
 * drag-and-drop, block insertion/reordering or publishing. Every control is a
 * static placeholder rendering the typed mock data in this file.
 *
 * Layout: dedicated full-height workspace — top toolbar, left block/library
 * panel with the page structure, centre page canvas, right block settings
 * panel, and an understated bottom status bar.
 *
 * Visual language follows the sibling references (../dashboard.tsx,
 * ../content/page.tsx, ../reviews/page.tsx, ../media/page.tsx,
 * ../preview/page.tsx, ../users/page.tsx) and DESIGN.md §8 (L4 Admin).
 */

import type { LucideIcon } from 'lucide-react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Box,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock,
  Columns2,
  Columns3,
  Dot,
  Ellipsis,
  Eye,
  GripVertical,
  Image as ImageIcon,
  ImagePlus,
  Images,
  Layers,
  LayoutGrid,
  ListOrdered,
  MapPin,
  Maximize,
  Megaphone,
  Minus,
  Monitor,
  MousePointerClick,
  MoveVertical,
  PanelTop,
  PencilLine,
  RectangleHorizontal,
  Search,
  Send,
  Smartphone,
  Square,
  Tablet,
  Type,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { helveticaNeue } from '@/lib/font';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Visual Page Editor — Page Builder Sandbox',
};

/* ---------------------------------------------------------------------------
 * Mock data
 * ------------------------------------------------------------------------- */

const PAGE_TITLE = 'Syukuran Wisudawan';

const EVENT = {
  eyebrow: 'Program Kerja HMTC ITS',
  heading: 'Syukuran Wisudawan',
  description:
    'Merayakan perjalanan, pencapaian, dan langkah baru para wisudawan Teknik Informatika ITS.',
  date: 'Sabtu, 24 Oktober 2026',
  time: '09.00–12.00 WIB',
  location: 'Departemen Teknik Informatika ITS',
  organizer: 'Departemen Keprofesian HMTC ITS',
} as const;

const ABOUT_TEXT =
  'Syukuran Wisudawan merupakan momen kebersamaan untuk merayakan pencapaian mahasiswa Teknik Informatika ITS yang telah menyelesaikan perjalanan akademiknya. Kegiatan ini menjadi ruang untuk berbagi cerita, mempererat hubungan antarmahasiswa, dan menyambut langkah baru setelah kelulusan.';

const AGENDA: readonly { time: string; title: string }[] = [
  { time: '09.00', title: 'Registrasi peserta' },
  { time: '09.30', title: 'Pembukaan' },
  { time: '10.00', title: 'Sambutan dan apresiasi wisudawan' },
  { time: '11.00', title: 'Dokumentasi dan ramah tamah' },
  { time: '12.00', title: 'Penutupan' },
];

const PUBLIC_NAV: readonly string[] = [
  'Beranda',
  'Tentang',
  'Program Kerja',
  'Kontak',
];

const CANVAS_SECTIONS = 6;

type BlockItem = {
  label: string;
  icon: LucideIcon;
  hint?: string;
};

type BlockCategory = {
  name: string;
  items: readonly BlockItem[];
};

const BLOCK_CATEGORIES: readonly BlockCategory[] = [
  {
    name: 'Layout',
    items: [
      { label: 'Section', icon: Square, hint: 'Full-width band' },
      { label: 'Two Columns', icon: Columns2, hint: 'Split content' },
      { label: 'Three Columns', icon: Columns3, hint: 'Feature row' },
      { label: 'Container', icon: Box, hint: 'Grouped blocks' },
    ],
  },
  {
    name: 'Content',
    items: [
      { label: 'Heading', icon: Type },
      { label: 'Rich Text', icon: AlignLeft },
      { label: 'Image', icon: ImageIcon },
      { label: 'Image Gallery', icon: Images },
      { label: 'Card', icon: RectangleHorizontal },
      { label: 'Button', icon: MousePointerClick },
      { label: 'Divider', icon: Minus },
      { label: 'Spacer', icon: MoveVertical },
    ],
  },
  {
    name: 'Event',
    items: [
      { label: 'Event Hero', icon: PanelTop, hint: 'Banner + metadata' },
      { label: 'Event Details', icon: CalendarDays, hint: 'Date, time, place' },
      { label: 'Event Agenda', icon: ListOrdered, hint: 'Timeline list' },
      { label: 'Registration CTA', icon: Megaphone, hint: 'Call to action' },
      { label: 'Event Gallery', icon: ImagePlus, hint: 'Photo grid' },
    ],
  },
];

type LayerNode = {
  label: string;
  icon: LucideIcon;
  depth: 0 | 1 | 2;
  selected?: boolean;
};

const LAYERS: readonly LayerNode[] = [
  { label: 'Page', icon: Layers, depth: 0 },
  { label: 'Hero Section', icon: PanelTop, depth: 1, selected: true },
  { label: 'Eyebrow', icon: Type, depth: 2 },
  { label: 'Heading', icon: Type, depth: 2 },
  { label: 'Description', icon: AlignLeft, depth: 2 },
  { label: 'Primary Button', icon: MousePointerClick, depth: 2 },
  { label: 'About Section', icon: PanelTop, depth: 1 },
  { label: 'Section Heading', icon: Type, depth: 2 },
  { label: 'Rich Text', icon: AlignLeft, depth: 2 },
  { label: 'Event Details', icon: CalendarDays, depth: 1 },
  { label: 'Date', icon: Dot, depth: 2 },
  { label: 'Time', icon: Dot, depth: 2 },
  { label: 'Location', icon: Dot, depth: 2 },
  { label: 'Event Agenda', icon: ListOrdered, depth: 1 },
  { label: 'Gallery Section', icon: Images, depth: 1 },
  { label: 'Footer CTA', icon: Megaphone, depth: 1 },
];

const LAYER_INDENT: readonly string[] = ['pl-1', 'pl-4', 'pl-7'];

const SANDBOX_LINKS: readonly { href: string; label: string }[] = [
  { href: '/sandbox/page-builder/dashboard', label: 'Dashboard' },
  { href: '/sandbox/page-builder/content', label: 'Posts & Pages' },
  { href: '/sandbox/page-builder/media', label: 'Media Library' },
  { href: '/sandbox/page-builder/reviews', label: 'Review & Approval' },
  { href: '/sandbox/page-builder/preview', label: 'Page Preview' },
  { href: '/sandbox/page-builder/users', label: 'Users & Roles' },
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
 * Panel primitives
 * ------------------------------------------------------------------------- */

function PanelHeading({ children }: { children: string }) {
  return (
    <Typography
      as='p'
      font='satoshi'
      weight='medium'
      variant='c2'
      className='tracking-[0.08em] text-gray-500 uppercase'
    >
      {children}
    </Typography>
  );
}

function SegmentedControl({
  label,
  options,
}: {
  label: string;
  options: readonly {
    label: string;
    icon?: LucideIcon;
    active?: boolean;
  }[];
}) {
  return (
    <div className='space-y-1'>
      <PanelHeading>{label}</PanelHeading>
      <div
        role='group'
        aria-label={label}
        className='inline-flex w-full items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5'
      >
        {options.map(({ label: optionLabel, icon: Icon, active }) => (
          <button
            key={optionLabel}
            type='button'
            aria-pressed={active}
            className={cn(
              'flex h-7 flex-1 items-center justify-center gap-1.5 rounded-sm px-2 transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none',
              active
                ? 'bg-navy/5 text-navy'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            )}
          >
            {Icon && (
              <Icon
                className='size-3.5 shrink-0'
                strokeWidth={1.75}
                aria-hidden='true'
              />
            )}
            <Typography
              as='span'
              font='satoshi'
              weight='medium'
              variant='c2'
              className='leading-none whitespace-nowrap'
            >
              {optionLabel}
            </Typography>
          </button>
        ))}
      </div>
    </div>
  );
}

function TokenSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className='space-y-1'>
      <PanelHeading>{label}</PanelHeading>
      <div className='flex h-8 items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-2.5'>
        <Typography
          as='span'
          font='satoshi'
          variant='s3'
          className='truncate text-gray-800'
        >
          {value}
        </Typography>
        <ChevronDown
          className='size-3.5 shrink-0 text-gray-400'
          strokeWidth={1.75}
          aria-hidden='true'
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const shared =
    'mt-1 w-full rounded-md border border-gray-200 bg-white px-2.5 text-sm text-gray-900 transition-colors hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none';

  return (
    <label className='block'>
      <PanelHeading>{label}</PanelHeading>
      {multiline ? (
        <textarea
          rows={3}
          defaultValue={value}
          className={cn(shared, 'resize-none py-2 leading-5')}
        />
      ) : (
        <input type='text' defaultValue={value} className={cn(shared, 'h-8')} />
      )}
    </label>
  );
}

function ToggleRow({
  label,
  description,
  checked,
}: {
  label: string;
  description: string;
  checked: boolean;
}) {
  return (
    <div className='flex items-start justify-between gap-3'>
      <div className='min-w-0'>
        <Typography
          as='p'
          font='satoshi'
          weight='medium'
          variant='s3'
          className='text-gray-800'
        >
          {label}
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='mt-0.5 leading-4 text-gray-500'
        >
          {description}
        </Typography>
      </div>
      <button
        type='button'
        role='switch'
        aria-checked={checked}
        aria-label={label}
        className={cn(
          'relative mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none',
          checked ? 'bg-navy' : 'bg-gray-200',
        )}
      >
        <span
          aria-hidden='true'
          className={cn(
            'absolute size-3.5 rounded-full bg-white transition-transform',
            checked ? 'translate-x-[1.15rem]' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Top toolbar
 * ------------------------------------------------------------------------- */

function ViewportSwitch() {
  return (
    <div
      role='group'
      aria-label='Canvas viewport'
      className='inline-flex shrink-0 items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5'
    >
      {VIEWPORTS.map(({ label, icon: Icon, active }) => (
        <button
          key={label}
          type='button'
          aria-pressed={active}
          aria-label={`${label} viewport`}
          className={cn(
            'flex size-7 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none',
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

function EditorToolbar() {
  return (
    <header className='sticky top-0 z-30 flex shrink-0 flex-col gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:px-4 lg:h-16 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:py-0'>
      <div className='flex min-w-0 items-center gap-2'>
        <Link
          href='/sandbox/page-builder/content'
          aria-label='Back to Posts & Pages'
          className='flex size-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
        >
          <ArrowLeft className='size-4' strokeWidth={1.75} aria-hidden='true' />
        </Link>

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
                  weight='medium'
                  variant='c2'
                  aria-current='page'
                  className='block truncate text-gray-700'
                >
                  {PAGE_TITLE}
                </Typography>
              </li>
            </ol>
          </nav>

          <div className='mt-0.5 flex min-w-0 items-center gap-2'>
            <span className='inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5'>
              <PencilLine
                className='size-3 shrink-0 text-amber-700'
                strokeWidth={2}
                aria-hidden='true'
              />
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='leading-none text-amber-800'
              >
                Draft
              </Typography>
            </span>

            <span className='inline-flex min-w-0 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5'>
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='s3'
                className='truncate text-gray-900'
              >
                {PAGE_TITLE}
              </Typography>
              <ChevronDown
                className='size-3.5 shrink-0 text-gray-400'
                strokeWidth={1.75}
                aria-hidden='true'
              />
            </span>
          </div>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2 lg:justify-center'>
        <ViewportSwitch />
        <span className='inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1'>
          <Maximize
            className='size-3 text-gray-400'
            strokeWidth={1.75}
            aria-hidden='true'
          />
          <Typography
            as='span'
            font='satoshi'
            variant='c2'
            className='leading-none text-gray-600'
          >
            100%
          </Typography>
        </span>
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <span className='hidden items-center gap-1.5 xl:inline-flex'>
          <CircleCheck
            className='size-3.5 shrink-0 text-green-600'
            strokeWidth={2}
            aria-hidden='true'
          />
          <Typography
            as='span'
            font='satoshi'
            variant='c2'
            className='text-gray-500'
          >
            All changes saved
          </Typography>
        </span>

        <Button
          asChild
          variant='outline'
          size='sm'
          className='h-8 gap-1.5 rounded-lg border-gray-200 bg-white px-2.5 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50'
        >
          <Link href='/sandbox/page-builder/preview'>
            <Eye className='size-4' aria-hidden='true' />
            Preview
          </Link>
        </Button>

        <Button
          type='button'
          size='sm'
          className='h-8 gap-1.5 rounded-lg bg-navy px-2.5 font-medium text-white shadow-none hover:bg-navy/90 focus-visible:ring-navy/30'
        >
          <Send className='size-4' aria-hidden='true' />
          Submit for Review
        </Button>

        <button
          type='button'
          aria-label='More editor actions'
          className='flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
        >
          <Ellipsis className='size-4' strokeWidth={1.75} aria-hidden='true' />
        </button>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
 * Left panel
 * ------------------------------------------------------------------------- */

function BlockRow({ block }: { block: BlockItem }) {
  const Icon = block.icon;

  return (
    <div className='flex cursor-grab items-center gap-2 rounded-md px-2 py-1.5 transition-colors select-none hover:bg-gray-100'>
      <GripVertical
        className='size-3.5 shrink-0 text-gray-300'
        strokeWidth={1.75}
        aria-hidden='true'
      />
      <span className='flex size-6 shrink-0 items-center justify-center rounded-sm border border-gray-200 bg-gray-50 text-gray-500'>
        <Icon className='size-3' strokeWidth={1.75} aria-hidden='true' />
      </span>
      <div className='min-w-0 flex-1'>
        <Typography
          as='p'
          font='satoshi'
          weight='medium'
          variant='s3'
          className='truncate text-gray-800'
        >
          {block.label}
        </Typography>
        {block.hint && (
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='truncate text-gray-500'
          >
            {block.hint}
          </Typography>
        )}
      </div>
    </div>
  );
}

function BlockLibrary() {
  return (
    <div className='space-y-3'>
      <div className='relative'>
        <Search
          className='pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400'
          strokeWidth={1.75}
          aria-hidden='true'
        />
        <input
          type='search'
          aria-label='Search blocks'
          placeholder='Search blocks...'
          autoComplete='off'
          className='h-8 w-full rounded-md border border-gray-200 bg-white pr-2.5 pl-8 text-sm text-gray-900 transition-colors placeholder:text-gray-400 hover:border-gray-300 focus-visible:border-navy/30 focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:outline-none'
        />
      </div>

      {BLOCK_CATEGORIES.map((category) => (
        <div key={category.name}>
          <div className='flex items-center justify-between gap-2 px-2 pb-1'>
            <PanelHeading>{category.name}</PanelHeading>
            <ChevronDown
              className='size-3 text-gray-400'
              strokeWidth={2}
              aria-hidden='true'
            />
          </div>
          <ul>
            {category.items.map((block) => (
              <li key={block.label}>
                <BlockRow block={block} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LayersTree() {
  return (
    <div>
      <div className='flex items-center justify-between gap-2 px-2 pb-1'>
        <PanelHeading>Page structure</PanelHeading>
        <Layers
          className='size-3.5 text-gray-400'
          strokeWidth={1.75}
          aria-hidden='true'
        />
      </div>

      <ul className='space-y-px'>
        {LAYERS.map((node) => {
          const Icon = node.icon;

          return (
            <li key={node.label}>
              <div
                aria-current={node.selected ? 'true' : undefined}
                className={cn(
                  'relative flex items-center gap-2 rounded-md py-1.5 pr-2',
                  LAYER_INDENT[node.depth],
                  node.selected
                    ? 'bg-navy/5 text-navy'
                    : 'text-gray-600 hover:bg-gray-100',
                )}
              >
                {node.selected && (
                  <span
                    aria-hidden='true'
                    className='absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-cerulean-blue'
                  />
                )}
                <Icon
                  className={cn(
                    'size-3.5 shrink-0',
                    node.selected ? 'text-navy' : 'text-gray-400',
                  )}
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
                <Typography
                  as='span'
                  font='satoshi'
                  weight={node.selected ? 'medium' : 'regular'}
                  variant='s3'
                  className='min-w-0 flex-1 truncate'
                >
                  {node.label}
                </Typography>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SandboxLinks() {
  return (
    <div>
      <PanelHeading>Sandbox pages</PanelHeading>
      <ul className='mt-2 space-y-1'>
        {SANDBOX_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className='block rounded-sm px-2 py-1 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
            >
              <Typography
                as='span'
                font='satoshi'
                variant='c2'
                className='text-gray-500'
              >
                {link.label}
              </Typography>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeftPanel() {
  return (
    <div className='flex flex-col divide-y divide-gray-100'>
      <div className='p-3'>
        <div
          role='group'
          aria-label='Library tab'
          className='flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5'
        >
          <button
            type='button'
            aria-pressed='true'
            className='flex h-7 flex-1 items-center justify-center gap-1.5 rounded-sm bg-navy/5 px-2 text-navy focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
          >
            <LayoutGrid
              className='size-3.5'
              strokeWidth={1.75}
              aria-hidden='true'
            />
            <Typography
              as='span'
              font='satoshi'
              weight='medium'
              variant='c2'
              className='leading-none'
            >
              Blocks
            </Typography>
          </button>
          <button
            type='button'
            aria-pressed='false'
            className='flex h-7 flex-1 items-center justify-center gap-1.5 rounded-sm px-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
          >
            <Layers
              className='size-3.5'
              strokeWidth={1.75}
              aria-hidden='true'
            />
            <Typography
              as='span'
              font='satoshi'
              weight='medium'
              variant='c2'
              className='leading-none'
            >
              Layers
            </Typography>
          </button>
        </div>
      </div>

      <div className='p-3'>
        <BlockLibrary />
      </div>

      <div className='p-3'>
        <LayersTree />
      </div>

      <div className='p-3'>
        <SandboxLinks />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Canvas — block wrapper and public page
 * ------------------------------------------------------------------------- */

function CanvasBlock({
  label,
  selected,
  children,
}: {
  label: string;
  selected?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'group relative',
        selected
          ? 'outline-2 outline-offset-[-2px] outline-cerulean-blue'
          : 'hover:outline-1 hover:outline-offset-[-1px] hover:outline-navy/25',
      )}
    >
      {selected ? (
        <>
          <span className='absolute top-0 left-0 z-10 inline-flex items-center gap-1.5 rounded-br-md bg-cerulean-blue px-2 py-1'>
            <PanelTop
              className='size-3 text-white'
              strokeWidth={2}
              aria-hidden='true'
            />
            <Typography
              as='span'
              font='satoshi'
              weight='semibold'
              variant='c2'
              className='leading-none text-white'
            >
              {label}
            </Typography>
          </span>

          <span className='absolute top-1 right-1 z-10 inline-flex items-center gap-0.5 rounded-md border border-gray-200 bg-white/95 p-0.5 shadow-sm'>
            <button
              type='button'
              aria-label={`Move ${label} up`}
              className='flex size-6 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
            >
              <ChevronDown
                className='size-3.5 rotate-180'
                strokeWidth={2}
                aria-hidden='true'
              />
            </button>
            <button
              type='button'
              aria-label={`Move ${label} down`}
              className='flex size-6 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
            >
              <ChevronDown
                className='size-3.5'
                strokeWidth={2}
                aria-hidden='true'
              />
            </button>
            <button
              type='button'
              aria-label={`Duplicate ${label}`}
              className='flex size-6 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none'
            >
              <Columns2
                className='size-3.5'
                strokeWidth={2}
                aria-hidden='true'
              />
            </button>
            <button
              type='button'
              aria-label={`Delete ${label}`}
              className='flex size-6 items-center justify-center rounded-sm text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none'
            >
              <Minus className='size-3.5' strokeWidth={2} aria-hidden='true' />
            </button>
          </span>
        </>
      ) : (
        <span className='absolute top-1 left-1 z-10 inline-flex items-center gap-1 rounded-md border border-transparent px-1.5 py-0.5 opacity-0 transition-opacity group-hover:border-gray-200 group-hover:bg-white/95 group-hover:opacity-100'>
          <GripVertical
            className='size-3 text-gray-400'
            strokeWidth={2}
            aria-hidden='true'
          />
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='leading-none text-gray-500'
          >
            {label}
          </Typography>
        </span>
      )}

      {children}
    </div>
  );
}

function HeroBanner() {
  return (
    <div
      role='img'
      aria-label='Ilustrasi banner Syukuran Wisudawan 2026'
      className='relative aspect-[4/3] w-full overflow-hidden rounded-md border border-white/10 bg-gradient-to-br from-navy via-black to-black'
    >
      <svg
        viewBox='0 0 320 240'
        preserveAspectRatio='xMidYMid slice'
        aria-hidden='true'
        className='absolute inset-0 size-full'
      >
        <g fill='none' strokeWidth={1.2} className='stroke-cerulean-blue/30'>
          <circle cx='262' cy='200' r='86' />
          <circle cx='262' cy='200' r='54' />
          <circle cx='262' cy='200' r='24' />
        </g>

        <text
          x='160'
          y='156'
          textAnchor='middle'
          fontSize='80'
          fill='white'
          fillOpacity='0.06'
          fontFamily='sans-serif'
          fontWeight='700'
        >
          2026
        </text>

        <path
          d='M160 52 L228 80 L160 108 L92 80 Z'
          className='fill-white/10 stroke-white/30'
          strokeWidth={1.4}
        />
        <path
          d='M130 94 L130 122 C130 134 190 134 190 122 L190 94'
          fill='none'
          className='stroke-white/25'
          strokeWidth={1.4}
        />
        <path
          d='M228 80 L228 112'
          className='stroke-cerulean-blue'
          strokeWidth={1.4}
        />
        <circle cx='228' cy='116' r='3' className='fill-cerulean-blue' />
      </svg>

      <div className='absolute top-2 left-2 rounded-sm border border-white/15 bg-black/40 px-1.5 py-0.5'>
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
    </div>
  );
}

function CanvasPublicHeader() {
  return (
    <header className='border-b border-white/10 bg-black'>
      <div className='flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <span
            aria-hidden='true'
            className='flex size-7 shrink-0 items-center justify-center rounded-sm bg-white'
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
              variant='c2'
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
          <ul className='flex items-center gap-4'>
            {PUBLIC_NAV.map((item) => (
              <li key={item}>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='c2'
                  className='text-white/60'
                >
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </nav>

        <span className='inline-flex h-7 shrink-0 items-center justify-center rounded-full bg-white px-3'>
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='leading-none text-black'
          >
            Informasi Acara
          </Typography>
        </span>
      </div>
    </header>
  );
}

function CanvasHero() {
  return (
    <section className='bg-black'>
      <div className='grid gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-2 lg:items-center lg:gap-10'>
        <div className='min-w-0'>
          <Typography
            as='p'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='tracking-[0.2em] text-cerulean-blue uppercase'
          >
            {EVENT.eyebrow}
          </Typography>

          <Typography
            as='h2'
            font='helveticaNeue'
            weight='thin'
            variant='j1'
            className='mt-2 leading-[1.05] text-white'
          >
            {EVENT.heading}
          </Typography>

          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='mt-3 max-w-md leading-6 text-white/60'
          >
            {EVENT.description}
          </Typography>

          <ul className='mt-5 grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-3'>
            {[
              { icon: CalendarDays, value: EVENT.date },
              { icon: Clock, value: EVENT.time },
              { icon: MapPin, value: EVENT.location },
            ].map(({ icon: Icon, value }) => (
              <li key={value} className='flex items-start gap-1.5'>
                <Icon
                  className='mt-px size-3 shrink-0 text-white/40'
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='leading-4 text-white/80'
                >
                  {value}
                </Typography>
              </li>
            ))}
          </ul>

          <div className='mt-5 flex flex-wrap items-center gap-2'>
            <span className='inline-flex h-8 items-center justify-center rounded-full bg-white px-3.5'>
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='leading-none text-black'
              >
                Lihat Informasi Acara
              </Typography>
            </span>
            <span className='inline-flex h-8 items-center justify-center rounded-full border border-white/20 px-3.5'>
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='leading-none text-white/80'
              >
                Bagikan Acara
              </Typography>
            </span>
          </div>
        </div>

        <HeroBanner />
      </div>
    </section>
  );
}

function CanvasAbout() {
  return (
    <section className='border-b border-gray-100 bg-white'>
      <div className='grid gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:py-10'>
        <div className='min-w-0'>
          <Typography
            as='h2'
            font='helveticaNeue'
            weight='light'
            variant='i1'
            className='text-text-black'
          >
            Tentang Acara
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='mt-2 max-w-prose leading-6 text-gray-600'
          >
            {ABOUT_TEXT}
          </Typography>
        </div>

        <aside
          aria-label='Informasi acara'
          className='h-fit rounded-md border border-gray-200 bg-gray-50/70 p-3'
        >
          <PanelHeading>Informasi Acara</PanelHeading>
          <dl className='mt-2 space-y-2'>
            {[
              { label: 'Tanggal', value: EVENT.date },
              { label: 'Waktu', value: EVENT.time },
              { label: 'Lokasi', value: EVENT.location },
              { label: 'Penyelenggara', value: EVENT.organizer },
            ].map((item) => (
              <div key={item.label}>
                <dt>
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='c2'
                    className='text-gray-500'
                  >
                    {item.label}
                  </Typography>
                </dt>
                <dd>
                  <Typography
                    as='span'
                    font='satoshi'
                    weight='medium'
                    variant='c2'
                    className='block leading-4 text-gray-800'
                  >
                    {item.value}
                  </Typography>
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}

function CanvasEventDetails() {
  return (
    <section className='border-b border-gray-100 bg-gray-50'>
      <div className='px-4 py-8 sm:px-6 lg:py-10'>
        <Typography
          as='h2'
          font='helveticaNeue'
          weight='light'
          variant='i1'
          className='text-text-black'
        >
          Detail Acara
        </Typography>

        <ul className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            { icon: CalendarDays, label: 'Tanggal', value: EVENT.date },
            { icon: Clock, label: 'Waktu', value: EVENT.time },
            { icon: MapPin, label: 'Lokasi', value: EVENT.location },
            {
              icon: Megaphone,
              label: 'Penyelenggara',
              value: EVENT.organizer,
            },
          ].map(({ icon: Icon, label, value }) => (
            <li
              key={label}
              className='rounded-md border border-gray-200 bg-white p-3'
            >
              <span className='flex items-center gap-1.5'>
                <Icon
                  className='size-3 shrink-0 text-gray-400'
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='tracking-[0.06em] text-gray-500 uppercase'
                >
                  {label}
                </Typography>
              </span>
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='mt-1 block leading-4 text-gray-800'
              >
                {value}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CanvasAgenda() {
  return (
    <section className='border-b border-gray-100 bg-white'>
      <div className='px-4 py-8 sm:px-6 lg:py-10'>
        <Typography
          as='h2'
          font='helveticaNeue'
          weight='light'
          variant='i1'
          className='text-text-black'
        >
          Rangkaian Acara
        </Typography>

        <ol className='mt-4 max-w-xl'>
          {AGENDA.map((item, index) => {
            const isLast = index === AGENDA.length - 1;

            return (
              <li key={item.time} className='flex gap-3'>
                <span
                  aria-hidden='true'
                  className='relative flex w-3 shrink-0 justify-center'
                >
                  <span className='mt-1.5 size-2 rounded-full bg-french-blue' />
                  {!isLast && (
                    <span className='absolute top-4 bottom-0 w-px bg-gray-200' />
                  )}
                </span>
                <div className='flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 pb-3'>
                  <Typography
                    as='span'
                    font='satoshi'
                    weight='medium'
                    variant='c2'
                    className='w-10 text-gray-900 tabular-nums'
                  >
                    {item.time}
                  </Typography>
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='c2'
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

type GalleryVariant = 'cap' | 'confetti' | 'stage' | 'crowd';

const GALLERY: readonly { variant: GalleryVariant; alt: string }[] = [
  { variant: 'cap', alt: 'Ilustrasi toga wisudawan' },
  { variant: 'confetti', alt: 'Ilustrasi konfeti perayaan wisuda' },
  { variant: 'stage', alt: 'Ilustrasi panggung acara syukuran' },
  { variant: 'crowd', alt: 'Ilustrasi kebersamaan peserta acara' },
];

function GalleryThumb({
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
        'relative aspect-[4/3] overflow-hidden rounded-sm border border-gray-200 bg-gradient-to-br',
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

function CanvasGallery() {
  return (
    <section className='border-b border-gray-100 bg-gray-50'>
      <div className='px-4 py-8 sm:px-6 lg:py-10'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <Typography
            as='h2'
            font='helveticaNeue'
            weight='light'
            variant='i1'
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

        <ul className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {GALLERY.map((tile) => (
            <li key={tile.variant}>
              <GalleryThumb variant={tile.variant} alt={tile.alt} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CanvasFooterCta() {
  return (
    <section className='bg-[#121212] px-4 py-10 text-center sm:px-6'>
      <Typography
        as='h2'
        font='helveticaNeue'
        weight='thin'
        variant='j2'
        className='mx-auto max-w-lg leading-tight text-white'
      >
        Sampai Jumpa di Perayaan Wisuda
      </Typography>
      <Typography
        as='p'
        font='satoshi'
        variant='b4'
        className='mx-auto mt-2 max-w-md leading-6 text-white/60'
      >
        Bersama merayakan pencapaian dan menyambut perjalanan baru.
      </Typography>
      <div className='mt-4 flex justify-center'>
        <span className='inline-flex h-8 items-center justify-center rounded-full bg-white px-3.5'>
          <Typography
            as='span'
            font='satoshi'
            weight='medium'
            variant='c2'
            className='leading-none text-black'
          >
            Lihat Informasi Acara
          </Typography>
        </span>
      </div>
    </section>
  );
}

function PageCanvas() {
  return (
    <div className='mx-auto w-full max-w-6xl'>
      <div className='mb-2 flex flex-wrap items-center justify-between gap-2 px-0.5'>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-gray-500'
        >
          Page Canvas
        </Typography>
        <span className='inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-0.5'>
          <Monitor
            className='size-3 text-gray-400'
            strokeWidth={1.75}
            aria-hidden='true'
          />
          <Typography
            as='span'
            font='satoshi'
            variant='c2'
            className='leading-none text-gray-600'
          >
            Desktop · 1440px
          </Typography>
        </span>
      </div>

      <div
        className={cn(
          'overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm',
          helveticaNeue.variable,
        )}
      >
        <CanvasPublicHeader />

        <CanvasBlock label='Hero Section' selected>
          <CanvasHero />
        </CanvasBlock>
        <CanvasBlock label='About Section'>
          <CanvasAbout />
        </CanvasBlock>
        <CanvasBlock label='Event Details'>
          <CanvasEventDetails />
        </CanvasBlock>
        <CanvasBlock label='Event Agenda'>
          <CanvasAgenda />
        </CanvasBlock>
        <CanvasBlock label='Gallery Section'>
          <CanvasGallery />
        </CanvasBlock>
        <CanvasBlock label='Footer CTA'>
          <CanvasFooterCta />
        </CanvasBlock>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Right panel — block settings
 * ------------------------------------------------------------------------- */

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className='border-t border-gray-100 pt-4'>
      <div className='flex items-center justify-between gap-2'>
        <PanelHeading>{title}</PanelHeading>
        <ChevronDown
          className='size-3.5 text-gray-400'
          strokeWidth={2}
          aria-hidden='true'
        />
      </div>
      <div className='mt-3 space-y-3'>{children}</div>
    </div>
  );
}

function FocalPointControl() {
  return (
    <div className='space-y-1'>
      <PanelHeading>Focal point</PanelHeading>
      <div
        role='group'
        aria-label='Image focal point'
        className='grid w-24 grid-cols-3 gap-0.5 rounded-md border border-gray-200 bg-white p-1'
      >
        {Array.from({ length: 9 }).map((_, index) => (
          <span
            key={index}
            aria-hidden='true'
            className={cn(
              'size-3 rounded-full',
              index === 4 ? 'bg-navy' : 'bg-gray-200',
            )}
          />
        ))}
      </div>
      <Typography as='p' font='satoshi' variant='c2' className='text-gray-500'>
        Centre
      </Typography>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className='flex flex-col divide-y divide-gray-100'>
      <div className='flex items-center gap-2 p-3'>
        <span className='flex size-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500'>
          <PanelTop
            className='size-3.5'
            strokeWidth={1.75}
            aria-hidden='true'
          />
        </span>
        <div className='min-w-0 flex-1'>
          <Typography
            as='p'
            font='satoshi'
            weight='semibold'
            variant='s3'
            className='truncate text-gray-900'
          >
            Hero Section
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='truncate text-gray-500'
          >
            Selected block
          </Typography>
        </div>
      </div>

      <div className='p-3'>
        <div
          role='group'
          aria-label='Settings section'
          className='flex items-center gap-0.5 rounded-md border border-gray-200 bg-white p-0.5'
        >
          {[
            { label: 'Content', active: true },
            { label: 'Style', active: false },
            { label: 'Layout', active: false },
          ].map((tab) => (
            <button
              key={tab.label}
              type='button'
              aria-pressed={tab.active}
              className={cn(
                'flex h-7 flex-1 items-center justify-center rounded-sm px-2 transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none',
                tab.active
                  ? 'bg-navy/5 text-navy'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
              )}
            >
              <Typography
                as='span'
                font='satoshi'
                weight='medium'
                variant='c2'
                className='leading-none'
              >
                {tab.label}
              </Typography>
            </button>
          ))}
        </div>
      </div>

      <div className='space-y-3 p-3'>
        <TextField label='Eyebrow' value={EVENT.eyebrow} />
        <TextField label='Heading' value={EVENT.heading} />
        <TextField label='Description' value={EVENT.description} multiline />
        <TextField label='Primary Button Label' value='Lihat Informasi Acara' />
        <TextField label='Button Link' value='/proker/syukuran-wisudawan' />
      </div>

      <div className='p-3'>
        <SettingsGroup title='Style'>
          <SegmentedControl
            label='Text alignment'
            options={[
              { label: 'Left', icon: AlignLeft, active: true },
              { label: 'Center', icon: AlignCenter },
              { label: 'Right', icon: AlignRight },
            ]}
          />
          <SegmentedControl
            label='Heading size'
            options={[
              { label: 'S' },
              { label: 'M' },
              { label: 'L', active: true },
              { label: 'XL' },
            ]}
          />
          <TokenSelect label='Background' value='Light' />
          <TokenSelect label='Text color' value='Default' />
          <TokenSelect label='Content width' value='Wide' />
          <TokenSelect label='Section spacing' value='Comfortable' />
        </SettingsGroup>
      </div>

      <div className='p-3'>
        <SettingsGroup title='Layout'>
          <TokenSelect label='Section width' value='Full width' />
          <TokenSelect label='Vertical padding' value='Comfortable' />
          <SegmentedControl
            label='Horizontal alignment'
            options={[
              { label: 'Left', icon: AlignLeft, active: true },
              { label: 'Center', icon: AlignCenter },
              { label: 'Right', icon: AlignRight },
            ]}
          />
          <TokenSelect label='Content arrangement' value='Stacked' />
          <ToggleRow
            label='Mobile stacking'
            description='Stack columns below 768px'
            checked
          />
        </SettingsGroup>
      </div>

      <div className='p-3'>
        <SettingsGroup title='Media'>
          <div className='space-y-1'>
            <PanelHeading>Hero banner</PanelHeading>
            <div className='flex items-center gap-3 rounded-md border border-gray-200 bg-white p-2'>
              <div className='w-24 shrink-0'>
                <HeroBanner />
              </div>
              <div className='min-w-0 flex-1'>
                <Typography
                  as='p'
                  font='satoshi'
                  weight='medium'
                  variant='c2'
                  className='truncate text-gray-800'
                >
                  seminar-dosen-banner.jpg
                </Typography>
                <Typography
                  as='p'
                  font='satoshi'
                  variant='c2'
                  className='truncate text-gray-500'
                >
                  1920 × 1080 · 1.8 MB
                </Typography>
                <Button
                  asChild
                  variant='outline'
                  size='sm'
                  className='mt-2 h-7 gap-1.5 rounded-md border-gray-200 bg-white px-2 font-medium text-gray-700 shadow-none hover:border-gray-300 hover:bg-gray-50'
                >
                  <Link href='/sandbox/page-builder/media'>
                    <ImageIcon className='size-3.5' aria-hidden='true' />
                    Choose Media
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <TextField label='Alt text' value='Banner Syukuran Wisudawan 2026' />
          <FocalPointControl />
        </SettingsGroup>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Status bar
 * ------------------------------------------------------------------------- */

function StatusBar() {
  return (
    <footer className='flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-gray-200 bg-white px-3 py-1.5 sm:px-4'>
      <div className='flex flex-wrap items-center gap-x-4 gap-y-1'>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-gray-500'
        >
          <span className='font-medium text-gray-700'>
            {CANVAS_SECTIONS} sections
          </span>
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='hidden text-gray-500 sm:block'
        >
          Desktop viewport
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-gray-500'
        >
          Last saved 18 Oct 2026, 08:15
        </Typography>
      </div>

      <Typography as='p' font='satoshi' variant='c2' className='text-gray-400'>
        Static design reference · no changes are saved
      </Typography>
    </footer>
  );
}

/* ---------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export default function VisualPageEditorPage() {
  return (
    <div className='flex min-h-screen flex-col bg-gray-100 text-gray-900 lg:h-screen lg:overflow-hidden'>
      <EditorToolbar />

      <div className='flex min-h-0 flex-1 flex-col lg:flex-row'>
        <aside
          aria-label='Blocks and page structure'
          className='order-2 flex flex-col border-b border-gray-200 bg-white lg:order-1 lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:border-r lg:border-b-0 xl:w-[17rem]'
        >
          <LeftPanel />
        </aside>

        <div className='order-1 min-w-0 flex-1 bg-gray-100 lg:order-2 lg:overflow-y-auto'>
          <div className='p-3 sm:p-4 lg:p-5'>
            <PageCanvas />
          </div>

          <div className='border-t border-gray-200 bg-white xl:hidden'>
            <SettingsPanel />
          </div>
        </div>

        <aside
          aria-label='Block settings'
          className='order-3 hidden border-l border-gray-200 bg-white xl:flex xl:w-80 xl:shrink-0 xl:flex-col xl:overflow-y-auto'
        >
          <SettingsPanel />
        </aside>
      </div>

      <StatusBar />
    </div>
  );
}
