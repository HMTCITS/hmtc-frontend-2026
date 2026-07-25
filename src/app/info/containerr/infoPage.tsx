'use client';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

const links = [
  { label: 'Request Media Partner', url: 'https://intip.in/RequestMedparHMTC2026' },
  { label: 'Instagram', url: 'https://www.instagram.com/hmtc_its' },
  { label: 'WhatsApp OA', url: 'http://wa.me/6285124014965' },
  { label: 'Twitter', url: 'https://twitter.com/hmtc_its' },
  { label: 'Facebook', url: 'https://www.facebook.com/HMTCFTEIC' },
  { label: 'Youtube', url: 'https://www.youtube.com/c/bluepresshmtc' },
  { label: 'Issuu', url: 'https://issuu.com/medfohmtc' },
  { label: 'Website', url: 'https://hmtc-its.com' },
];

export const metadata: Metadata = {
  title: 'Info Kontak & Media Sosial HMTC ITS',
  description:
    'Temukan semua link penting HMTC ITS: Media Partner, Instagram, WhatsApp, Line OA, Twitter, Facebook, YouTube, Issuu, dan Website resmi HMTC ITS (Himpunan Mahasiswa Teknik Computer-Informatika ITS Surabaya).',
  keywords: [
    'HMTC ITS',
    'Himpunan Mahasiswa Teknik Computer',
    'Info Kontak HMTC',
    'Media Sosial HMTC',
    'Instagram HMTC ITS',
    'WhatsApp HMTC',
    'Twitter HMTC',
    'Facebook HMTC',
    'YouTube HMTC',
    'Issuu HMTC',
    'Website HMTC',
    'ITS Surabaya',
  ],
  alternates: {
    canonical: 'https://hmtc-its.com/info',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Info Kontak & Media Sosial HMTC ITS',
    description:
      'Temukan semua link penting HMTC ITS: Media Partner, Instagram, WhatsApp, Line OA, Twitter, Facebook, YouTube, Issuu, dan Website resmi HMTC ITS (Himpunan Mahasiswa Teknik Computer-Informatika ITS Surabaya).',
    url: 'https://hmtc-its.com/info',
    siteName: 'HMTC ITS',
    images: [
      {
        url: 'https://hmtc-its.com/images/logo-hmtc-info.jpg',
        width: 512,
        height: 512,
        alt: 'Logo HMTC ITS',
      },
    ],
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary',
    title: 'Info Kontak & Media Sosial HMTC ITS',
    description:
      'Link resmi media sosial, WhatsApp, Line, dan kontak HMTC ITS (Himpunan Mahasiswa Teknik Computer-Informatika ITS Surabaya).',
    images: ['https://hmtc-its.com/images/logo-hmtc-info.jpg'],
  },
};

export default function InfoPage() {
  return (
    <div className='flex min-h-screen flex-col items-center bg-gradient-to-b from-cyan-500 to-blue-900 px-4 py-20'>
      {/* Kembali ke main */}
      <Link
        href='https://hmtc-its.com'
        className='absolute top-4 left-4 flex gap-2 rounded-full border border-white/50 px-4 py-4 text-center font-poppins text-base font-normal text-white transition-all duration-200 hover:bg-white hover:text-blue-900 md:top-12 md:left-12 md:gap-4 md:px-6 lg:fixed'
      >
        <div>&larr;</div>
        <p>Kembali</p>
      </Link>

      {/* Logo */}
      <div className='mb-4'>
        <Image
          src='/images/logo-hmtc-info.jpg'
          alt='HMTC ITS Logo'
          width={90}
          height={90}
          className='rounded-full'
        />
      </div>

      {/* Judul */}
      <h1 className='mb-1 font-plus-jakarta-sans text-center text-2xl font-bold text-white'>
        HMTC ITS
      </h1>
      <p className='mb-6 font-plus-jakarta-sans text-center text-lg font-normal text-white'>
        Himpunan Mahasiswa Teknik Computer-Informatika ITS
      </p>

      {/* Link Buttons */}
      <div className='w-full max-w-md space-y-4'>
        {links.map((link, idx) => (
          <Link
            key={idx}
            href={link.url}
            className='block w-full rounded-full border border-white/50 py-4 text-center font-poppins text-base font-normal text-white transition-all duration-200 hover:bg-white hover:text-blue-900'
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
