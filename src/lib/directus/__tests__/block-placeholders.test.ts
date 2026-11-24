import {
  findPlaceholders,
  publishBlocksSchema,
  TEMPLATE_PLACEHOLDER_HREF,
} from '@/lib/directus/blocks';

describe('findPlaceholders', () => {
  it('finds a string that is one bracketed group', () => {
    expect(findPlaceholders('[Judul acara]')).toEqual([[]]);
    expect(findPlaceholders('  [00.00 – 00.00 WIB] ')).toEqual([[]]);
  });

  it('ignores brackets inside real text', () => {
    expect(findPlaceholders('Workshop [Online]')).toEqual([]);
    expect(findPlaceholders('[A] dan [B]')).toEqual([]);
    expect(findPlaceholders('[]')).toEqual([]);
  });

  it('finds the template link placeholder', () => {
    expect(findPlaceholders(TEMPLATE_PLACEHOLDER_HREF)).toEqual([[]]);
    expect(findPlaceholders('/')).toEqual([]);
  });

  it('returns the path of a nested placeholder', () => {
    const props = {
      heading: 'Detail acara',
      items: [
        { label: 'Tanggal', value: 'Sabtu, 5 Desember 2026' },
        { label: 'Waktu', value: '[00.00 – 00.00 WIB]' },
      ],
    };
    expect(findPlaceholders(props, ['props'])).toEqual([
      ['props', 'items', 1, 'value'],
    ]);
  });
});

describe('publishBlocksSchema placeholders', () => {
  const hero = (title: string) => ({
    id: 'hero',
    type: 'hero',
    version: 1,
    props: { title, align: 'left' },
  });
  const cta = (href: string) => ({
    id: 'cta',
    type: 'cta',
    version: 1,
    props: {
      heading: 'Daftar Bluecamp 2026',
      action: { label: 'Daftar sekarang', href },
      tone: 'accent',
    },
  });

  it('rejects each placeholder with its block and field', () => {
    const result = publishBlocksSchema.safeParse([
      hero('[Judul acara]'),
      cta(TEMPLATE_PLACEHOLDER_HREF),
    ]);
    expect(result.success).toBe(false);
    expect(result.error!.issues.map((issue) => issue.path)).toEqual([
      [0, 'props', 'title'],
      [1, 'props', 'action', 'href'],
    ]);
  });

  it('passes once every placeholder is replaced', () => {
    expect(
      publishBlocksSchema.safeParse([hero('Bluecamp 2026'), cta('/daftar')])
        .success,
    ).toBe(true);
  });
});
