'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { agendaBlock, BLOCK_LIMITS, type BlockOf } from '@/lib/directus/blocks';

import {
  blockErrorAt,
  BlockField,
  blockFieldClasses,
  useBlockIssues,
} from './block-field';
import { ItemListEditor } from './item-list-editor';

export type AgendaBlockFormProps = {
  value: BlockOf<'agenda'>;
  onChange: (next: BlockOf<'agenda'>) => void;
};

export function AgendaBlockForm({ value, onChange }: AgendaBlockFormProps) {
  const issues = useBlockIssues(agendaBlock, value);
  const { props } = value;

  const update = (patch: Partial<BlockOf<'agenda'>['props']>) =>
    onChange({ ...value, props: { ...props, ...patch } });

  const setItem = (
    index: number,
    patch: Partial<{ time: string; title: string; description: string }>,
  ) =>
    update({
      items: props.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });

  return (
    <div className='space-y-5'>
      <BlockField
        id={`agenda-heading-${value.id}`}
        label='Judul bagian'
        optional
        error={blockErrorAt(issues, 'props', 'heading')}
      >
        <Input
          id={`agenda-heading-${value.id}`}
          value={props.heading ?? ''}
          onChange={(event) =>
            update({ heading: event.target.value || undefined })
          }
          maxLength={BLOCK_LIMITS.headingChars}
          placeholder='Susunan Acara'
          className={blockFieldClasses()}
        />
      </BlockField>

      <ItemListEditor
        label='Sesi acara'
        items={props.items}
        onChange={(items) => update({ items })}
        createItem={() => ({
          time: '00.00',
          title: 'Sesi baru',
          description: undefined,
        })}
        itemAriaLabel={(_, index) => `sesi ${index + 1}`}
        max={BLOCK_LIMITS.agendaItems}
        addLabel='Tambah sesi'
        emptyLabel='Belum ada sesi.'
        renderFields={(item, index) => (
          <div className='space-y-3'>
            <div className='grid gap-3 sm:grid-cols-[auto_1fr]'>
              <BlockField
                id={`agenda-time-${value.id}-${index}`}
                label='Jam'
                error={blockErrorAt(issues, 'props', 'items', index, 'time')}
              >
                <Input
                  id={`agenda-time-${value.id}-${index}`}
                  value={item.time}
                  onChange={(event) =>
                    setItem(index, { time: event.target.value })
                  }
                  maxLength={40}
                  placeholder='09.00'
                  className={blockFieldClasses('w-24')}
                />
              </BlockField>

              <BlockField
                id={`agenda-title-${value.id}-${index}`}
                label='Judul sesi'
                error={blockErrorAt(issues, 'props', 'items', index, 'title')}
              >
                <Input
                  id={`agenda-title-${value.id}-${index}`}
                  value={item.title}
                  onChange={(event) =>
                    setItem(index, { title: event.target.value })
                  }
                  maxLength={120}
                  placeholder='Registrasi'
                  className={blockFieldClasses()}
                />
              </BlockField>
            </div>

            <BlockField
              id={`agenda-description-${value.id}-${index}`}
              label='Deskripsi'
              optional
              error={blockErrorAt(
                issues,
                'props',
                'items',
                index,
                'description',
              )}
            >
              <Textarea
                id={`agenda-description-${value.id}-${index}`}
                value={item.description ?? ''}
                onChange={(event) =>
                  setItem(index, {
                    description: event.target.value || undefined,
                  })
                }
                maxLength={300}
                rows={2}
                placeholder='Keterangan singkat sesi ini.'
                className={blockFieldClasses()}
              />
            </BlockField>
          </div>
        )}
      />
    </div>
  );
}
