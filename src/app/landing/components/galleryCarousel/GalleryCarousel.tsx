'use client';

import type {
  EmblaCarouselType,
  EmblaEventType,
  EmblaOptionsType,
} from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import * as React from 'react';

import {
  getDirection,
  wrapIndex,
} from '@/app/landing/components/galleryCarousel/carousel-utils';
import EventCard, {
  type EventCardState,
} from '@/app/landing/components/galleryCarousel/EventCard';
import EventInfo from '@/app/landing/components/galleryCarousel/EventInfo';
import {
  type GalleryCarouselEvent,
  galleryCarouselEvents,
} from '@/contents/galleryCarousel';
import { cn } from '@/lib/utils';

/** With fewer events there is no loop and no prev/next controls. */
const LOOP_MIN_EVENTS = 3;
/**
 * Embla only loops when the slides overflow the viewport (3 slots wide on
 * tablet and desktop). Below this count the list is rendered twice.
 */
const DUPLICATE_BELOW = 5;

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0078B4]';

type Position = { snap: number; direction: -1 | 0 | 1 };

type GalleryCarouselProps = {
  events?: GalleryCarouselEvent[];
};

export default function GalleryCarousel({
  events = galleryCarouselEvents,
}: GalleryCarouselProps) {
  const total = events.length;
  const canLoop = total >= LOOP_MIN_EVENTS;

  // Rendered slide i always shows events[i % total].
  const slides = React.useMemo(
    () =>
      canLoop && total < DUPLICATE_BELOW ? [...events, ...events] : events,
    [events, canLoop, total],
  );
  const snapCount = slides.length;

  // JS-driven motion is not covered by the global CSS guard, so check here.
  const reduceMotion = useReducedMotion() ?? false;

  const options = React.useMemo<EmblaOptionsType>(
    () => ({
      loop: canLoop,
      align: 'center',
      containScroll: false,
      skipSnaps: false,
      duration: 28,
      // Embla scrolls a focused slide to the centre by default. Here, focusing
      // a side card should only show its hover state; Enter/click selects it.
      watchFocus: false,
    }),
    [canLoop],
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const [position, setPosition] = React.useState<Position>({
    snap: 0,
    direction: 0,
  });
  const regionRef = React.useRef<HTMLDivElement>(null);
  const trackRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!emblaApi) return;

    const sync = (api: EmblaCarouselType, evt: EmblaEventType) => {
      const next = api.selectedScrollSnap();
      const prev = api.previousScrollSnap();
      const n = api.scrollSnapList().length;
      const direction =
        evt !== 'select'
          ? 0
          : canLoop
            ? getDirection(prev, next, n)
            : (Math.sign(next - prev) as -1 | 0 | 1);
      setPosition({ snap: next, direction });
    };

    emblaApi.on('select', sync).on('reInit', sync);
    return () => {
      emblaApi.off('select', sync).off('reInit', sync);
    };
  }, [emblaApi, canLoop]);

  if (total === 0) return null;

  const snap = Math.min(position.snap, snapCount - 1);
  const eventIndex = snap % total;
  const event = slides[snap];
  const hasControls = canLoop;

  const getCardState = (i: number): EventCardState => {
    if (i === snap) return 'main';
    const isNeighbour = canLoop
      ? i === wrapIndex(snap - 1, snapCount) ||
        i === wrapIndex(snap + 1, snapCount)
      : Math.abs(i - snap) === 1;
    return isNeighbour ? 'side' : 'hidden';
  };

  // A focused side card loses its button once it becomes the main card.
  // Park focus on the carousel region so it doesn't fall back to <body>.
  const keepFocusInRegion = () => {
    const active = document.activeElement;
    if (active && trackRef.current?.contains(active)) {
      regionRef.current?.focus({ preventScroll: true });
    }
  };

  const goPrev = () => {
    keepFocusInRegion();
    emblaApi?.scrollPrev(reduceMotion);
  };
  const goNext = () => {
    keepFocusInRegion();
    emblaApi?.scrollNext(reduceMotion);
  };
  const goTo = (i: number) => {
    keepFocusInRegion();
    emblaApi?.scrollTo(i, reduceMotion);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (total < 2) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    }
  };

  const chevronClass = cn(
    'inline-flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-75 hover:bg-white/10 xl:size-16',
    FOCUS_RING,
  );

  return (
    <section
      id='gallery'
      aria-labelledby='gallery-heading'
      className='bg-[#121212] px-12 py-18 sm:p-18 md:p-24 xl:px-12'
    >
      {/* Caps the width so the info column and the carousel stay together on
          wide screens instead of drifting to opposite edges. */}
      <div className='mx-auto w-full max-w-7xl'>
        <div className='border-b border-white/12 pb-4'>
          {/* Same type as the RevealKabinet heading directly above ("The Faces
              Behind HMTC."), so the two sections read as a pair. Raw classes
              because that heading uses the system serif, which <Typography>
              has no key for. */}
          <h2
            id='gallery-heading'
            className='m-0 font-serif text-[48px] leading-[0.95] font-normal tracking-[-0.02em] text-[#EDEAE2]'
          >
            <em className='text-[#2B7FFF] italic'>Gallery</em> of HMTC
          </h2>
        </div>

        {/* DOM order is info → stage; below xl the stage is shown first. */}
        <div className='mt-10 flex flex-col gap-10 xl:flex-row xl:items-center xl:gap-12'>
          <EventInfo
            events={events}
            index={eventIndex}
            direction={position.direction}
            reduceMotion={reduceMotion}
            className='order-2 mx-auto w-full max-w-3xl xl:order-1 xl:mx-0 xl:w-80 xl:max-w-none xl:shrink-0'
          />

          {/* Below xl: grid — viewport on row 1, [‹] bars [›] on row 2.
            At xl: flex — [‹] viewport [›] on one line, bars hidden. */}
          <div
            ref={regionRef}
            role='region'
            aria-roledescription='carousel'
            aria-label='Gallery of HMTC events'
            tabIndex={0}
            onKeyDown={onKeyDown}
            className={cn(
              'order-1 mx-auto grid w-full max-w-3xl grid-cols-[auto_1fr_auto] items-center gap-y-6 rounded-lg',
              'xl:order-2 xl:mx-0 xl:flex xl:max-w-none xl:min-w-0 xl:flex-1 xl:gap-4',
              FOCUS_RING,
            )}
          >
            {hasControls && (
              <button
                type='button'
                onClick={goPrev}
                aria-label='Previous event'
                className={cn(chevronClass, 'col-start-1 row-start-2')}
              >
                <ChevronLeft strokeWidth={1.5} className='size-7 xl:size-10' />
              </button>
            )}

            <div
              ref={emblaRef}
              className='col-span-3 row-start-1 w-full overflow-hidden select-none xl:min-w-0 xl:flex-1'
            >
              {/* No flex gap: the 25px card gap comes from scaling side cards to 0.8. */}
              <div
                ref={trackRef}
                className='flex touch-pan-y touch-pinch-zoom items-center'
              >
                {slides.map((slide, i) => {
                  const state = getCardState(i);
                  return (
                    <div
                      key={`${slide.key}-${i}`}
                      role='group'
                      aria-roledescription='slide'
                      aria-label={`${(i % total) + 1} of ${total}: ${slide.title}`}
                      aria-hidden={state === 'hidden' || undefined}
                      className='min-w-0 shrink-0 grow-0 basis-3/5 sm:basis-1/2 md:basis-1/3'
                    >
                      <EventCard
                        event={slide}
                        state={state}
                        onSelect={() => goTo(i)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {hasControls && (
              <div
                aria-hidden='true'
                className='col-start-2 row-start-2 flex flex-wrap justify-center gap-1 xl:hidden'
              >
                {events.map((e, i) => (
                  <span
                    key={e.key}
                    className={cn(
                      'h-[2px] w-[14px]',
                      i === eventIndex ? 'bg-white' : 'bg-white/20',
                    )}
                  />
                ))}
              </div>
            )}

            {hasControls && (
              <button
                type='button'
                onClick={goNext}
                aria-label='Next event'
                className={cn(chevronClass, 'col-start-3 row-start-2')}
              >
                <ChevronRight strokeWidth={1.5} className='size-7 xl:size-10' />
              </button>
            )}
          </div>
        </div>
      </div>

      <p className='sr-only' aria-live='polite'>
        Event {eventIndex + 1} of {total}: {event.title}
      </p>
    </section>
  );
}
