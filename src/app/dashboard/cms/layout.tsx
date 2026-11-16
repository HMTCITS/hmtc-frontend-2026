import type { ReactNode } from 'react';

import { CmsShell } from './_components/cms-shell';

/**
 * L4 layout for `/dashboard/cms/**` (DESIGN.md §8). Session verification is
 * NOT here yet — `/dashboard/**` is still gated by the pathname block in
 * `src/proxy.ts` in production, and the real session check lands with the
 * auth task (integration plan §1).
 */
export const metadata = {
  title: 'CMS HMTC',
};

export default function CmsLayout({ children }: { children: ReactNode }) {
  return <CmsShell>{children}</CmsShell>;
}
