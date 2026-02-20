import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

export default function About() {
  return (
    <div className='flex flex-col items-center justify-center bg-white px-12 pt-16 pb-8 sm:px-18 md:px-24 lg:px-20 lg:pt-24'>
      <div className='flex w-full flex-col items-center justify-center md:gap-8 lg:gap-14 xl:flex-row xl:gap-21'>
        <NextImage
          src='/fotbarhmtc2024.webp'
          alt='Foto bersama dengan HMTC 2024'
          width={550}
          height={400}
          className='w-full max-w-[615px] object-cover xl:max-w-[535px]'
          imgClassName='object-cover'
          quality={90}
          priority={false}
          useSkeleton
        />
        <div className='mt-8 max-w-[615px] text-left lg:mt-0'>
          <Typography
            as='h2'
            font='satoshi'
            variant='k2'
            weight='regular'
            className='text-2xl text-blue-600 max-xl:text-center sm:text-3xl xl:text-2xl'
          >
            About Us
          </Typography>
          <Typography
            as='h3'
            font='adelphe'
            variant='i2'
            weight='bold'
            className='mt-4 text-2xl max-xl:text-justify max-md:text-center sm:text-4xl md:text-5xl md:leading-[50px]'
          >
            Dedication to Excellence in Education and Technology
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='s1'
            weight='regular'
            className='mt-6 text-justify text-sm text-gray-700 sm:text-lg md:mt-8'
          >
            Organisasi ini bernama Himpunan Mahasiswa Teknik Computer —
            Informatika yang selanjutnya disebut HMTC.
          </Typography>
          <Typography
            as='p'
            font='satoshi'
            variant='s1'
            weight='regular'
            className='mt-4 text-justify text-sm text-gray-700 sm:text-lg'
          >
            Tujuan HMTC adalah tercapainya kesempurnaan pendidikan dalam rangka
            membentuk pribadi mahasiswa yang bertaqwa kepada Tuhan Yang Maha
            Esa, memiliki sikap kecendekiawanan, integritas, kepekaan sosial,
            serta mampu menguasai dan mengembangkan Ilmu Pengetahuan dan
            Teknologi Informatika dan Komputer.
          </Typography>
        </div>
      </div>
    </div>
  );
}
