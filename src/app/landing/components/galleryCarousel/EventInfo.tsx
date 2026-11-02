import { ArrowUpRight } from 'lucide-react';
import type { Transition, Variants } from 'motion/react';
import { AnimatePresence, motion, useIsPresent } from 'motion/react';
import * as React from 'react';

import BaseLink from '@/components/links/BaseLink';
import Typography from '@/components/Typography';
import type { GalleryCarouselEvent } from '@/contents/galleryCarousel';
import { cn } from '@/lib/utils';

type EventInfoProps = {
  events: GalleryCarouselEvent[];
  /** Index into `events` of the event on the main card. */
  index: number;
  /** +1 forward, -1 backward, 0 none. Decides which way the title rolls. */
  direction: number;
  reduceMotion: boolean;
  className?: string;
};

// "Title Stack": going forward, the old title leaves upward and the new one
// arrives from below. Going backward, the reverse.
const roll: Variants = {
  enter: (d: number) => ({ y: d >= 0 ? '100%' : '-100%' }),
  center: { y: '0%' },
  exit: (d: number) => ({ y: d >= 0 ? '-100%' : '100%' }),
};

const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

type LayerProps = {
  variants: Variants;
  direction: number;
  transition: Transition;
  className?: string;
  children: React.ReactNode;
};

/**
 * One copy of the content inside a grid cell. While a copy is leaving, it is
 * hidden from screen readers and made inert so its link can't take focus.
 */
function Layer({
  variants,
  direction,
  transition,
  className,
  children,
}: LayerProps) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial='enter'
      animate='center'
      exit='exit'
      transition={transition}
      aria-hidden={isPresent ? undefined : true}
      inert={!isPresent}
      className={cn(
        '[grid-area:1/1]',
        !isPresent && 'pointer-events-none',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

type HeadlineProps = { event: GalleryCarouselEvent; isSizer?: boolean };

/** Date eyebrow + event title. */
function Headline({ event, isSizer = false }: HeadlineProps) {
  return (
    <>
      <Typography
        font='satoshi'
        weight='medium'
        variant='c0'
        className='tracking-[0.18em] text-white/55 uppercase'
      >
        {event.date}
      </Typography>
      <Typography
        as={isSizer ? 'p' : 'h3'}
        font='satoshi'
        weight='medium'
        variant='j2'
        className='mt-3 leading-tight text-white'
      >
        {event.title}
      </Typography>
    </>
  );
}

export default function EventInfo({
  events,
  index,
  direction,
  reduceMotion,
  className,
}: EventInfoProps) {
  const event = events[index];
  const transition: Transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };

  return (
    <div className={className}>
      {/* Mask. Every headline also sits invisibly in the same grid cell, so the
          cell is as tall as the longest one and nothing below it jumps. The
          visible copy fills the cell and sits at its bottom, so a ±100% roll
          always clears the mask. */}
      <div className='relative grid overflow-hidden'>
        {events.map((e) => (
          <div
            key={e.key}
            aria-hidden='true'
            className='invisible [grid-area:1/1]'
          >
            <Headline event={e} isSizer />
          </div>
        ))}
        <AnimatePresence initial={false} custom={direction}>
          <Layer
            key={event.key}
            variants={roll}
            direction={direction}
            transition={transition}
            className='flex flex-col justify-end'
          >
            <Headline event={event} />
          </Layer>
        </AnimatePresence>
      </div>

      {/* TODO(content): descriptions come from galleryCarousel.ts. */}
      <div className='grid'>
        <AnimatePresence initial={false} custom={direction}>
          <Layer
            key={event.key}
            variants={fade}
            direction={direction}
            transition={transition}
          >
            {event.description && (
              <Typography
                font='satoshi'
                weight='regular'
                variant='b2'
                className='mt-4 line-clamp-3 text-white/60'
              >
                {event.description}
              </Typography>
            )}
          </Layer>
        </AnimatePresence>
      </div>

      <div aria-hidden='true' className='my-6 h-px w-full bg-white/12' />

      <div className='flex items-center justify-between gap-4'>
        {/* Same pill as the Instagram link in RevealKabinet; inverts on hover. */}
        <BaseLink
          href={event.link}
          className='inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-white transition-colors duration-75 hover:border-white hover:bg-white hover:text-[#0B0B0C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0078B4]'
        >
          <Typography as='span' font='satoshi' weight='medium' variant='b4'>
            Explore More
          </Typography>
          <ArrowUpRight
            aria-hidden='true'
            strokeWidth={1.5}
            className='size-4'
          />
          <span className='sr-only'> — {event.title} (opens in new tab)</span>
        </BaseLink>

        {/* Position counter. Screen readers get it from the live region. */}
        <Typography
          as='div'
          aria-hidden='true'
          font='satoshi'
          weight='medium'
          variant='c0'
          className='flex tracking-[0.18em] text-white/55 tabular-nums'
        >
          <div className='relative grid overflow-hidden text-white'>
            <AnimatePresence initial={false} custom={direction}>
              <Layer
                key={event.key}
                variants={roll}
                direction={direction}
                transition={transition}
              >
                {pad(index + 1)}
              </Layer>
            </AnimatePresence>
          </div>
          <span className='px-1.5'>/</span>
          {pad(events.length)}
        </Typography>
      </div>
    </div>
  );
}
