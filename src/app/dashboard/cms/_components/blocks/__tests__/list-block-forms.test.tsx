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

import { AgendaBlockForm } from '../agenda-block-form';
import { DEFAULT_MOCK_ASSET, MOCK_ASSETS } from '../asset-picker';
import type { BlockFormProps } from '../block-form-utils';
import { EventDetailsBlockForm } from '../event-details-block-form';
import { GalleryBlockForm } from '../gallery-block-form';
import { BLOCK_FORMS } from '../index';

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
    latest: () => onChange.mock.calls[onChange.mock.calls.length - 1][0],
  };
}

/** Focus, type, then leave: what a user does to one field. */
function fill(control: HTMLElement, text: string) {
  fireEvent.focus(control);
  fireEvent.change(control, { target: { value: text } });
  fireEvent.blur(control);
}

const field = (label: string) => screen.getByLabelText(label);
const fields = (label: string) => screen.getAllByLabelText(label);
const button = (name: string | RegExp) => screen.getByRole('button', { name });

describe('BLOCK_FORMS', () => {
  it('has a form for every block type', () => {
    expect(Object.keys(BLOCK_FORMS).sort()).toEqual(
      [
        'agenda',
        'cta',
        'divider',
        'eventDetails',
        'gallery',
        'hero',
        'richText',
      ].sort(),
    );
  });
});

describe('AgendaBlockForm', () => {
  const twoSessions = (): BlockOf<'agenda'> => ({
    ...createBlock('agenda'),
    props: {
      items: [
        { time: '08.00', title: 'Registrasi' },
        { time: '09.00', title: 'Sambutan' },
      ],
    },
  });

  it('starts from the blockDefaults values with nothing flagged', () => {
    renderForm(AgendaBlockForm, createBlock('agenda'));

    expect(field('Judul bagian')).toHaveValue('Susunan Acara');
    expect(field('Jam')).toHaveValue('08.00');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('adds a session with a valid prefilled default', () => {
    const { latest } = renderForm(AgendaBlockForm, createBlock('agenda'));

    fireEvent.click(button(/tambah sesi/i));

    expect(latest().props.items[1]).toEqual({
      time: '00.00',
      title: 'Sesi baru',
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('moves and removes sessions', () => {
    const { latest } = renderForm(AgendaBlockForm, twoSessions());

    fireEvent.click(button(/turunkan sesi 1/i));
    expect(latest().props.items.map((item) => item.title)).toEqual([
      'Sambutan',
      'Registrasi',
    ]);

    fireEvent.click(button(/hapus sesi 1/i));
    expect(latest().props.items.map((item) => item.title)).toEqual([
      'Registrasi',
    ]);
  });

  it('removes the description when it is emptied', () => {
    const { latest } = renderForm(AgendaBlockForm, createBlock('agenda'));

    fill(field('Deskripsi'), 'Di lobi gedung.');
    expect(latest().props.items[0]?.description).toBe('Di lobi gedung.');

    fill(field('Deskripsi'), '');
    expect(latest().props.items[0]).not.toHaveProperty('description');
  });

  it('holds a required error back while typing and shows the blocks.ts message on blur', () => {
    renderForm(AgendaBlockForm, createBlock('agenda'));
    const time = field('Jam');

    fireEvent.focus(time);
    fireEvent.change(time, { target: { value: '' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    fireEvent.blur(time);
    expect(time).toHaveAccessibleDescription('Jam wajib diisi');
  });

  it('stops adding at the session limit', () => {
    renderForm(AgendaBlockForm, {
      ...createBlock('agenda'),
      props: {
        items: Array.from({ length: BLOCK_LIMITS.agendaItems }, () => ({
          time: '08.00',
          title: 'Sesi',
        })),
      },
    });

    expect(button(/tambah sesi/i)).toBeDisabled();
  });

  it('locks every control when disabled', () => {
    renderForm(AgendaBlockForm, twoSessions(), true);

    [
      ...screen.getAllByRole('textbox'),
      ...screen.getAllByRole('button'),
    ].forEach((control) => expect(control).toBeDisabled());
  });
});

describe('EventDetailsBlockForm', () => {
  it('edits a row and picks an icon', () => {
    const { latest } = renderForm(
      EventDetailsBlockForm,
      createBlock('eventDetails'),
    );

    fill(field('Label'), 'Lokasi');
    fireEvent.click(screen.getByRole('radio', { name: 'Lokasi' }));

    expect(latest().props.items[0]).toEqual({
      label: 'Lokasi',
      value: '1 Januari 2026',
      icon: 'location',
    });
  });

  it('adds a row from blockDefaults', () => {
    const { latest } = renderForm(
      EventDetailsBlockForm,
      createBlock('eventDetails'),
    );

    fireEvent.click(button(/tambah baris/i));

    expect(latest().props.items).toHaveLength(2);
    expect(fields('Label')).toHaveLength(2);
  });

  it('leaves the icon unchosen when the row has none', () => {
    renderForm(EventDetailsBlockForm, {
      ...createBlock('eventDetails'),
      props: { items: [{ label: 'Tanggal', value: 'Besok' }] },
    });

    screen
      .getAllByRole('radio')
      .forEach((radio) => expect(radio).not.toBeChecked());
  });

  it('flags every field of a block that arrives invalid', () => {
    renderForm(EventDetailsBlockForm, {
      ...createBlock('eventDetails'),
      props: { items: [{ label: '', value: 'v'.repeat(161) }] },
    });

    expect(field('Label')).toHaveAccessibleDescription('Label wajib diisi');
    expect(field('Isi')).toHaveAccessibleDescription('Maksimal 160 karakter');
  });
});

describe('GalleryBlockForm', () => {
  it('adds an image with a valid mock asset and edits its alt text', () => {
    const { latest } = renderForm(GalleryBlockForm, createBlock('gallery'));

    fireEvent.click(button(/tambah gambar/i));
    expect(latest().props.images).toEqual([
      { asset: DEFAULT_MOCK_ASSET, alt: 'Gambar baru' },
    ]);

    fill(field('Teks alternatif'), 'Peserta di aula');
    fireEvent.change(field('Aset'), { target: { value: MOCK_ASSETS[2].id } });

    expect(latest().props.images[0]).toEqual({
      asset: MOCK_ASSETS[2].id,
      alt: 'Peserta di aula',
    });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('switches the layout', () => {
    const { latest } = renderForm(GalleryBlockForm, createBlock('gallery'));

    fireEvent.click(screen.getByRole('radio', { name: 'Masonry' }));

    expect(latest().props.layout).toBe('masonry');
  });

  it('keeps an unknown asset selectable and flags it with the blocks.ts message', () => {
    renderForm(GalleryBlockForm, {
      ...createBlock('gallery'),
      props: {
        layout: 'grid',
        images: [{ asset: '/images/foo.png', alt: '' }],
      },
    });

    expect(field('Aset')).toHaveValue('/images/foo.png');
    expect(field('Aset')).toHaveAccessibleDescription(
      'Harus uuid aset Directus',
    );
    expect(field('Teks alternatif')).toHaveAccessibleDescription(
      expect.stringContaining('Alt text wajib diisi'),
    );
  });

  it('removes the caption when it is emptied', () => {
    const { latest } = renderForm(GalleryBlockForm, {
      ...createBlock('gallery'),
      props: {
        layout: 'grid',
        images: [{ asset: DEFAULT_MOCK_ASSET, alt: 'Foto', caption: 'Lama' }],
      },
    });

    fill(field('Keterangan'), '');

    expect(latest().props.images[0]).not.toHaveProperty('caption');
  });
});
