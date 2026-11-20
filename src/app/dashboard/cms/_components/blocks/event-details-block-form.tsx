'use client';

import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Clock, Link2, MapPin, Ticket } from 'lucide-react';
import type { ComponentType } from 'react';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BLOCK_LIMITS,
  blockDefaults,
  type BlockOf,
  eventDetailsBlock,
} from '@/lib/directus/blocks';

import {
  blockErrorAt,
  blockErrorForItem,
  BlockField,
  blockFieldClasses,
  useBlockIssues,
} from './block-field';
import { ItemListEditor } from './item-list-editor';

export type EventDetailsBlockFormProps = {
  value: BlockOf<'eventDetails'>;
  onChange: (next: BlockOf<'eventDetails'>) => void;
};

type DetailIcon = NonNullable<
  BlockOf<'eventDetails'>['props']['items'][number]['icon']
>;

const ICON_OPTIONS: readonly {
  value: DetailIcon;
  label: string;
  icon: LucideIcon;
}[] = [
  { value: 'calendar', label: 'Kalender', icon: CalendarDays },
  { value: 'clock', label: 'Jam', icon: Clock },
  { value: 'location', label: 'Lokasi', icon: MapPin },
  { value: 'ticket', label: 'Tiket', icon: Ticket },
  { value: 'link', label: 'Tautan', icon: Link2 },
];

export function EventDetailsBlockForm({
  value,
  onChange,
}: EventDetailsBlockFormProps) {
  const issues = useBlockIssues(eventDetailsBlock, value);
  const { props } = value;

  const update = (patch: Partial<BlockOf<'eventDetails'>['props']>) =>
    onChange({ ...value, props: { ...props, ...patch } });

  const setItem = (
    index: number,
    patch: Partial<{ label: string; value: string; icon: DetailIcon }>,
  ) =>
    update({
      items: props.items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    });

  return (
    <div className='space-y-5'>
      <BlockField
        id={`event-details-heading-${value.id}`}
        label='Judul bagian'
        optional
        error={blockErrorAt(issues, 'props', 'heading')}
      >
        <Input
          id={`event-details-heading-${value.id}`}
          value={props.heading ?? ''}
          onChange={(event) =>
            update({ heading: event.target.value || undefined })
          }
          maxLength={BLOCK_LIMITS.headingChars}
          placeholder='Detail Acara'
          className={blockFieldClasses()}
        />
      </BlockField>

      <ItemListEditor
        label='Baris detail'
        description='Tanggal, waktu, lokasi, dan sejenisnya.'
        items={props.items}
        onChange={(items) => update({ items })}
        createItem={() => blockDefaults.eventDetails().props.items[0]}
        itemAriaLabel={(_, index) => `baris ${index + 1}`}
        max={BLOCK_LIMITS.detailItems}
        addLabel='Tambah baris'
        emptyLabel='Belum ada baris detail.'
        renderFields={(item, index) => (
          <div className='space-y-3'>
            <div className='grid gap-3 sm:grid-cols-2'>
              <BlockField
                id={`event-details-label-${value.id}-${index}`}
                label='Label'
                error={blockErrorAt(issues, 'props', 'items', index, 'label')}
              >
                <Input
                  id={`event-details-label-${value.id}-${index}`}
                  value={item.label}
                  onChange={(event) =>
                    setItem(index, { label: event.target.value })
                  }
                  maxLength={40}
                  placeholder='Tanggal'
                  className={blockFieldClasses()}
                />
              </BlockField>

              <BlockField
                id={`event-details-value-${value.id}-${index}`}
                label='Isi'
                error={blockErrorAt(issues, 'props', 'items', index, 'value')}
              >
                <Input
                  id={`event-details-value-${value.id}-${index}`}
                  value={item.value}
                  onChange={(event) =>
                    setItem(index, { value: event.target.value })
                  }
                  maxLength={160}
                  placeholder='12 Oktober 2026'
                  className={blockFieldClasses()}
                />
              </BlockField>
            </div>

            <div className='space-y-1.5'>
              <Typography
                as='p'
                font='satoshi'
                variant='c2'
                className='text-muted-foreground'
              >
                Ikon
              </Typography>
              <div
                role='group'
                aria-label='Pilih ikon'
                className='flex flex-wrap gap-1'
              >
                {ICON_OPTIONS.map((option) => {
                  const active = item.icon === option.value;

                  return (
                    <Button
                      key={option.value}
                      type='button'
                      variant={active ? 'secondary' : 'ghost'}
                      size='sm'
                      aria-pressed={active}
                      aria-label={`Ikon ${option.label}`}
                      onClick={() => setItem(index, { icon: option.value })}
                    >
                      <option.icon aria-hidden='true' />
                      <Typography as='span' font='satoshi' variant='c2'>
                        {option.label}
                      </Typography>
                    </Button>
                  );
                })}
              </div>
              {blockErrorForItem(issues, 'props.items', index, [
                `props.items.${index}.label`,
                `props.items.${index}.value`,
                `props.items.${index}.icon`,
              ]) ? (
                <p role='alert' className='text-xs text-destructive'>
                  {blockErrorForItem(issues, 'props.items', index, [
                    `props.items.${index}.label`,
                    `props.items.${index}.value`,
                    `props.items.${index}.icon`,
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

export type EventDetailsForm = ComponentType<EventDetailsBlockFormProps>;
