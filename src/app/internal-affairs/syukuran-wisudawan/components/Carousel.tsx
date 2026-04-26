'use client';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

const Carousel: React.FC = () => {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: false,
    slidesToScroll: 1, // Default (Desktop)
    breakpoints: {
      '(max-width: 767px)': { slidesToScroll: 1 } // Mobile override
    }
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
      image: '/images/internal-affairs/syukuran-wisuda/gallery/1776836660255.JPG',
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
      image: '/images/internal-affairs/syukuran-wisuda/gallery/1776836660917.JPG',
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
      <div className='flex gap-2 cursor-grab'>
        {posts.map((post, index) => (
          <div className='flex-[0_0_100%] h-[50vh] w-full md:flex-[0_0_90%] lg:flex-[0_0_60%] md:h-[50vh] flex justify-center content-center' key={index}>
            <div className='relative w-full h-full'>
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
      <div className='flex justify-center items-center'>
        <div className='mt-8 grid grid-cols-[auto_auto_auto] w-fit justify-center items-center gap-2 bg-gray-950 rounded-full px-4'>
          <button
            aria-label='Backward'
            onClick={scrollPrev}
            className='px-1 py-2 text-xl text-gray-300 hover:text-yellow-300 cursor-pointer'
          >
            ←
          </button>
          <div className='flex flex-wrap justify-center items-center'>
            {scrollSnaps.map((_, index) => (
              <button
                aria-label='Scroll to slide'
                key={index}
                className={`cursor-pointer mx-1 h-2 w-2 rounded-full ${index === selectedIndex ? 'bg-yellow-300' : 'bg-gray-300'
                  }`}
                onClick={() => scrollTo(index)}
              />
            ))}
          </div>
          <button
            aria-label='Forward'
            onClick={scrollNext}
            className='px-1 py-2 text-xl text-gray-300 hover:text-yellow-300 cursor-pointer'
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
