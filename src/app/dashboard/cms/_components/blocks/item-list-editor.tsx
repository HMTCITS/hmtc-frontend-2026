'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field';

function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length
  ) {
    return [...items];
  }

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Generic add / remove / reorder list for block item arrays (event details,
 * agenda entries, gallery images).
 *
 * Mutations are immutable: every change hands a NEW array to `onChange`, so the
 * parent editor keeps owning the state and React Query / undo keep working.
 */
export function ItemListEditor<T>({
  label,
  description,
  items,
  onChange,
  createItem,
  renderFields,
  itemAriaLabel,
  max,
  error,
  addLabel = 'Tambah item',
  emptyLabel = 'Belum ada item.',
}: {
  label: string;
  description?: string;
  items: readonly T[];
  onChange: (items: T[]) => void;
  createItem: () => T;
  renderFields: (item: T, index: number) => ReactNode;
  /** Human label per item, used inside the aria-labels of row controls. */
  itemAriaLabel: (item: T, index: number) => string;
  max?: number;
  /** Error on the list itself, e.g. over the limit, from `useBlockForm`. */
  error?: string;
  addLabel?: string;
  emptyLabel?: string;
}) {
  const atMax = max !== undefined && items.length >= max;

  return (
    <section aria-label={label} className='space-y-3'>
      <div className='flex items-baseline justify-between gap-2'>
        <Typography as='p' font='satoshi' weight='medium' variant='s3'>
          {label}
        </Typography>
        {max !== undefined ? (
          <Typography
            as='p'
            font='satoshi'
            variant='c2'
            className='text-muted-foreground'
          >
            {items.length}/{max}
          </Typography>
        ) : null}
      </div>

      {description ? (
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-muted-foreground'
        >
          {description}
        </Typography>
      ) : null}

      {items.length === 0 ? (
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='text-muted-foreground'
        >
          {emptyLabel}
        </Typography>
      ) : (
        <ul className='space-y-3'>
          {items.map((item, index) => {
            const rowLabel = itemAriaLabel(item, index);

            return (
              <li key={index} className='rounded-lg border border-border p-3'>
                <div className='flex items-start gap-3'>
                  <div className='@container min-w-0 flex-1 space-y-3'>
                    {renderFields(item, index)}
                  </div>

                  <div className='flex flex-col gap-1'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={`Naikkan ${rowLabel}`}
                      disabled={index === 0}
                      onClick={() =>
                        onChange(moveItem(items, index, index - 1))
                      }
                    >
                      <ArrowUp aria-hidden='true' />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={`Turunkan ${rowLabel}`}
                      disabled={index === items.length - 1}
                      onClick={() =>
                        onChange(moveItem(items, index, index + 1))
                      }
                    >
                      <ArrowDown aria-hidden='true' />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      aria-label={`Hapus ${rowLabel}`}
                      className='text-destructive hover:text-destructive'
                      onClick={() => {
                        const next = items.filter((_, i) => i !== index);
                        onChange(next);
                      }}
                    >
                      <Trash2 aria-hidden='true' />
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <FieldError>{error}</FieldError>

      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={atMax}
        onClick={() => onChange([...items, createItem()])}
      >
        <Plus aria-hidden='true' />
        {addLabel}
      </Button>
    </section>
  );
}
