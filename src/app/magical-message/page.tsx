'use client';

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Button from '@/components/buttons/Button';
import ColorBends from '@/components/ColorBends';
import Input from '@/components/forms/Input';

import Footer from './components/footer';

type MagicalMessageFormValues = {
  doaHarapan: string;
  namaPenulis: string;
};

export default function Page() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<MagicalMessageFormValues>({
    defaultValues: {
      doaHarapan: '',
      namaPenulis: '',
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: MagicalMessageFormValues) => {
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/magical-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          submittedAt: new Date().toISOString(),
        }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || 'Gagal mengirim pesan. Silakan coba lagi.',
        );
      }

      reset();
      setIsSubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pesan. Silakan coba lagi.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='relative min-h-screen overflow-hidden bg-black'>
      <div className='pointer-events-none absolute inset-0'>
        <ColorBends
          className=''
          style={{}}
          rotation={45}
          speed={0.2}
          colors={['#800040', '#8000ff', '#400000'] as any}
          transparent
          autoRotate={0}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
        />
      </div>

      <section className='relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6'>
        {isSubmitted ? (
          <article className='w-full max-w-[717px] rounded-[10px] border border-[#322145] bg-black/60 p-5 backdrop-blur-[60px] sm:p-6 md:p-[52px]'>
            <p className='font-plus-jakarta-sans text-base leading-[1.1] font-extrabold text-[#0078B4] sm:text-[20px]'>
              SW 133
            </p>

            <div className='mt-4 space-y-2 sm:mt-6'>
              <h1 className='flex flex-wrap items-center gap-x-2 gap-y-1 text-left text-[30px] leading-[1.05] sm:text-[38px] md:text-[48px]'>
                <span className='font-libre-baskerville font-semibold text-white'>
                  Terima
                </span>
                <span className='bg-gradient-to-r from-[#0078B4] to-[#811FEE] bg-clip-text font-libre-baskerville font-bold text-transparent'>
                  Kasih!
                </span>
              </h1>
              <p className='font-plus-jakarta-sans text-[15px] leading-[1.2] text-[#B2B2B2] sm:text-[18px] sm:leading-[1.1]'>
                Pesanmu telah dibawa oleh burung hantu tercepat menuju meja
                perjamuan wisudawan. Semoga setiap harapanmu menjadi mantra
                pelindung bagi perjalanan mereka di dunia nyata.
              </p>
            </div>

            <div className='mt-6 sm:mt-8'>
              <Button
                type='button'
                className='h-11 w-full rounded-[8px] bg-[#0078B4] py-2 text-white hover:bg-[#006A9E] sm:h-[50px] sm:py-3'
                textClassName='font-plus-jakarta-sans text-sm font-bold tracking-[0.02em] text-white sm:text-base'
                onClick={() => (window.location.href = '/')}
              >
                Kembali ke Beranda
              </Button>
            </div>
          </article>
        ) : (
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='w-full max-w-[717px] rounded-[10px] border border-[#322145] bg-black/60 p-5 backdrop-blur-[60px] sm:p-6 md:p-[52px]'
            >
              <Button
                variant='unstyled'
                leftIcon={ArrowLeft}
                className='p-0 pb-5 font-plus-jakarta-sans text-white/80 sm:pb-6'
                onClick={() => (window.location.href = '/')}
                aria-label='back'
              >
                Kembali ke Beranda
              </Button>
              <p className='font-plus-jakarta-sans text-base leading-[1.1] font-extrabold text-[#0078B4] sm:text-[20px]'>
                SW 133
              </p>

              <div className='mt-4 space-y-2 sm:mt-6'>
                <h1 className='text-left font-libre-baskerville text-[30px] leading-[1.05] font-semibold text-white sm:text-[38px] md:text-[48px]'>
                  <span className='block'>Send a</span>
                  <span className='block bg-gradient-to-r from-[#0078B4] to-[#811FEE] bg-clip-text pb-2 text-transparent'>
                    Magical Message
                  </span>
                </h1>
                <p className='max-w-[522px] font-plus-jakarta-sans text-[15px] leading-[1.2] text-[#B2B2B2] sm:text-[18px] sm:leading-[1.1]'>
                  Sematkan doa dan pesan cinta untuk merayakan langkah baru di
                  Wisuda 133.
                </p>
              </div>

              <div className='mt-6 space-y-3 sm:mt-8 sm:space-y-[14px]'>
                <Input
                  id='doaHarapan'
                  label='Doa dan Harapan'
                  placeholder='Semoga selalu bahagia dan lancar...'
                  validation={{ required: 'Doa dan Harapan wajib diisi' }}
                  containerClassName='space-y-2 sm:space-y-3'
                  labelClassName='font-plus-jakarta-sans text-sm font-semibold leading-[1.4] text-white sm:text-base'
                  inputClassName='h-10 rounded-[8px] border-[#6B6B6B] bg-transparent px-4 font-plus-jakarta-sans text-sm text-white/90 placeholder:text-[rgba(87,87,87,0.78)] focus:border-[#B2B2B2] focus:ring-[#322145]/40 sm:h-[43px] sm:px-6 sm:text-base'
                />

                <Input
                  id='namaPenulis'
                  label='Nama Pengirim'
                  placeholder='cth: Suaminya Paula'
                  validation={{ required: 'Nama Pengirim wajib diisi' }}
                  containerClassName='space-y-2 sm:space-y-3'
                  labelClassName='font-plus-jakarta-sans text-sm font-semibold leading-[1.4] text-white sm:text-base'
                  inputClassName='h-10 rounded-[8px] border-[#6B6B6B] bg-transparent px-4 font-plus-jakarta-sans text-sm text-white/90 placeholder:text-[rgba(87,87,87,0.78)] focus:border-[#B2B2B2] focus:ring-[#322145]/40 sm:h-[43px] sm:px-6 sm:text-base'
                />
              </div>

              <div className='mt-6 sm:mt-8'>
                <Button
                  type='submit'
                  className='h-11 w-full rounded-[8px] bg-[#0078B4] py-2 text-white hover:bg-[#006A9E] sm:h-[50px] sm:py-3'
                  textClassName='font-plus-jakarta-sans text-sm font-bold tracking-[0.02em] text-white sm:text-base'
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </Button>
                {submitError && (
                  <p className='mt-3 font-plus-jakarta-sans text-sm text-red-300'>
                    {submitError}
                  </p>
                )}
              </div>
            </form>
          </FormProvider>
        )}
      </section>

      <Footer />
    </main>
  );
}
