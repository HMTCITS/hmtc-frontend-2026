'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import Footer from '@/layouts/Footer';
import NavbarLanding from '@/layouts/NavbarLanding';

type GalleryItem = {
  title?: string;
  src?: string;
  alt?: string;
  height?: string;
};

type ContentData = {
  hero: {
    title: string;
    description: string;
  };
  hashtags: string[];
  about: {
    heading: string;
    content: string;
  };
  gallery: {
    images: GalleryItem[];
  };
  feedback: {
    title?: string;
    content: string;
    author?: string;
    role?: string;
  }[];
};

type TemplateProps = {
  content: ContentData;
};

export default function Template({ content }: TemplateProps) {
  const [activeLightbox, setActiveLightbox] = useState<GalleryItem | null>(
    null,
  );

  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveLightbox(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const galleryList: GalleryItem[] = content.gallery?.images || [];

  return (
    <>
      <NavbarLanding />
      <main className='bg-white font-plus-jakarta-sans text-[#14181f] selection:bg-[#1561BD] selection:text-white'>
        {/* ================= HERO SECTION ================= */}
        <section
          id='top'
          className='relative overflow-hidden bg-gradient-to-br from-[#eaf1fa] via-[#f3f7fc] to-[#ffffff] py-24 text-[#14181f]'
        >
          {/* Background Grid & Geometric Shapes */}
          <div className='absolute inset-0 bg-[linear-gradient(rgba(21,97,189,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(21,97,189,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-70 [mask-image:radial-gradient(120%_90%_at_70%_0%,#000_30%,transparent_75%)]'></div>
          <div className='absolute top-[120px] right-[9%] h-24 w-24 rotate-[-36deg] bg-[#FFB23A] opacity-80 [clip-path:polygon(50%_0%,_0%_86.6%,_100%_86.6%)]'></div>
          <div className='absolute right-[22%] bottom-[70px] h-[62px] w-[62px] bg-[#5D92D0]/25 [clip-path:polygon(0_0,100%_0,0_100%)]'></div>
          <div className='absolute bottom-[130px] left-[-30px] h-[160px] w-[160px] bg-[#1561BD]/5 [clip-path:polygon(0_0,100%_100%,0_100%)]'></div>

          <div className='relative z-10 mx-auto max-w-[1180px] px-6 md:px-8'>
            {/* Badge */}
            <span className='inline-flex items-center gap-[0.6em] text-[0.72rem] font-bold tracking-[0.22em] text-[#1561BD] uppercase'>
              <span className='inline-flex gap-[3px]'>
              </span>
                <svg
                  className='h-2 w-[22px] text-[#E88E00]'
                  viewBox='0 0 24 12'
                  fill='currentColor'
                >
                  <path d='M0 0l8 6-8 6zM8 0l8 6-8 6z'></path>
                </svg>
              <span className='text-[clamp(0.55rem,1.5vw,0.85rem)] font-bold tracking-[0.22em] uppercase'>
                Program Kerja
              </span>
            </span>

            {/* Heading */}
            <h1 className='mt-6 text-left text-[clamp(2.6rem,7vw,5.4rem)] leading-[0.95] font-black tracking-tight text-[#14181f] uppercase'>
              {content.hero.title}
            </h1>

            <div className='my-8 h-[5px] w-[84px] bg-[#FFB23A]'></div>

            <p className='max-w-[640px] text-[clamp(1.05rem,1.7vw,1.32rem)] leading-relaxed font-normal text-[#3a424e]'>
              {content.hero.description}
            </p>

            {/* Hashtags Grid */}
            {content.hashtags && content.hashtags.length > 0 && (
              <div className='mt-6 grid grid-cols-[repeat(4,max-content)] gap-2.5'>
                {content.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className='inline-block rounded-full bg-[#1561BD]/10 px-3.5 py-1 text-xs font-bold tracking-wider text-[#1561BD] transition-colors hover:bg-[#1561BD] hover:text-white'
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ================= ABOUT SECTION ================= */}
        <section id='tentang' className='bg-white py-[118px]'>
          <div className='mx-auto grid max-w-[1180px] grid-cols-1 items-start gap-16 px-6 md:px-8 lg:grid-cols-[0.9fr_1.1fr]'>
            <div className='lg:sticky lg:top-[120px]'>
              <span className='inline-flex items-center gap-[0.6em] text-[0.72rem] font-bold tracking-[0.22em] text-[#1561BD] uppercase'>
                <svg
                  className='h-2 w-[22px] text-[#E88E00]'
                  viewBox='0 0 24 12'
                  fill='currentColor'
                >
                  <path d='M0 0l8 6-8 6zM8 0l8 6-8 6z'></path>
                </svg>
                Tentang
              </span>
              <h2 className='mt-4 text-[clamp(1.9rem,3.4vw,2.7rem)] leading-[0.95] font-black tracking-tight text-[#14181f] uppercase'>
                {content.about.heading}
              </h2>
              <div className='my-6 h-[5px] w-[64px] bg-[#FFB23A]'></div>
            </div>

            {/* About Content with Drop-Cap */}
            <div className='text-[1.22rem] leading-[1.74] text-[#3a424e]'>
              <p className='text-justify text-wrap'>
                <span className='float-left pt-1 pr-4 text-[4.6rem] leading-[0.78] font-black text-[#1561BD]'>
                  {content.about.content.charAt(0)}
                </span>
                {content.about.content.slice(1)}
              </p>
            </div>
          </div>
        </section>

        {/* ================= GALLERY SECTION ================= */}
        <section id='gallery' className='bg-[#f3f7fc] py-[118px]'>
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
            </div>

            {/* Image Grid with Dynamic Heights */}
            <div className='grid grid-cols-1 items-center gap-[18px] sm:grid-cols-2 lg:grid-cols-3'>
              {galleryList.map((item, index) => (
                <div
                  key={index}
                  onClick={() => setActiveLightbox(item)}
                  className='group relative mb-[18px] cursor-pointer break-inside-avoid overflow-hidden rounded-[4px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#073a76]/20'
                >
                  <div
                    className={`relative w-full ${
                      item.height || 'h-[240px]'
                    } flex items-center justify-center border border-[#e5ecf6] bg-gradient-to-br from-white to-[#f7faff] bg-repeat`}
                  >
                    <span className='absolute top-3 right-[14px] z-10 text-[1.1rem] font-extrabold tracking-wider text-[#073a76]/22'>
                      {index + 1}
                    </span>

                    {item.src ? (
                      <Image
                        src={item.src}
                        alt={item.alt || 'Gallery Image'}
                        fill
                        className='object-cover'
                      />
                    ) : (
                      <div className='text-4xl font-bold text-[#1561BD]/40'>
                        ◈
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= FEEDBACK SECTION ================= */}
        <section id='feedback' className='bg-white py-[118px]'>
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
                Feedback
              </span>
              <h2 className='mt-4 text-[clamp(2rem,4.2vw,3.3rem)] leading-none font-black tracking-tight text-[#14181f] uppercase'>
                Suara <span className='text-[#E88E00]'>Peserta</span>
              </h2>
            </div>

            {/* Feedback Masonry Columns */}
            <div className='columns-1 gap-[22px] [column-fill:balance] sm:columns-2 lg:columns-3'>
              {content.feedback.map((fb: any, idx: number) => (
                <div
                  key={fb.id || idx}
                  className='group relative mb-[22px] break-inside-avoid rounded-[6px] border border-[#e4e9f0] bg-[#f3f7fc] p-[26px_26px_24px] shadow-md shadow-[#073a76]/5'
                >
                  <div className='mb-3.5 flex items-start justify-between gap-4'>
                    <h3 className='text-[1.1rem] leading-snug font-bold text-[#14181f]'>
                      {fb.title || ''}
                    </h3>
                    <svg
                      className='h-8 w-8 flex-shrink-0 text-[#eaf1fa] transition-colors duration-300 group-hover:text-[#5D92D0]/30'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M7 7H3v7h4l-2 4h3l2-4V7H7zm11 0h-4v7h4l-2 4h3l2-4V7h-3z'></path>
                    </svg>
                  </div>
                  <p className='m-0 mb-[22px] text-[1.0rem] leading-[1.66] text-[#3a424e]'>
                    {fb.content}
                  </p>
                  <div className='flex items-center gap-3.5'>
                    <span
                      className='grid h-[42px] w-[42px] flex-shrink-0 place-items-center rounded-full text-[0.98rem] font-black text-white'
                      style={{ backgroundColor: fb.color || '#1561BD' }}
                    >
                      {(fb.author || 'P').charAt(0)}
                    </span>
                    <div>
                      <span className='block text-[0.95rem] leading-tight font-bold text-[#14181f]'>
                        {fb.author || 'Peserta'}
                      </span>
                      <span className='mt-0.5 block text-[0.8rem] text-[#6b7585]'>
                        {fb.role || ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= LIGHTBOX MODAL ================= */}
        {activeLightbox && (
          <div
            className='fixed inset-0 z-[100] flex items-center justify-center bg-[#061a34]/80 p-6 backdrop-blur-sm'
            onClick={() => setActiveLightbox(null)}
          >
            <div
              className='w-full max-w-[760px]'
              onClick={(e) => e.stopPropagation()}
            >
              <div className='relative grid aspect-[4/3] place-items-center overflow-hidden rounded-md bg-gradient-to-br from-[#eaf1fa] to-[#cadbf1]'>
                {activeLightbox.src ? (
                  <Image
                    src={activeLightbox.src}
                    alt='Lightbox'
                    fill
                    className='object-cover'
                  />
                ) : (
                  <div className='text-6xl text-[#0A4A98]/40'>◈</div>
                )}
              </div>
              <div className='mt-4 flex items-center justify-between text-white'>
                <span className='text-xs font-bold tracking-widest text-[#FFB23A] uppercase'>
                  {'Dokumentasi'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveLightbox(null)}
              className='absolute top-6 right-8 flex cursor-pointer items-center gap-2 font-bold tracking-widest text-white hover:text-[#FFB23A]'
            >
              <X size={20} />
              Tutup
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
