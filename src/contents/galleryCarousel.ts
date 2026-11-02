import { galleryItems } from '@/contents/gallery';

export type GalleryCarouselEvent = {
  /** Stable React key. The image path, because `gallery.ts` ids are not unique. */
  key: string;
  title: string;
  date: string;
  /** e.g. '/gallery/tcCup.JPG' — NextImage prefixes '/images'. */
  image: string;
  /** Google Drive album. */
  link: string;
  /** Shown under the title. When missing, the event date is shown instead. */
  description?: string;
};

// Order = carousel order. The first entry is the starting main card.
const FEATURED_IMAGES = [
  '/gallery/FarewellParty.JPG',
  '/gallery/baktiSosialUPTDLiponsosKalijudan.jpg',
  '/gallery/hmtcSuImt2025.jpg',
  '/gallery/tcGathering.jpg',
  '/gallery/tcCup.JPG',
  '/gallery/hmtcNextGen.jpg',
] as const;

type FeaturedImage = (typeof FEATURED_IMAGES)[number];

// TODO(content): 1–2 sentences per event, supplied by HMTC. Keyed by image path.
const DESCRIPTIONS: Partial<Record<FeaturedImage, string>> = {};

export const galleryCarouselEvents: GalleryCarouselEvent[] =
  FEATURED_IMAGES.flatMap((image) => {
    const item = galleryItems.find((g) => g.image === image);

    if (!item) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(
          `[galleryCarousel] No galleryItems entry for "${image}" — skipped.`,
        );
      }
      return [];
    }

    return [
      {
        key: item.image,
        title: item.title,
        date: item.date,
        image: item.image,
        link: item.link,
        description: DESCRIPTIONS[image],
      },
    ];
  });
