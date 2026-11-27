'use client';

import { FieldSet } from '@/components/ui/field';
import { BLOCK_META, type BlockOf, ctaBlock } from '@/lib/directus/blocks';

import { ActionFields, ChoiceField, TextField } from './block-fields';
import {
  type BlockFormProps,
  optionalText,
  withProps,
} from './block-form-utils';
import { useBlockForm } from './use-block-form';

type CtaProps = BlockOf<'cta'>['props'];

const TONE_LABELS: Record<CtaProps['tone'], string> = {
  accent: 'Aksen',
  neutral: 'Netral',
};

export function CtaBlockForm({
  value,
  onChange,
  disabled,
}: BlockFormProps<'cta'>) {
  const form = useBlockForm(ctaBlock, value);
  const { props } = value;

  const set = (patch: Partial<CtaProps>) => onChange(withProps(value, patch));

  return (
    <FieldSet
      disabled={disabled}
      aria-label={`Pengaturan blok ${BLOCK_META.cta.label}`}
      className='gap-5'
    >
      <TextField
        label='Judul'
        value={props.heading}
        onValueChange={(heading) => set({ heading })}
        {...form.field('props.heading')}
      />
      <TextField
        label='Deskripsi'
        multiline
        value={props.description ?? ''}
        onValueChange={(text) => set({ description: optionalText(text) })}
        {...form.field('props.description')}
      />
      <ActionFields
        value={props.action}
        onValueChange={(action) => set({ action })}
        label={form.field('props.action.label')}
        href={form.field('props.action.href')}
      />
      <ChoiceField
        label='Warna'
        value={props.tone}
        options={TONE_LABELS}
        onValueChange={(tone) => set({ tone })}
      />
    </FieldSet>
  );
}
