import { useEffect, useState } from 'react';

import Lightbox from './Lightbox';

export type GalleryItem = {
  id: string;
  cat: 'pelaksanaan' | 'materi' | 'dinamika';
  height: string;
  tag: string;
  title: string;
  image?: string;
};

type GalleryFilter = 'all' | 'pelaksanaan' | 'materi' | 'dinamika';

const GALLERY_DATA: GalleryItem[] = [
  {
    id: '01',
    cat: 'pelaksanaan',
    height: 'h-[260px]',
    tag: 'Pelaksanaan Kegiatan',
    title: 'Pembukaan Bluecamp 2026',
  },
  {
    id: '02',
    cat: 'materi',
    height: 'h-[200px]',
    tag: 'Materi',
    title: 'Sesi Metodologi Penelitian',
  },
  {
    id: '03',
    cat: 'dinamika',
    height: 'h-[300px]',
    tag: 'Dinamika Peserta',
    title: 'Diskusi Kelompok Antarpeserta',
  },
  {
    id: '04',
    cat: 'pelaksanaan',
    height: 'h-[220px]',
    tag: 'Pelaksanaan Kegiatan',
    title: 'Registrasi & Pengarahan',
  },
  {
    id: '05',
    cat: 'materi',
    height: 'h-[280px]',
    tag: 'Materi',
    title: 'Workshop Pengembangan Ide',
  },
  {
    id: '06',
    cat: 'dinamika',
    height: 'h-[210px]',
    tag: 'Dinamika Peserta',
    title: 'Presentasi Proyek Peserta',
  },
  {
    id: '07',
    cat: 'pelaksanaan',
    height: 'h-[300px]',
    tag: 'Pelaksanaan Kegiatan',
    title: 'Kunjungan Laboratorium',
  },
  {
    id: '08',
    cat: 'materi',
    height: 'h-[240px]',
    tag: 'Materi',
    title: 'Talkshow Riset & Teknologi',
  },
  {
    id: '09',
    cat: 'dinamika',
    height: 'h-[260px]',
    tag: 'Dinamika Peserta',
    title: 'Mentoring Bersama Pemateri',
  },
  {
    id: '10',
    cat: 'pelaksanaan',
    height: 'h-[230px]',
    tag: 'Pelaksanaan Kegiatan',
    title: 'Penutupan & Apresiasi',
  },
  {
    id: '11',
    cat: 'materi',
    height: 'h-[200px]',
    tag: 'Materi',
    title: 'Sesi Literasi Akademik',
  },
  {
    id: '12',
    cat: 'dinamika',
    height: 'h-[290px]',
    tag: 'Dinamika Peserta',
    title: 'Eksplorasi Gagasan Tim',
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
    <section id='dokumentasi' className='bg-[#f3f7fc] py-[118px]'>
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

        <div className='columns-1 gap-[18px] [column-fill:balance] sm:columns-2 lg:columns-3'>
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLightbox(item)}
              className='group relative mb-[18px] cursor-pointer break-inside-avoid overflow-hidden rounded-[4px] border border-[#e4e9f0] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#073a76]/20'
            >
              <div
                className={`relative w-full ${item.height} flex items-center justify-center [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,0.5)_0_2px,transparent_2px_22px)] bg-repeat transition-all ${item.cat === 'materi' ? 'bg-gradient-to-br from-[#fff0d9] to-[#ffe2b3]' : item.cat === 'dinamika' ? 'bg-gradient-to-br from-[#dfeaf8] to-[#c3d8f0]' : 'bg-gradient-to-br from-[#eaf1fa] to-[#dce8f6]'}`}
              >
                <span className='absolute top-3 right-[14px] text-[1.1rem] font-extrabold tracking-wider text-[#073a76]/22'>
                  {item.id}
                </span>
                <span
                  className={`absolute top-3 left-3 rounded-[2px] px-[10px] py-[5px] text-[0.66rem] font-bold tracking-wider text-white uppercase backdrop-blur-[2px] ${item.cat === 'materi' ? 'bg-[#b56f00]/90' : 'bg-[#073a76]/86'}`}
                >
                  {item.tag}
                </span>
                <div
                  className={`opacity-40 ${item.cat === 'materi' ? 'text-[#b56f00]' : 'text-[#073a76]'}`}
                >
                  <svg
                    className='h-[42px] w-[42px]'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.6'
                  >
                    <path d='M3 11l18-8-8 18-2-7-8-3z'></path>
                  </svg>
                </div>
                <div className='absolute right-0 bottom-0 left-0 translate-y-2 bg-gradient-to-t from-[#071e3c]/78 to-transparent p-[14px_14px_12px] text-[0.84rem] font-semibold text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100'>
                  {item.title}
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
