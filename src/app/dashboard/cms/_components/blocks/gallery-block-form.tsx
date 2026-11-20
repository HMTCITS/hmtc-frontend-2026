'use client';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BLOCK_LIMITS,
  blockDefaults,
  type BlockOf,
  galleryBlock,
} from '@/lib/directus/blocks';

import { MockAssetPicker } from './asset-picker';
import {
  blockErrorAt,
  blockErrorForItem,
  BlockField,
  blockFieldClasses,
  useBlockIssues,
} from './block-field';
import { ItemListEditor } from './item-list-editor';

export type GalleryBlockFormProps = {
  value: BlockOf<'gallery'>;
  onChange: (next: BlockOf<'gallery'>) => void;
};

const LAYOUT_OPTIONS = [
  { value: 'grid', label: 'Grid' },
  { value: 'masonry', label: 'Masonry' },
] as const;

export function GalleryBlockForm({ value, onChange }: GalleryBlockFormProps) {
  const issues = useBlockIssues(galleryBlock, value);
  const { props } = value;

  const update = (patch: Partial<BlockOf<'gallery'>['props']>) =>
    onChange({ ...value, props: { ...props, ...patch } });

  const setItem = (
    index: number,
    patch: Partial<{ asset: string; alt: string; caption: string }>,
  ) =>
    update({
      images: props.images.map((image, i) =>
        i === index ? { ...image, ...patch } : image,
      ),
    });

  return (
    <div className='space-y-5'>
      <BlockField
        id={`gallery-heading-${value.id}`}
        label='Judul bagian'
        optional
        error={blockErrorAt(issues, 'props', 'heading')}
      >
        <Input
          id={`gallery-heading-${value.id}`}
          value={props.heading ?? ''}
          onChange={(event) =>
            update({ heading: event.target.value || undefined })
          }
          maxLength={BLOCK_LIMITS.headingChars}
          placeholder='Galeri'
          className={blockFieldClasses()}
        />
      </BlockField>

      <div className='space-y-1.5'>
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-muted-foreground'
        >
          Tata letak
        </Typography>
        <div
          role='group'
          aria-label='Tata letak galeri'
          className='inline-flex gap-1'
        >
          {LAYOUT_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type='button'
              variant={props.layout === option.value ? 'secondary' : 'ghost'}
              size='sm'
              aria-pressed={props.layout === option.value}
              onClick={() => update({ layout: option.value })}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <ItemListEditor
        label='Gambar'
        description='Pilih aset dari daftar contoh. Pemilih aset sungguhan menyusul di task C5.'
        items={props.images}
        onChange={(images) => update({ images })}
        createItem={() => ({
          ...(blockDefaults.gallery().props.images[0] ?? {
            asset: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            alt: 'Gambar baru',
            caption: undefined,
          }),
        })}
        itemAriaLabel={(_, index) => `gambar ${index + 1}`}
        max={BLOCK_LIMITS.galleryImages}
        addLabel='Tambah gambar'
        emptyLabel='Belum ada gambar.'
        renderFields={(image, index) => (
          <div className='space-y-3'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <BlockField
                id={`gallery-asset-${value.id}-${index}`}
                label='Aset'
                error={blockErrorAt(issues, 'props', 'images', index, 'asset')}
              >
                <MockAssetPicker
                  id={`gallery-asset-${value.id}-${index}`}
                  value={image.asset}
                  onChange={(assetId) => setItem(index, { asset: assetId })}
                />
              </BlockField>

              <BlockField
                id={`gallery-alt-${value.id}-${index}`}
                label='Alt text'
                error={blockErrorAt(issues, 'props', 'images', index, 'alt')}
              >
                <Input
                  id={`gallery-alt-${value.id}-${index}`}
                  value={image.alt}
                  onChange={(event) =>
                    setItem(index, { alt: event.target.value })
                  }
                  maxLength={160}
                  placeholder='Deskripsi gambar'
                  className={blockFieldClasses()}
                />
              </BlockField>
            </div>

            <div className='space-y-1.5'>
              <BlockField
                id={`gallery-caption-${value.id}-${index}`}
                label='Caption'
                optional
                error={blockErrorAt(
                  issues,
                  'props',
                  'images',
                  index,
                  'caption',
                )}
              >
                <Input
                  id={`gallery-caption-${value.id}-${index}`}
                  value={image.caption ?? ''}
                  onChange={(event) =>
                    setItem(index, { caption: event.target.value || undefined })
                  }
                  maxLength={160}
                  placeholder='Keterangan singkat'
                  className={blockFieldClasses()}
                />
              </BlockField>

              {blockErrorForItem(issues, 'props.images', index, [
                `props.images.${index}.asset`,
                `props.images.${index}.alt`,
                `props.images.${index}.caption`,
              ]) ? (
                <p role='alert' className='text-xs text-destructive'>
                  {blockErrorForItem(issues, 'props.images', index, [
                    `props.images.${index}.asset`,
                    `props.images.${index}.alt`,
                    `props.images.${index}.caption`,
                  ])}
                </p>
              ) : null}
            </div>
          </div>
        )}
      />
    </div>
  );
}
