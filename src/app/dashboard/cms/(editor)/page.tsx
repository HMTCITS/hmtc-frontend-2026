import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_PAGES } from '@/lib/cms/fixtures';

import {
  CmsEmpty,
  CmsError,
  CmsLoading,
  CmsPermissionDenied,
} from './_components/cms-states';
import { PagesTable } from './_components/pages-table';

/**
 * Mock "Posts & Pages" screen (task A8). Data comes from `fixtures.ts` and
 * follows the `PageSummary` wire DTO; wiring to the real `/api/cms/pages`
 * replaces the import, not the layout.
 */
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
        <Typography
          as='p'
          font='satoshi'
          variant='c2'
          className='text-muted-foreground/70'
        >
          Data contoh mengikuti DTO PageSummary — belum tersambung ke Directus.
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

        <PagesTable pages={MOCK_PAGES} />
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
