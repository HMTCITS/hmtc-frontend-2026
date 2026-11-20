'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { FieldDescription, FieldError, FieldSet } from '@/components/ui/field';
import { BLOCK_LIMITS, BLOCK_META, richTextBlock } from '@/lib/directus/blocks';

import { TextField } from './block-fields';
import {
  type BlockFormProps,
  optionalText,
  withProps,
} from './block-form-utils';
import { useBlockForm } from './use-block-form';

const paragraphPath = (index: number) => `props.paragraphs.${index}`;

export function RichTextBlockForm({
  value,
  onChange,
  disabled,
}: BlockFormProps<'richText'>) {
  const form = useBlockForm(richTextBlock, value);
  const { heading, paragraphs } = value.props;

  const paragraphNodes = useRef<(HTMLElement | null)[]>([]);
  const addButton = useRef<HTMLButtonElement>(null);
  /** Where focus should land once the edited list has rendered. */
  const pendingFocus = useRef<number | 'add' | null>(null);

  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;

    pendingFocus.current = null;
    if (target === 'add') addButton.current?.focus();
    else paragraphNodes.current[target]?.focus();
  });

  const setParagraphs = (next: string[]) =>
    onChange(withProps(value, { paragraphs: next }));

  function addParagraph() {
    const index = paragraphs.length;
    // A new paragraph starts empty, which the schema rejects. Hold that error
    // back until the user leaves the field they were just handed.
    form.keepQuiet(paragraphPath(index));
    pendingFocus.current = index;
    setParagraphs([...paragraphs, '']);
  }

  function removeParagraph(index: number) {
    const next = paragraphs.filter((_, position) => position !== index);
    // The pressed button may unmount with its row; move focus to something
    // that is still there.
    pendingFocus.current =
      next.length === 0 ? 'add' : Math.min(index, next.length - 1);
    setParagraphs(next);
  }

  const atLimit = paragraphs.length >= BLOCK_LIMITS.paragraphsPerBlock;

  return (
    <FieldSet
      disabled={disabled}
      aria-label={`Pengaturan blok ${BLOCK_META.richText.label}`}
      className='gap-5'
    >
      <TextField
        label='Judul bagian'
        value={heading ?? ''}
        onValueChange={(text) =>
          onChange(withProps(value, { heading: optionalText(text) }))
        }
        {...form.field('props.heading')}
      />

      <FieldSet aria-label='Paragraf' className='gap-4'>
        {paragraphs.length === 0 ? (
          <FieldDescription>
            Belum ada paragraf. Halaman tidak bisa dipublikasikan selama blok
            ini kosong.
          </FieldDescription>
        ) : null}

        {paragraphs.map((paragraph, index) => (
          <TextField
            // Rows are fully controlled and hold no state of their own, so
            // position is a safe key.
            key={index}
            label={`Paragraf ${index + 1}`}
            multiline
            rows={4}
            value={paragraph}
            onValueChange={(text) =>
              setParagraphs(
                paragraphs.map((current, position) =>
                  position === index ? text : current,
                ),
              )
            }
            controlRef={(node) => {
              paragraphNodes.current[index] = node;
            }}
            action={
              <Button
                type='button'
                variant='ghost'
                size='icon'
                // Without its own colour the icon would turn red with the
                // rest of an invalid row and read as a warning.
                className='size-7 text-muted-foreground'
                aria-label={`Hapus paragraf ${index + 1}`}
                onClick={() => removeParagraph(index)}
              >
                <Trash2 aria-hidden='true' />
              </Button>
            }
            {...form.field(paragraphPath(index))}
          />
        ))}

        <FieldError>{form.errorAt('props.paragraphs')}</FieldError>

        <Button
          ref={addButton}
          type='button'
          variant='outline'
          size='sm'
          className='self-start'
          disabled={atLimit}
          onClick={addParagraph}
        >
          <Plus aria-hidden='true' />
          Tambah paragraf
        </Button>
        {atLimit ? (
          <FieldDescription>
            Satu blok memuat paling banyak {BLOCK_LIMITS.paragraphsPerBlock}{' '}
            paragraf.
          </FieldDescription>
        ) : null}
      </FieldSet>
    </FieldSet>
  );
}
