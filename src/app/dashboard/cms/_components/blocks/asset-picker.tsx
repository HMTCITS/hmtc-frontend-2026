'use client';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

import type { FieldBinding } from './use-block-form';

/**
 * MOCK asset library (task A10). The real picker with upload arrives with task
 * C5 (#227, `POST /api/cms/assets`); until then the editor picks from a fixed
 * list of valid uuids, so a new image or hero is valid by default.
 */
export const MOCK_ASSETS = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', label: 'Poster acara (mock)' },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', label: 'Foto kelompok (mock)' },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', label: 'Dokumentasi (mock)' },
] as const;

export const DEFAULT_MOCK_ASSET = MOCK_ASSETS[0].id;

type AssetFieldProps = FieldBinding & {
  label: string;
  value: string | undefined;
  onValueChange: (assetId: string | undefined) => void;
  hint?: string;
  /** Offers "Tanpa gambar" for an optional image. */
  optional?: boolean;
};

/**
 * Select over the mock library. A value that is not in the list (for example
 * a block saved before the mock existed) stays selectable, so opening the form
 * never rewrites it silently; the schema still flags it if it is not a uuid.
 */
export function AssetField({
  id,
  error,
  onFocus,
  onBlur,
  label,
  value,
  onValueChange,
  hint,
  optional = false,
}: AssetFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId]
    .filter(Boolean)
    .join(' ');
  const unknown =
    value !== undefined && !MOCK_ASSETS.some((asset) => asset.id === value);

  return (
    <Field data-invalid={error ? true : undefined} className='gap-2'>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value ?? ''}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        onChange={(event) => onValueChange(event.target.value || undefined)}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base text-foreground shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          error && 'border-destructive focus-visible:ring-destructive',
        )}
      >
        {optional ? <option value=''>Tanpa gambar</option> : null}
        {unknown ? <option value={value}>{value}</option> : null}
        {MOCK_ASSETS.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.label}
          </option>
        ))}
      </select>
      {hint ? <FieldDescription id={hintId}>{hint}</FieldDescription> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
