'use client';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useState } from 'react';

import NextImage from '@/components/NextImage';

const Carousel: React.FC = () => {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: false,
    slidesToScroll: 3, // Default (Desktop)
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
      image: '/lifeathmtc/life-1.png',
    },
    {
      image: '/lifeathmtc/life-2.png',
    },
    {
      image: '/lifeathmtc/life-3.png',
    },
    {
      image: '/lifeathmtc/life-2.png',
    },
    {
      image: '/lifeathmtc/life-1.png',
    },
    {
      image: '/lifeathmtc/life-2.png',
    },
    {
      image: '/lifeathmtc/life-3.png',
    },
    {
      image: '/lifeathmtc/life-2.png',
    },
  ];

  return (
    <div className='embla' ref={emblaRef}>
      <div className='embla__container flex select-none gap-8 cursor-grab'>
        {posts.map((post, index) => (
          <div className='embla__slide flex-none min-w-0' key={index}>
            <div
              className='flex'
            >
              <div className='relative flex'>
                <NextImage
                  src={post.image}
                  alt={`Post ${index + 1} Kehidupan Sehari hari anak TC`}
                  width={425}
                  height={530}
                  className='h-full w-full'
                  imgClassName='object-cover'
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-8 inline-flex flex-wrap justify-center items-center gap-2 bg-gray-950 rounded-full px-4'>
        <button
          aria-label='Backward'
          onClick={scrollPrev}
          className='px-1 py-2 text-xl text-gray-300 hover:text-yellow-300 cursor-pointer'
        >
          ←
        </button>
        {scrollSnaps.map((_, index) => (
          <button
            aria-label='Scroll to slide'
            key={index}
            className={`cursor-pointer mx-1 h-2 w-2 rounded-full ${index === selectedIndex ? 'bg-yellow-300' : 'bg-gray-300'
              }`}
            onClick={() => scrollTo(index)}
          />
        ))}
        <button
          aria-label='Forward'
          onClick={scrollNext}
          className='px-1 py-2 text-xl text-gray-300 hover:text-yellow-300 cursor-pointer'
        >
          →
        </button>
      </div>
      <div className='mt-2'>
      </div>
    </div>
  );
};

export default Carousel;
