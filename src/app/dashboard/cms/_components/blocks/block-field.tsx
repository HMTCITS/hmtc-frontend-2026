'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { z } from 'zod';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Field wrapper for block editors: label + control + validation message.
 *
 * Errors come from `blocks.ts` Zod issues, mapped by dotted path (for example
 * `items.2.time`), so the copy the editor sees is the copy the API enforces.
 */
export function BlockField({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <Label htmlFor={id} className='flex items-baseline gap-1'>
        {label}
        {optional ? (
          <span className='text-xs font-normal text-muted-foreground'>
            opsional
          </span>
        ) : null}
      </Label>
      {children}
      {error ? (
        <p role='alert' className='text-xs text-destructive'>
          {error}
        </p>
      ) : hint ? (
        <p className='text-xs text-muted-foreground'>{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Parse a block with its own schema from `blocks.ts` and index the resulting
 * issues by dotted path for per-field rendering.
 */
export function useBlockIssues<T extends z.ZodType>(
  schema: T,
  value: unknown,
): Map<string, string> {
  return useMemo(() => {
    const map = new Map<string, string>();
    const parsed = schema.safeParse(value);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        map.set(issue.path.map(String).join('.'), issue.message);
      }
    }

    return map;
  }, [schema, value]);
}

/** Look up the most specific error for a field path. */
export function blockErrorAt(
  issues: Map<string, string>,
  ...path: readonly (string | number)[]
): string | undefined {
  return issues.get(path.join('.'));
}

/** The first issue under an item prefix, shown only when no field inside the
 * item already displays it (avoids the same message appearing twice). */
export function blockErrorForItem(
  issues: Map<string, string>,
  collectionPath: string,
  index: number,
  visibleFieldPaths: readonly string[] = [],
): string | undefined {
  const fieldErrors = new Set(visibleFieldPaths);
  const prefix = `${collectionPath}.${index}.`;
  for (const key of Array.from(issues.keys())) {
    if (key.startsWith(prefix) && !fieldErrors.has(key)) return issues.get(key);
  }
  return undefined;
}

export function blockFieldClasses(className?: string) {
  return cn(
    'rounded-md border border-input bg-transparent px-3 py-2 text-sm',
    'placeholder:text-muted-foreground',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className,
  );
}
