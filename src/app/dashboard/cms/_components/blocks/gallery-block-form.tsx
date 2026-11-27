'use client';

import { FieldSet } from '@/components/ui/field';
import {
  BLOCK_LIMITS,
  BLOCK_META,
  type BlockOf,
  galleryBlock,
} from '@/lib/directus/blocks';

import { AssetField, DEFAULT_MOCK_ASSET } from './asset-picker';
import { ChoiceField, TextField } from './block-fields';
import {
  type BlockFormProps,
  optionalText,
  withProps,
} from './block-form-utils';
import { ItemListEditor } from './item-list-editor';
import { useBlockForm } from './use-block-form';

type GalleryProps = BlockOf<'gallery'>['props'];
type GalleryImage = GalleryProps['images'][number];

const LAYOUT_LABELS: Record<GalleryProps['layout'], string> = {
  grid: 'Grid',
  masonry: 'Masonry',
};

export function GalleryBlockForm({
  value,
  onChange,
  disabled,
}: BlockFormProps<'gallery'>) {
  const form = useBlockForm(galleryBlock, value);
  const { props } = value;

  const set = (patch: Partial<GalleryProps>) =>
    onChange(withProps(value, patch));

  const setImage = (index: number, patch: Partial<GalleryImage>) =>
    set({
      images: props.images.map((image, position) => {
        if (position !== index) return image;
        const next: Record<string, unknown> = { ...image, ...patch };
        // An emptied optional field is removed, never stored as `''`.
        if (next.caption === undefined) delete next.caption;
        return next as GalleryImage;
      }),
    });

  return (
    <FieldSet
      disabled={disabled}
      aria-label={`Pengaturan blok ${BLOCK_META.gallery.label}`}
      className='gap-5'
    >
      <TextField
        label='Judul bagian'
        value={props.heading ?? ''}
        onValueChange={(text) => set({ heading: optionalText(text) })}
        {...form.field('props.heading')}
      />
      <ChoiceField
        label='Tata letak'
        value={props.layout}
        options={LAYOUT_LABELS}
        onValueChange={(layout) => set({ layout })}
      />

      <ItemListEditor
        label='Gambar'
        description='Masih daftar contoh; pemilih dan upload aset menyusul di #227.'
        items={props.images}
        onChange={(images) => set({ images })}
        // `alt` is prefilled so a new row is valid until the user edits it.
        createItem={(): GalleryImage => ({
          asset: DEFAULT_MOCK_ASSET,
          alt: 'Gambar baru',
        })}
        itemAriaLabel={(_, index) => `gambar ${index + 1}`}
        max={BLOCK_LIMITS.galleryImages}
        error={form.errorAt('props.images')}
        addLabel='Tambah gambar'
        emptyLabel='Belum ada gambar. Halaman tidak bisa dipublikasikan selama blok ini kosong.'
        renderFields={(image, index) => (
          <>
            <AssetField
              label='Aset'
              value={image.asset}
              onValueChange={(asset) =>
                setImage(index, { asset: asset ?? DEFAULT_MOCK_ASSET })
              }
              {...form.field(`props.images.${index}.asset`)}
            />
            <TextField
              label='Teks alternatif'
              hint='Menjelaskan gambar untuk pembaca layar.'
              value={image.alt}
              onValueChange={(alt) => setImage(index, { alt })}
              {...form.field(`props.images.${index}.alt`)}
            />
            <TextField
              label='Keterangan'
              value={image.caption ?? ''}
              onValueChange={(text) =>
                setImage(index, { caption: optionalText(text) })
              }
              {...form.field(`props.images.${index}.caption`)}
            />
          </>
        )}
      />
    </FieldSet>
  );
}
