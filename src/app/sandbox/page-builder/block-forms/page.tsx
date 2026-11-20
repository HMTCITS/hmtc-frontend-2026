'use client';

import Link from 'next/link';
import { type ComponentType, useId, useState } from 'react';
import type { z } from 'zod';

import type { BlockFormProps } from '@/app/dashboard/cms/_components/blocks/block-form-utils';
import { CtaBlockForm } from '@/app/dashboard/cms/_components/blocks/CtaBlockForm';
import { DividerBlockForm } from '@/app/dashboard/cms/_components/blocks/DividerBlockForm';
import { HeroBlockForm } from '@/app/dashboard/cms/_components/blocks/HeroBlockForm';
import { RichTextBlockForm } from '@/app/dashboard/cms/_components/blocks/RichTextBlockForm';
import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { toValidationIssues } from '@/lib/cms/errors';
import { BlockRenderer } from '@/lib/directus/block-renderers';
import {
  BLOCK_META,
  type BlockOf,
  createBlock,
  ctaBlock,
  dividerBlock,
  heroBlock,
  richTextBlock,
} from '@/lib/directus/blocks';
import { cn } from '@/lib/utils';

type DemoType = 'hero' | 'richText' | 'cta' | 'divider';

type Preset<T extends DemoType> = {
  label: string;
  block: BlockOf<T>;
};

/** The schema stores asset uuids, so the demo maps one to a local file. */
const SAMPLE_IMAGE = '11111111-1111-4111-8111-111111111111';

const context = {
  resolveAssetUrl: (assetId: string) =>
    assetId === SAMPLE_IMAGE
      ? '/images/halamandepan.png'
      : '/images/not-exist.png',
};

/**
 * `createBlock` mints a random id. This page renders on the server and again in
 * the browser, so the id is pinned to keep both renders identical.
 */
function defaultBlock<T extends DemoType>(type: T): BlockOf<T> {
  return { ...createBlock(type), id: `demo-${type}` };
}

const HERO_PRESETS: readonly Preset<'hero'>[] = [
  { label: 'Default', block: defaultBlock('hero') },
  {
    label: 'Contoh terisi',
    block: {
      type: 'hero',
      version: 1,
      id: 'demo-hero',
      props: {
        eyebrow: 'Internal Affairs',
        title: 'Syukuran Wisudawan ke-133',
        description: 'Contoh isi yang ditulis lewat form, tanpa HTML dari CMS.',
        image: SAMPLE_IMAGE,
        imageAlt: 'Suasana acara HMTC',
        align: 'left',
        cta: {
          label: 'Lihat proker lain',
          href: '/research-and-technology/bluecamp/2026',
        },
      },
    },
  },
  {
    label: 'Contoh tidak valid',
    block: {
      type: 'hero',
      version: 1,
      id: 'demo-hero',
      props: {
        title: '',
        image: 'bukan-uuid',
        align: 'center',
        cta: { label: '', href: 'javascript:alert(1)' },
      },
    },
  },
];

const RICH_TEXT_PRESETS: readonly Preset<'richText'>[] = [
  { label: 'Default', block: defaultBlock('richText') },
  {
    label: 'Contoh terisi',
    block: {
      type: 'richText',
      version: 1,
      id: 'demo-richText',
      props: {
        heading: 'Tentang Acara',
        paragraphs: [
          'Setiap paragraf disimpan sebagai teks. Renderer yang menambahkan tag paragraf.',
          'Tag seperti <b>ini</b> tampil sebagai teks biasa, tidak dijalankan.',
        ],
      },
    },
  },
  {
    label: 'Contoh tidak valid',
    block: {
      type: 'richText',
      version: 1,
      id: 'demo-richText',
      props: {
        heading: 'Judul bagian ini sengaja dibuat terlalu panjang. '.repeat(3),
        paragraphs: ['', 'Paragraf pertama di atas sengaja dikosongkan.'],
      },
    },
  },
];

const CTA_PRESETS: readonly Preset<'cta'>[] = [
  { label: 'Default', block: defaultBlock('cta') },
  {
    label: 'Contoh terisi',
    block: {
      type: 'cta',
      version: 1,
      id: 'demo-cta',
      props: {
        heading: 'Ikut acara berikutnya',
        description: 'Pendaftaran dibuka sampai akhir bulan.',
        action: {
          label: 'Daftar sekarang',
          href: 'https://example.com/daftar',
        },
        tone: 'neutral',
      },
    },
  },
  {
    label: 'Contoh tidak valid',
    block: {
      type: 'cta',
      version: 1,
      id: 'demo-cta',
      props: {
        heading: '',
        action: {
          label: 'Label tombol ini sengaja dibuat terlalu panjang',
          href: 'http://tanpa-https.example',
        },
        tone: 'accent',
      },
    },
  },
];

const DIVIDER_PRESETS: readonly Preset<'divider'>[] = [
  { label: 'Default', block: defaultBlock('divider') },
  {
    label: 'Contoh terisi',
    block: {
      type: 'divider',
      version: 1,
      id: 'demo-divider',
      props: { spacing: 'lg' },
    },
  },
];

function StatusPill({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full bg-gray-100 px-2 py-0.5',
        ok
          ? 'text-[var(--color-text-success)]'
          : 'text-[var(--color-text-error)]',
      )}
    >
      <Typography as='span' font='satoshi' weight='medium' variant='c2'>
        {ok ? 'lolos skema' : 'ditolak skema'}
      </Typography>
    </span>
  );
}

type FormDemoProps<T extends DemoType> = {
  type: T;
  schema: z.ZodType<BlockOf<T>>;
  Form: ComponentType<BlockFormProps<T>>;
  /** The first preset is the `blockDefaults` value and must be valid. */
  presets: readonly Preset<T>[];
  readOnly: boolean;
};

function FormDemo<T extends DemoType>({
  type,
  schema,
  Form,
  presets,
  readOnly,
}: FormDemoProps<T>) {
  const headingId = useId();
  const [block, setBlock] = useState(presets[0].block);
  const [lastValid, setLastValid] = useState(presets[0].block);

  const result = schema.safeParse(block);
  const issues = result.success ? [] : toValidationIssues(result.error);

  function update(next: BlockOf<T>) {
    setBlock(next);
    // The public page only ever renders blocks that passed the schema, so the
    // preview does the same and holds the last block that did.
    if (schema.safeParse(next).success) setLastValid(next);
  }

  return (
    <section aria-labelledby={headingId} className='space-y-3'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Typography
          as='h2'
          id={headingId}
          font='satoshi'
          weight='semibold'
          variant='h3'
          className='text-gray-900'
        >
          {BLOCK_META[type].label}
        </Typography>

        <div
          role='group'
          aria-label={`Data contoh ${BLOCK_META[type].label}`}
          className='flex flex-wrap gap-2'
        >
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type='button'
              variant='outline'
              size='sm'
              className='bg-white'
              onClick={() => update(preset.block)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className='flex flex-col gap-4 xl:flex-row xl:items-start'>
        <div className='rounded-xl border border-gray-200 bg-white p-4 xl:w-80 xl:shrink-0'>
          <Form value={block} onChange={update} disabled={readOnly} />
        </div>

        <div className='min-w-0 flex-1 space-y-4'>
          <div className='overflow-hidden rounded-xl border border-gray-200 bg-white'>
            <BlockRenderer block={lastValid} context={context} />
          </div>

          <div className='space-y-3 rounded-lg border border-gray-200 bg-white p-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <StatusPill ok={result.success} />
              <Typography
                as='p'
                font='satoshi'
                variant='b4'
                className='text-gray-500'
              >
                {result.success
                  ? 'Pratinjau di atas mengikuti form.'
                  : 'Pratinjau di atas menahan versi valid terakhir.'}
              </Typography>
            </div>

            {issues.length > 0 ? (
              <div className='space-y-1'>
                <Typography
                  as='p'
                  font='satoshi'
                  variant='b4'
                  className='text-gray-500'
                >
                  Issue mentah dari skema, dalam format yang dikirim server.
                  Form menampilkan issue yang sama per field, dengan kata-kata
                  yang lebih ramah untuk aturan panjang teks.
                </Typography>
                <ul className='space-y-1'>
                  {issues.map((issue) => (
                    <li key={`${issue.path}-${issue.message}`}>
                      <Typography
                        as='p'
                        font='jetbrainsMono'
                        variant='c0'
                        className='text-gray-600'
                      >
                        {issue.path}: {issue.message}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Typography
              as='pre'
              font='jetbrainsMono'
              variant='c0'
              className='overflow-x-auto rounded bg-gray-50 p-3 text-gray-700'
            >
              {JSON.stringify(block, null, 2)}
            </Typography>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BlockFormsDemoPage() {
  const [readOnly, setReadOnly] = useState(false);

  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <main className='mx-auto w-full max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8'>
        <header className='space-y-2'>
          <Typography
            as='p'
            font='satoshi'
            weight='semibold'
            variant='j2'
            className='text-gray-900'
          >
            Block Form Demo
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='max-w-3xl leading-6 text-gray-500'
          >
            Empat form editor blok dengan data contoh. Setiap form mulai dari
            blockDefaults, divalidasi dengan skema di blocks.ts, dan menampilkan
            error per field. Di sebelahnya ada pratinjau, hasil validasi skema,
            dan JSON yang dihasilkan form. Tidak ada koneksi ke Directus dan
            tidak ada yang disimpan.
          </Typography>
          <Link
            href='/sandbox/page-builder'
            className='inline-flex text-sm text-navy underline'
          >
            Kembali ke Page Builder
          </Link>
        </header>

        <div className='flex flex-wrap items-center gap-3'>
          <Button
            type='button'
            variant={readOnly ? 'default' : 'outline'}
            size='sm'
            aria-pressed={readOnly}
            className={cn(!readOnly && 'bg-white')}
            onClick={() => setReadOnly((current) => !current)}
          >
            Mode baca saja
          </Button>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='text-gray-500'
          >
            Mengunci semua form lewat prop disabled.
          </Typography>
        </div>

        <FormDemo
          type='hero'
          schema={heroBlock}
          Form={HeroBlockForm}
          presets={HERO_PRESETS}
          readOnly={readOnly}
        />
        <FormDemo
          type='richText'
          schema={richTextBlock}
          Form={RichTextBlockForm}
          presets={RICH_TEXT_PRESETS}
          readOnly={readOnly}
        />
        <FormDemo
          type='cta'
          schema={ctaBlock}
          Form={CtaBlockForm}
          presets={CTA_PRESETS}
          readOnly={readOnly}
        />
        <FormDemo
          type='divider'
          schema={dividerBlock}
          Form={DividerBlockForm}
          presets={DIVIDER_PRESETS}
          readOnly={readOnly}
        />
      </main>
    </div>
  );
}
