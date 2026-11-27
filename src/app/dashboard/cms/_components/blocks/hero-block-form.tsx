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

import { AssetField } from './asset-picker';
import { ActionFields, ChoiceField, TextField } from './block-fields';
import {
  type BlockFormProps,
  optionalText,
  withProps,
} from './block-form-utils';
import { useBlockForm } from './use-block-form';

type HeroProps = BlockOf<'hero'>['props'];

const ALIGN_LABELS: Record<HeroProps['align'], string> = {
  left: 'Kiri',
  center: 'Tengah',
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
      aria-label={`Pengaturan blok ${BLOCK_META.hero.label}`}
      className='gap-5'
    >
      <TextField
        label='Teks kecil di atas judul'
        value={props.eyebrow ?? ''}
        onValueChange={(text) => set({ eyebrow: optionalText(text) })}
        {...form.field('props.eyebrow')}
      />
      <TextField
        label='Judul'
        value={props.title}
        onValueChange={(title) => set({ title })}
        {...form.field('props.title')}
      />
      <TextField
        label='Deskripsi'
        multiline
        value={props.description ?? ''}
        onValueChange={(text) => set({ description: optionalText(text) })}
        {...form.field('props.description')}
      />
      <ChoiceField
        label='Perataan teks'
        value={props.align}
        options={ALIGN_LABELS}
        onValueChange={(align) => set({ align })}
      />
      <AssetField
        label='Gambar'
        optional
        hint='Masih daftar contoh; pemilih dan upload aset menyusul di #227.'
        value={props.image ?? undefined}
        onValueChange={(image) => set({ image })}
        {...form.field('props.image')}
      />
      <TextField
        label='Teks alternatif gambar'
        hint='Menjelaskan gambar untuk pembaca layar. Kalau kosong, judul yang dipakai.'
        value={props.imageAlt ?? ''}
        onValueChange={(text) => set({ imageAlt: optionalText(text) })}
        {...form.field('props.imageAlt')}
      />

      <Field orientation='horizontal'>
        <FieldLabel htmlFor={buttonToggleId}>Tampilkan tombol</FieldLabel>
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
