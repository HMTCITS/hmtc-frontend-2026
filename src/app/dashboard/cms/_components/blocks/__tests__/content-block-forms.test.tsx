/**
 * `lucide-react` lists its ESM build under the `browser` export condition, which
 * the jsdom environment asks for by default and Jest cannot parse. Dropping the
 * condition makes Jest take the CommonJS build instead.
 *
 * @jest-environment-options {"customExportConditions": []}
 */

import '@testing-library/jest-dom';

import { fireEvent, render, screen } from '@testing-library/react';
import { type ComponentType, useState } from 'react';

import {
  BLOCK_LIMITS,
  type BlockOf,
  type BlockType,
  createBlock,
} from '@/lib/directus/blocks';

import { MOCK_ASSETS } from '../asset-picker';
import type { BlockFormProps } from '../block-form-utils';
import { CtaBlockForm } from '../cta-block-form';
import { DividerBlockForm } from '../divider-block-form';
import { HeroBlockForm } from '../hero-block-form';
import { RichTextBlockForm } from '../rich-text-block-form';

/** Mounts a form the way the editor will: the parent owns the block. */
function renderForm<T extends BlockType>(
  Form: ComponentType<BlockFormProps<T>>,
  initial: BlockOf<T>,
  disabled = false,
) {
  const onChange = jest.fn<void, [BlockOf<T>]>();

  function Harness() {
    const [block, setBlock] = useState(initial);
    return (
      <Form
        value={block}
        disabled={disabled}
        onChange={(next) => {
          onChange(next);
          setBlock(next);
        }}
      />
    );
  }

  render(<Harness />);

  return {
    onChange,
    latest: () => onChange.mock.calls[onChange.mock.calls.length - 1][0],
  };
}

function type(control: HTMLElement, text: string) {
  fireEvent.change(control, { target: { value: text } });
}

/** Focus, type, then leave: what a user does to one field. */
function fill(control: HTMLElement, text: string) {
  fireEvent.focus(control);
  type(control, text);
  fireEvent.blur(control);
}

const field = (label: string) => screen.getByLabelText(label);
const option = (name: string) => screen.getByRole('radio', { name });
const button = (name: string) => screen.getByRole('button', { name });

describe('HeroBlockForm', () => {
  it('starts from the blockDefaults values with nothing flagged', () => {
    renderForm(HeroBlockForm, createBlock('hero'));

    expect(field('Judul')).toHaveValue('Judul halaman');
    expect(field('Teks kecil di atas judul')).toHaveValue('');
    expect(option('Tengah')).toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Tampilkan tombol' }),
    ).not.toBeChecked();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports each edit as the whole next block', () => {
    const hero = createBlock('hero');
    const { latest } = renderForm(HeroBlockForm, hero);

    fill(field('Judul'), 'Syukuran Wisudawan');
    fireEvent.click(option('Kiri'));

    expect(latest()).toEqual({
      ...hero,
      props: { title: 'Syukuran Wisudawan', align: 'left' },
    });
  });

  it('removes an optional prop when its field is emptied', () => {
    const { latest } = renderForm(HeroBlockForm, createBlock('hero'));

    fill(field('Teks kecil di atas judul'), 'Internal Affairs');
    expect(latest().props.eyebrow).toBe('Internal Affairs');

    fill(field('Teks kecil di atas judul'), '');
    expect(latest().props).not.toHaveProperty('eyebrow');
  });

  it('holds an error back while the field is being typed in, then shows it on blur', () => {
    const { latest } = renderForm(HeroBlockForm, createBlock('hero'));
    const heading = field('Judul');

    fireEvent.focus(heading);
    type(heading, '');

    expect(latest().props.title).toBe('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.blur(heading);

    expect(screen.getByRole('alert')).toHaveTextContent('Wajib diisi');
    expect(heading).toBeInvalid();
    expect(heading).toHaveAccessibleDescription('Wajib diisi');
  });

  it('clears a shown error as soon as the value is valid again', () => {
    renderForm(HeroBlockForm, createBlock('hero'));
    const heading = field('Judul');
    fill(heading, '');

    fireEvent.focus(heading);
    type(heading, 'J');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(heading).toBeValid();
  });

  it('flags overflow at once, without waiting for blur', () => {
    renderForm(HeroBlockForm, createBlock('hero'));
    const heading = field('Judul');

    fireEvent.focus(heading);
    type(heading, 'J'.repeat(BLOCK_LIMITS.heroTitleChars + 1));

    expect(heading).toHaveAccessibleDescription('Maksimal 140 karakter');
  });

  it('flags every field of a block that arrives invalid', () => {
    renderForm(HeroBlockForm, {
      ...createBlock('hero'),
      props: {
        eyebrow: 'e'.repeat(81),
        title: '',
        description: 'd'.repeat(601),
        image: 'bukan-uuid',
        imageAlt: 'a'.repeat(161),
        align: 'center',
        cta: { label: '', href: 'javascript:alert(1)' },
      },
    });

    const described = (text: string) => expect.stringContaining(text);
    expect(field('Teks kecil di atas judul')).toHaveAccessibleDescription(
      'Maksimal 80 karakter',
    );
    expect(field('Judul')).toHaveAccessibleDescription('Wajib diisi');
    expect(field('Deskripsi')).toHaveAccessibleDescription(
      'Maksimal 600 karakter',
    );
    expect(field('Gambar')).toHaveAccessibleDescription(
      described('Harus uuid aset Directus'),
    );
    expect(field('Teks alternatif gambar')).toHaveAccessibleDescription(
      described('Maksimal 160 karakter'),
    );
    expect(field('Label tombol')).toHaveAccessibleDescription('Wajib diisi');
    expect(field('Tautan tombol')).toHaveAccessibleDescription(
      described('Tautan harus path internal, https, atau mailto'),
    );
  });

  it('adds the button with the default action and removes it again', () => {
    const { latest } = renderForm(HeroBlockForm, createBlock('hero'));
    const toggle = screen.getByRole('switch', { name: 'Tampilkan tombol' });

    fireEvent.click(toggle);

    expect(latest().props.cta).toEqual(createBlock('cta').props.action);
    expect(field('Label tombol')).toHaveValue('Lihat proker lain');
    expect(field('Tautan tombol')).toHaveValue('/');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(latest().props).not.toHaveProperty('cta');
    expect(screen.queryByLabelText('Label tombol')).not.toBeInTheDocument();
  });

  it('trims pasted whitespace when the field is left', () => {
    const { latest } = renderForm(HeroBlockForm, createBlock('hero'));

    fill(field('Judul'), '  Syukuran Wisudawan ');

    expect(latest().props.title).toBe('Syukuran Wisudawan');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('picks an image from the mock library and removes it again', () => {
    const { latest } = renderForm(HeroBlockForm, createBlock('hero'));
    const image = field('Gambar');

    expect(image).toHaveValue('');
    fireEvent.change(image, { target: { value: MOCK_ASSETS[1].id } });
    expect(latest().props.image).toBe(MOCK_ASSETS[1].id);

    fireEvent.change(image, { target: { value: '' } });
    expect(latest().props).not.toHaveProperty('image');
  });

  it('locks every control when disabled', () => {
    renderForm(
      HeroBlockForm,
      {
        ...createBlock('hero'),
        props: {
          title: 'Judul',
          align: 'center',
          cta: { label: 'Buka', href: '/' },
        },
      },
      true,
    );

    const controls = [
      ...screen.getAllByRole('textbox'),
      ...screen.getAllByRole('radio'),
      screen.getByRole('combobox', { name: 'Gambar' }),
      screen.getByRole('switch', { name: 'Tampilkan tombol' }),
    ];
    expect(controls).toHaveLength(10);
    controls.forEach((control) => expect(control).toBeDisabled());
  });
});

describe('RichTextBlockForm', () => {
  const withParagraphs = (paragraphs: string[]): BlockOf<'richText'> => ({
    ...createBlock('richText'),
    props: { paragraphs },
  });

  it('starts from the blockDefaults values with nothing flagged', () => {
    renderForm(RichTextBlockForm, createBlock('richText'));

    expect(field('Judul bagian')).toHaveValue('');
    expect(field('Paragraf 1')).toHaveValue('Tulis isi bagian ini.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('omits the heading when it is emptied, because the schema rejects an empty string', () => {
    const { latest } = renderForm(RichTextBlockForm, createBlock('richText'));

    fill(field('Judul bagian'), 'Tentang Acara');
    expect(latest().props.heading).toBe('Tentang Acara');

    fill(field('Judul bagian'), '');
    expect(latest().props).not.toHaveProperty('heading');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('edits one paragraph without touching the others', () => {
    const { latest } = renderForm(
      RichTextBlockForm,
      withParagraphs(['Satu', 'Dua', 'Tiga']),
    );

    fill(field('Paragraf 2'), 'Dua, diperbarui');

    expect(latest().props.paragraphs).toEqual([
      'Satu',
      'Dua, diperbarui',
      'Tiga',
    ]);
  });

  it('adds an empty paragraph, focuses it, and flags it only once it is left empty', () => {
    const { latest } = renderForm(RichTextBlockForm, createBlock('richText'));

    fireEvent.click(button('Tambah paragraf'));

    expect(latest().props.paragraphs).toEqual(['Tulis isi bagian ini.', '']);
    expect(field('Paragraf 2')).toHaveFocus();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.blur(field('Paragraf 2'));

    expect(field('Paragraf 2')).toHaveAccessibleDescription('Wajib diisi');
  });

  it('removes a paragraph and moves focus to a row that still exists', () => {
    const { latest } = renderForm(
      RichTextBlockForm,
      withParagraphs(['Satu', 'Dua', 'Tiga']),
    );

    fireEvent.click(button('Hapus paragraf 2'));
    expect(latest().props.paragraphs).toEqual(['Satu', 'Tiga']);
    expect(field('Paragraf 2')).toHaveValue('Tiga');
    expect(field('Paragraf 2')).toHaveFocus();

    fireEvent.click(button('Hapus paragraf 2'));
    expect(latest().props.paragraphs).toEqual(['Satu']);
    expect(field('Paragraf 1')).toHaveFocus();

    fireEvent.click(button('Hapus paragraf 1'));
    expect(latest().props.paragraphs).toEqual([]);
    expect(button('Tambah paragraf')).toHaveFocus();
    expect(screen.getByText(/Belum ada paragraf/)).toBeInTheDocument();
  });

  it('stops adding at the paragraph limit', () => {
    renderForm(
      RichTextBlockForm,
      withParagraphs(Array(BLOCK_LIMITS.paragraphsPerBlock).fill('Isi')),
    );

    expect(button('Tambah paragraf')).toBeDisabled();
    expect(
      screen.getByText('Satu blok memuat paling banyak 40 paragraf.'),
    ).toBeInTheDocument();
  });

  it('flags every field of a block that arrives invalid', () => {
    renderForm(RichTextBlockForm, {
      ...createBlock('richText'),
      props: {
        heading: 'h'.repeat(BLOCK_LIMITS.headingChars + 1),
        paragraphs: ['', 'p'.repeat(BLOCK_LIMITS.paragraphChars + 1)],
      },
    });

    expect(field('Judul bagian')).toHaveAccessibleDescription(
      'Maksimal 120 karakter',
    );
    expect(field('Paragraf 1')).toHaveAccessibleDescription('Wajib diisi');
    expect(field('Paragraf 2')).toHaveAccessibleDescription(
      'Maksimal 2000 karakter',
    );
  });

  it('keeps markup as plain text', () => {
    const { latest } = renderForm(RichTextBlockForm, createBlock('richText'));

    fill(field('Paragraf 1'), '<img src=x onerror=alert(1)>');

    expect(latest().props.paragraphs).toEqual(['<img src=x onerror=alert(1)>']);
    expect(document.querySelector('img')).not.toBeInTheDocument();
  });

  it('locks every control when disabled', () => {
    renderForm(RichTextBlockForm, withParagraphs(['Satu']), true);

    const controls = [
      ...screen.getAllByRole('textbox'),
      ...screen.getAllByRole('button'),
    ];
    expect(controls).toHaveLength(4);
    controls.forEach((control) => expect(control).toBeDisabled());
  });
});

describe('CtaBlockForm', () => {
  it('starts from the blockDefaults values with nothing flagged', () => {
    renderForm(CtaBlockForm, createBlock('cta'));

    expect(field('Judul')).toHaveValue('Sampai jumpa di acara berikutnya');
    expect(field('Label tombol')).toHaveValue('Lihat proker lain');
    expect(field('Tautan tombol')).toHaveValue('/');
    expect(option('Aksen')).toBeChecked();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports each edit as the whole next block', () => {
    const cta = createBlock('cta');
    const { latest } = renderForm(CtaBlockForm, cta);

    fill(field('Deskripsi'), 'Pendaftaran dibuka sampai Jumat.');
    fill(field('Label tombol'), 'Daftar');
    fill(field('Tautan tombol'), ' https://hmtc-its.com/daftar ');
    fireEvent.click(option('Netral'));

    expect(latest()).toEqual({
      ...cta,
      props: {
        heading: 'Sampai jumpa di acara berikutnya',
        description: 'Pendaftaran dibuka sampai Jumat.',
        action: { label: 'Daftar', href: 'https://hmtc-its.com/daftar' },
        tone: 'neutral',
      },
    });
  });

  it('rejects a link outside the allowlist with the message from the schema', () => {
    renderForm(CtaBlockForm, createBlock('cta'));
    const link = field('Tautan tombol');

    fireEvent.focus(link);
    type(link, 'javascript:alert(1)');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.blur(link);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Tautan harus path internal, https, atau mailto',
    );
  });

  it('flags every field of a block that arrives invalid', () => {
    renderForm(CtaBlockForm, {
      ...createBlock('cta'),
      props: {
        heading: '',
        description: 'd'.repeat(301),
        action: {
          label: 'l'.repeat(BLOCK_LIMITS.ctaLabelChars + 1),
          href: '//evil.example',
        },
        tone: 'accent',
      },
    });

    expect(field('Judul')).toHaveAccessibleDescription('Wajib diisi');
    expect(field('Deskripsi')).toHaveAccessibleDescription(
      'Maksimal 300 karakter',
    );
    expect(field('Label tombol')).toHaveAccessibleDescription(
      'Maksimal 40 karakter',
    );
    expect(field('Tautan tombol')).toHaveAccessibleDescription(
      expect.stringContaining('Tautan harus path internal, https, atau mailto'),
    );
  });
});

describe('DividerBlockForm', () => {
  it('starts from the blockDefaults value and reports the chosen spacing', () => {
    const divider = createBlock('divider');
    const { latest } = renderForm(DividerBlockForm, divider);

    expect(option('Sedang')).toBeChecked();

    fireEvent.click(option('Besar'));

    expect(latest()).toEqual({ ...divider, props: { spacing: 'lg' } });
    expect(option('Besar')).toBeChecked();
  });

  it('locks every control when disabled', () => {
    renderForm(DividerBlockForm, createBlock('divider'), true);

    screen
      .getAllByRole('radio')
      .forEach((control) => expect(control).toBeDisabled());
  });
});
