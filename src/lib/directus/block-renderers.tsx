/**
 * Public renderers for the approved CMS blocks.
 *
 * One renderer per entry in `BLOCK_RENDERERS`; the `satisfies` clause makes a
 * missing renderer a compile error. Nothing here executes CMS-supplied HTML,
 * CSS or JavaScript: every block is a typed React component fed by validated
 * props.
 *
 * Styling reads theme tokens with a fallback to an existing brand token, so a
 * page theme can restyle every block without touching this file. No hex value
 * is introduced here.
 */

import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Link2,
  MapPin,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';

import Typography from '@/components/Typography';
import { cn } from '@/lib/utils';

import type { Block, BlockOf, BlockType } from './blocks';

/** Caller-supplied asset resolver. Keeps env vars and credentials out of here. */
export type BlockRenderContext = {
  resolveAssetUrl: (assetId: string) => string;
};

const SURFACE = 'bg-[var(--cms-surface,var(--color-white))]';
const INK = 'text-[var(--cms-ink,var(--color-navy))]';
const MUTED = 'text-[var(--cms-muted,var(--color-black-300))]';
const ACCENT_TEXT = 'text-[var(--cms-accent,var(--color-cerulean-blue))]';
const ACCENT_BG = 'bg-[var(--cms-accent,var(--color-cerulean-blue))]';
const ACCENT_INK = 'text-[var(--cms-accent-ink,var(--color-navy))]';
const LINE = 'border-[var(--cms-line,var(--color-black-50))]';

/**
 * Directus assets are remote, and `next.config.js` `images.remotePatterns`
 * currently allows only `**.cloudflareinsights.com`, so `next/image` would
 * throw at runtime. A plain `<img>` works under the CSP (`img-src` allows
 * `https:`) and keeps `alt` mandatory. Switching to `<NextImage>` requires
 * whitelisting the Directus asset host first.
 */
function BlockImage({
  assetId,
  alt,
  context,
  className,
}: {
  assetId: string;
  alt: string;
  context: BlockRenderContext;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote host is not whitelisted yet
    <img
      src={context.resolveAssetUrl(assetId)}
      alt={alt}
      loading='lazy'
      decoding='async'
      className={cn('size-full object-cover', className)}
    />
  );
}

function CtaLink({
  action,
  tone = 'accent',
}: {
  action: { label: string; href: string };
  tone?: 'accent' | 'neutral';
}) {
  return (
    <Link
      href={action.href}
      className={cn(
        'inline-flex items-center gap-2 border-current pb-1 transition-opacity hover:opacity-80',
        'border-b',
        tone === 'accent' ? ACCENT_TEXT : INK,
      )}
    >
      <Typography as='span' font='satoshi' weight='semibold' variant='s3'>
        {action.label}
      </Typography>
      <ArrowRight className='size-4' strokeWidth={1.75} aria-hidden='true' />
    </Link>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Typography
      as='h2'
      font='helveticaNeue'
      weight='light'
      variant='k2'
      className={INK}
    >
      {children}
    </Typography>
  );
}

function HeroRenderer({
  block,
  context,
}: {
  block: BlockOf<'hero'>;
  context: BlockRenderContext;
}) {
  const { props } = block;
  const centered = props.align === 'center';
  const hasImage = Boolean(props.image);

  return (
    <section className={cn(SURFACE, 'py-20 md:py-28')}>
      <div
        className={cn(
          'layout grid items-center gap-10',
          hasImage && 'md:grid-cols-2',
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-5',
            centered && !hasImage && 'items-center text-center',
          )}
        >
          {props.eyebrow ? (
            <Typography
              as='p'
              font='satoshi'
              weight='medium'
              variant='s4'
              className={cn(ACCENT_TEXT, 'tracking-[0.18em] uppercase')}
            >
              {props.eyebrow}
            </Typography>
          ) : null}

          <Typography
            as='h1'
            font='helveticaNeue'
            weight='thin'
            variant='k1'
            className={INK}
          >
            {props.title}
          </Typography>

          {props.description ? (
            <Typography
              as='p'
              font='satoshi'
              weight='regular'
              variant='b1'
              className={MUTED}
            >
              {props.description}
            </Typography>
          ) : null}

          {props.cta ? <CtaLink action={props.cta} /> : null}
        </div>

        {props.image ? (
          <div
            className={cn(
              'aspect-[4/3] overflow-hidden rounded-xl border',
              LINE,
            )}
          >
            <BlockImage
              assetId={props.image}
              alt={props.imageAlt ?? props.title}
              context={context}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function RichTextRenderer({ block }: { block: BlockOf<'richText'> }) {
  const { props } = block;

  return (
    <section className={cn(SURFACE, 'py-16 md:py-24')}>
      <div className='layout flex flex-col gap-6'>
        {props.heading ? (
          <SectionHeading>{props.heading}</SectionHeading>
        ) : null}

        <div className='flex max-w-3xl flex-col gap-4'>
          {props.paragraphs.map((paragraph, index) => (
            <Typography
              key={index}
              as='p'
              font='satoshi'
              weight='regular'
              variant='b1'
              className={MUTED}
            >
              {paragraph}
            </Typography>
          ))}
        </div>
      </div>
    </section>
  );
}

type DetailIcon = NonNullable<
  BlockOf<'eventDetails'>['props']['items'][number]['icon']
>;

const DETAIL_ICONS = {
  calendar: CalendarDays,
  clock: Clock,
  location: MapPin,
  ticket: Ticket,
  link: Link2,
} satisfies Record<DetailIcon, LucideIcon>;

function EventDetailsRenderer({ block }: { block: BlockOf<'eventDetails'> }) {
  const { props } = block;

  return (
    <section className={cn(SURFACE, 'py-16 md:py-24')}>
      <div className='layout flex flex-col gap-6'>
        {props.heading ? (
          <SectionHeading>{props.heading}</SectionHeading>
        ) : null}

        <dl className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {props.items.map((item) => {
            const Icon = item.icon ? DETAIL_ICONS[item.icon] : CalendarDays;

            return (
              <div
                key={`${item.label}-${item.value}`}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4',
                  LINE,
                )}
              >
                <Icon
                  className={cn('mt-0.5 size-5 shrink-0', ACCENT_TEXT)}
                  strokeWidth={1.75}
                  aria-hidden='true'
                />
                <div className='flex flex-col gap-1'>
                  <Typography
                    as='dt'
                    font='satoshi'
                    weight='medium'
                    variant='s4'
                    className={MUTED}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    as='dd'
                    font='satoshi'
                    weight='medium'
                    variant='s2'
                    className={INK}
                  >
                    {item.value}
                  </Typography>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

function AgendaRenderer({ block }: { block: BlockOf<'agenda'> }) {
  const { props } = block;

  return (
    <section className={cn(SURFACE, 'py-16 md:py-24')}>
      <div className='layout flex flex-col gap-6'>
        {props.heading ? (
          <SectionHeading>{props.heading}</SectionHeading>
        ) : null}

        <ol className={cn('flex flex-col border-l pl-6', LINE)}>
          {props.items.map((item, index) => (
            <li
              key={`${item.time}-${index}`}
              className='relative flex flex-col gap-1 pb-8 last:pb-0'
            >
              <span
                className={cn(
                  'absolute top-1.5 -left-[1.9rem] size-2.5 rounded-full',
                  ACCENT_BG,
                )}
                aria-hidden='true'
              />
              <Typography
                as='p'
                font='jetbrainsMono'
                weight='regular'
                variant='c0'
                className={ACCENT_TEXT}
              >
                {item.time}
              </Typography>
              <Typography
                as='p'
                font='satoshi'
                weight='medium'
                variant='s1'
                className={INK}
              >
                {item.title}
              </Typography>
              {item.description ? (
                <Typography
                  as='p'
                  font='satoshi'
                  weight='regular'
                  variant='b4'
                  className={MUTED}
                >
                  {item.description}
                </Typography>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function GalleryRenderer({
  block,
  context,
}: {
  block: BlockOf<'gallery'>;
  context: BlockRenderContext;
}) {
  const { props } = block;
  const masonry = props.layout === 'masonry';

  return (
    <section className={cn(SURFACE, 'py-16 md:py-24')}>
      <div className='layout flex flex-col gap-6'>
        {props.heading ? (
          <SectionHeading>{props.heading}</SectionHeading>
        ) : null}

        <div
          className={cn(
            masonry
              ? 'columns-2 gap-4 md:columns-3'
              : 'grid grid-cols-2 gap-4 md:grid-cols-3',
          )}
        >
          {props.images.map((image, index) => (
            <figure
              key={`${image.asset}-${index}`}
              className={cn(
                'overflow-hidden rounded-lg border',
                LINE,
                masonry && 'mb-4 break-inside-avoid',
              )}
            >
              <div className='aspect-[4/3]'>
                <BlockImage
                  assetId={image.asset}
                  alt={image.alt}
                  context={context}
                />
              </div>
              {image.caption ? (
                <figcaption className='px-3 py-2'>
                  <Typography
                    as='span'
                    font='satoshi'
                    weight='regular'
                    variant='c0'
                    className={MUTED}
                  >
                    {image.caption}
                  </Typography>
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaRenderer({ block }: { block: BlockOf<'cta'> }) {
  const { props } = block;
  const accent = props.tone === 'accent';

  return (
    <section className={cn(SURFACE, 'py-16 md:py-24')}>
      <div className='layout'>
        <div
          className={cn(
            'flex flex-col items-start gap-5 rounded-xl p-8 md:p-12',
            accent ? ACCENT_BG : cn('border', LINE),
          )}
        >
          <Typography
            as='h2'
            font='helveticaNeue'
            weight='light'
            variant='j2'
            className={accent ? ACCENT_INK : INK}
          >
            {props.heading}
          </Typography>

          {props.description ? (
            <Typography
              as='p'
              font='satoshi'
              weight='regular'
              variant='b1'
              className={accent ? ACCENT_INK : MUTED}
            >
              {props.description}
            </Typography>
          ) : null}

          <CtaLink action={props.action} tone={accent ? 'neutral' : 'accent'} />
        </div>
      </div>
    </section>
  );
}

const DIVIDER_SPACING = {
  sm: 'h-6',
  md: 'h-12',
  lg: 'h-20',
} satisfies Record<BlockOf<'divider'>['props']['spacing'], string>;

function DividerRenderer({ block }: { block: BlockOf<'divider'> }) {
  return (
    <div className={DIVIDER_SPACING[block.props.spacing]} aria-hidden='true' />
  );
}

type RendererFor<T extends BlockType> = ComponentType<{
  block: BlockOf<T>;
  context: BlockRenderContext;
}>;

/**
 * The registry. `satisfies` keeps the map exhaustive over `BlockType`.
 */
export const BLOCK_RENDERERS = {
  hero: HeroRenderer,
  richText: RichTextRenderer,
  eventDetails: EventDetailsRenderer,
  agenda: AgendaRenderer,
  gallery: GalleryRenderer,
  cta: CtaRenderer,
  divider: DividerRenderer,
} satisfies { [T in BlockType]: RendererFor<T> };

function UnknownBlock({ type }: { type: string }) {
  return (
    <section className='layout py-8'>
      <div
        role='note'
        className={cn('rounded-lg border border-dashed p-4', LINE)}
      >
        <Typography
          as='p'
          font='satoshi'
          weight='regular'
          variant='b4'
          className={MUTED}
        >
          Blok tidak dikenal: {type}. Halaman perlu diperbaiki di CMS.
        </Typography>
      </div>
    </section>
  );
}

/**
 * Dispatch one block.
 *
 * TypeScript cannot correlate `BLOCK_RENDERERS[block.type]` with the narrowed
 * `block`, so the map lookup is widened once here. The runtime guard still
 * covers unknown types that bypassed validation.
 */
export function BlockRenderer({
  block,
  context,
}: {
  block: Block;
  context: BlockRenderContext;
}) {
  const Renderer = BLOCK_RENDERERS[block.type] as
    | ComponentType<{ block: Block; context: BlockRenderContext }>
    | undefined;

  if (!Renderer) return <UnknownBlock type={block.type} />;

  return <Renderer block={block} context={context} />;
}

/** Renders a page body in array order. */
export function BlockList({
  blocks,
  context,
}: {
  blocks: readonly Block[];
  context: BlockRenderContext;
}) {
  return (
    <div className={cn(SURFACE, INK)}>
      {blocks.map((block) => (
        <BlockRenderer key={block.id} block={block} context={context} />
      ))}
    </div>
  );
}
