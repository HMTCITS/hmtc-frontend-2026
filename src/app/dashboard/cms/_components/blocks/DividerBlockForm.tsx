'use client';

import { FieldSet } from '@/components/ui/field';
import { BLOCK_META, type BlockOf } from '@/lib/directus/blocks';

import { type BlockFormProps, withProps } from './block-form-utils';
import { ChoiceField } from './BlockFormFields';

type DividerProps = BlockOf<'divider'>['props'];

const SPACING_LABELS: Record<DividerProps['spacing'], string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
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
      aria-label={`${BLOCK_META.divider.label} block settings`}
    >
      <ChoiceField
        label='Spacing'
        value={value.props.spacing}
        options={SPACING_LABELS}
        onValueChange={(spacing) => onChange(withProps(value, { spacing }))}
      />
    </FieldSet>
  );
}
