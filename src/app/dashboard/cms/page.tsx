import { Suspense } from 'react';

import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  CmsEmpty,
  CmsError,
  CmsLoading,
  CmsPermissionDenied,
} from './_components/cms-states';
import { PagesList } from './_components/pages-list';

/** "Posts & Pages" screen: the page list comes from `GET /api/cms/pages`. */
export default function CmsPostsAndPagesPage() {
  return (
    <div className='space-y-8'>
      <header className='space-y-2'>
        <Typography
          as='h1'
          font='satoshi'
          weight='semibold'
          variant='j2'
          className='text-foreground'
        >
          Posts &amp; Pages
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='text-muted-foreground'
        >
          Kelola halaman proker: draft, review, dan publikasi per tahun edisi.
        </Typography>
      </header>

      <section aria-labelledby='cms-pages-title' className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <Typography
            as='h2'
            id='cms-pages-title'
            font='satoshi'
            weight='medium'
            variant='h3'
            className='text-foreground'
          >
            Daftar halaman
          </Typography>
          <Button size='sm' type='button' disabled title='Menunggu task editor'>
            Halaman baru
          </Button>
        </div>

        <Suspense fallback={<CmsLoading rows={3} />}>
          <PagesList />
        </Suspense>
      </section>

      <section aria-labelledby='cms-states-title' className='space-y-4'>
        <Typography
          as='h2'
          id='cms-states-title'
          font='satoshi'
          weight='medium'
          variant='h3'
          className='text-foreground'
        >
          Komponen keadaan
        </Typography>
        <Typography
          as='p'
          font='satoshi'
          variant='b4'
          className='text-muted-foreground'
        >
          Empat keadaan wajib yang harus dirender setiap layar CMS.
        </Typography>

        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='h5'
                >
                  Loading
                </Typography>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CmsLoading rows={2} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='h5'
                >
                  Kosong
                </Typography>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CmsEmpty
                title='Belum ada halaman'
                description='Buat halaman pertama untuk satu proker.'
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='h5'
                >
                  Error
                </Typography>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CmsError message='Directus tidak merespons. Periksa koneksi lalu coba lagi.' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Typography
                  as='span'
                  font='satoshi'
                  weight='medium'
                  variant='h5'
                >
                  Akses ditolak
                </Typography>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CmsPermissionDenied code='forbidden' />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
