'use client';

import * as React from 'react';

import ButtonLink from '@/components/links/ButtonLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function Cover() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id='home'
      className='relative h-screen overflow-hidden bg-black text-white'
    >
      <div className='h-full overflow-hidden'>
        <NextImage
          src='oprecBg.png'
          alt='Background Beranda HMTC 2025'
          className='z-0 h-screen min-h-[415px] w-full sm:min-h-[470px] lg:min-h-[768px] xl:min-h-[890px] 2xl:min-h-[768px]'
          imgClassName='h-full w-full object-cover object-center'
          width={1512}
          height={982}
          priority
        />
        <div className='absolute inset-0 z-10 h-full w-full bg-gradient-to-b from-white/5 via-black/20 to-black/80' />
      </div>

      <div className='justify-top absolute inset-0 z-20 flex items-center px-4'>
        <div
          className={`mx-auto w-full max-w-4xl pt-20 text-center transition-all duration-700 ease-out ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <Typography
            as='h1'
            font='libre'
            variant='j0'
            weight='bold'
            className='leading-tight text-white'
          >
            OPREC MAGANG
          </Typography>

          <Typography
            as='h2'
            font='libre'
            variant='k1'
            weight='bold'
            className='mt-3 text-white'
          >
            HMTC 2026
          </Typography>

          <div className='mt-8 flex items-center justify-center'>
            <ButtonLink
              href='/ayomeludaftarmagang'
              variant='unstyled'
              className='cursor-pointer rounded-md border border-white bg-transparent text-white transition hover:bg-white hover:text-black'
            >
              Gas Daftar!
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
