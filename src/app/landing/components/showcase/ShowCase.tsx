import Quotes from '@/app/landing/components/cover/Quotes';
import VisiMisi from '@/app/landing/components/cover/VisiMisi';
import KetuaCarousel from '@/components/carousel/KetuaCarousel';
import NextImage from '@/components/NextImage';

export default function ShowCase() {
  return (
    <div className='relative bg-gray-100'>
      <NextImage
        src='/fotohmtc2026.png'
        alt='Foto HMTC 2026'
        className='relative h-screen w-full object-cover'
        style={{ objectFit: 'cover' }}
        width={1512}
        height={735}
      />
      <div className='flex w-full items-center justify-center bg-[#121212] px-12 py-18 sm:p-18 md:p-24'>
        <div className='flex w-full flex-col justify-between gap-x-6 gap-y-12 md:px-0 lg:flex-row lg:gap-x-27'>
          <div className='max-w-[335px]'>
            <VisiMisi
              text1='Vision'
              text2='Terwujudnya relevansi HMTC yang berdasar berdampak bagi mahasiswa Teknik Informatika ITS melalui pergerakan yang holistik dan esensial'
            />
          </div>

          <div className='max-w-[870px]'>
            <VisiMisi
              text1='Mission'
              text2={[
                'Menginisiasi pergerakan HMTC yang berdasar berdampak demi meningkatnya relevansi HMTC pada mahasiswa Teknik Informatika.',
                'Menguatkan peran HMTC sebagai advokat yang holistik guna menciptakan citra HMTC yang positif.',
                'Menciptakan landasan HMTC yang esensial demi terbentuknya HMTC yang berkelanjutan.',
              ]}
            />
          </div>
        </div>
      </div>
      <div className='flex w-full bg-[#121212] px-12 py-18 sm:p-18 md:p-24'>
        <Quotes />
      </div>
      <div className='relative flex w-full items-center bg-[#121212] px-12 py-18 sm:p-18 md:p-24 lg:px-[8%]'>
        <KetuaCarousel options={{ loop: true }} />
      </div>
    </div>
  );
}
