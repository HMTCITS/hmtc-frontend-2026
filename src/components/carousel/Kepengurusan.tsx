import 'swiper/css';

import { ChevronLeft, ChevronRight } from 'lucide-react';
// import required modules
import {
  Autoplay,
  Keyboard,
  Navigation,
  Pagination,
  Scrollbar,
} from 'swiper/modules';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

import AnggotaCard from '@/components/cards/AnggotaCard';
import { Anggota } from '@/constants/anggota';
import { cn } from '@/lib/utils';

export default function Kepengurusan() {
  return (
    <Swiper
      slidesPerView={1}
      centeredSlides={false}
      slidesPerGroupSkip={1}
      grabCursor={true}
      keyboard={{
        enabled: true,
      }}
      breakpoints={{
        800: {
          slidesPerView: 2,
          slidesPerGroup: 2,
        },
      }}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
      }}
      navigation={{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }}
      modules={[Autoplay, Keyboard, Scrollbar, Navigation, Pagination]}
    >
      <button
        aria-label='Backward'
        className='swiper-button-next !h-12 !w-12 rounded-full bg-white p-2.5 ring-2 ring-text-black hover:bg-gray-100'
      >
        <ChevronRight className='!text-xs text-text-black' />
      </button>
      <button
        aria-label='Forward'
        className='swiper-button-prev !h-12 !w-12 rounded-full bg-white p-2.5 ring-2 ring-text-black hover:bg-gray-100'
      >
        <ChevronLeft className='!text-xs text-text-black' />
      </button>
      {Anggota.map(({ ...props }, index) => (
        <SwiperSlide
          key={index}
          className={cn(
            index % 2 === 0 ? 'lg:pr-20' : 'lg:pl-20',
            index === Anggota.length - 1 && 'lg:pr-20 lg:pl-0',
            index === Anggota.length - 2 && 'lg:pr-0 lg:pl-20',
          )}
        >
          <AnggotaCard {...props} index={index} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
