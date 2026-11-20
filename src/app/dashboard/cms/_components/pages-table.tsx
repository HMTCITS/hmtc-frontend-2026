import Typography from '@/components/Typography';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PageSummary } from '@/lib/cms/dto';

import { CmsEmpty } from './cms-states';
import { PageStatusBadge } from './page-status-badge';

/**
 * Mock "Posts & Pages" table for the CMS shell (task A8). Presentational only:
 * the real data source and row actions arrive with the editor tasks.
 */
export function PagesTable({ pages }: { pages: readonly PageSummary[] }) {
  if (pages.length === 0) {
    return (
      <CmsEmpty
        title='Belum ada halaman'
        description='Buat halaman pertama untuk satu proker, lalu kirim untuk direview.'
        action={
          <Button size='sm' type='button'>
            Halaman baru
          </Button>
        }
      />
    );
  }

  return (
    <div className='rounded-lg border border-border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Typography as='span' font='satoshi' weight='medium' variant='s4'>
                Judul
              </Typography>
            </TableHead>
            <TableHead>
              <Typography as='span' font='satoshi' weight='medium' variant='s4'>
                Tipe
              </Typography>
            </TableHead>
            <TableHead>
              <Typography as='span' font='satoshi' weight='medium' variant='s4'>
                Status
              </Typography>
            </TableHead>
            <TableHead>
              <Typography as='span' font='satoshi' weight='medium' variant='s4'>
                Tahun
              </Typography>
            </TableHead>
            <TableHead>
              <Typography as='span' font='satoshi' weight='medium' variant='s4'>
                Terakhir diubah
              </Typography>
            </TableHead>
            <TableHead>
              <span className='sr-only'>Aksi</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page.id}>
              <TableCell>
                <div className='flex flex-col gap-0.5'>
                  <Typography
                    as='span'
                    font='satoshi'
                    weight='medium'
                    variant='s3'
                    className='text-foreground'
                  >
                    {page.title}
                  </Typography>
                  <Typography
                    as='span'
                    font='satoshi'
                    variant='c2'
                    className='text-muted-foreground'
                  >
                    {page.path}
                  </Typography>
                </div>
              </TableCell>
              <TableCell>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='b4'
                  className='text-muted-foreground capitalize'
                >
                  {page.pageType}
                </Typography>
              </TableCell>
              <TableCell>
                <PageStatusBadge status={page.status} />
              </TableCell>
              <TableCell>
                <Typography as='span' font='satoshi' variant='b4'>
                  {page.editionYear}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  as='span'
                  font='satoshi'
                  variant='b4'
                  className='text-muted-foreground'
                >
                  {page.updatedAt.slice(0, 10)}
                </Typography>
              </TableCell>
              <TableCell className='text-right'>
                <Button
                  variant='outline'
                  size='sm'
                  type='button'
                  disabled
                  title='Menunggu task editor halaman'
                >
                  Buka
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
