'use client';

import { FieldSet } from '@/components/ui/field';
import {
  agendaBlock,
  BLOCK_LIMITS,
  BLOCK_META,
  type BlockOf,
} from '@/lib/directus/blocks';

import { TextField } from './block-fields';
import {
  type BlockFormProps,
  optionalText,
  withProps,
} from './block-form-utils';
import { ItemListEditor } from './item-list-editor';
import { useBlockForm } from './use-block-form';

type AgendaItem = BlockOf<'agenda'>['props']['items'][number];

export function AgendaBlockForm({
  value,
  onChange,
  disabled,
}: BlockFormProps<'agenda'>) {
  const form = useBlockForm(agendaBlock, value);
  const { props } = value;

  const setItems = (items: AgendaItem[]) =>
    onChange(withProps(value, { items }));

  const setItem = (index: number, patch: Partial<AgendaItem>) =>
    setItems(
      props.items.map((item, position) => {
        if (position !== index) return item;
        const next: Record<string, unknown> = { ...item, ...patch };
        // An emptied optional field is removed, never stored as `''`.
        if (next.description === undefined) delete next.description;
        return next as AgendaItem;
      }),
    );

  return (
    <FieldSet
      disabled={disabled}
      aria-label={`Pengaturan blok ${BLOCK_META.agenda.label}`}
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
        label='Sesi acara'
        items={props.items}
        onChange={setItems}
        // Prefilled so a new row is valid until the user edits it.
        createItem={(): AgendaItem => ({ time: '00.00', title: 'Sesi baru' })}
        itemAriaLabel={(_, index) => `sesi ${index + 1}`}
        max={BLOCK_LIMITS.agendaItems}
        error={form.errorAt('props.items')}
        addLabel='Tambah sesi'
        emptyLabel='Belum ada sesi. Halaman tidak bisa dipublikasikan selama blok ini kosong.'
        renderFields={(item, index) => (
          <>
            <div className='grid gap-3 @md:grid-cols-[8rem_1fr]'>
              <TextField
                label='Jam'
                value={item.time}
                onValueChange={(time) => setItem(index, { time })}
                {...form.field(`props.items.${index}.time`)}
              />
              <TextField
                label='Judul sesi'
                value={item.title}
                onValueChange={(title) => setItem(index, { title })}
                {...form.field(`props.items.${index}.title`)}
              />
            </div>
            <TextField
              label='Deskripsi'
              multiline
              rows={2}
              value={item.description ?? ''}
              onValueChange={(text) =>
                setItem(index, { description: optionalText(text) })
              }
              {...form.field(`props.items.${index}.description`)}
            />
          </>
        )}
      />
    </FieldSet>
  );
}
