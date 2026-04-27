'use client';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

const Carousel: React.FC = () => {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: false,
    align: 'center',
    slidesToScroll: 1,
    breakpoints: {
      '(max-width: 767px)': { slidesToScroll: 1 },
    },
  });

  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (embla) embla.scrollTo(index);
    },
    [embla],
  );

  const onSelect = useCallback(() => {
    if (!embla) return;
    setSelectedIndex(embla.selectedScrollSnap());
  }, [embla]);

  useEffect(() => {
    if (!embla) return;

    const onInitAndSelect = () => {
      setScrollSnaps(embla.scrollSnapList());
      setSelectedIndex(embla.selectedScrollSnap());
    };

    onInitAndSelect();
    embla.on('select', onSelect);
    embla.on('reInit', onInitAndSelect);

    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onInitAndSelect);
    };
  }, [embla, onSelect]);

  const scrollNext = useCallback(() => {
    if (embla) embla.scrollNext();
  }, [embla]);

  const scrollPrev = useCallback(() => {
    if (embla) embla.scrollPrev();
  }, [embla]);

  const posts = [
    {
      image:
        '/images/internal-affairs/syukuran-wisuda/gallery/1776836660255.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/DSC01298.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/DSC01299.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2687.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2707.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2758.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2760.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2823.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2832.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2858.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2877.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2903.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2913.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2931.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_2988.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_3000.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/IMG_3093.JPG',
    },
    {
      image:
        '/images/internal-affairs/syukuran-wisuda/gallery/1776836660917.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/DSC09591.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/DSC09592.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/DSC09596.JPG',
    },
    {
      image: '/images/internal-affairs/syukuran-wisuda/gallery/DSC09624.JPG',
    },
  ];

  return (
    <div className='embla select-none' ref={emblaRef}>
      <div className='flex cursor-grab gap-0.5 sm:gap-1'>
        {posts.map((post, index) => (
          <div
            className='flex h-[42vh] min-h-[240px] flex-[0_0_92%] content-center justify-center sm:flex-[0_0_48%] lg:flex-[0_0_32%]'
            key={index}
          >
            <div className='relative h-full w-full'>
              <Image
                src={post.image}
                alt={`Post ${index + 1} Foto Gallery Syukuran Wisuda ke-133 TC`}
                fill
                className='object-contain'
              />
            </div>
          </div>
        ))}
      </div>
      <div className='flex items-center justify-center'>
        <div className='mt-8 grid w-fit grid-cols-[auto_auto_auto] items-center justify-center gap-2 rounded-full bg-gray-950 px-4'>
          <button
            aria-label='Backward'
            onClick={scrollPrev}
            className='cursor-pointer px-1 py-2 text-xl text-gray-300 hover:text-yellow-300'
          >
            ←
          </button>
          <div className='flex flex-wrap items-center justify-center'>
            {scrollSnaps.map((_, index) => (
              <button
                aria-label='Scroll to slide'
                key={index}
                className={`mx-1 h-2 w-2 cursor-pointer rounded-full ${
                  index === selectedIndex ? 'bg-yellow-300' : 'bg-gray-300'
                }`}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
          <button
            aria-label='Forward'
            onClick={scrollNext}
            className='cursor-pointer px-1 py-2 text-xl text-gray-300 hover:text-yellow-300'
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
