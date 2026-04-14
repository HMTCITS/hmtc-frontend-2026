'use client';

import { EmblaOptionsType } from 'embla-carousel';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';
import React, { useEffect, useRef, useState } from 'react';

import KetuaCard from '../cards/KetuaCard';

type PropType = {
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = ({ options }) => {
  const slides = [0, 1, 2, 3, 4, 5, 6, 0, 1, 2, 3, 4, 5, 6];
  const autoScrollOptions = {
    playOnInit: true,
    delay: 4000,
    duration: 1000,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options, [
    AutoScroll(autoScrollOptions),
  ]);
  const [_isPlaying, setIsPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const autoScroll = emblaApi.plugins().autoScroll;
    if (!autoScroll) return;

    const handleMouseOver = () => {
      autoScroll.stop();
      setIsPlaying(false);
    };

    const handleMouseLeave = () => {
      autoScroll.play();
      setIsPlaying(true);
    };

    const container = carouselRef.current;
    if (container) {
      container.addEventListener('mouseover', handleMouseOver);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mouseover', handleMouseOver);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [emblaApi]);

  return (
    <div className='relative mb-[20px] flex w-full flex-col items-center gap-[10px] lg:mb-0'>
      <div className='z-10 w-full'>
        <div className='flex w-full flex-col items-start gap-8'>
          <h2 className='font-adelphe text-base text-[#FFFFFF] uppercase'>
            History of HMTC
          </h2>
          <h1 className='w-full font-adelphe text-4xl leading-[40px] font-bold text-[#FFFFFF] lg:text-5xl lg:leading-[53px]'>
            Get to Know The Chairman of HMTC
          </h1>

          <p className='text-justify font-satoshi text-base leading-[20px] text-[#FFFFFF] lg:text-lg lg:leading-[25px]'>
            Sejarah HMTC dibangun oleh para pemimpin visioner yang telah
            memberikan kontribusi besar dalam membentuk organisasi HMTC ini.
            Dengan dedikasi dan semangat kepemimpinan mereka, HMTC terus
            berkembang menjadi organisasi yang solid dan inovatif. Tiap periode
            kepemimpinan terus membawa perubahan, tantangan, serta pencapaian
            yang menjadi fondasi bagi generasi HMTC berikutnya, hingga kini,
            Agym Kamil Ramadhan, Ketua HMTC 2026 Niat Baik
            hadir untuk membawa transformasi HMTC kearah yang lebih baik.
          </p>
        </div>
      </div>

      <div
        className='relative mt-10 h-[272.67px] w-full overflow-hidden lg:mt-20'
        ref={carouselRef}
      >
        <div className='embla__viewport' ref={emblaRef}>
          <div className='flex justify-evenly gap-6 px-6'>
            {slides.map((id, index) => (
              <div
                className='embla__slide mx-3 h-[200px] w-[150px] flex-shrink-0 lg:h-[272.67px] lg:w-[194.5px]'
                key={index}
              >
                <KetuaCard imageIndex={id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmblaCarousel;
