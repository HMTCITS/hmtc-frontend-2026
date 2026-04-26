'use client';
import React from 'react';

import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

const Quotes: React.FC = () => {
  return (
    <div className='relative z-10 flex w-full flex-col-reverse items-center justify-between gap-5 lg:flex-row lg:gap-[90px]'>
      <div className='flex w-full flex-col items-start gap-3 md:gap-5 lg:w-[480px] lg:gap-[60px]'>
        <div className='mb-[20px] flex w-full items-center justify-center lg:mb-0 lg:w-[380px] xl:w-[480px]'>
          <Typography
            as='p'
            variant='b2'
            font='satoshi'
            className='text-xs leading-5 text-white italic sm:text-base md:text-base md:leading-7 lg:text-2xl lg:leading-8.5'
          >
            &quot;HMTC pada awalnya bertujuan menjadi wadah aspirasi dan
            kreativitas mahasiswa TC baik dalam akademis maupun non
            akademis&quot;
          </Typography>
        </div>

        <div className='flex w-full flex-row items-center gap-3 md:gap-4 lg:mb-0'>
          <NextImage
            src='Quotes/fotoQuotes.png'
            alt='Quote Image'
            className='relative h-8 w-8 overflow-hidden rounded-full bg-[#784747] object-cover md:h-14 md:w-14'
            width={56}
            height={56}
          />
          <div className='flex w-[165px] flex-col items-start gap-0.5'>
            <Typography
              as='p'
              variant='b2'
              font='libre'
              weight='bold'
              className='text-xs leading-4.5 text-white italic md:text-base md:leading-5.5 lg:text-xl lg:leading-[28px]'
            >
              - Tri Saksono Adi
            </Typography>
            <Typography
              as='p'
              variant='b2'
              font='helveticaNeue'
              weight='regular'
              className='text-xs leading-4 font-[100] text-white opacity-68 md:text-base md:leading-[20px] lg:text-base lg:leading-[22px]'
            >
              Ketua HMTC Pertama
            </Typography>
          </div>
        </div>
      </div>

      <div className='relative flex w-full flex-col items-center justify-center lg:w-[646px]'>
        <div className='flex w-full flex-row items-center justify-between px-0'>
          <Typography
            as='p'
            variant='b2'
            font='satoshi'
            weight='regular'
            className='text-xs text-white lg:text-sm'
          >
            HMTC INCREMENTAL
          </Typography>

          <div className='flex flex-row items-center'>
            <div className='h-[1px] w-[80px] border border-white md:w-[120px]'></div>
            {/* <Typography
              as='p'
              variant='b2'
              font='satoshi'
              weight='regular'
              className='ml-2 text-sm text-white lg:text-sm'
            >
              29 06 2026
            </Typography> */}
          </div>
        </div>
        <NextImage
          src='/Quotes/incremental2026.png'
          alt='Quotes Background'
          className='h-full w-full rounded-none'
          imgClassName='object-cover'
          width={646}
          height={311}
        />
      </div>
    </div>
  );
};

export default Quotes;
