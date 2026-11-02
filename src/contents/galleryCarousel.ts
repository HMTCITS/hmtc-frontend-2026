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

// Order = carousel order. The first entry is the starting main card.
const DIRECTUS_ASSETS = 'https://directus.hmtc-its.com/assets';

const FEATURED_IMAGES = [
  `${DIRECTUS_ASSETS}/6c6b6232-3fda-48d6-a7ac-22a0aa6d82aa`, // TC Run
  `${DIRECTUS_ASSETS}/fcff7f13-8eb9-4c79-9a2d-28d8d67c9bf1`, // Benchmarking HMTC ITS x HMIF ITB
  `${DIRECTUS_ASSETS}/cfe1b5ff-39cb-4107-941e-09669a4ffd40`, // OKKBK 2026
  `${DIRECTUS_ASSETS}/43ee0b5a-f6ae-418f-9366-b020203d9b63`, // Basic Media Schooling (BMS)
  `${DIRECTUS_ASSETS}/2b839d7b-28ba-47f5-a7ba-dc19c631d62c`, // HMTC x BEM FTEIC Peduli
  `${DIRECTUS_ASSETS}/4604c029-9bae-4d76-8f14-f7c2acae8319`, // Supporteran Basket ELITExPESRAF
] as const;

type FeaturedImage = (typeof FEATURED_IMAGES)[number];

// TODO(content): 1–2 sentences per event, supplied by HMTC. Keyed by image URL.
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
