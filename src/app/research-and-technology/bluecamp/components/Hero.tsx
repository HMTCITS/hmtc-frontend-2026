import Image from 'next/image';

const HERO_META = [
  { label: 'Program', value: 'Academic Exploration' },
  { label: 'Fokus', value: 'Riset & Teknologi' },
  { label: 'Penyelenggara', value: 'HMTC ITS' },
];

export default function Hero() {
  return (
    <section
      id='top'
      className='relative overflow-hidden bg-gradient-to-br from-[#1763c0] via-[#0d4ea0] to-[#073a76] pt-[190px] pb-[120px] text-white'
    >
      <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:64px_64px] opacity-50 [mask-image:radial-gradient(120%_90%_at_70%_0%,#000_30%,transparent_75%)]'></div>
      <div className='absolute top-[120px] right-[9%] h-24 w-24 rotate-[-36deg] bg-[#FFB23A] opacity-85 [clip-path:polygon(50%_0%,_0%_86.6%,_100%_86.6%)]'></div>
      <div className='absolute right-[22%] bottom-[70px] h-[62px] w-[62px] bg-[#5D92D0]/35 [clip-path:polygon(0_0,100%_0,0_100%)]'></div>
      <div className='absolute bottom-[130px] left-[-30px] h-[160px] w-[160px] bg-white/5 [clip-path:polygon(0_0,100%_100%,0_100%)]'></div>

      <div className='relative z-10 mx-auto max-w-[1180px] px-6 md:px-8'>
        <span className='inline-flex items-center gap-[0.6em] text-[0.72rem] font-bold tracking-[0.22em] text-[#cfe0f6] uppercase'>
          <span className='inline-flex gap-[3px]'>
            <svg
              className='h-4 w-4 animate-[chev_1.6s_infinite] text-[#FFB23A]'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='3'
            >
              <path d='M8 5l7 7-7 7'></path>
            </svg>
            <svg
              className='h-4 w-4 animate-[chev_1.6s_0.18s_infinite] text-[#FFB23A]'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='3'
            >
              <path d='M8 5l7 7-7 7'></path>
            </svg>
            <svg
              className='h-4 w-4 animate-[chev_1.6s_0.36s_infinite] text-[#FFB23A]'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='3'
            >
              <path d='M8 5l7 7-7 7'></path>
            </svg>
          </span>
          Dokumentasi · Eksplorasi Keilmiahan
        </span>
        <h1 className='mt-6 text-left leading-[0.95] font-black tracking-tight uppercase'>
          <Image
            src='/images/research-and-technology/bluecamp/logo-bluecamp-white.svg'
            alt='Logo Bluecamp 2026'
            width={800}
            height={320}
            priority
          />
          <span className='mt-[10px] block text-[clamp(2.6rem,7vw,5.4rem)] leading-none text-[#FFB23A]'>
            2026
          </span>
        </h1>
        <div className='my-8 h-[5px] w-[84px] bg-[#FFB23A]'></div>
        <p className='max-w-[560px] text-[clamp(1.05rem,1.7vw,1.32rem)] leading-relaxed font-normal text-[#dce8f8]'>
          Catatan perjalanan ide — dari rasa ingin tahu, ruang diskusi, hingga
          gagasan yang tumbuh menjadi proyek keilmiahan.
        </p>
        <div className='mt-[42px] flex flex-wrap gap-[14px_40px]'>
          {HERO_META.map((meta, idx) => (
            <div key={idx} className='flex flex-col gap-[2px]'>
              <span className='text-[0.68rem] font-bold tracking-[0.18em] text-[#9fc0ea] uppercase'>
                {meta.label}
              </span>
              <span className='text-[1.04rem] font-bold tracking-wide'>
                {meta.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className='absolute bottom-[26px] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.64rem] font-bold tracking-[0.24em] text-[#bcd3f0] uppercase'>
        <span>Gulir</span>
        <span className='h-[34px] w-[1px] animate-[cue_1.8s_cubic-bezier(.22,.61,.36,1)_infinite] bg-gradient-to-b from-[#bcd3f0] to-transparent'></span>
      </div>
    </section>
  );
}
