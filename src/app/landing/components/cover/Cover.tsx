'use client';

import { motion } from 'motion/react';

import NextImage from '@/components/NextImage';

const HEADLINE_LINES = ['MEMBAWA', 'PERUBAHAN', 'POSITIF &', 'PROGRESIF.'];

const STATS = [
  { value: '9', label: 'DEPARTEMEN' },
  { value: '100+', label: 'PENGURUS AKTIF' },
  { value: '2026', label: 'PERIODE' },
];

// Shared variant names propagated from root
const lineReveal = {
  hidden: { y: '108%' },
  visible: (i: number) => ({
    y: '0%',
    transition: {
      duration: 0.78,
      delay: 0.32 + i * 0.11,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const fadeSlideUp = (delay: number) => ({
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
});

const fadeOnly = (delay: number) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, delay },
  },
});

function DoveIcon({ className }: { className?: string }) {
  return (
    <NextImage
      src='logo-hmtc-2026.svg'
      alt='Logo HMTC 2026'
      width={40}
      height={40}
      isVector={true}
      className={className}
      imgClassName='h-full w-full'
    />
  );
}

export default function Cover({ heroReady }: { heroReady?: boolean }) {
  return (
    <div id='home' className='relative overflow-hidden bg-black text-white'>
      {/* Background */}
      <div className='absolute inset-0'>
        <NextImage
          src='bendera.png'
          alt='Background Beranda HMTC 2026'
          className='h-full w-full'
          imgClassName='h-full w-full object-cover object-center'
          width={1512}
          height={982}
          priority={true}
        />
        <div className='absolute inset-0 bg-black/72' />
      </div>

      {/* Root animation container — starts only after loading screen exits */}
      <motion.div
        className='relative z-10 flex min-h-svh flex-col'
        initial='hidden'
        animate={heroReady ? 'visible' : 'hidden'}
      >
        {/* ── Hero body ─────────────────────────────────────────────── */}
        <div className='relative flex flex-1 flex-col px-8 pt-10 pb-8 lg:px-14 lg:pt-14 xl:px-20'>
          <motion.div
            variants={fadeOnly(1.05)}
            className='absolute top-1/2 right-3.5 hidden -translate-y-1/2 rotate-90 lg:block'
          >
            <span className='font-plus-jakarta-sans text-[9px] tracking-[0.3em] whitespace-nowrap text-white/28 uppercase'>
              TEKNIK INFORMATIKA - ITS
            </span>
          </motion.div>

          {/* ── Giant headline ──────────────────────────────────────── */}
          <div className='mt-8 flex flex-1 flex-col justify-center lg:mt-6'>
            {HEADLINE_LINES.map((line, i) => (
              <div key={line} className='overflow-hidden'>
                <motion.h1
                  custom={i}
                  variants={lineReveal}
                  className='font-helveticaNeue text-[clamp(2.6rem,9.5vw,8.5rem)] leading-[0.9] font-thin tracking-[-0.01em] text-white'
                >
                  {line}
                </motion.h1>
              </div>
            ))}
          </div>

          {/* ── Bottom row ─────────────────────────────────────────── */}
          <div className='mt-10 flex items-end justify-between gap-6'>
            {/* Subtitle */}
            <motion.p
              variants={fadeSlideUp(0.92)}
              className='max-w-[340px] font-satoshi text-sm leading-relaxed text-white/60'
            >
              Kabinet mahasiswa yang berdedikasi membangun komunitas akademik
              yang berdaya, inklusif, dan berorientasi pada masa depan.
            </motion.p>

            {/* Branding mark */}
            <motion.div
              variants={fadeSlideUp(1.02)}
              className='hidden shrink-0 items-center gap-3 lg:flex'
            >
              <DoveIcon className='h-8 w-8' />
              <div>
                <p className='font-libre text-sm leading-tight font-semibold text-white italic'>
                  Kabinet Niat Baik
                </p>
                <p className='mt-0.5 font-satoshi text-[10px] tracking-[0.22em] text-white/40 uppercase'>
                  Periode 2026 — 27
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Stats bar ──────────────────────────────────────────────── */}
        <div className='grid grid-cols-2 border-t border-white/10 sm:grid-cols-4'>
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              variants={fadeSlideUp(1.1 + i * 0.07)}
              className='flex flex-col gap-1.5 border-r border-b border-white/10 px-8 py-6 last:border-r-0 sm:border-b-0'
            >
              <span className='font-helveticaNeue text-[2rem] leading-none font-thin text-white lg:text-[2.6rem]'>
                {value}
              </span>
              <span className='font-satoshi text-[10px] tracking-[0.22em] text-white/40 uppercase'>
                {label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
