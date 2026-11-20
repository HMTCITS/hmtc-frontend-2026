'use client';

import { type ChangeEvent, type ReactNode, useId } from 'react';

import Typography from '@/components/Typography';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type { FieldBinding } from './useBlockForm';

type TextControl = HTMLInputElement | HTMLTextAreaElement;

type TextFieldProps = FieldBinding & {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  /** Rendered beside the label, e.g. the remove button of a list row. */
  action?: ReactNode;
  controlRef?: (node: TextControl | null) => void;
};

export function TextField({
  id,
  error,
  onFocus,
  onBlur,
  label,
  value,
  onValueChange,
  hint,
  multiline = false,
  rows = 3,
  action,
  controlRef,
}: TextFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(' ');

  const control = {
    id,
    value,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy || undefined,
    // `Field` turns its text red when invalid; what the user typed stays ink.
    className: cn(
      'text-foreground',
      error && 'border-destructive focus-visible:ring-destructive',
    ),
    onChange: (event: ChangeEvent<TextControl>) =>
      onValueChange(event.target.value),
    onFocus,
    onBlur: () => {
      // Whitespace left by a paste would fail the link and uuid rules, and a
      // title made only of spaces would pass the "required" rule.
      const trimmed = value.trim();
      if (trimmed !== value) onValueChange(trimmed);
      onBlur();
    },
  };

  const labelNode = <FieldLabel htmlFor={id}>{label}</FieldLabel>;

  return (
    <Field data-invalid={error ? true : undefined} className='gap-2'>
      {action ? (
        <div className='flex items-center justify-between gap-2'>
          {labelNode}
          {action}
        </div>
      ) : (
        labelNode
      )}

      {multiline ? (
        <Textarea ref={controlRef} rows={rows} {...control} />
      ) : (
        <Input ref={controlRef} type='text' {...control} />
      )}

      {hint ? <FieldDescription id={hintId}>{hint}</FieldDescription> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}

type ChoiceFieldProps<V extends string> = {
  label: string;
  value: V;
  /**
   * Label per option. Typing it as a `Record` over the schema's enum makes a
   * newly added enum value a compile error here.
   */
  options: Readonly<Record<V, string>>;
  onValueChange: (value: V) => void;
};

/** One-of-a-few choice, drawn as a segmented control over native radios. */
export function ChoiceField<V extends string>({
  label,
  value,
  options,
  onValueChange,
}: ChoiceFieldProps<V>) {
  const name = useId();

  return (
    <FieldSet className='gap-0'>
      <FieldLegend variant='label' className='mb-2'>
        {label}
      </FieldLegend>
      {/* The chosen option is already filled with the ring colour, so focus is
          drawn around the whole control, the same way `Input` shows it. */}
      <div className='flex gap-0.5 rounded-md border border-input p-0.5 has-focus-visible:ring-1 has-focus-visible:ring-ring'>
        {(Object.keys(options) as V[]).map((option) => (
          <label key={option} className='flex-1'>
            <input
              type='radio'
              name={name}
              value={option}
              checked={option === value}
              onChange={() => onValueChange(option)}
              className='peer sr-only'
            />
            <Typography
              as='span'
              font='satoshi'
              weight='medium'
              variant='s3'
              className='flex h-8 cursor-pointer items-center justify-center rounded-sm px-2 text-muted-foreground transition-colors peer-checked:bg-primary peer-checked:text-primary-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-[:enabled:not(:checked)]:hover:bg-accent'
            >
              {options[option]}
            </Typography>
          </label>
        ))}
      </div>
    </FieldSet>
  );
}

type Action = { label: string; href: string };

type ActionFieldsProps = {
  value: Action;
  onValueChange: (next: Action) => void;
  label: FieldBinding;
  href: FieldBinding;
};

/** The label and link pair shared by the hero button and the CTA block. */
export function ActionFields({
  value,
  onValueChange,
  label,
  href,
}: ActionFieldsProps) {
  return (
    <>
      <TextField
        label='Button label'
        value={value.label}
        onValueChange={(text) => onValueChange({ ...value, label: text })}
        {...label}
      />
      <TextField
        label='Button link'
        hint='Path internal seperti /nama-halaman, atau tautan https:// atau mailto:.'
        value={value.href}
        onValueChange={(text) => onValueChange({ ...value, href: text })}
        {...href}
      />
    </>
  );
}
