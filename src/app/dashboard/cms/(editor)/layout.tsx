import type { ReactNode } from 'react';

import { CmsShell } from '../_components/cms-shell';
import { CmsError } from '../_components/cms-states';
import { requireEditorSession } from '../_lib/editor-session';

/**
 * Session guard and shell for every editor screen.
 *
 * Layouts do not re-run on client navigation and do not stop the page under
 * them from rendering, so each editor page also calls `requireEditorSession()`,
 * and the data itself is protected by `requireSession()` in every
 * `/api/cms/*` route.
 */
export default async function CmsEditorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireEditorSession();

  if (!session) {
    return (
      <main className='mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <CmsError message='Directus tidak merespons. Coba lagi beberapa saat lagi.' />
      </main>
    );
  }

  const { user } = session;
  return (
    <CmsShell user={{ name: user.name, email: user.email }}>
      {children}
    </CmsShell>
  );
}
