'use client';

import { FieldSet } from '@/components/ui/field';
import { BLOCK_META, type BlockOf } from '@/lib/directus/blocks';

import { ChoiceField } from './block-fields';
import { type BlockFormProps, withProps } from './block-form-utils';

type DividerProps = BlockOf<'divider'>['props'];

const SPACING_LABELS: Record<DividerProps['spacing'], string> = {
  sm: 'Kecil',
  md: 'Sedang',
  lg: 'Besar',
};

/** A divider has one enum prop, so it has no state the schema could reject. */
export function DividerBlockForm({
  value,
  onChange,
  disabled,
}: BlockFormProps<'divider'>) {
  return (
    <FieldSet
      disabled={disabled}
      aria-label={`Pengaturan blok ${BLOCK_META.divider.label}`}
    >
      <ChoiceField
        label='Jarak'
        value={value.props.spacing}
        options={SPACING_LABELS}
        onValueChange={(spacing) => onChange(withProps(value, { spacing }))}
      />
    </FieldSet>
  );
}
