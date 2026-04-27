'use client';
import Image from 'next/image';

export default function ProkerPage() {
  const scrollToGallery = () => {
    const gallerySection = document.getElementById('gallery-section');

    if (!gallerySection) return;

    gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      <div className='relative z-10 flex flex-col items-center justify-center gap-[28px] self-stretch bg-[#EFDFC4] px-6 pt-[100px] pb-0 md:px-16 lg:px-[254px]'>
        <Image
          src='/images/internal-affairs/syukuran-wisuda/proker-bg.png'
          alt=''
          fill
          priority
          className='-z-10 object-cover object-bottom select-none'
          draggable='false'
        />
        <div className='flex flex-col items-center gap-[28px] text-center'>
          <div className='flex items-center justify-start gap-3 bg-black/50 p-1'>
            <p className='justify-start font-plus-jakarta-sans text-lg font-light text-yellow-500'>
              HMTC Niat Baik
            </p>
            <p className='justify-start font-plus-jakarta-sans text-lg font-bold text-yellow-500'>
              /
            </p>
            <p className='justify-start font-plus-jakarta-sans text-lg font-bold text-yellow-500'>
              Internal Affairs
            </p>
          </div>
          <h1 className='font-harry-potter text-[3.75rem] leading-[1.05] font-normal tracking-[-1.5px] text-[#FDC100] [-webkit-text-stroke:1px_#7B4100] [text-shadow:0_4px_8px_rgba(254,194,0,0.50)] sm:text-[4.5rem] sm:tracking-[-3px] md:text-[clamp(3.5rem,25vw,128px)] md:tracking-[-6.4px]'>
            Syukuran Wisudawan ke-133
          </h1>
          <div className='flex items-center justify-center gap-2.5 bg-black/60 p-1'>
            <p className='text-center font-plus-jakarta-sans text-sm font-normal text-yellow-500 md:text-xl'>
              Selamat datang di malam perayaan kemenangan yang penuh keajaiban,
              di mana tongkat sihir diangkat tinggi untuk menghormati para
              wisudawan ke-133 yang telah berhasil menyelesaikan perjalanan
              panjang mereka di aula pengetahuan Teknik Informatika. Layaknya
              menembus kabut di Danau Hitam, kalian telah berhasil melewati
              berbagai rintangan kode dan mantra algoritma yang rumit hingga
              tiba di puncak menara keberhasilan ini. Malam ini, biarlah setiap
              memori yang terukir menjadi sekuat mantra Expecto Patronum,
              membawa cahaya kebanggaan bagi keluarga besar HMTC. Selamat
              menempuh petualangan baru di dunia luar yang lebih luas; ingatlah
              bahwa keajaiban sejati tidak hanya terletak pada sihir, melainkan
              pada niat baik dan ilmu yang kalian amalkan bagi sesama.
            </p>
          </div>
          <div className='flex flex-wrap items-center justify-center gap-2 bg-black/60 p-1 text-sm md:text-xl'>
            <p className='justify-start font-plus-jakarta-sans font-semibold text-yellow-500'>
              #SyukuranWisuda133
            </p>
            <p className='justify-start font-plus-jakarta-sans font-semibold text-yellow-500'>
              #IANiatBaik
            </p>
            <p className='justify-start font-plus-jakarta-sans font-semibold text-yellow-500'>
              #HMTCNiatBaik26
            </p>
            <p className='justify-start font-plus-jakarta-sans font-semibold text-yellow-500'>
              #ITSSurabaya
            </p>
          </div>
          <button
            type='button'
            onClick={scrollToGallery}
            className='inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-red-950 px-4 py-3 text-center font-plus-jakarta-sans text-base leading-4 font-semibold tracking-tight text-white capitalize outline-1 outline-offset-[-1px] outline-amber-800'
          >
            Lihat Gallery
          </button>
          <div className='relative z-10 mx-auto flex aspect-video w-full max-w-[984px] items-center justify-center'>
            <Image
              src='/images/internal-affairs/syukuran-wisuda/VideoFrame.png'
              alt=''
              fill
              priority
              className='-z-10 object-cover object-bottom select-none'
              draggable='false'
            />
            <iframe
              className='h-[80%] w-[80%] bg-transparent shadow-lg'
              src='https://www.youtube.com/embed/0OVwbbqpEwA'
              title='Video Syukuran Wisudawan ke-133 TC'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
