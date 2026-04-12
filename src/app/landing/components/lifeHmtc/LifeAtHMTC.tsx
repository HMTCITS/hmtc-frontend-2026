'use client';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useEffect, useState } from 'react';

import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

const LifeAtHMTC: React.FC = () => {
  const [options, setOptions] = useState({
    slidesToScroll: 3,
    dragFree: false,
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setOptions({
      slidesToScroll: isMobile ? 1 : 3,
      dragFree: isMobile,
    });
  }, []);

  const [emblaRef] = useEmblaCarousel({
    loop: false,
    ...options,
  });

  const posts = [
    {
      image: '/lifeathmtc/life-1.png',
      link: 'https://www.instagram.com/p/C596sMVrDvM/?img_index=1',
    },
    {
      image: '/lifeathmtc/life-2.png',
      link: 'https://www.instagram.com/p/C6-V7L4R-ko/?img_index=1',
    },
    {
      image: '/lifeathmtc/life-3.png',
      link: 'https://www.instagram.com/p/C8ZRD8goAMg/?img_index=1',
    },
    {
      image: '/lifeathmtc/life-2.png',
      link: 'https://www.instagram.com/p/C6-V7L4R-ko/?img_index=1',
    },
  ];

  return (
    <section className='flex flex-col items-center justify-center bg-white p-4 pt-28 font-sans'>
      <div className='w-full max-w-[90%] text-center lg:max-w-[65%]'>
        <Typography
          as='h2'
          variant='h2'
          font='satoshi'
          weight='medium'
          className='text-gradient text-lg'
        >
          LIFE AT HMTC
        </Typography>
        <Typography
          as='h1'
          variant='j1'
          font='adelphe'
          weight='bold'
          className='mt-5 mb-5 text-3xl lg:text-5xl'
        >
          All The Things We Do
        </Typography>
        <Typography
          as='p'
          variant='b2'
          font='satoshi'
          weight='regular'
          className='mb-14 text-base text-gray-600'
        >
          Setiap kegiatan yang kami lakukan merupakan wujud nyata dari semangat
          kebersamaan dan dedikasi kami untuk menuju perubahan, mulai dari
          Banabung (Bagi Nasi Bungkus) yang membawa kepedulian sosial, Welcome
          Party HMTC 2026 yang mempererat solidaritas, hingga HMTC Incremental
          yang menjadi langkah strategis dalam membangun organisasi yang lebih
          progresif.
        </Typography>
      </div>
      <div className='w-full max-w-7xl md:px-12'>
        <div className='embla' ref={emblaRef}>
          <div className='embla__container gap-6 px-6'>
            {posts.map((post, index) => (
              <div className='embla__slide lifeAtHmtc' key={index}>
                <a
                  aria-label='Open post'
                  href={post.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex'
                >
                  <div className='relative flex h-[390px] w-[425px] md:h-[480px] lg:h-[530px]'>
                    <NextImage
                      src={post.image}
                      alt={`Post ${index + 1} Kehidupan Sehari hari anak TC`}
                      width={425}
                      height={530}
                      className='h-full w-full'
                      imgClassName='object-cover'
                    />
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LifeAtHMTC;
