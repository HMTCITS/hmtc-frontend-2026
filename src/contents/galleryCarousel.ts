import { galleryItems } from '@/contents/gallery';

export type GalleryCarouselEvent = {
  /** Stable React key. The image URL, unique per gallery entry. */
  key: string;
  title: string;
  date: string;
  /** Directus asset URL, e.g. 'https://directus.hmtc-its.com/assets/<uuid>'. */
  image: string;
  /** Album link. When missing, the "Explore More" button is hidden. */
  link?: string;
  /** Shown under the title. When missing, the event date is shown instead. */
  description?: string;
};

// TODO(content): 1–2 sentences per event, supplied by HMTC. Keyed by image URL.
const DESCRIPTIONS: Record<string, string> = {};

// Every galleryItems entry, in its declared order. The first entry is the
// starting main card. Add or reorder events in src/contents/gallery.ts only.
export const galleryCarouselEvents: GalleryCarouselEvent[] = galleryItems.map(
  (item) => ({
    key: item.image,
    title: item.title,
    date: item.date,
    image: item.image,
    link: item.link,
    description: DESCRIPTIONS[item.image],
  }),
);
