import { redirect } from 'next/navigation';

import Typography from '@/components/Typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { safeNext } from '@/lib/cms/redirect';
import { getSession } from '@/lib/directus/session';

import { LoginForm } from '../_components/login-form';

export const metadata = {
  title: 'Masuk · CMS HMTC',
  robots: { index: false, follow: false },
};

async function isLoggedIn(): Promise<boolean> {
  try {
    return (await getSession({ refresh: false })).status === 'ok';
  } catch {
    return false; // Directus down: show the form; login reports the error
  }
}

export default async function CmsLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const raw = (await searchParams).next;
  const next = typeof raw === 'string' ? raw : undefined;

  if (await isLoggedIn()) redirect(safeNext(next));

  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='space-y-1'>
          <Typography as='h1' font='satoshi' weight='semibold' variant='h3'>
            Masuk ke CMS HMTC
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='b4'
            className='text-muted-foreground'
          >
            Gunakan akun CMS dari departemenmu.
          </Typography>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </main>
  );
}
