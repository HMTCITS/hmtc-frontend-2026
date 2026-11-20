'use client';

import { FieldSet } from '@/components/ui/field';
import {
  BLOCK_LIMITS,
  BLOCK_META,
  blockDefaults,
  type BlockOf,
  eventDetailsBlock,
} from '@/lib/directus/blocks';

import { ChoiceField, TextField } from './block-fields';
import {
  type BlockFormProps,
  optionalText,
  withProps,
} from './block-form-utils';
import { ItemListEditor } from './item-list-editor';
import { useBlockForm } from './use-block-form';

type DetailItem = BlockOf<'eventDetails'>['props']['items'][number];
type DetailIcon = NonNullable<DetailItem['icon']>;

/** Typed over the schema enum, so a new icon is a compile error here. */
const ICON_LABELS: Record<DetailIcon, string> = {
  calendar: 'Tanggal',
  clock: 'Jam',
  location: 'Lokasi',
  ticket: 'Tiket',
  link: 'Tautan',
};

export function EventDetailsBlockForm({
  value,
  onChange,
  disabled,
}: BlockFormProps<'eventDetails'>) {
  const form = useBlockForm(eventDetailsBlock, value);
  const { props } = value;

  const setItems = (items: DetailItem[]) =>
    onChange(withProps(value, { items }));

  const setItem = (index: number, patch: Partial<DetailItem>) =>
    setItems(
      props.items.map((item, position) =>
        position === index ? { ...item, ...patch } : item,
      ),
    );

  return (
    <FieldSet
      disabled={disabled}
      aria-label={`Pengaturan blok ${BLOCK_META.eventDetails.label}`}
      className='gap-5'
    >
      <TextField
        label='Judul bagian'
        value={props.heading ?? ''}
        onValueChange={(text) =>
          onChange(withProps(value, { heading: optionalText(text) }))
        }
        {...form.field('props.heading')}
      />

      <ItemListEditor
        label='Baris detail'
        description='Tanggal, waktu, lokasi, dan sejenisnya.'
        items={props.items}
        onChange={setItems}
        createItem={() => blockDefaults.eventDetails().props.items[0]}
        itemAriaLabel={(_, index) => `baris ${index + 1}`}
        max={BLOCK_LIMITS.detailItems}
        error={form.errorAt('props.items')}
        addLabel='Tambah baris'
        emptyLabel='Belum ada baris detail. Halaman tidak bisa dipublikasikan selama blok ini kosong.'
        renderFields={(item, index) => (
          <>
            <div className='grid gap-3 @md:grid-cols-2'>
              <TextField
                label='Label'
                value={item.label}
                onValueChange={(label) => setItem(index, { label })}
                {...form.field(`props.items.${index}.label`)}
              />
              <TextField
                label='Isi'
                value={item.value}
                onValueChange={(text) => setItem(index, { value: text })}
                {...form.field(`props.items.${index}.value`)}
              />
            </div>
            <ChoiceField
              label='Ikon'
              value={item.icon}
              options={ICON_LABELS}
              onValueChange={(icon) => setItem(index, { icon })}
            />
          </>
        )}
      />
    </FieldSet>
  );
}
