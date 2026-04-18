"use client";
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import Box from "@/app/internal-affairs/syukuran-wisudawan/components/Box";
import Typography from "@/components/Typography";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const wishes = [
  { author: "Dave", wishes: "Buat para wisudawan semoga sukses, mendapatkan jodoh dan pekerjaan yang layak" },
  { author: "Sarah", wishes: "Selamat menempuh hidup baru di dunia kerja, tetap semangat!" },
  { author: "Budi", wishes: "Semoga ilmu yang didapat bermanfaat bagi nusa dan bangsa." },
  { author: "Lestari", wishes: "Sukses selalu untuk langkah selanjutnya!" },
  { author: "Dave", wishes: "Buat para wisudawan semoga sukses, mendapatkan jodoh dan pekerjaan yang layak" },
  { author: "Sarah", wishes: "Selamat menempuh hidup baru di dunia kerja, tetap semangat!" },
  { author: "Budi", wishes: "Semoga ilmu yang didapat bermanfaat bagi nusa dan bangsa." },
  { author: "Lestari", wishes: "Sukses selalu untuk langkah selanjutnya!" },
  { author: "Dave", wishes: "Buat para wisudawan semoga sukses, mendapatkan jodoh dan pekerjaan yang layak" },
  { author: "Sarah", wishes: "Selamat menempuh hidup baru di dunia kerja, tetap semangat!" },
  { author: "Budi", wishes: "Semoga ilmu yang didapat bermanfaat bagi nusa dan bangsa." },
  { author: "Lestari", wishes: "Sukses selalu untuk langkah selanjutnya!" },
];

const ELLIPSIS = '…' as const;

export default function HarapanPage() {
  const itemsPerPage = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(wishes.length / itemsPerPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const currentWishes = useMemo(
    () => wishes.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [page],
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
    <div className="flex flex-col items-center justify-center self-stretch gap-[28px] p-8 sm:p-16 md:p-[10%] py-32 bg-[#EFDFC4] bg-[url('/images/internal-affairs/syukuran-wisuda/harapan-bg.png')] bg-repeat">
      <div className="w-full inline-flex flex-col gap-7 p-8 sm:p-16 md:p-24 pb-48 md:pb-32 relative z-10 bg-[url('/images/internal-affairs/syukuran-wisuda/blank-brown-paper-design.png')] bg-cover bg-repeat">
        <div className="absolute -top-20 -left-20 hidden md:block">
          <Image
            src="/images/internal-affairs/syukuran-wisuda/slytherin.png"
            alt=""
            width={200}
            height={200}
            priority
            draggable="false"
            className="select-none"
          />
        </div>
        <div className="absolute -top-20 -right-20 hidden md:block">
          <Image
            src="/images/internal-affairs/syukuran-wisuda/hufflepuff.png"
            alt=""
            width={200}
            height={200}
            priority
            draggable="false"
            className="select-none"
          />
        </div>
        <div className="absolute -bottom-20 -left-20 hidden md:block">
          <Image
            src="/images/internal-affairs/syukuran-wisuda/ravenclaw.png"
            alt=""
            width={200}
            height={200}
            priority
            draggable="false"
            className="select-none"
          />
        </div>
        <div className="absolute -bottom-20 -right-20 hidden md:block">
          <Image
            src="/images/internal-affairs/syukuran-wisuda/gryffindor.png"
            alt=""
            width={200}
            height={200}
            priority
            draggable="false"
            className="select-none"
          />
        </div>
        <h1 className="text-[#360000] font-harry-potter text-[80px] font-normal leading-normal">Untaian Doa dan Harapan</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentWishes.map((wish, index) => (
            <Box
              key={index}
              id={(page - 1) * itemsPerPage + index}
              wishes={wish.wishes}
              author={wish.author}
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
    </div>
  );
}