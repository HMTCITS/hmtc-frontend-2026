import {
  BLOCK_LIMITS,
  createBlock,
  ctaBlock,
  dividerBlock,
  heroBlock,
  richTextBlock,
} from '@/lib/directus/blocks';

import {
  collectFieldErrors,
  optionalText,
  withProps,
} from '../block-form-utils';

describe('collectFieldErrors', () => {
  it('accepts every default from blockDefaults', () => {
    expect(collectFieldErrors(heroBlock, createBlock('hero'))).toEqual({});
    expect(collectFieldErrors(richTextBlock, createBlock('richText'))).toEqual(
      {},
    );
    expect(collectFieldErrors(ctaBlock, createBlock('cta'))).toEqual({});
    expect(collectFieldErrors(dividerBlock, createBlock('divider'))).toEqual(
      {},
    );
  });

  it('words the length rules and keeps the messages written in the schema', () => {
    const hero = createBlock('hero');

    const errors = collectFieldErrors(heroBlock, {
      ...hero,
      props: {
        ...hero.props,
        title: '',
        eyebrow: 'e'.repeat(81),
        image: 'bukan-uuid',
        cta: { label: 'Buka', href: 'javascript:alert(1)' },
      },
    });

    expect(errors).toEqual({
      'props.title': { message: 'Wajib diisi', immediate: false },
      'props.eyebrow': { message: 'Maksimal 80 karakter', immediate: true },
      'props.image': { message: 'Harus uuid aset Directus', immediate: false },
      'props.cta.href': {
        message: 'Tautan harus path internal, https, atau mailto',
        immediate: false,
      },
    });
  });

  it('reports one error per field, the most basic one first', () => {
    const cta = createBlock('cta');

    const errors = collectFieldErrors(ctaBlock, {
      ...cta,
      props: { ...cta.props, action: { label: 'Buka', href: '' } },
    });

    expect(errors).toEqual({
      'props.action.href': { message: 'Wajib diisi', immediate: false },
    });
  });

  it('keys a list item by its index and the list by its own path', () => {
    const richText = createBlock('richText');

    expect(
      collectFieldErrors(richTextBlock, {
        ...richText,
        props: { paragraphs: ['Isi', 'Isi', 'Isi', ''] },
      }),
    ).toEqual({
      'props.paragraphs.3': { message: 'Wajib diisi', immediate: false },
    });

    // Since zod 4.6 an over-long array stops before its items are checked, so
    // only the list error is reported until the list is back under the limit.
    expect(
      collectFieldErrors(richTextBlock, {
        ...richText,
        props: {
          paragraphs: Array(BLOCK_LIMITS.paragraphsPerBlock + 1).fill('Isi'),
        },
      }),
    ).toEqual({
      'props.paragraphs': { message: 'Maksimal 40 item', immediate: true },
    });
  });
});

describe('withProps', () => {
  it('merges the patch and leaves the original block untouched', () => {
    const hero = createBlock('hero');

    const next = withProps(hero, { title: 'Baru', eyebrow: 'Acara' });

    expect(next).toEqual({
      ...hero,
      props: { title: 'Baru', eyebrow: 'Acara', align: 'center' },
    });
    expect(hero.props).toEqual({ title: 'Judul halaman', align: 'center' });
  });

  it('removes a prop that an emptied optional field patches to undefined', () => {
    const richText = withProps(createBlock('richText'), { heading: 'Tentang' });

    const next = withProps(richText, { heading: optionalText('') });

    expect(next.props).toEqual({ paragraphs: ['Tulis isi bagian ini.'] });
    expect(collectFieldErrors(richTextBlock, next)).toEqual({});
  });
});
