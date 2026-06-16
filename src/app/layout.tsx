import '@/styles/globals.css';
import '@/styles/embla.css';

import type { Metadata } from 'next';

import Providers from '@/app/providers';
import JsonLd from '@/components/JsonLd';
import {
  adelphe,
  archivo,
  harryPotter,
  inter,
  jetbrainsMono,
  libreBaskerville,
  libreCaslon,
  playfairDisplay,
  plusJakartaSans,
  poppins,
  satoshi,
} from '@/lib/font';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL('https://hmtc-its.com'),

  title: {
    default:
      'HMTC ITS | Himpunan Mahasiswa Teknik Computer Institut Teknologi Sepuluh Nopember',
    template: '%s | HMTC ITS',
  },

  description:
    'Selamat datang di Himpunan Mahasiswa Teknik Computer (HMTC) ITS — workshop, galeri, blog, dan komunitas mahasiswa.',

  applicationName: 'HMTC ITS',

  authors: [
    {
      name: 'HMTC ITS',
      url: 'https://arek.its.ac.id/hmtc/',
    },
  ],

  publisher: 'Institut Teknologi Sepuluh Nopember',

  keywords: [
    // versi capital
    'HMTC',
    'HMTC ITS',
    'Himpunan Mahasiswa Teknik Computer',
    'Himpunan Mahasiswa Teknik Computer ITS',
    'Institut Teknologi Sepuluh Nopember',
    'ITS',

    // versi lowercase
    'hmtc',
    'hmtc its',
    'himpunan mahasiswa Teknik Computer',
    'himpunan mahasiswa Teknik Computer its',
    'institut teknologi sepuluh nopember',
    'its',

    // long-tail & variasi bahasa Indonesia
    'hmtc its website resmi',
    'komunitas mahasiswa Teknik Computer its',
    'kegiatan hmtc its',
    'agenda hmtc its',
    'acara hmtc its',
    'blog hmtc its',
    'berita hmtc its',
    'profil hmtc its',
    'struktur organisasi hmtc its',
    'visi misi hmtc its',
    'kontak hmtc its',
    'pengumuman hmtc its',
    'pengurus hmtc its',
    'galeri hmtc its',
    'dokumentasi hmtc its',

    // long-tail & variasi bahasa Inggris
    'computer engineering student association its',
    'hmtc student community its',
    'hmTC ITS events',
    'hmTC workshop its',
    'hmTC competition its',
    'technical computer student association its',

    // tech & domain-specific
    'hmtc-its.com',
    'sitemap hmtc its',
    'favicon hmtc its',
    'seo nextjs hmtc its',
    'nextjs metadata hmtc its',
  ],

  alternates: {
    canonical: 'https://hmtc-its.com',
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any', type: 'image/png' },
      { url: '/favicon16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon256x256.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: '/apple-touch-icon-180x180.png',
    shortcut: '/favicon256x256.png',
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon256x256.png',
        color: '#ff6600',
      },
    ],
  },

  openGraph: {
    title: 'HMTC ITS',
    description:
      'Organisasi Mahasiswa Teknologi dan Kreativitas di ITS—workshop, galeri, blog, komunitas.',
    url: 'https://hmtc-its.com',
    siteName: 'HMTC ITS',
    images: [
      {
        url: 'https://hmtc-its.com/images/halamandepan.png',
        width: 1440,
        height: 935,
      },
    ],
    type: 'website',
    locale: 'id_ID',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'HMTC ITS',
    description:
      'Organisasi Mahasiswa Teknologi dan Kreativitas di ITS—workshop, galeri, blog, komunitas.',
    images: ['https://hmtc-its.com/images/halamandepan.png'],
  },

  other: {
    instagram: ['https://www.instagram.com/hmtc_its/'],
    'university-profile': ['https://arek.its.ac.id/hmtc/'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='id' suppressHydrationWarning={true}>
      <body
        className={cn(
          playfairDisplay.variable,
          poppins.variable,
          adelphe.variable,
          archivo.variable,
          inter.variable,
          jetbrainsMono.variable,
          satoshi.variable,
          libreCaslon.variable,
          libreBaskerville.variable,
          harryPotter.variable,
          plusJakartaSans.variable,
          'scroll-smooth',
        )}
      >
        <JsonLd
          title='HMTC ITS - Himpunan Mahasiswa Teknik Computer'
          description='Himpunan Mahasiswa Teknik Computer ITS - wadah kreativitas dan kegiatan mahasiswa.'
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
