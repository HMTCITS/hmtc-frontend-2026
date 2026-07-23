'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import Styles from '@/app/student-social-development/tcharity-run/styles.module.css';
import Footer from '@/layouts/Footer';

import RibbonWaveBackground from './components/ribbon-wave-bg';

interface FormData {
  namaLengkap: string;
  email: string;
  whatsapp: string;
  angkatan: string;
  buktiPembayaran?: File | null;
}

export default function TCharityRunPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    namaLengkap: '',
    email: '',
    whatsapp: '',
    angkatan: '',
    buktiPembayaran: null,
  });

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStepChange = (step: 1 | 2 | 3 | 4) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (JPG/PNG only)
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Format file tidak didukung. Harap upload file JPG atau PNG.');
      return;
    }

    // Validate file size (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal ukuran file adalah 2MB.');
      return;
    }

    setFormData((prev) => ({ ...prev, buktiPembayaran: file }));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='flex min-h-screen flex-col justify-between bg-gray-50 font-sans text-[#0A1931] antialiased'>
      {/* NAVBAR */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          !isScrolled && currentStep == 1
            ? 'bg-transparent'
            : 'bg-gray-50 shadow-sm'
        }`}
      >
        <div className='mx-auto flex h-20 max-w-5xl items-center justify-between px-4'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => handleStepChange(1)}
              className='cursor-pointer text-2xl font-bold tracking-tight text-[#000D3A]'
            >
              TCharity Run 2026
            </button>
          </div>
          <nav className='hidden items-center space-x-8 text-sm font-medium text-gray-500 md:flex'>
            <button
              onClick={() => handleStepChange(1)}
              className={`cursor-pointer border-b-2 pb-1 transition-all ${currentStep === 1 ? 'border-[#000D3A] font-semibold text-[#000D3A]' : 'border-transparent hover:text-gray-800'}`}
            >
              Event Info
            </button>
            <button
              onClick={() => handleStepChange(2)}
              className={`cursor-pointer border-b-2 pb-1 transition-all ${currentStep === 2 ? 'border-[#000D3A] font-semibold text-[#000D3A]' : 'border-transparent hover:text-gray-800'}`}
            >
              Registration
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className='flex w-full flex-grow flex-col items-center'>
        {/* STEP 1: EVENT INFO & ROUTE MAP */}
        {currentStep === 1 && (
          <div className={`${Styles.animateFadeIn} w-full space-y-8`}>
            {/* Hero Banner with Ribbon Wave Background */}
            <section className='relative -mt-20 mb-16 flex min-h-[95vh] w-full items-center overflow-hidden bg-gray-50'>
              {/* Decorative Background */}
              <div
                className='pointer-events-none absolute inset-0 z-0 h-full w-full'
                aria-hidden='true'
              >
                <RibbonWaveBackground className='block h-full w-full' />
              </div>

              {/* Hero Content Layer */}
              <div className='relative z-10 mx-auto mt-auto max-w-5xl px-4 text-[#000D3A] sm:px-6 lg:px-8'>
                <h1 className='mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl'>
                  TCharity Run 2026
                </h1>
                <p className='text-sm leading-relaxed text-gray-700 sm:text-base'>
                  TCharity Run merupakan event lari yang diselenggarakan oleh
                  HMTC ITS sebagai bentuk ajakan kepada mahasiswa aktif dan
                  alumni Teknik Informatika ITS untuk menerapkan gaya hidup
                  sehat sekaligus berkontribusi dalam kegiatan sosial.
                  Pendapatan yang diperoleh dari acara ini akan didonasikan
                  kepada pihak yang membutuhkan. TCharity Run akan
                  diselenggarakan pada 12 September 2026, dengan rangkaian acara
                  yang meliputi main event berupa kegiatan lari, serta
                  pasca-event yang diisi dengan sesi Q&amp;A, photo booth, dan
                  pembagian doorprize.
                </p>
              </div>
            </section>
            {/* Content Container */}
            <div className='mx-auto w-full max-w-5xl space-y-8 px-4'>
              {/* Details & Facilities Section */}
              <div className='grid gap-8 rounded-3xl bg-gray-50 p-8 md:grid-cols-3 md:p-10'>
                {/* Detail Pelaksanaan */}
                <div>
                  <div className='mb-6 flex items-center space-x-3'>
                    <div className='rounded-xl bg-blue-50 p-2 text-[#000D3A]'>
                      <Image
                        src='/images/student-social-development/tcharity-run/calendar-icon.svg'
                        alt='Calendar Icon'
                        width={24}
                        height={24}
                        className='h-4 w-4'
                      />
                    </div>
                    <h3 className='text-xl font-bold text-[#000D3A]'>
                      Detail Pelaksanaan
                    </h3>
                  </div>
                  <div className='ml-5 space-y-4 border-l-2 border-gray-100 pl-4'>
                    <div>
                      <span className='block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                        Hari / Tanggal
                      </span>
                      <span className='text-base font-semibold text-gray-800'>
                        Sabtu, 12 September 2026
                      </span>
                    </div>
                    <div>
                      <span className='block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                        Lokasi
                      </span>
                      <span className='text-base font-semibold text-gray-800'>
                        ITS
                      </span>
                    </div>
                    <div>
                      <span className='block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                        Kategori
                      </span>
                      <span className='text-base font-semibold text-gray-800'>
                        5K Fun Run
                      </span>
                    </div>
                    <div>
                      <span className='block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                        Last Register
                      </span>
                      <span className='text-base font-semibold text-gray-800'>
                        5 September 2026
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fasilitas Peserta */}
                <div>
                  <div className='mb-6 flex items-center space-x-3'>
                    <div className='rounded-xl bg-blue-50 p-2 text-[#000D3A]'>
                      <Image
                        src='/images/student-social-development/tcharity-run/facility-icon.svg'
                        alt='Calendar Icon'
                        width={24}
                        height={24}
                        className='h-4 w-4'
                      />
                    </div>
                    <h3 className='text-xl font-bold text-[#000D3A]'>
                      Fasilitas Peserta
                    </h3>
                  </div>
                  <ul className='ml-5 space-y-4 border-l-2 border-gray-100 pl-4'>
                    <li className='flex items-center space-x-3 text-sm font-medium text-gray-700'>
                      <span className='text-indigo-600'>🏅</span>{' '}
                      <span>Finisher Medal</span>
                    </li>
                    <li className='flex items-center space-x-3 text-sm font-medium text-gray-700'>
                      <span className='text-indigo-600'>🔢</span>{' '}
                      <span>Nomor Dada (BIB)</span>
                    </li>
                    <li className='flex items-center space-x-3 text-sm font-medium text-gray-700'>
                      <span className='text-indigo-600'>💧</span>{' '}
                      <span>Water Station & Refreshment</span>
                    </li>
                    <li className='flex items-center space-x-3 text-sm font-medium text-gray-700'>
                      <span className='text-indigo-600'>📄</span>{' '}
                      <span>E-Certificate</span>
                    </li>
                    <li className='flex items-center space-x-3 text-sm font-medium text-gray-700'>
                      <span className='text-indigo-600'>🎁</span>{' '}
                      <span>Doorprize</span>
                    </li>
                    <li className='flex items-center space-x-3 text-sm font-medium text-gray-700'>
                      <span className='text-indigo-600'>📸</span>{' '}
                      <span>Photobooth</span>
                    </li>
                    <li className='flex items-center space-x-3 text-sm font-medium text-gray-700'>
                      <span className='text-indigo-600'>🕹️</span>{' '}
                      <span>Games</span>
                    </li>
                  </ul>
                </div>
                {/* Contact Person */}
                <div>
                  <div className='mb-6 flex items-center space-x-3'>
                    <div className='rounded-xl bg-blue-50 p-0.5 text-[#000D3A]'>
                      <Image
                        src='/images/student-social-development/tcharity-run/call-icon.svg'
                        alt='Call Icon'
                        width={34}
                        height={34}
                        className='h-7 w-7'
                      />
                    </div>
                    <h3 className='text-xl font-bold text-[#000D3A]'>
                      Contact Person
                    </h3>
                  </div>
                  <div className='ml-5 space-y-4 border-l-2 border-gray-100 pl-4'>
                    <div>
                      <span className='block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                        Berwyn
                      </span>
                      <span className='text-base font-semibold text-gray-800'>
                        082217664468
                      </span>
                    </div>
                    <div>
                      <span className='block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                        Naufa
                      </span>
                      <span className='text-base font-semibold text-gray-800'>
                        081359976398
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & CTA Action Bar */}
              <div className='flex flex-col items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-gray-50 p-6 shadow-sm sm:flex-row md:p-8'>
                <div>
                  <span className='block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                    Harga Pendaftaran
                  </span>
                  <span className='text-3xl font-extrabold text-[#000D3A]'>
                    Rp20.000
                  </span>
                </div>
                <button
                  onClick={() => handleStepChange(2)}
                  className='w-full cursor-pointer rounded-2xl bg-[#000D3A] px-10 py-4 text-center font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#100D3A]/80 sm:w-auto'
                >
                  Pesan Sekarang
                </button>
              </div>

              {/* Route Map Section */}
              <div className='space-y-6 rounded-3xl bg-gray-50 p-8'>
                <div className='flex items-center space-x-3'>
                  <div className='rounded-xl bg-blue-50 p-2 text-[#000D3A]'>
                    <svg
                      className='h-6 w-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'
                      />
                    </svg>
                  </div>
                  <h3 className='text-xl font-bold text-[#000D3A]'>
                    Rute Lari
                  </h3>
                </div>

                <a
                  href='https://earth.google.com/earth/d/1YT9YBZXCclaXY_h_5sAjz05LTSmZbjh4'
                  className='group relative mx-auto flex aspect-[11/13] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-4 border-gray-200 bg-gray-100 p-2 transition-all hover:border-blue-200 md:max-w-[50%]'
                >
                  <Image
                    src='/images/student-social-development/tcharity-run/Rute Lari.png'
                    alt='Rute lari'
                    width={220}
                    height={390}
                    priority
                    draggable='false'
                    className='aspect-[11/13] h-full w-full rounded-2xl border-4 border-gray-200 object-cover select-none'
                  />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REGISTRATION FORM */}
        {currentStep === 2 && (
          <div className='max-w-55xl mx-auto w-full px-4 py-8'>
            <div
              className={`${Styles.animateFadeIn} mx-auto max-w-3xl space-y-8 rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm md:p-10`}
            >
              <div>
                <h2 className='mb-2 text-3xl font-extrabold tracking-tight text-[#000D3A]'>
                  Data Peserta
                </h2>
                <p className='text-sm text-gray-500'>
                  Silakan isi data diri dengan benar untuk keperluan pendataan
                  peserta.
                </p>
              </div>

              <hr className='border-gray-100' />

              <div className='space-y-6'>
                <div>
                  <label className='mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                    Nama Lengkap
                  </label>
                  <input
                    type='text'
                    name='namaLengkap'
                    placeholder='Masukkan nama lengkap'
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                    Alamat Email
                  </label>
                  <input
                    type='email'
                    name='email'
                    placeholder='example@gmail.com'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                    Nomor Whatsapp
                  </label>
                  <input
                    type='tel'
                    name='whatsapp'
                    placeholder='0812xxxxxx'
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase'>
                    Angkatan
                  </label>
                  <input
                    type='text'
                    name='angkatan'
                    placeholder='contoh: 2024 / Alumni'
                    value={formData.angkatan}
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                  />
                </div>
              </div>

              <div className='flex space-x-4 pt-4'>
                <button
                  onClick={() => handleStepChange(1)}
                  className='w-1/3 cursor-pointer rounded-2xl bg-gray-100 px-6 py-4 text-center text-sm font-bold text-gray-600 transition hover:bg-gray-200'
                >
                  Kembali
                </button>
                <button
                  onClick={() => handleStepChange(3)}
                  className='w-2/3 cursor-pointer rounded-2xl bg-[#000D3A] px-6 py-4 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#100D3A]/80'
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT & QRIS */}
        {currentStep === 3 && (
          <div className='mx-auto w-full max-w-5xl px-4 py-8'>
            <div
              className={`${Styles.animateFadeIn} mx-auto flex max-w-2xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-gray-50 shadow-sm`}
            >
              {/* Header Ringkasan Pembayaran */}
              <div className='space-y-4 bg-[#000D3A] p-8 text-white'>
                <span className='block text-xs font-bold tracking-wider text-white/60 uppercase'>
                  Ringkasan Pembayaran
                </span>
                <div className='text-4xl font-black'>Rp20.000</div>
                <div className='flex justify-between border-t border-white/10 pt-2 text-sm text-white/80'>
                  <span>Pendaftaran TCharity Run 2026</span>
                  <span className='font-bold'>Rp20.000</span>
                </div>
              </div>

              <div className='space-y-8 p-8'>
                {/* QRIS Scan Placeholder */}
                <div className='space-y-4 text-center'>
                  <h3 className='text-lg font-bold text-[#000D3A]'>
                    Scan QRIS Untuk Melakukan Pembayaran
                  </h3>
                  <div className='group relative mx-auto flex aspect-[11/16] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-4 border-gray-200 bg-gray-100 p-2 transition-all md:max-w-[50%]'>
                    <Image
                      src='/images/student-social-development/tcharity-run/QRIS TCharity Run 2026.jpg'
                      alt='QRIS TCharity Run 2026'
                      width={330}
                      height={480}
                      priority
                      draggable='false'
                      className='aspect-[11/16] h-full w-full rounded-2xl border-4 border-gray-200 object-cover select-none'
                    />
                  </div>
                </div>

                {/* Upload Bukti */}
                <div className='space-y-3'>
                  <h4 className='text-sm font-bold text-[#000D3A]'>
                    Bukti Pembayaran
                  </h4>

                  {/* Hidden file input */}
                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept='image/png, image/jpeg'
                    className='hidden'
                  />

                  {/* Clickable upload box */}
                  <div
                    onClick={triggerFileSelect}
                    className='group cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F9FA] p-8 text-center transition hover:border-blue-400'
                  >
                    <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-sm transition group-hover:text-blue-500'>
                      <Image
                        src='/images/student-social-development/tcharity-run/upload-icon.svg'
                        alt='Calendar Icon'
                        width={24}
                        height={24}
                        className='h-4 w-4'
                      />
                    </div>

                    {/* Dynamically show file name if uploaded */}
                    {formData.buktiPembayaran ? (
                      <div>
                        <p className='mx-auto max-w-xs truncate text-sm font-bold text-blue-600'>
                          {formData.buktiPembayaran.name}
                        </p>
                        <p className='mt-1 text-xs text-gray-400'>
                          Klik untuk mengganti file
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className='text-sm font-bold text-gray-700'>
                          Upload Bukti Pembayaran (JPG/PNG)
                        </p>
                        <p className='mt-1 text-xs text-gray-400'>
                          Maksimal ukuran file 2MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Alert Warning Box */}
                <div className='flex items-start space-x-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-800'>
                  <svg
                    className='mt-0.5 h-5 w-5 shrink-0 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <p>
                    Pastikan mengunggah bukti yang valid untuk mempercepat
                    proses verifikasi oleh panitia.
                  </p>
                </div>

                {/* Action Button */}
                <div className='flex space-x-4 pt-4'>
                  <button
                    onClick={() => handleStepChange(2)}
                    className='w-1/3 cursor-pointer rounded-2xl bg-gray-100 px-6 py-4 text-center text-sm font-bold text-gray-600 transition hover:bg-gray-200'
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => handleStepChange(4)}
                    className='w-full cursor-pointer rounded-2xl bg-[#000D3A] py-4 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#100D3A]/80'
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS PAGE & QR TICKET */}
        {currentStep === 4 && (
          <div className='mx-auto w-full max-w-5xl px-4 py-8'>
            <div
              className={`${Styles.animateFadeIn} mx-auto max-w-xl space-y-8 rounded-3xl border border-gray-100 bg-gray-50 p-8 text-center shadow-sm md:p-12`}
            >
              {/* Green Success Badge */}
              <div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 shadow-sm'>
                ✓
              </div>

              <div className='space-y-2'>
                <h2 className='text-3xl font-extrabold tracking-tight text-[#000D3A]'>
                  Pendaftaran Berhasil!
                </h2>
                <p className='px-4 text-sm text-gray-500'>
                  Terima kasih telah mendaftar di TCharity Run 2026. Jangan lupa
                  untuk join Group WhatsApp di bawah ini yaa.
                </p>
              </div>

              {/* Ticket Graphic Placeholder */}
              <div className='relative mx-auto w-72 overflow-hidden rounded-2xl bg-[#000D3A] p-6 text-left text-white shadow-xl'>
                {/* Ticket Side Cuts */}
                <div className='absolute top-1/2 -left-3 h-6 w-6 rounded-full bg-gray-50'></div>
                <div className='absolute top-1/2 -right-3 h-6 w-6 rounded-full bg-gray-50'></div>

                <div className='mb-6 flex items-start justify-between text-[10px] font-bold tracking-wider text-white/50 uppercase'>
                  <div>
                    <span className='block text-white/40'>Event</span>
                    <span className='text-xs font-bold text-white'>
                      TCharity Run 2026
                    </span>
                  </div>
                  <div className='text-right'>
                    <span className='block text-white/40'>Category</span>
                    <span className='text-xs font-bold text-white'>5K</span>
                  </div>
                </div>

                {/* Ticket QR Code Body */}
                <div className='relative mx-auto flex aspect-square h-full w-full items-center justify-center rounded-xl bg-gray-50 p-4 shadow-inner'>
                  <Image
                    src='/images/student-social-development/tcharity-run/QR Group WhatsApp Peserta TCharity Run.png'
                    alt='Rute lari'
                    fill
                    priority
                    draggable='false'
                    className='select-none'
                  />
                </div>
              </div>
              <div>
                <a
                  href='https://chat.whatsapp.com/KioJFVSGcrM1L0DbX0aqpU?s=cl&p=a&ilr=1'
                  className='text-sm font-bold text-[#0000FF] hover:underline'
                >
                  https://chat.whatsapp.com/KioJFVSGcrM1L0DbX0aqpU
                </a>
              </div>

              <button
                onClick={() => {
                  setFormData({
                    namaLengkap: '',
                    email: '',
                    whatsapp: '',
                    angkatan: '',
                  });
                  handleStepChange(1);
                }}
                className='inline-block cursor-pointer pt-4 text-sm font-bold text-[#000D3A] hover:underline'
              >
                ← Kembali Ke Beranda Acara
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
