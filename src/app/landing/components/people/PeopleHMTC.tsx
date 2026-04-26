'use client';
import React, { useState } from 'react';

import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function PeopleHMTC() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    '/peoplehmtc/Kahima.png',
    '/peoplehmtc/CMI.png',
    '/peoplehmtc/EA.png',
    '/peoplehmtc/EDD.png',
    '/peoplehmtc/IA.png',
    '/peoplehmtc/SW.png',
    '/peoplehmtc/STI.png',
    '/peoplehmtc/SSD.png',
    '/peoplehmtc/psdm.png',
    '/peoplehmtc/Personalia.png',
    '/peoplehmtc/Keuangan.png',
    '/peoplehmtc/relation.png',
    '/peoplehmtc/rt.png',
    '/peoplehmtc/SCHEMATICS.png',
    '/peoplehmtc/Flexoo.png',
    '/peoplehmtc/DPA.png',
  ];

  const totalSlides = images.length;

  const scrollPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalSlides - 1 : prevIndex - 1,
    );
  };

  const scrollNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === totalSlides - 1 ? 0 : prevIndex + 1,
    );
  };

  return (
    <section className='flex flex-col items-center justify-center bg-white font-sans md:px-[8%] md:py-24'>
      <div className='flex w-full max-w-[95%] flex-col items-center pt-4 max-md:pt-12 lg:flex-row'>
        <div className='w-full px-6 lg:w-[60%] lg:px-0'>
          <Typography
            as='h1'
            variant='s1'
            font='satoshi'
            weight='medium'
            className='text-gradient text-lg'
          >
            HMTC 2026 NIAT BAIK
          </Typography>
          <Typography
            as='h2'
            variant='j2'
            font='adelphe'
            weight='bold'
            className='mt-3 text-3xl leading-tight lg:text-5xl lg:leading-[52.80px]'
          >
            The People Behind HMTC
          </Typography>
          <Typography
            as='p'
            variant='b2'
            font='satoshi'
            weight='regular'
            className='mt-6 text-justify text-base text-gray-600 lg:max-w-[75%]'
          >
            Di balik setiap langkah besar, ada individu-individu hebat yang
            bekerja dengan penuh dedikasi. Setiap anggota memiliki peran penting
            dalam mewujudkan visi transformasi HMTC dari merancang inovasi,
            membangun kolaborasi, hingga menciptakan lingkungan yang lebih
            dinamis dan berdampak.
          </Typography>
          <div className='mt-10 w-full space-y-4'>
            <div className='flex items-center'>
              <div>
                <NextImage
                  width={200}
                  height={200}
                  src='/icons/departement.svg'
                  alt='Departments Icon'
                  className='h-6 w-6'
                />
              </div>
              <div className='ml-4 h-auto w-full md:w-[438px]'>
                <Typography
                  as='p'
                  variant='b2'
                  font='satoshi'
                  weight='bold'
                  className='text-base text-gray-800'
                >
                  9 Departments
                </Typography>
                <Typography
                  as='p'
                  variant='b2'
                  font='satoshi'
                  weight='regular'
                  className='text-base text-gray-600'
                >
                  9 departemen HMTC yang saling berkolaborasi dalam menjalankan
                  berbagai terobosan program HMTC Niat Baik.
                </Typography>
              </div>
            </div>
            <div className='flex w-full items-center border-t border-gray-300 pt-4 lg:w-[438px]'>
              <div>
                <NextImage
                  width={200}
                  height={200}
                  src='/icons/people.svg'
                  alt='People Icon'
                  className='h-6 w-6'
                />
              </div>
              <div className='ml-4 h-auto w-full md:w-[438px]'>
                <Typography
                  as='p'
                  variant='b2'
                  font='satoshi'
                  weight='bold'
                  className='text-base text-gray-800'
                >
                  100+ People
                </Typography>
                <Typography
                  as='p'
                  variant='b2'
                  font='satoshi'
                  weight='regular'
                  className='text-base text-gray-600'
                >
                  Ratusan pengurus HMTC dengan semangat dan dedikasi tinggi
                  untuk terus membawa HMTC ke level yang lebih baik.
                </Typography>
              </div>
            </div>
            <div className='flex w-full items-center border-t border-gray-300 pt-4 lg:w-[438px]'>
              <div>
                <NextImage
                  width={200}
                  height={200}
                  src='/icons/book.svg'
                  alt='Proker Icon'
                  className='h-6 w-6'
                />
              </div>
              <div className='ml-4 w-full md:w-[438px]'>
                <Typography
                  as='p'
                  variant='b2'
                  font='satoshi'
                  weight='bold'
                  className='text-base text-gray-800'
                >
                  20+ Proker
                </Typography>
                <Typography
                  as='p'
                  variant='b2'
                  font='satoshi'
                  weight='regular'
                  className='text-base text-gray-600'
                >
                  Dengan lebih dari 20 program kerja unggulan, HMTC 2026
                  berfokus untuk memberikan kontribusi nyata bagi mahasiswa dan
                  KM ITS.
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <div className='relative mt-8 w-full px-4 lg:mt-0 lg:w-[40%] lg:px-0'>
          <div className='carousel'>
            {images.map((src, index) => (
              <div
                key={index}
                className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                <NextImage
                  width={200}
                  height={200}
                  src={src}
                  alt={`Profile image ${index + 1}`}
                  className='h-full w-full object-cover'
                  quality={75}
                />
              </div>
            ))}
          </div>
          <Typography
            as='p'
            variant='b2'
            font='satoshi'
            weight='regular'
            className='absolute -bottom-8 left-4 text-black lg:left-0'
          >
            {String(currentIndex + 1).padStart(2, '0')} /{' '}
            {String(totalSlides).padStart(2, '0')}
          </Typography>
          <div className='absolute right-4 -bottom-10 flex space-x-2 lg:right-0 lg:space-x-1'>
            <button
              aria-label='Backward'
              onClick={scrollPrev}
              className='px-1 py-2 text-xl text-gray-500 hover:text-black'
            >
              ←
            </button>
            <button
              aria-label='Forward'
              onClick={scrollNext}
              className='px-1 py-2 text-xl text-black hover:text-gray-500'
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
