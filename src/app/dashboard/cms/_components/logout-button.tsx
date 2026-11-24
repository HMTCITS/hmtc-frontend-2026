'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CMS_LOGIN } from '@/lib/cms/redirect';
import { cmsFetch } from '@/lib/cms-client';

/**
 * Logs out and returns to the login page. The route always clears both
 * cookies, so a failed request still ends on the login page.
 */
export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await cmsFetch('logout');
    } catch {
      // Ignored: the login page is the right place either way.
    }
    router.replace(CMS_LOGIN);
    router.refresh();
  }

  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      className={className}
      disabled={pending}
      onClick={() => void logout()}
    >
      <LogOut className='size-4' aria-hidden='true' />
      {pending ? 'Keluar…' : 'Keluar'}
    </Button>
  );
}
