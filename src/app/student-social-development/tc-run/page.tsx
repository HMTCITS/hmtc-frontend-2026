'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

import Styles from '@/app/student-social-development/tc-run/styles.module.css';
import Footer from '@/layouts/Footer';
import { getCookie, setCookie } from '@/lib/cookies';

import RibbonWaveBackground from './components/ribbon-wave-bg';

interface FormData {
  namaLengkap: string;
  alamatEmail: string;
  nomorWhatsapp: string;
  angkatan: string;
  berkenanDonasi: '' | 'ya' | 'tidak';
  nominalDonasi?: number;
  nominalDonasiVisual?: string;
  buktiPembayaran?: File | null;
}

const REGISTRATION_STORAGE_KEY_PREFIX =
  'tc-run-2026.registration.submitted';
const REGISTRATION_COOKIE_KEY_PREFIX =
  'tc.registration.submitted';
const ID = 'tc-run-2026';
const RSVP_CLOSES_AT = '2026-09-05T23:59:59+07:00';

export default function TCRunPage() {
  const registrationStorageKey = useMemo(
    () => `${REGISTRATION_STORAGE_KEY_PREFIX}.${ID}`,
    [],
  );
  const registrationCookieKey = useMemo(
    () => `${REGISTRATION_COOKIE_KEY_PREFIX}_${ID}`,
    [],
  );

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    namaLengkap: '',
    alamatEmail: '',
    nomorWhatsapp: '',
    angkatan: '',
    berkenanDonasi: '',
    nominalDonasi: 0,
    nominalDonasiVisual: '',
    buktiPembayaran: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldValidationError, setFieldValidationError] = useState<
    string | null
  >(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const savedLocalStatus = localStorage.getItem(registrationStorageKey);
    const savedCookieStatus = getCookie(registrationCookieKey);
    const hasRegistered =
      savedLocalStatus === 'true' || savedCookieStatus === 'true';

    if (!hasRegistered) {
      return;
    }

    setIsSubmitted(true);

    try {
      localStorage.setItem(registrationStorageKey, 'true');
    } catch (error) {
      void error;
    }

    setCookie(registrationCookieKey, 'true', {
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
      sameSite: 'Lax',
    });
  }, [registrationCookieKey, registrationStorageKey]);

  const isRsvpClosed = useMemo(() => {
    if (!RSVP_CLOSES_AT) {
      return false;
    }

    const closeTime = new Date(RSVP_CLOSES_AT).getTime();
    if (Number.isNaN(closeTime)) {
      return false;
    }

    return Date.now() > closeTime;
  }, []);

  const checkHasEmptyField = (data: FormData) => {
    return (
      !data.namaLengkap ||
      !data.alamatEmail ||
      !data.nomorWhatsapp ||
      !data.angkatan ||
      !data.berkenanDonasi
    );
  };

  const checkHasBuktiPembayaran = (data: FormData) => {
    return data.buktiPembayaran;
  };

  const checkIsFieldValid = (data: FormData): string | null => {
    if (isRsvpClosed) {
      return 'Registration Closed, thank you';
    }

    if (checkHasEmptyField(data)) {
      return 'Semua field wajib diisi.';
    }

    if (!data.alamatEmail.includes('@')) {
      return 'Alamat email tidak valid.';
    }

    if (!/^\d{10,13}$/.test(data.nomorWhatsapp)) {
      return 'Nomor WhatsApp tidak valid. Harap masukkan 10-13 digit angka.';
    }

    if (
      !data.angkatan.match(/^\d{4}$/) &&
      data.angkatan.toLowerCase() !== 'alumni'
    ) {
      return 'Angkatan tidak valid. Harap masukkan tahun 4 digit atau "Alumni".';
    }

    const MAX_LENGTH = 255;
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string' && value.length > MAX_LENGTH) {
        const readableKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        return `${readableKey} terlalu panjang. Maksimal ${MAX_LENGTH} karakter.`;
      }
    }

    return null;
  };

  const handleDonationAnswer = () => {
    if (isRsvpClosed) {
      setFieldValidationError('Registration Closed, thank you');
      return;
    }

    if (!formData.berkenanDonasi) {
      setFieldValidationError('Silakan pilih salah satu opsi.');
      return;
    }

    setFieldValidationError(null);

    if (formData.berkenanDonasi === 'ya') {
      handleStepChange(3);
    } else {
      handleStepChange(1);
    }
  };

  // const handleGoToPembayaran = async () => {
  //   const fieldValidationError = checkIsFieldValid(formData);
  //   if (fieldValidationError) {
  //     setFieldValidationError(fieldValidationError);
  //     return;
  //   }
  //
  //   if (formData.berkenanDonasi === 'tidak') {
  //     await submitRegistration();
  //     return;
  //   }
  //
  //   handleStepChange(3);
  // };

  const handleStepChange = (step: 1 | 2 | 3 | 4) => {
    setFieldValidationError(null);
    setSubmitError(null);
    if (isSubmitted && (step === 2 || step === 3)) {
      setCurrentStep(4);
    } else {
      setCurrentStep(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const maintainCursorPosition = (
    input: HTMLInputElement | null,
    oldValueLength: number,
    newValue: string,
  ) => {
    if (!input) return;
    const cursorPosition = input.selectionStart || 0;

    requestAnimationFrame(() => {
      const lengthDifference = newValue.length - oldValueLength;
      let newCursorPosition = Math.max(3, cursorPosition + lengthDifference);
      newCursorPosition = Math.min(newCursorPosition, newValue.length);
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'nominalDonasi') {
      const MAX_DONATION = 1000000000000;
      const input = inputRef.current;
      const oldValueLength = value.length;

      let numericValue = value.replace(/\D/g, '');
      numericValue = numericValue.replace(/^0+/, '');

      if (Number(numericValue) > MAX_DONATION) {
        numericValue = MAX_DONATION.toString();
      }

      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      const numericValueVisual = formattedValue ? `Rp${formattedValue}` : 'Rp0';

      setFormData((prev) => ({
        ...prev,
        nominalDonasi: Number(numericValue),
        nominalDonasiVisual: numericValueVisual,
      }));

      maintainCursorPosition(input, oldValueLength, numericValueVisual);
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (JPG/PNG only)
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setSubmitError(
        'Format file tidak didukung. Harap upload file JPG atau PNG.',
      );
      return;
    }

    // Validate file size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(
        'Ukuran file terlalu besar. Maksimal ukuran file adalah 5MB.',
      );
      return;
    }

    setFormData((prev) => ({ ...prev, buktiPembayaran: file }));
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();

    setFormData((prev) => ({ ...prev, buktiPembayaran: null }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const submitRegistration = async () => {
    setSubmitError(null);

    const fieldValidationError = checkIsFieldValid(formData);
    if (fieldValidationError) {
      setSubmitError(fieldValidationError);
      return;
    }

    if (formData.berkenanDonasi === 'ya') {
      const hasNominalDonasi =
        formData.nominalDonasi && formData.nominalDonasi > 0;
      const hasBuktiPembayaran = checkHasBuktiPembayaran(formData);

      if (!hasNominalDonasi || !hasBuktiPembayaran) {
        setSubmitError(
          'Nominal donasi dan bukti pembayaran wajib diisi karena kamu memilih untuk berdonasi.',
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('namaLengkap', formData.namaLengkap);
      formDataToSend.append('alamatEmail', formData.alamatEmail);
      formDataToSend.append('nomorWhatsapp', formData.nomorWhatsapp);
      formDataToSend.append('angkatan', formData.angkatan);
      formDataToSend.append(
        'nominalDonasi',
        formData.nominalDonasi?.toString() || '0',
      );
      if (formData.buktiPembayaran) {
        formDataToSend.append('buktiPembayaran', formData.buktiPembayaran);
      }

      const response = await fetch('/api/tc-run', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || 'Gagal mengirim pendaftaran. Silakan coba lagi.',
        );
      }

      try {
        localStorage.setItem(registrationStorageKey, 'true');
      } catch (error) {
        void error;
      }

      setCookie(registrationCookieKey, 'true', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
        sameSite: 'Lax',
      });

      setIsSubmitted(true);
      setFormData({
        namaLengkap: '',
        alamatEmail: '',
        nomorWhatsapp: '',
        angkatan: '',
        berkenanDonasi: '',
        nominalDonasi: 0,
        nominalDonasiVisual: '',
        buktiPembayaran: null,
      });
      handleStepChange(4);
      setSubmitError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pendaftaran. Silakan coba lagi.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col justify-between bg-gray-50 font-plus-jakarta-sans text-[#0A1931] antialiased'>
      {/* NAVBAR */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${!isScrolled && currentStep == 1
            ? 'bg-transparent'
            : 'bg-gray-50 shadow-sm'
          }`}
      >
        <div className='mx-auto flex h-20 max-w-5xl items-center justify-between px-4'>
          <div className='flex items-center space-x-3'>
            <button
              type='button'
              onClick={() => handleStepChange(1)}
              className='cursor-pointer text-2xl font-bold tracking-tight text-[#000D3A]'
            >
              TC Run 2026
            </button>
          </div>
          <nav className='hidden items-center space-x-8 text-sm font-medium text-gray-500 md:flex'>
            <button
              type='button'
              onClick={() => handleStepChange(1)}
              className={`cursor-pointer border-b-2 pb-1 transition-all ${currentStep === 1 ? 'border-[#000D3A] font-semibold text-[#000D3A]' : 'border-transparent hover:text-gray-800'}`}
            >
              Event Info
            </button>
            <button
              type='button'
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
                  TC Run 2026
                </h1>
                <p className='text-sm leading-relaxed text-gray-700 sm:text-base'>
                  TC Run merupakan event lari yang diselenggarakan oleh HMTC ITS
                  sebagai bentuk ajakan kepada mahasiswa aktif dan alumni Teknik
                  Informatika ITS untuk menerapkan gaya hidup sehat sekaligus
                  berkontribusi dalam kegiatan sosial. Pendapatan yang diperoleh
                  dari acara ini akan didonasikan kepada pihak yang membutuhkan.
                  TC Run akan diselenggarakan pada 12 September 2026, dengan
                  rangkaian acara yang meliputi main event berupa kegiatan lari,
                  serta pasca-event yang diisi dengan sesi Q&amp;A, photo booth,
                  dan pembagian doorprize.
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
                        src='/images/student-social-development/tc-run/calendar-icon.svg'
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
                        src='/images/student-social-development/tc-run/facility-icon.svg'
                        alt='Facility Icon'
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
                        src='/images/student-social-development/tc-run/call-icon.svg'
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
                    GRATIS
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => handleStepChange(2)}
                  className='w-full cursor-pointer rounded-2xl bg-[#000D3A] px-10 py-4 text-center font-bold text-white shadow-lg shadow-blue-900/10 transition hover:bg-[#100D3A]/80 sm:w-auto'
                >
                  Daftar Sekarang
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
                    src='/images/student-social-development/tc-run/Rute Lari.png'
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

        {/* STEP 2: DONATION QUESTION */}
        {currentStep === 2 && (
          <div className='mx-auto w-full max-w-5xl px-4 py-8'>
            <div
              className={`${Styles.animateFadeIn} mx-auto max-w-3xl space-y-8 rounded-3xl border border-gray-100 bg-gray-50 p-8 shadow-sm md:p-10`}
            >
              {/* PERINGATAN KUOTA PENUH */}
              <div className='flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5 flex-shrink-0'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.518 11.59c.75 1.334-.213 2.987-1.743 2.987H3.482c-1.53 0-2.493-1.653-1.743-2.987l6.518-11.59zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                <p className='font-medium'>
                  Mohon maaf, kuota pendaftaran sudah penuh.
                </p>
              </div>

              <div>
                <h2 className='mb-2 text-3xl font-extrabold tracking-tight text-[#000D3A]'>
                  Berdonasi Yuk!
                </h2>
                <p className='text-sm text-gray-500'>
                  Sebelum lanjut mengisi data diri, apakah kamu berkenan untuk
                  berdonasi?
                </p>
              </div>

              <hr className='border-gray-100' />

              <div className='space-y-2'>
                <label className='block text-sm font-bold text-[#000D3A]'>
                  Berkenan Berdonasi? <span className='text-red-600'>*</span>
                </label>
                <div className='flex gap-4'>
                  <label className='flex flex-1 cursor-pointer items-center justify-center rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition has-[:checked]:border-[#000D3A] has-[:checked]:bg-blue-50'>
                    <input
                      type='radio'
                      name='berkenanDonasi'
                      value='ya'
                      checked={formData.berkenanDonasi === 'ya'}
                      onChange={handleInputChange}
                      className='sr-only'
                    />
                    Ya, saya berkenan
                  </label>
                  <label className='flex flex-1 cursor-pointer items-center justify-center rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition has-[:checked]:border-[#000D3A] has-[:checked]:bg-blue-50'>
                    <input
                      type='radio'
                      name='berkenanDonasi'
                      value='tidak'
                      checked={formData.berkenanDonasi === 'tidak'}
                      onChange={handleInputChange}
                      className='sr-only'
                    />
                    Tidak
                  </label>
                </div>
              </div>

              <div className='flex w-full flex-col items-center'>
                {fieldValidationError && (
                  <p className='mt-2 font-sans text-sm text-red-600'>
                    {fieldValidationError}
                  </p>
                )}
                <div className='flex w-full space-x-4 pt-4'>
                  <button
                    type='button'
                    onClick={() => handleStepChange(1)}
                    className='w-1/3 cursor-pointer rounded-2xl bg-gray-100 px-6 py-4 text-center text-sm font-bold text-gray-600 transition hover:bg-gray-200'
                  >
                    Kembali
                  </button>
                  <button
                    type='button'
                    onClick={handleDonationAnswer}
                    className='w-2/3 cursor-pointer rounded-2xl bg-[#000D3A] px-6 py-4 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#100D3A]/80'
                  >
                    Lanjut
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DATA PESERTA & DONASI */}
        {currentStep === 3 && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitRegistration();
            }}
            className='mx-auto w-full max-w-5xl px-4 py-8'
          >
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
                <div className='space-y-2'>
                  <label className='block text-sm font-bold text-[#000D3A]'>
                    Nama Lengkap <span className='text-red-600'>*</span>
                  </label>
                  <input
                    type='text'
                    name='namaLengkap'
                    placeholder='Masukkan nama lengkap'
                    value={formData.namaLengkap}
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-bold text-[#000D3A]'>
                    Alamat Email <span className='text-red-600'>*</span>
                  </label>
                  <input
                    type='email'
                    name='alamatEmail'
                    placeholder='example@gmail.com'
                    value={formData.alamatEmail}
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-bold text-[#000D3A]'>
                    Nomor Whatsapp <span className='text-red-600'>*</span>
                  </label>
                  <input
                    type='tel'
                    name='nomorWhatsapp'
                    placeholder='0812xxxxxx'
                    value={formData.nomorWhatsapp}
                    onChange={handleInputChange}
                    minLength={10}
                    maxLength={13}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-bold text-[#000D3A]'>
                    Angkatan <span className='text-red-600'>*</span>
                  </label>
                  <input
                    type='text'
                    name='angkatan'
                    placeholder='contoh: 2024 / Alumni'
                    value={formData.angkatan}
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                    required
                  />
                </div>
              </div>

              <hr className='border-gray-100' />

              <div className='space-y-6'>
                <div>
                  <h3 className='mb-2 text-xl font-bold text-[#000D3A]'>
                    Yuk, Berbagi melalui TC Run
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Sisihkan sedikit untuk berdonasi kepada Yayasan Himmatun Ayat
                    melalui QRIS berikut. Donasi bersifat sukarela dan dapat
                    diberikan sesuai kemampuan masing-masing.
                  </p>
                </div>

                <div className='space-y-2'>
                  <label className='block text-sm font-bold text-[#000D3A]'>
                    Nominal Donasi
                  </label>
                  <input
                    ref={inputRef}
                    type='text'
                    name='nominalDonasi'
                    inputMode='numeric'
                    value={formData.nominalDonasiVisual}
                    placeholder='Masukkan nominal donasi. Contoh: 10000'
                    onChange={handleInputChange}
                    className='w-full rounded-2xl border border-transparent bg-[#F4F5F7] px-5 py-4 text-sm font-medium transition outline-none focus:border-gray-200 focus:bg-gray-50'
                  />
                </div>

                <div className='space-y-4 text-center'>
                  <h3 className='text-lg font-bold text-[#000D3A]'>
                    Scan QRIS Untuk Berdonasi
                  </h3>
                  <div className='group relative mx-auto flex aspect-[1632/2892] w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-4 border-gray-200 bg-gray-100 p-2 transition-all md:max-w-[50%]'>
                    <Image
                      src='/images/student-social-development/tc-run/Ver. 8.png'
                      alt='QRIS TC Run 2026'
                      width={1632}
                      height={2892}
                      priority
                      draggable='false'
                      className='h-full w-full rounded-2xl border-4 border-gray-200 object-contain select-none'
                    />
                  </div>
                  <p className='text-sm text-[#000D3A]'>
                    Donasi akan disalurkan kepada Yayasan Himmatun Ayat.
                  </p>
                </div>

                <div className='space-y-2 mb-2'>
                  <label className='block text-sm font-bold text-[#000D3A]'>
                    Bukti Donasi
                  </label>

                  <input
                    type='file'
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept='image/png, image/jpeg'
                    className='hidden'
                  />

                  <div
                    onClick={triggerFileSelect}
                    className='group cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 bg-[#F8F9FA] p-8 text-center transition hover:border-blue-400'
                  >
                    <div className='mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-sm transition group-hover:text-blue-500'>
                      <Image
                        src='/images/student-social-development/tc-run/upload-icon.svg'
                        alt='Upload Icon'
                        width={24}
                        height={24}
                        className='h-4 w-4'
                      />
                    </div>

                    {formData.buktiPembayaran ? (
                      <div>
                        <div className='relative flex items-center justify-center space-x-2'>
                          <p className='max-w-xs truncate text-sm font-bold text-blue-600'>
                            {formData.buktiPembayaran.name}
                          </p>
                          <button
                            type='button'
                            onClick={handleRemoveFile}
                            className='flex cursor-pointer items-center justify-center text-red-500 hover:text-red-700 hover:underline'
                          >
                            ✕
                          </button>
                        </div>
                        <p className='mt-1 text-xs text-gray-400'>
                          Klik untuk mengganti file
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className='text-sm font-bold text-gray-700'>
                          Upload Bukti Donasi (JPG/PNG)
                        </p>
                        <p className='mt-1 text-xs text-gray-400'>
                          Maksimal ukuran file 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <p className='text-xs text-[#000D3A]'>
                  Opsional — unggah jika kamu melakukan donasi.
                </p>

                <div className='flex items-center space-x-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-800'>
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
                    Jika melakukan donasi, pastikan bukti yang diunggah terlihat
                    jelas untuk memudahkan proses verifikasi oleh panitia.
                  </p>
                </div>
              </div>

              <div className='flex w-full flex-col items-center'>
                {fieldValidationError && (
                  <p className='mt-2 font-sans text-sm text-red-600'>
                    {fieldValidationError}
                  </p>
                )}
                {submitError && (
                  <p className='mt-2 font-sans text-sm text-red-600'>
                    {submitError}
                  </p>
                )}
                <div className='flex w-full space-x-4 pt-4'>
                  <button
                    type='button'
                    onClick={() => handleStepChange(2)}
                    className='w-1/3 cursor-pointer rounded-2xl bg-gray-100 px-6 py-4 text-center text-sm font-bold text-gray-600 transition hover:bg-gray-200'
                  >
                    Kembali
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-2/3 cursor-pointer rounded-2xl bg-[#000D3A] py-4 text-center text-sm font-bold text-white shadow-md transition hover:bg-[#100D3A]/80'
                  >
                    {isSubmitting ? 'Mengirim...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS PAGE */}
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
                  Terima Kasih atas donasinya!
                </h2>
              </div>
              <button
                type='button'
                onClick={() => {
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
