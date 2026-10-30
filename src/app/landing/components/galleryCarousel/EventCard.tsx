import NextImage from '@/components/NextImage';
import type { GalleryCarouselEvent } from '@/contents/galleryCarousel';
import { cn } from '@/lib/utils';

/**
 * - `main`   — the big centred card. Not interactive.
 * - `side`   — a visible neighbour of the main card. Clickable and focusable.
 * - `hidden` — any other slide. Styled like a side card (it becomes one as the
 *              track moves) but not interactive.
 */
export type EventCardState = 'main' | 'side' | 'hidden';

type EventCardProps = {
  event: GalleryCarouselEvent;
  state: EventCardState;
  onSelect: () => void;
};

// Card size and fade share the canonical L1 entrance easing.
const EASE = 'duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

export default function EventCard({ event, state, onSelect }: EventCardProps) {
  const isMain = state === 'main';
  const isSide = state === 'side';

  // The wrapper never changes element type between states. Swapping a <div>
  // for a <button> would remount the photo and skip the scale transition, so
  // side cards get a full-size button laid on top instead.
  return (
    <div
      className={cn(
        // Tailwind v4 `scale-*` sets the CSS `scale` property, not `transform`.
        'group relative origin-center transition-[scale]',
        EASE,
        isMain ? 'scale-100' : 'scale-80',
      )}
    >
      <div className='relative aspect-[5/7] w-full overflow-hidden rounded-lg'>
        {/* Only the photo is dimmed, so the hover tint above it stays at a true 20%. */}
        <NextImage
          src={event.image}
          alt={event.title}
          fill
          useSkeleton
          draggable={false}
          sizes='(min-width: 1280px) 256px, (min-width: 768px) 33vw, 60vw'
          className={cn(
            'absolute inset-0 transition-opacity',
            EASE,
            isMain ? 'opacity-100' : 'opacity-50',
          )}
          imgClassName='object-cover object-center'
        />
        {/* Hover / focus tint for side cards. */}
        <span
          aria-hidden='true'
          className={cn(
            'pointer-events-none absolute inset-0 bg-white/20 opacity-0 transition-opacity',
            EASE,
            isSide &&
              'group-hover:opacity-100 group-has-[:focus-visible]:opacity-100',
          )}
        />
      </div>

      {isSide && (
        // Sits outside the overflow-hidden frame so its focus outline isn't clipped.
        <button
          type='button'
          onClick={onSelect}
          aria-label={`Show ${event.title}`}
          className='absolute inset-0 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0078B4]'
        />
      )}
    </div>
  );
}
