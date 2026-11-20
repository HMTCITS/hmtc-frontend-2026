import { fireEvent, render, screen } from '@testing-library/react';

import { type BlockOf, createBlock } from '@/lib/directus/blocks';

import { AgendaBlockForm } from './agenda-block-form';
import { EventDetailsBlockForm } from './event-details-block-form';
import { GalleryBlockForm } from './gallery-block-form';

/** lucide-react ships ESM only; Jest does not transform node_modules here. */
jest.mock('lucide-react', () => ({
  ArrowDown: () => null,
  ArrowUp: () => null,
  CalendarDays: () => null,
  Clock: () => null,
  Link2: () => null,
  MapPin: () => null,
  Plus: () => null,
  Ticket: () => null,
  Trash2: () => null,
}));

const MOCK_UUID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

type OnChange<T> = jest.Mock<void, [T]>;

function lastCall<T>(onChange: OnChange<T>): T {
  expect(onChange).toHaveBeenCalled();
  return onChange.mock.calls.at(-1)?.[0] as T;
}

describe('AgendaBlockForm', () => {
  function setup() {
    const onChange: OnChange<BlockOf<'agenda'>> = jest.fn();
    render(
      <AgendaBlockForm value={createBlock('agenda')} onChange={onChange} />,
    );
    return { onChange };
  }

  it('adds a session with a valid prefilled default', () => {
    const { onChange } = setup();

    fireEvent.click(screen.getByRole('button', { name: /tambah sesi/i }));

    const next = lastCall(onChange);
    expect(next.props.items).toHaveLength(2);
    expect(next.props.items[1]).toEqual({ time: '00.00', title: 'Sesi baru' });
  });

  it('removes a session', () => {
    const { onChange } = setup();

    fireEvent.click(screen.getByRole('button', { name: /hapus sesi 1/i }));

    expect(lastCall(onChange).props.items).toHaveLength(0);
  });

  it('moves a session down', () => {
    const initial: BlockOf<'agenda'> = {
      ...createBlock('agenda'),
      props: {
        heading: undefined,
        items: [
          { time: '08.00', title: 'Registrasi' },
          { time: '09.00', title: 'Sambutan' },
        ],
      },
    };
    const onChange: OnChange<BlockOf<'agenda'>> = jest.fn();
    render(<AgendaBlockForm value={initial} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: /turunkan sesi 1/i }));

    expect(lastCall(onChange).props.items.map((item) => item.title)).toEqual([
      'Sambutan',
      'Registrasi',
    ]);
  });

  it('edits a session title', () => {
    const { onChange } = setup();

    fireEvent.change(screen.getByLabelText('Judul sesi'), {
      target: { value: 'Pembukaan' },
    });

    expect(lastCall(onChange).props.items[0]?.title).toBe('Pembukaan');
  });

  it('shows the blocks.ts validation message when a required field is cleared', () => {
    const { onChange } = setup();

    fireEvent.change(screen.getByLabelText('Jam'), { target: { value: '' } });

    const next = lastCall(onChange);
    expect(next.props.items[0]?.time).toBe('');

    render(<AgendaBlockForm value={next} onChange={onChange} />);
    expect(screen.getByText('Jam wajib diisi')).toBeTruthy();
  });
});

describe('EventDetailsBlockForm', () => {
  it('adds a detail row and picks an icon for the new row', () => {
    const onChange: OnChange<BlockOf<'eventDetails'>> = jest.fn();
    const { unmount } = render(
      <EventDetailsBlockForm
        value={createBlock('eventDetails')}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /tambah baris/i }));
    const withTwoRows = lastCall(onChange);
    expect(withTwoRows.props.items).toHaveLength(2);

    unmount();
    render(<EventDetailsBlockForm value={withTwoRows} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button', { name: /ikon jam/i })[1]!);

    expect(lastCall(onChange).props.items[1]?.icon).toBe('clock');
  });

  it('edits a row label', () => {
    const onChange: OnChange<BlockOf<'eventDetails'>> = jest.fn();
    render(
      <EventDetailsBlockForm
        value={createBlock('eventDetails')}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Label'), {
      target: { value: 'Lokasi' },
    });

    expect(lastCall(onChange).props.items[0]?.label).toBe('Lokasi');
  });
});

describe('GalleryBlockForm', () => {
  it('adds an image with a mock asset default and edits its alt text', () => {
    const onChange: OnChange<BlockOf<'gallery'>> = jest.fn();
    render(
      <GalleryBlockForm value={createBlock('gallery')} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /tambah gambar/i }));
    const afterAdd = lastCall(onChange);
    expect(afterAdd.props.images).toHaveLength(1);
    expect(afterAdd.props.images[0]?.asset).toBe(MOCK_UUID);

    render(<GalleryBlockForm value={afterAdd} onChange={onChange} />);
    fireEvent.change(screen.getAllByLabelText('Alt text')[0]!, {
      target: { value: 'Peserta di aula' },
    });

    expect(lastCall(onChange).props.images[0]?.alt).toBe('Peserta di aula');
  });

  it('switches the layout', () => {
    const onChange: OnChange<BlockOf<'gallery'>> = jest.fn();
    render(
      <GalleryBlockForm value={createBlock('gallery')} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Masonry' }));

    expect(lastCall(onChange).props.layout).toBe('masonry');
  });

  it('surfaces the blocks.ts error for an invalid asset uuid', () => {
    const invalid = {
      ...createBlock('gallery'),
      props: {
        heading: undefined,
        layout: 'grid' as const,
        images: [{ asset: '/images/foo.png', alt: 'Gambar' }],
      },
    };

    render(<GalleryBlockForm value={invalid} onChange={jest.fn()} />);

    expect(
      screen.getAllByText('harus uuid aset Directus').length,
    ).toBeGreaterThan(0);
  });

  it('surfaces the blocks.ts error when alt text is cleared', () => {
    const onChange: OnChange<BlockOf<'gallery'>> = jest.fn();
    const first = render(
      <GalleryBlockForm value={createBlock('gallery')} onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /tambah gambar/i }));
    const withImage = lastCall(onChange);
    first.unmount();

    const second = render(
      <GalleryBlockForm value={withImage} onChange={onChange} />,
    );
    fireEvent.change(screen.getByLabelText('Alt text'), {
      target: { value: '' },
    });
    second.unmount();

    render(<GalleryBlockForm value={lastCall(onChange)} onChange={onChange} />);
    expect(screen.getByText('Alt text wajib diisi')).toBeTruthy();
  });
});
