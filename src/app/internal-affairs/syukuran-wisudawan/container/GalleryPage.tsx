'use client';
import Image from 'next/image';

import Carousel from '@/app/internal-affairs/syukuran-wisudawan/components/Carousel';

export default function GalleryPage() {
  return (
    <div
      id='gallery-section'
      className='relative z-10 inline-flex flex-col items-center justify-center gap-7 self-stretch overflow-hidden bg-[#EFDFC4]'
    >
      <div className='absolute top-0 left-0 hidden md:block'>
        <Image
          src='/images/internal-affairs/syukuran-wisuda/left curtain.png'
          alt=''
          width={256}
          height={459}
          priority
          draggable='false'
          className='select-none'
        />
      </div>
      <div className='absolute top-0 right-0 hidden md:block'>
        <Image
          src='/images/internal-affairs/syukuran-wisuda/right curtain.png'
          alt=''
          width={256}
          height={459}
          priority
          draggable='false'
          className='select-none'
        />
      </div>
      <div className='absolute top-0 left-0 -z-10 h-[100%] w-full select-none'>
        <Image
          src='/images/internal-affairs/syukuran-wisuda/gallery-bg.png'
          alt=''
          fill
          className='object-cover object-center select-none'
          priority
          draggable='false'
        />
      </div>
      <div className='absolute bottom-0 left-0 -z-10 h-[20%] w-full select-none'>
        <Image
          src='/images/internal-affairs/syukuran-wisuda/gallery-bg-bottom.png'
          alt=''
          fill
          className='object-cover object-bottom select-none'
          draggable='false'
        />
      </div>
      <div className='absolute bottom-0 left-0 hidden md:block'>
        <Image
          src='/images/internal-affairs/syukuran-wisuda/book.png'
          alt=''
          width={200}
          height={200}
          priority
          draggable='false'
          className='select-none'
        />
      </div>
      <div className='absolute right-0 bottom-0 hidden md:block'>
        <Image
          src='/images/internal-affairs/syukuran-wisuda/clock.png'
          alt=''
          width={200}
          height={200}
          priority
          draggable='false'
          className='select-none'
        />
      </div>
      <div className='mb-16 flex w-full flex-col justify-center gap-7 text-center md:p-32 max-md:mt-16'>
        <h1 className='font-harry-potter text-[3.4rem] leading-[1.05] font-normal text-[#FDC100] [-webkit-text-stroke:1px_#7B4100] [text-shadow:0_4px_8px_rgba(254,194,0,0.50)] sm:text-[4.1rem] md:text-[clamp(1.0rem,25vw,128px)]'>
          Precious Moments
        </h1>
        <Carousel />
      </div>
    </div>
  );
}
