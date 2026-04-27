'use client';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import Box from '@/app/internal-affairs/syukuran-wisudawan/components/Box';
import wishesJson from '@/app/internal-affairs/syukuran-wisudawan/components/wishes.json';
import Typography from '@/components/Typography';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

type WishPayload = {
  doaHarapan: string;
  namaPenulis: string;
  submittedAt: string;
};

type WishCard = {
  author: string;
  wishes: string;
};

function transformWishes(data: WishPayload[]): WishCard[] {
  return data
    .map((item) => ({
      author: item.namaPenulis?.trim() || 'Anonim',
      wishes: item.doaHarapan?.trim() || '-',
    }))
    .filter((item) => item.wishes !== '-');
}

const wishes = transformWishes(wishesJson as WishPayload[]);

const ELLIPSIS = '…' as const;
const MOBILE_BREAKPOINT = '(max-width: 767px)';

export default function HarapanPage() {
  const [itemsPerPage, setItemsPerPage] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches
      ? 3
      : 6,
  );
  const [page, setPage] = useState(1);
  const [selectedWish, setSelectedWish] = useState<
    (WishCard & { id: number }) | null
  >(null);

  const totalPages = Math.ceil(wishes.length / itemsPerPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

    const updateItemsPerPage = (event: MediaQueryList | MediaQueryListEvent) => {
      setItemsPerPage(event.matches ? 3 : 6);
    };

    updateItemsPerPage(mediaQuery);
    mediaQuery.addEventListener('change', updateItemsPerPage);

    return () => {
      mediaQuery.removeEventListener('change', updateItemsPerPage);
    };
  }, []);

  useEffect(() => {
    if (!selectedWish) return;

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedWish(null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onEscape);
    };
  }, [selectedWish]);

  const currentWishes = useMemo(
    () => wishes.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [itemsPerPage, page],
  );

  // build a pages array with ellipses
  const pages: (number | typeof ELLIPSIS)[] =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, i) => i + 1)
      : [
          1,
          page > 3 ? ELLIPSIS : 2,
          page - 1,
          page,
          page + 1,
          page < totalPages - 2 ? ELLIPSIS : totalPages - 1,
          totalPages,
        ];

  const paginationItems = pages
    .filter((p) => (typeof p === 'number' ? p >= 1 && p <= totalPages : true))
    .map((p, i) =>
      p === ELLIPSIS ? (
        <PaginationItem key={`e${i}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={p}>
          <PaginationLink
            onClick={(e) => {
              e.preventDefault();
              setPage(p);
            }}
            className={cn(
              '!mb-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full hover:bg-gray-200',
              page === p
                ? '!bg-[#01263C] !text-white'
                : 'bg-transparent text-[#01263C]',
            )}
          >
            <Typography
              variant='h3'
              font='adelphe'
              className='translate-y-0.5 leading-none'
            >
              {p}
            </Typography>
          </PaginationLink>
        </PaginationItem>
      ),
    );

  return (
    <div className="flex flex-col items-center justify-center gap-[28px] self-stretch bg-[#EFDFC4] bg-[url('/images/internal-affairs/syukuran-wisuda/harapan-bg.png')] bg-repeat p-8 py-32 sm:p-16 md:p-[10%]">
      <div className="relative z-10 inline-flex w-full flex-col gap-7 bg-[url('/images/internal-affairs/syukuran-wisuda/blank-brown-paper-design.png')] bg-cover bg-repeat p-8 pb-48 sm:p-16 md:p-24 md:pb-32">
        <div className='absolute -top-20 -left-20 hidden md:block'>
          <Image
            src='/images/internal-affairs/syukuran-wisuda/slytherin.png'
            alt=''
            width={200}
            height={200}
            priority
            draggable='false'
            className='select-none'
          />
        </div>
        <div className='absolute -top-20 -right-20 hidden md:block'>
          <Image
            src='/images/internal-affairs/syukuran-wisuda/hufflepuff.png'
            alt=''
            width={200}
            height={200}
            priority
            draggable='false'
            className='select-none'
          />
        </div>
        <div className='absolute -bottom-20 -left-20 hidden md:block'>
          <Image
            src='/images/internal-affairs/syukuran-wisuda/ravenclaw.png'
            alt=''
            width={200}
            height={200}
            priority
            draggable='false'
            className='select-none'
          />
        </div>
        <div className='absolute -right-20 -bottom-20 hidden md:block'>
          <Image
            src='/images/internal-affairs/syukuran-wisuda/gryffindor.png'
            alt=''
            width={200}
            height={200}
            priority
            draggable='false'
            className='select-none'
          />
        </div>
        <h1 className='font-harry-potter text-[3.5rem] leading-[1.05] font-normal text-[#360000] sm:text-[4.3rem] md:text-[80px]'>
          Untaian Doa dan Harapan
        </h1>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {currentWishes.map((wish, index) => (
            <Box
              key={index}
              id={(page - 1) * itemsPerPage + index}
              wishes={wish.wishes}
              author={wish.author}
              onClick={() =>
                setSelectedWish({
                  ...wish,
                  id: (page - 1) * itemsPerPage + index,
                })
              }
            />
          ))}
        </div>
        {totalPages > 1 && (
          <Pagination className='mt-8 cursor-pointer justify-end'>
            <PaginationContent>
              <PaginationItem className='mr-6'>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.max(p - 1, 1));
                  }}
                >
                  <ChevronLeftIcon color='#01263C' />
                </PaginationLink>
              </PaginationItem>

              {paginationItems}

              <PaginationItem className='ml-6 cursor-pointer'>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((p) => Math.min(p + 1, totalPages));
                  }}
                >
                  <ChevronRightIcon color='#01263C' />
                </PaginationLink>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      {selectedWish && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'
          onClick={() => setSelectedWish(null)}
        >
          <div
            className='relative w-full max-w-3xl'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type='button'
              onClick={() => setSelectedWish(null)}
              className='absolute top-3 right-3 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60'
              aria-label='Tutup popup harapan'
            >
              <XIcon size={18} />
            </button>

            <Box
              id={selectedWish.id}
              wishes={selectedWish.wishes}
              author={selectedWish.author}
              truncateMessage={false}
              className='max-h-[80vh]'
            />
          </div>
        </div>
      )}
    </div>
  );
}
