'use client';

import { useId, useMemo, useState } from 'react';
import type { z } from 'zod';

import { collectFieldErrors } from './block-form-utils';

/** What a field needs from the form: spread it onto a field component. */
export type FieldBinding = {
  id: string;
  error: string | undefined;
  onFocus: () => void;
  onBlur: () => void;
};

/**
 * Validation state shared by every block form.
 *
 * Errors are derived from the block on each render instead of being stored, so
 * they cannot drift from the value the editor holds, and a block that arrives
 * invalid is flagged before the user touches it.
 *
 * The one thing kept in state is the "quiet" field: a field that was valid when
 * the user entered it and is still being typed in. Its error waits for blur, so
 * a half-typed link is not flagged on the first keystroke.
 */
export function useBlockForm(schema: z.ZodType, value: unknown) {
  const baseId = useId();
  const errors = useMemo(
    () => collectFieldErrors(schema, value),
    [schema, value],
  );
  const [quietPath, setQuietPath] = useState<string | null>(null);

  function errorAt(path: string): string | undefined {
    const error = errors[path];
    if (!error) return undefined;
    if (path === quietPath && !error.immediate) return undefined;
    return error.message;
  }

  function field(path: string): FieldBinding {
    return {
      id: `${baseId}-${path}`,
      error: errorAt(path),
      onFocus: () => {
        // A field that is already showing an error keeps showing it, so the
        // user sees it clear as they fix it.
        if (!errors[path]) setQuietPath(path);
      },
      onBlur: () => {
        setQuietPath((current) => (current === path ? null : current));
      },
    };
  }

  return {
    field,
    errorAt,
    /**
     * Holds back the error of a field the form itself just created empty,
     * until the user leaves it.
     */
    keepQuiet: setQuietPath,
  };
}
