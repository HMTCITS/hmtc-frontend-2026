import type { ReactNode } from 'react';

/**
 * L4 layout for `/dashboard/cms/**` (DESIGN.md §8). It carries no guard: the
 * login page lives under it. The session check and the shell are in
 * `(editor)/layout.tsx`, which wraps every editor screen.
 */
export const metadata = {
  title: 'CMS HMTC',
};

export default function CmsLayout({ children }: { children: ReactNode }) {
  return children;
}
