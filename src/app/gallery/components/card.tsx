import { MoveRight } from 'lucide-react';
import Link from 'next/link';

import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import type { GalleryItem } from '@/types/gallery';

interface CardProps {
  item: GalleryItem;
}

export default function Card({ item }: CardProps) {
  return (
    <div className='group flex flex-col overflow-hidden rounded-xl border bg-gray-100 shadow-sm'>
      <div className='relative h-56 w-full overflow-hidden'>
        <NextImage
          src={item.image}
          alt={item.title}
          width={item.width}
          height={item.height}
          useSkeleton
          className='h-full w-full transition-transform duration-300 group-hover:scale-105'
          imgClassName='object-cover'
        />
        <NextImage
          src='/gallery/WavyCardGallery.svg'
          alt='Gelombang Card Gallery'
          isVector
          width={296}
          height={22}
          priority
          className='absolute bottom-0 left-1/2 w-[103%] -translate-x-1/2'
          imgClassName='w-full'
        />
      </div>

      <div className='flex h-35 flex-col justify-between bg-white p-3'>
        <div>
          <Typography variant='c0' font='adelphe'>
            {item.date}
          </Typography>
          <Typography
            variant='h3'
            font='satoshi'
            weight='bold'
            className='mt-1 line-clamp-2 overflow-hidden'
          >
            {item.title}
          </Typography>
        </div>

        {item.link && (
          <div className='mt-4 flex justify-end'>
            <Link
              href={item.link}
              className='flex items-center gap-2 border-b text-[#00AAE7] hover:text-[#0085b8]'
            >
              <Typography variant='b3' font='satoshi'>
                View More
              </Typography>
              <MoveRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
