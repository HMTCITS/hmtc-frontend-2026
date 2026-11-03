import type { Metadata } from 'next';
import Link from 'next/link';

import Typography from '@/components/Typography';
import { BlockList } from '@/lib/directus/block-renderers';
import {
  blocksSchema,
  parseBlocksForRead,
  publishBlocksSchema,
} from '@/lib/directus/blocks';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Block Schema Demo',
};

const HERO_ASSET = '11111111-1111-4111-8111-111111111111';
const GALLERY_1 = '22222222-2222-4222-8222-222222222222';
const GALLERY_2 = '33333333-3333-4333-8333-333333333333';
const GALLERY_3 = '44444444-4444-4444-8444-444444444444';

/**
 * Stand-in for the Directus asset host. The schema only accepts uuids, so the
 * demo keeps uuids and maps them to local files here.
 */
const LOCAL_ASSETS: Record<string, string> = {
  [HERO_ASSET]: '/images/halamandepan.png',
  [GALLERY_1]: '/images/gallery/FarewellParty.JPG',
  [GALLERY_2]: '/images/gallery/COMVIS.jpg',
  [GALLERY_3]: '/images/gallery/futsalTCELEKTRO.jpg',
};

const context = {
  resolveAssetUrl: (assetId: string) =>
    LOCAL_ASSETS[assetId] ?? '/images/not-exist.png',
};

const DEMO_BLOCKS: unknown = [
  {
    type: 'hero',
    version: 1,
    id: 'demo-hero',
    props: {
      eyebrow: 'Internal Affairs',
      title: 'Syukuran Wisudawan ke-133',
      description:
        'Contoh halaman yang dirender sepenuhnya dari JSON blok, tanpa HTML dari CMS.',
      image: HERO_ASSET,
      imageAlt: 'Suasana acara HMTC',
      align: 'center',
      cta: { label: 'Lihat proker lain', href: '/internal-affairs' },
    },
  },
  {
    type: 'eventDetails',
    version: 1,
    id: 'demo-details',
    props: {
      heading: 'Detail Acara',
      items: [
        { label: 'Tanggal', value: '12 Oktober 2026', icon: 'calendar' },
        { label: 'Waktu', value: '08.00 - 16.00', icon: 'clock' },
        {
          label: 'Lokasi',
          value: 'Aula Teknik Computer ITS',
          icon: 'location',
        },
      ],
    },
  },
  {
    type: 'agenda',
    version: 1,
    id: 'demo-agenda',
    props: {
      heading: 'Susunan Acara',
      items: [
        { time: '08.00', title: 'Registrasi' },
        {
          time: '09.00',
          title: 'Sambutan',
          description: 'Oleh Ketua HMTC dan dosen pembina.',
        },
        { time: '10.00', title: 'Penyerahan Penghargaan' },
      ],
    },
  },
  {
    type: 'richText',
    version: 1,
    id: 'demo-richtext',
    props: {
      heading: 'Tentang Acara',
      paragraphs: [
        'Blok ini hanya menyimpan paragraf. Renderer yang menambahkan tag paragraf, jadi tidak ada HTML yang bisa disisipkan lewat CMS.',
        'Kalau ada teks yang perlu format khusus, itu harus menjadi blok baru dengan renderer sendiri, bukan HTML bebas.',
      ],
    },
  },
  {
    type: 'gallery',
    version: 1,
    id: 'demo-gallery',
    props: {
      heading: 'Galeri',
      layout: 'grid',
      images: [
        { asset: GALLERY_1, alt: 'Peserta di acara farewell party' },
        { asset: GALLERY_2, alt: 'Suasana presentasi COMVIS' },
        { asset: GALLERY_3, alt: 'Pertandingan futsal antar angkatan' },
      ],
    },
  },
  {
    type: 'divider',
    version: 1,
    id: 'demo-divider',
    props: { spacing: 'md' },
  },
  {
    type: 'cta',
    version: 1,
    id: 'demo-cta',
    props: {
      heading: 'Sampai jumpa di acara berikutnya',
      description: 'Semua bagian di atas berasal dari satu kolom JSON.',
      action: { label: 'Buka proker', href: '/internal-affairs' },
      tone: 'accent',
    },
  },
];

type TestCase = {
  label: string;
  mode: 'draft' | 'publish';
  expect: 'lolos' | 'ditolak';
  input: unknown;
};

const hero = (id: string) => ({
  type: 'hero',
  version: 1,
  id,
  props: { title: 'Judul', align: 'center' },
});

const gallery = (images: unknown[]) => ({
  type: 'gallery',
  version: 1,
  id: 'g',
  props: { layout: 'grid', images },
});

const CASES: readonly TestCase[] = [
  {
    label: 'Halaman demo, mode draft',
    mode: 'draft',
    expect: 'lolos',
    input: DEMO_BLOCKS,
  },
  {
    label: 'Halaman demo, mode publish',
    mode: 'publish',
    expect: 'lolos',
    input: DEMO_BLOCKS,
  },
  {
    label: 'Gallery kosong, disimpan sebagai draft',
    mode: 'draft',
    expect: 'lolos',
    input: [hero('h'), gallery([])],
  },
  {
    label: 'Gallery kosong, mau publish',
    mode: 'publish',
    expect: 'ditolak',
    input: [hero('h'), gallery([])],
  },
  {
    label: 'Tanpa hero, akan melanggar aturan satu h1',
    mode: 'publish',
    expect: 'ditolak',
    input: [
      { type: 'richText', version: 1, id: 'r', props: { paragraphs: ['x'] } },
    ],
  },
  {
    label: 'Dua hero, akan menghasilkan dua h1',
    mode: 'publish',
    expect: 'ditolak',
    input: [hero('a'), hero('b')],
  },
  {
    label: 'Id blok duplikat',
    mode: 'draft',
    expect: 'ditolak',
    input: [hero('same'), gallery([{ asset: GALLERY_1, alt: 'x' }])].map(
      (block) => ({ ...block, id: 'same' }),
    ),
  },
  {
    label: 'href javascript:',
    mode: 'draft',
    expect: 'ditolak',
    input: [
      hero('h'),
      {
        type: 'cta',
        version: 1,
        id: 'c',
        props: {
          heading: 'Klik',
          action: { label: 'Klik', href: 'javascript:alert(1)' },
          tone: 'accent',
        },
      },
    ],
  },
  {
    label: 'Properti asing (titel)',
    mode: 'draft',
    expect: 'ditolak',
    input: [
      {
        type: 'hero',
        version: 1,
        id: 'h',
        props: { titel: 'Salah ketik', align: 'center' },
      },
    ],
  },
  {
    label: 'Aset berupa path lokal, bukan uuid',
    mode: 'draft',
    expect: 'ditolak',
    input: [hero('h'), gallery([{ asset: '/images/foo.png', alt: 'x' }])],
  },
];

function evaluate(testCase: TestCase) {
  const schema =
    testCase.mode === 'publish' ? publishBlocksSchema : blocksSchema;
  const result = schema.safeParse(testCase.input);

  return {
    ok: result.success,
    issues: result.success
      ? []
      : result.error.issues.map((issue) => ({
          path: issue.path.join('.') || '(root)',
          message: issue.message,
        })),
  };
}

const readResult = parseBlocksForRead(DEMO_BLOCKS);

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
        {ok ? 'lolos' : 'ditolak'}
      </Typography>
    </span>
  );
}

export default function BlockSchemaDemoPage() {
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
            Block Schema Demo
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='max-w-3xl leading-6 text-gray-500'
          >
            Satu halaman contoh yang dirender dari JSON blok, ditambah hasil
            validasi terhadap beberapa input yang sengaja salah. Tidak ada
            koneksi ke Directus.
          </Typography>
          <Link
            href='/sandbox/page-builder'
            className='inline-flex text-sm text-navy underline'
          >
            Kembali ke Page Builder
          </Link>
        </header>

        <section className='space-y-3'>
          <Typography
            as='h2'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Hasil render
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='text-gray-500'
          >
            {readResult.blocks.length} blok valid dirender,{' '}
            {readResult.invalid.length} blok dilaporkan rusak. Judul besar di
            bawah adalah satu-satunya h1 di halaman ini.
          </Typography>

          <div className='overflow-hidden rounded-xl border border-gray-200 bg-white'>
            <BlockList blocks={readResult.blocks} context={context} />
          </div>
        </section>

        <section className='space-y-3'>
          <Typography
            as='h2'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            Hasil validasi skema
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='max-w-3xl text-gray-500'
          >
            Mode draft hanya memeriksa struktur. Mode publish menambah aturan
            satu hero dan koleksi yang tidak boleh kosong.
          </Typography>

          <ul className='grid gap-3'>
            {CASES.map((testCase) => {
              const result = evaluate(testCase);
              const matches = (testCase.expect === 'lolos') === result.ok;

              return (
                <li
                  key={testCase.label}
                  className='rounded-lg border border-gray-200 bg-white p-4'
                >
                  <div className='flex flex-wrap items-center gap-2'>
                    <StatusPill ok={result.ok} />
                    <Typography
                      as='p'
                      font='satoshi'
                      weight='medium'
                      variant='s2'
                      className='text-gray-900'
                    >
                      {testCase.label}
                    </Typography>
                    <span className='rounded-full bg-gray-100 px-2 py-0.5 text-gray-500'>
                      <Typography
                        as='span'
                        font='satoshi'
                        variant='c2'
                        className='text-gray-500'
                      >
                        {testCase.mode} / harap {testCase.expect}
                      </Typography>
                    </span>
                    {!matches ? (
                      <span className='text-[var(--color-text-error)]'>
                        <Typography
                          as='span'
                          font='satoshi'
                          weight='medium'
                          variant='c2'
                          className='text-[var(--color-text-error)]'
                        >
                          tidak sesuai harapan
                        </Typography>
                      </span>
                    ) : null}
                  </div>

                  {result.issues.length > 0 ? (
                    <ul className='mt-2 space-y-1'>
                      {result.issues.map((issue) => (
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
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section className='space-y-3'>
          <Typography
            as='h2'
            font='satoshi'
            weight='semibold'
            variant='h3'
            className='text-gray-900'
          >
            JSON yang dirender
          </Typography>
          <details className='rounded-lg border border-gray-200 bg-white p-4'>
            <summary className='cursor-pointer text-sm text-navy'>
              Tampilkan JSON
            </summary>
            <Typography
              as='pre'
              font='jetbrainsMono'
              variant='c0'
              className='mt-3 overflow-x-auto rounded bg-gray-50 p-3 text-gray-700'
            >
              {JSON.stringify(DEMO_BLOCKS, null, 2)}
            </Typography>
          </details>
        </section>
      </main>
    </div>
  );
}
