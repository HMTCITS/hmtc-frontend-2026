import Image from 'next/image';
import { useEffect, useState } from 'react';

import Lightbox from './Lightbox';

export type GalleryItem = {
  cat: 'pelaksanaan' | 'materi' | 'dinamika';
  height: string;
  image: string;
};

type GalleryFilter = 'all' | 'pelaksanaan' | 'materi' | 'dinamika';

const GALLERY_DATA: GalleryItem[] = [
  {
    cat: 'materi',
    height: 'h-[244px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD203805.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[267px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD203810.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[298px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD203834.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[213px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD203871.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[292px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD203888.jpg',
  },
  {
    cat: 'materi',
    height: 'h-[219px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD203905.jpg',
  },
  {
    cat: 'materi',
    height: 'h-[242px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204171.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[208px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204197.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[235px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204224.jpg',
  },
  {
    cat: 'materi',
    height: 'h-[260px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204286.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[271px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204308.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[291px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204332.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[222px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204342.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[234px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204375.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[226px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204390.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[221px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204404.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[244px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204411.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[223px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204485.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[217px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204504.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[225px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204512.jpg',
  },
  {
    cat: 'materi',
    height: 'h-[277px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204534.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[266px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204552.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[214px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204617.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[225px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD204642.jpg',
  },
  {
    cat: 'dinamika',
    height: 'h-[295px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD205028.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[251px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD205035.jpg',
  },
  {
    cat: 'pelaksanaan',
    height: 'h-[273px]',
    image: '/images/research-and-technology/bluecamp/gallery/BD205039.jpg',
  },
];

const FILTER_OPTIONS: { id: GalleryFilter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'pelaksanaan', label: 'Pelaksanaan Kegiatan' },
  { id: 'materi', label: 'Materi' },
  { id: 'dinamika', label: 'Dinamika Peserta' },
];

export default function Gallery() {
  const [filter, setFilter] = useState<GalleryFilter>('all');
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(
    null,
  );

  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveLightbox(null);
      }
    };

    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const filteredGallery =
    filter === 'all'
      ? GALLERY_DATA
      : GALLERY_DATA.filter((item) => item.cat === filter);

  return (
    <section id='dokumentasi' className='bg-[#ffffff] py-[118px]'>
      <div className='mx-auto max-w-[1180px] px-6 md:px-8'>
        <div className='mb-[54px] max-w-[760px]'>
          <span className='inline-flex items-center gap-[0.6em] text-[0.72rem] font-bold tracking-[0.22em] text-[#1561BD] uppercase'>
            <svg
              className='h-2 w-[22px] text-[#E88E00]'
              viewBox='0 0 24 12'
              fill='currentColor'
            >
              <path d='M0 0l8 6-8 6zM8 0l8 6-8 6z'></path>
            </svg>
            Dokumentasi
          </span>
          <h2 className='mt-4 text-[clamp(2rem,4.2vw,3.3rem)] leading-none font-black tracking-tight text-[#14181f] uppercase'>
            Jejak <span className='text-[#E88E00]'>Kegiatan</span>
          </h2>
          <p className='mt-[18px] max-w-[640px] text-[1.08rem] text-[#3a424e]'>
            Rangkaian momen sepanjang Bluecamp 2026 — dikelompokkan menurut
            pelaksanaan kegiatan, materi yang dibawakan, dan dinamika peserta.
          </p>
        </div>

        <div className='mb-[38px] flex flex-wrap gap-[10px]'>
          {FILTER_OPTIONS.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`cursor-pointer rounded-[2px] border-[1.5px] px-[18px] py-2 text-[0.86rem] font-semibold tracking-wide transition-all duration-200 ${filter === btn.id ? 'border-[#1561BD] bg-[#1561BD] text-white' : 'border-[#e4e9f0] bg-white text-[#3a424e] hover:border-[#5D92D0] hover:text-[#0A4A98]'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className='grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 items-center'>
          {filteredGallery.map((item, index) => (
            <div
              key={index + 1}
              onClick={() => setActiveLightbox(item)}
              className=' group relative mb-[18px] cursor-pointer break-inside-avoid overflow-hidden rounded-[4px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#073a76]/20'
            >
              <div
                className={`relative w-full ${item.height} flex items-center justify-center [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.5)_0_2px,transparent_2px_22px)] bg-repeat transition-all ${item.cat === 'materi' ? 'bg-gradient-to-br from-[#fff0d9] to-[#ffe2b3]' : item.cat === 'dinamika' ? 'bg-gradient-to-br from-[#dfeaf8] to-[#c3d8f0]' : 'bg-gradient-to-br from-[#eaf1fa] to-[#dce8f6]'}`}
              >
                <span className='absolute top-3 z-10 right-[14px] text-[1.1rem] font-extrabold tracking-wider text-[#073a76]/22'>
                  {index + 1}
                </span>
                <span
                  className={`absolute top-3 left-3 z-10 rounded-[2px] px-[10px] py-[5px] text-[0.66rem] font-bold tracking-wider text-white uppercase ${item.cat === 'materi' ? 'bg-[#b56f00]/90' : 'bg-[#073a76]/86'}`}
                >
                  {item.cat === 'materi'
                    ? 'Materi'
                    : item.cat === 'dinamika'
                      ? 'Dinamika Peserta'
                      : 'Pelaksanaan Kegiatan'}
                </span>
                <div
                  className={`w-full h-full z-0 ${item.cat === 'materi' ? 'text-[#b56f00]' : 'text-[#073a76]'}`}
                >
                  <Image src={item.image} alt='Gambar Dokumentasi Bluecamp' fill className='object-cover' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeLightbox && (
        <Lightbox
          item={activeLightbox}
          onClose={() => setActiveLightbox(null)}
        />
      )}
    </section>
  );
}
