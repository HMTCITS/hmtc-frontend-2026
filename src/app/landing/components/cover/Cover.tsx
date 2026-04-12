import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function Cover() {
  return (
    <div id='home' className='relative overflow-hidden bg-black text-white'>
      <div className='h-full overflow-hidden'>
        <NextImage
          src='halamandepan.webp'
          alt='Background Beranda HMTC 2026'
          className='z-0 h-[calc(100vh-52px)] min-h-[415px] w-full sm:min-h-[470px] lg:min-h-[768px] xl:min-h-[890px] 2xl:min-h-[768px]'
          imgClassName='h-full w-full object-cover object-center'
          width={1512}
          height={982}
          priority={true}
        />
        <div className='absolute inset-0 z-10 h-full w-full bg-black opacity-75'></div>
      </div>

      <div className='absolute top-0 z-20 flex h-full w-full items-center justify-center'>
        <div className='m-10 w-full max-lg:flex max-lg:flex-col max-lg:justify-between lg:mx-16 lg:my-20'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <Typography
              as='h1'
              font='libre'
              variant='j2'
              weight='regular'
              className='opacity-60 sm:text-4xl md:mr-auto md:text-5xl lg:text-7xl'
            >
              Membawa Perubahan <br />
            </Typography>
          </div>
          <div className='flex flex-row justify-end py-12 md:py-16 lg:justify-end'>
            <Typography
              as='h1'
              font='libre'
              variant='j1'
              weight='bold'
              className='opacity-86 max-md:pr-6 sm:text-5xl md:text-6xl lg:text-8xl'
            >
              Bersama
            </Typography>
          </div>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between lg:mt-20'>
            <Typography
              as='h1'
              font='libre'
              variant='j0'
              weight='bold'
              className='text-5xl leading-tight italic sm:text-6xl md:text-7xl lg:text-8xl xl:text-8xl'
            >
              Niat Baik
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
}
