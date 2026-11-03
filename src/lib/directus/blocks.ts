/**
 * HMTC CMS - approved React block registry.
 *
 * This module is the single source of truth for the JSON stored in
 * `cms_pages.blocks` and `cms_templates.blocks`. Directus stores those columns
 * as opaque JSON; the shape is defined here and validated on write and on read.
 *
 * Rules this file enforces:
 *  - No HTML, CSS or JavaScript travels through CMS content.
 *  - Every block carries a stable `id` (React key, editor selection) and a
 *    per-block `version` (migration seam).
 *  - Order is array order. There is deliberately no `order` field.
 *  - Unknown keys are rejected rather than ignored, so a typo surfaces at save
 *    time instead of silently disappearing.
 *
 * Two validation strengths exist on purpose:
 *  - `blocksSchema`        structural, for saving a draft.
 *  - `publishBlocksSchema` adds content completeness, for publishing.
 *
 * See `docs/hmtc-cms-block-schema.md` for the storage and rendering contract.
 */

import { z } from 'zod';

/** Schema revision of this registry. Bump only for cross-block changes. */
export const BLOCKS_SCHEMA_VERSION = 1;

/** Hard ceilings. They also bound the size of the single `blocks` JSON column. */
export const BLOCK_LIMITS = {
  blocksPerPage: 60,
  paragraphsPerBlock: 40,
  paragraphChars: 2000,
  galleryImages: 24,
  agendaItems: 30,
  detailItems: 12,
  heroTitleChars: 140,
  headingChars: 120,
  ctaLabelChars: 40,
  hrefChars: 2048,
} as const;

const blockId = z
  .string()
  .min(1)
  .max(64)
  .regex(
    /^[A-Za-z0-9_-]+$/,
    'id blok hanya boleh huruf, angka, tanda hubung, dan garis bawah',
  );

/** A Directus asset uuid. Never a `/images/...` path. */
const assetId = z.string().uuid('harus uuid aset Directus');

const heading = z.string().min(1).max(BLOCK_LIMITS.headingChars);

/**
 * Link allowlist.
 *
 * Rejects `javascript:`, `data:`, and protocol-relative `//host` URLs. An
 * internal target must start with a single `/`.
 */
const href = z
  .string()
  .min(1)
  .max(BLOCK_LIMITS.hrefChars)
  .refine(
    (value) =>
      value.startsWith('/')
        ? !value.startsWith('//')
        : /^(https:\/\/|mailto:)/.test(value),
    'tautan harus path internal, https, atau mailto',
  );

const callToAction = z.strictObject({
  label: z.string().min(1).max(BLOCK_LIMITS.ctaLabelChars),
  href,
});

/**
 * Shared envelope. `version` is per block type so one block can migrate
 * without touching its siblings.
 */
function defineBlock<TType extends string, TProps extends z.ZodRawShape>(
  type: TType,
  version: 1,
  props: TProps,
) {
  return z.strictObject({
    type: z.literal(type),
    version: z.literal(version),
    id: blockId,
    props: z.strictObject(props),
  });
}

/** Page-level banner. The only block allowed to render an `<h1>`. */
export const heroBlock = defineBlock('hero', 1, {
  eyebrow: z.string().max(80).optional(),
  title: z.string().min(1).max(BLOCK_LIMITS.heroTitleChars),
  description: z.string().max(600).optional(),
  image: assetId.nullable().optional(),
  imageAlt: z.string().max(160).optional(),
  align: z.enum(['left', 'center']),
  cta: callToAction.optional(),
});

/** Body copy. Paragraphs are separate items; the renderer adds the `<p>` tags. */
export const richTextBlock = defineBlock('richText', 1, {
  heading: heading.optional(),
  paragraphs: z
    .array(z.string().min(1).max(BLOCK_LIMITS.paragraphChars))
    .max(BLOCK_LIMITS.paragraphsPerBlock),
});

/** Date, time, venue and similar key/value rows. */
export const eventDetailsBlock = defineBlock('eventDetails', 1, {
  heading: heading.optional(),
  items: z
    .array(
      z.strictObject({
        label: z.string().min(1).max(40),
        value: z.string().min(1).max(160),
        icon: z
          .enum(['calendar', 'clock', 'location', 'ticket', 'link'])
          .optional(),
      }),
    )
    .max(BLOCK_LIMITS.detailItems),
});

/** Run-of-show list. */
export const agendaBlock = defineBlock('agenda', 1, {
  heading: heading.optional(),
  items: z
    .array(
      z.strictObject({
        time: z.string().min(1).max(40),
        title: z.string().min(1).max(120),
        description: z.string().max(300).optional(),
      }),
    )
    .max(BLOCK_LIMITS.agendaItems),
});

/** Photo grid. `alt` is required: the renderer must never guess it. */
export const galleryBlock = defineBlock('gallery', 1, {
  heading: heading.optional(),
  layout: z.enum(['grid', 'masonry']),
  images: z
    .array(
      z.strictObject({
        asset: assetId,
        alt: z.string().min(1).max(160),
        caption: z.string().max(160).optional(),
      }),
    )
    .max(BLOCK_LIMITS.galleryImages),
});

/** Closing call to action. */
export const ctaBlock = defineBlock('cta', 1, {
  heading: z.string().min(1).max(BLOCK_LIMITS.headingChars),
  description: z.string().max(300).optional(),
  action: callToAction,
  tone: z.enum(['accent', 'neutral']),
});

/** Vertical rhythm between sections. */
export const dividerBlock = defineBlock('divider', 1, {
  spacing: z.enum(['sm', 'md', 'lg']),
});

/** Discriminated union of every approved block. Adding one starts here. */
export const blockSchema = z.discriminatedUnion('type', [
  heroBlock,
  richTextBlock,
  eventDetailsBlock,
  agendaBlock,
  galleryBlock,
  ctaBlock,
  dividerBlock,
]);

export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

export const BLOCK_TYPES = [
  'hero',
  'richText',
  'eventDetails',
  'agenda',
  'gallery',
  'cta',
  'divider',
] as const satisfies readonly BlockType[];

/**
 * Draft-safe page body.
 *
 * Structural rules only: a draft may hold an empty gallery or an empty agenda.
 * Content completeness is enforced by `publishBlocksSchema`.
 *
 * Ids must be unique because they are React keys and editor selection handles.
 */
export const blocksSchema = z
  .array(blockSchema)
  .min(1, 'halaman minimal punya satu blok')
  .max(BLOCK_LIMITS.blocksPerPage)
  .superRefine((blocks, ctx) => {
    const seen = new Set<string>();
    blocks.forEach((block, index) => {
      if (seen.has(block.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `id blok duplikat: ${block.id}`,
          path: [index, 'id'],
        });
      }
      seen.add(block.id);
    });
  });

/**
 * Publish-safe page body.
 *
 * `hero` must appear exactly once, which is what guarantees the public page has
 * exactly one `<h1>` (AGENTS.md §7).
 */
export const publishBlocksSchema = blocksSchema.superRefine((blocks, ctx) => {
  const heroes = blocks.filter((block) => block.type === 'hero');
  if (heroes.length !== 1) {
    ctx.addIssue({
      code: 'custom',
      message: 'halaman harus punya tepat satu blok hero sebelum publish',
      path: [],
    });
  }

  blocks.forEach((block, index) => {
    const empty =
      (block.type === 'richText' && block.props.paragraphs.length === 0) ||
      (block.type === 'agenda' && block.props.items.length === 0) ||
      (block.type === 'eventDetails' && block.props.items.length === 0) ||
      (block.type === 'gallery' && block.props.images.length === 0);

    if (empty) {
      ctx.addIssue({
        code: 'custom',
        message: 'blok masih kosong',
        path: [index, 'props'],
      });
    }
  });
});

export type PageBlocks = z.infer<typeof blocksSchema>;

/** Editor-facing metadata. Not persisted; drives the block palette. */
export const BLOCK_META = {
  hero: { label: 'Hero', category: 'event', singleton: true },
  richText: { label: 'Rich Text', category: 'content', singleton: false },
  eventDetails: {
    label: 'Event Details',
    category: 'event',
    singleton: false,
  },
  agenda: { label: 'Agenda', category: 'event', singleton: false },
  gallery: { label: 'Gallery', category: 'event', singleton: false },
  cta: { label: 'Call to Action', category: 'content', singleton: false },
  divider: { label: 'Divider', category: 'layout', singleton: false },
} as const satisfies Record<
  BlockType,
  {
    label: string;
    category: 'event' | 'content' | 'layout';
    singleton: boolean;
  }
>;

type BlockDefaults = { [K in BlockType]: () => BlockOf<K> };

/**
 * Default values for a newly inserted block.
 *
 * Factories, not shared literals: a shared object would be mutated in place and
 * silently leak content between blocks.
 */
export const blockDefaults: BlockDefaults = {
  hero: () => ({
    type: 'hero',
    version: 1,
    id: newBlockId(),
    props: {
      title: 'Judul halaman',
      align: 'center',
    },
  }),
  richText: () => ({
    type: 'richText',
    version: 1,
    id: newBlockId(),
    props: { paragraphs: ['Tulis isi bagian ini.'] },
  }),
  eventDetails: () => ({
    type: 'eventDetails',
    version: 1,
    id: newBlockId(),
    props: {
      heading: 'Detail Acara',
      items: [{ label: 'Tanggal', value: '1 Januari 2026', icon: 'calendar' }],
    },
  }),
  agenda: () => ({
    type: 'agenda',
    version: 1,
    id: newBlockId(),
    props: {
      heading: 'Susunan Acara',
      items: [{ time: '08.00', title: 'Registrasi' }],
    },
  }),
  gallery: () => ({
    type: 'gallery',
    version: 1,
    id: newBlockId(),
    props: { heading: 'Galeri', layout: 'grid', images: [] },
  }),
  cta: () => ({
    type: 'cta',
    version: 1,
    id: newBlockId(),
    props: {
      heading: 'Sampai jumpa di acara berikutnya',
      action: { label: 'Lihat proker lain', href: '/' },
      tone: 'accent',
    },
  }),
  divider: () => ({
    type: 'divider',
    version: 1,
    id: newBlockId(),
    props: { spacing: 'md' },
  }),
};

/**
 * Build an empty block. The result is a *draft*: `publishBlocksSchema` will
 * reject it if a required collection is still empty.
 */
export function createBlock<T extends BlockType>(type: T): BlockOf<T> {
  return blockDefaults[type]();
}

/** UUID when available, otherwise a counter-based id for older runtimes. */
let fallbackId = 0;
function newBlockId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  fallbackId += 1;
  return `blk-${Date.now().toString(36)}-${fallbackId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Apply per-block migrations before validation.
 *
 * Today every block is version 1. When a block reaches version 2, upgrade the
 * stored value here and let the new schema parse the result. Migration happens
 * on read only: stored JSON is never rewritten in place, so revisions stay
 * reproducible.
 */
function migrateBlock(raw: unknown): unknown {
  if (!isRecord(raw)) return raw;
  // Example for a future bump:
  // if (raw.type === 'hero' && raw.version === 1) return { ...raw, version: 2 };
  return raw;
}

export type BlockValidationMode = 'draft' | 'publish';

/**
 * Write path.
 *
 * `draft` checks structure; `publish` also checks completeness and the
 * single-hero rule. Throws `ZodError`; the Route Handler maps it to 422.
 */
export function parseBlocksForWrite(
  input: unknown,
  mode: BlockValidationMode = 'draft',
): PageBlocks {
  return mode === 'publish'
    ? publishBlocksSchema.parse(input)
    : blocksSchema.parse(input);
}

export type InvalidBlock = {
  /** Index in the stored array, or -1 for a page-level problem. */
  index: number;
  type: string | null;
  reason: string;
};

export type ReadBlocksResult = {
  blocks: Block[];
  invalid: InvalidBlock[];
};

/**
 * Read path: never throws.
 *
 * A single malformed or unknown block must not take down a public page. Valid
 * blocks render, invalid ones are reported so the editor can surface an
 * actionable error and block publication.
 */
export function parseBlocksForRead(input: unknown): ReadBlocksResult {
  if (!Array.isArray(input)) {
    return {
      blocks: [],
      invalid: [{ index: -1, type: null, reason: 'blocks bukan array' }],
    };
  }

  const blocks: Block[] = [];
  const invalid: InvalidBlock[] = [];

  input.forEach((raw, index) => {
    const result = blockSchema.safeParse(migrateBlock(raw));
    if (result.success) {
      blocks.push(result.data);
      return;
    }

    invalid.push({
      index,
      type: readTypeOf(raw),
      reason: result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; '),
    });
  });

  if (blocks.length > 0 && !blocks.some((block) => block.type === 'hero')) {
    invalid.push({
      index: -1,
      type: null,
      reason: 'halaman tidak punya blok hero, sehingga tidak punya <h1>',
    });
  }

  return { blocks, invalid };
}

function readTypeOf(raw: unknown): string | null {
  if (!isRecord(raw)) return null;
  return typeof raw.type === 'string' ? raw.type : null;
}

/**
 * Move a block within the array. Storage order is render order, so reordering
 * is a plain array move rather than a persisted `order` field.
 */
export function moveBlock(
  blocks: readonly Block[],
  from: number,
  to: number,
): Block[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= blocks.length ||
    to >= blocks.length
  ) {
    return [...blocks];
  }

  const next = [...blocks];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
