'use client';

import type { ComponentType } from 'react';

import type { BlockType } from '@/lib/directus/blocks';

import { AgendaBlockForm } from './agenda-block-form';
import type { BlockFormProps } from './block-form-utils';
import { CtaBlockForm } from './cta-block-form';
import { DividerBlockForm } from './divider-block-form';
import { EventDetailsBlockForm } from './event-details-block-form';
import { GalleryBlockForm } from './gallery-block-form';
import { HeroBlockForm } from './hero-block-form';
import { RichTextBlockForm } from './rich-text-block-form';

export { DEFAULT_MOCK_ASSET, MOCK_ASSETS } from './asset-picker';
export type { BlockFormProps } from './block-form-utils';
export {
  AgendaBlockForm,
  CtaBlockForm,
  DividerBlockForm,
  EventDetailsBlockForm,
  GalleryBlockForm,
  HeroBlockForm,
  RichTextBlockForm,
};

/**
 * One form per block type, for the editor screen (#224). Typed as a mapped
 * type, so a block type added to `blocks.ts` without a form fails to compile.
 */
export const BLOCK_FORMS: {
  [T in BlockType]: ComponentType<BlockFormProps<T>>;
} = {
  hero: HeroBlockForm,
  richText: RichTextBlockForm,
  eventDetails: EventDetailsBlockForm,
  agenda: AgendaBlockForm,
  gallery: GalleryBlockForm,
  cta: CtaBlockForm,
  divider: DividerBlockForm,
};
