'use client';

import { useId } from 'react';

import { Field, FieldLabel, FieldSet } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import {
  BLOCK_META,
  type BlockOf,
  createBlock,
  heroBlock,
} from '@/lib/directus/blocks';

import {
  type BlockFormProps,
  optionalText,
  withProps,
} from './block-form-utils';
import { ActionFields, ChoiceField, TextField } from './BlockFormFields';
import { useBlockForm } from './useBlockForm';

type HeroProps = BlockOf<'hero'>['props'];

const ALIGN_LABELS: Record<HeroProps['align'], string> = {
  left: 'Left',
  center: 'Center',
};

export function HeroBlockForm({
  value,
  onChange,
  disabled,
}: BlockFormProps<'hero'>) {
  const form = useBlockForm(heroBlock, value);
  const buttonToggleId = useId();
  const { props } = value;
  const { cta } = props;

  const set = (patch: Partial<HeroProps>) => onChange(withProps(value, patch));

  return (
    <FieldSet
      disabled={disabled}
      aria-label={`${BLOCK_META.hero.label} block settings`}
      className='gap-5'
    >
      <TextField
        label='Eyebrow'
        value={props.eyebrow ?? ''}
        onValueChange={(text) => set({ eyebrow: optionalText(text) })}
        {...form.field('props.eyebrow')}
      />
      <TextField
        label='Heading'
        value={props.title}
        onValueChange={(title) => set({ title })}
        {...form.field('props.title')}
      />
      <TextField
        label='Description'
        multiline
        value={props.description ?? ''}
        onValueChange={(text) => set({ description: optionalText(text) })}
        {...form.field('props.description')}
      />
      <ChoiceField
        label='Text alignment'
        value={props.align}
        options={ALIGN_LABELS}
        onValueChange={(align) => set({ align })}
      />
      <TextField
        label='Image asset ID'
        hint='UUID gambar di pustaka Directus.'
        value={props.image ?? ''}
        onValueChange={(text) => set({ image: optionalText(text) })}
        {...form.field('props.image')}
      />
      <TextField
        label='Alt text'
        hint='Menjelaskan gambar untuk pembaca layar. Kalau kosong, heading yang dipakai.'
        value={props.imageAlt ?? ''}
        onValueChange={(text) => set({ imageAlt: optionalText(text) })}
        {...form.field('props.imageAlt')}
      />

      <Field orientation='horizontal'>
        <FieldLabel htmlFor={buttonToggleId}>Show button</FieldLabel>
        <Switch
          id={buttonToggleId}
          checked={cta !== undefined}
          onCheckedChange={(checked) =>
            // A hero button starts from the action of a new CTA block, so the
            // default label and link stay in `blockDefaults`.
            set({ cta: checked ? createBlock('cta').props.action : undefined })
          }
        />
      </Field>
      {cta ? (
        <ActionFields
          value={cta}
          onValueChange={(next) => set({ cta: next })}
          label={form.field('props.cta.label')}
          href={form.field('props.cta.href')}
        />
      ) : null}
    </FieldSet>
  );
}
