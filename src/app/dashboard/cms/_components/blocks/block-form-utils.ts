/**
 * Pieces shared by the block forms in this folder.
 *
 * A block form is a controlled view over one block: it receives the block,
 * reports every edit as a whole new block, and keeps no copy of its own. The
 * only validation is the schema in `@/lib/directus/blocks`; nothing here adds a
 * rule that the server would not also enforce.
 */

import type { z } from 'zod';

import type { Block, BlockOf, BlockType } from '@/lib/directus/blocks';

export type BlockFormProps<T extends BlockType> = {
  value: BlockOf<T>;
  /** Called on every edit with the whole next block, valid or not. */
  onChange: (next: BlockOf<T>) => void;
  /** Locks every control, e.g. while saving or when CMS editing is off. */
  disabled?: boolean;
};

export type FieldError = {
  message: string;
  /** Shown even while the field is still being typed in. */
  immediate: boolean;
};

/**
 * Keyed by dotted path relative to the block, e.g. `props.cta.href`. This is
 * the path format of `toValidationIssues` in `@/lib/cms/errors` without the
 * leading `blocks.<index>.`.
 */
export type FieldErrors = Readonly<Record<string, FieldError>>;

/**
 * Wording for the length rules, which the schema leaves to Zod's English
 * defaults. It is passed per parse, so a message written in the schema itself
 * still wins.
 */
const describeIssue: z.core.$ZodErrorMap = (issue) => {
  if (
    issue.code === 'too_small' &&
    issue.origin === 'string' &&
    issue.minimum === 1
  ) {
    return 'Wajib diisi';
  }

  if (issue.code === 'too_big') {
    const unit = issue.origin === 'string' ? 'karakter' : 'item';
    return `Maksimal ${issue.maximum} ${unit}`;
  }

  return undefined;
};

function capitalise(message: string): string {
  return message.charAt(0).toUpperCase() + message.slice(1);
}

/** Validates one block and returns at most one error per field. */
export function collectFieldErrors(
  schema: z.ZodType,
  value: unknown,
): FieldErrors {
  const result = schema.safeParse(value, { error: describeIssue });
  if (result.success) return {};

  const errors: Record<string, FieldError> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.map(String).join('.');
    // An empty link fails twice: too short, then not a link. The first issue
    // names the more basic problem, so it is the one worth showing.
    if (errors[path]) continue;

    errors[path] = {
      message: capitalise(issue.message),
      // Overflow never resolves by typing further, so it is not held back.
      immediate: issue.code === 'too_big',
    };
  }

  return errors;
}

/** An emptied optional text field means "absent", never `''`. */
export function optionalText(text: string): string | undefined {
  return text === '' ? undefined : text;
}

/**
 * Returns the block with `patch` merged into its props.
 *
 * A prop patched to `undefined` is removed instead of stored. Optional props
 * are omitted when unset: `richText.heading` rejects an empty string, and the
 * renderers treat a missing prop as "do not render this part".
 */
export function withProps<B extends Block>(
  block: B,
  patch: Partial<B['props']>,
): B {
  const props: Record<string, unknown> = { ...block.props, ...patch };
  for (const key of Object.keys(props)) {
    if (props[key] === undefined) delete props[key];
  }

  // Only keys of `B['props']` went in, so the result is still `B`.
  return { ...block, props } as B;
}
