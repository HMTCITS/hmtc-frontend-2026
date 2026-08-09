'use client';

import {
  ChevronDown,
  Instagram,
  Link2,
  Linkedin,
  Twitter,
  Youtube,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import BaseLink from '@/components/links/BaseLink';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import { NAVBAR_LINKS as ApaIni } from '@/contents/layout';
import SocialCard from '@/layouts/components/Social';
import { cn } from '@/lib/utils';

const SocialMedia = [
  { icon: Twitter, href: 'https://twitter.com/hmtc_its' },
  { icon: Instagram, href: 'https://www.instagram.com/hmtc_its/' },
  { icon: Youtube, href: 'https://www.youtube.com/@bluepresshmtc' },
  {
    icon: Linkedin,
    href: 'https://www.linkedin.com/company/himpunan-mahasiswa-teknik-computer-informatika/',
  },
  { icon: Link2, href: '/info' },
];

const ProgramKerja = [
  {
    label: 'Syukuran Wisuda',
    href: '/internal-affairs/syukuran-wisudawan',
    offset: -80,
  },
  {
    label: 'Video Tutorial',
    href: '/student-welfare/academic-resources',
    offset: -80,
  },
  {
    label: 'Seminar Dosen',
    href: '/research-and-technology/seminar-dosen',
    offset: -80,
  },
  {
    label: 'Bluecamp',
    href: '/research-and-technology/bluecamp',
    offset: -80,
  },
  {
    label: 'TC Run',
    href: '/student-social-development/tc-run',
    offset: -80,
  },
];

function handleSmoothAnchorClick(
  e: React.MouseEvent<HTMLAnchorElement>,
  offset: number = 0,
) {
  const href = e.currentTarget.getAttribute('href');
  if (href && href.startsWith('#')) {
    e.preventDefault();
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (target) {
      const rect = target.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;
      window.scrollTo({
        top: rect.top + scrollTop + offset,
        behavior: 'smooth',
      });
    }
  }
}

export default function Footer() {
  const [isApaIniOpen, setIsApaIniOpen] = React.useState(false);
  const [isProgramKerjaOpen, setIsProgramKerjaOpen] = React.useState(false);
  const toggleApaIni = () => setIsApaIniOpen((prev) => !prev);
  const toggleProgramKerja = () => setIsProgramKerjaOpen((prev) => !prev);

  return (
    <footer
      className={cn(
        'w-full px-6 py-12 md:px-24',
        'flex flex-col items-center gap-6 bg-text-black text-white md:gap-6',
      )}
    >
      <div
        className={cn(
          'flex w-full flex-col items-center gap-x-4 gap-y-12 pb-6',
          'md:min-h-[240px] md:flex-row md:items-start md:justify-between',
        )}
      >
        <BaseLink href='/' className='flex items-center gap-x-1'>
          <NextImage
            src='logo-hmtc-2026.svg'
            alt='Logo HMTC ITS 2026'
            width={32}
            height={32}
            priority
            quality={80}
            className=''
          />
          <span className='flex h-full items-center align-middle font-libre-baskerville text-white-main'>
            NIAT
            <span className='italic'>
              BA<span className='text-blue-500'>I</span>K
            </span>
          </span>
        </BaseLink>

        <div className='font-secondary grid grid-cols-2 gap-x-6'>
          <div className='flex w-full flex-col items-start gap-y-2.5 md:w-[187px]'>
            <div onClick={toggleApaIni} className='flex items-center gap-2'>
              <Typography
                variant='s2'
                className='cursor-pointer font-plus-jakarta-sans font-bold uppercase md:pb-5'
              >
                hmtc
              </Typography>
              <ChevronDown
                className={cn(
                  'text-white md:hidden',
                  'transition-transform duration-200 ease-in-out',
                  isApaIniOpen && 'rotate-180',
                )}
              />
            </div>
            <div
              className={cn(
                'flex flex-col items-start gap-3',
                'overflow-y-hidden transition-all duration-300 ease-in-out',
                isApaIniOpen
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100',
              )}
            >
              {ApaIni.map(({ name, href, offset }, index) =>
                href.startsWith('#') ? (
                  <a
                    key={index}
                    href={href}
                    aria-label={`Scroll ke bagian ${name}`}
                    className='font-secondary hover:text-base-nav cursor-pointer text-white-main transition-colors duration-75'
                    onClick={(e) => handleSmoothAnchorClick(e, offset ?? -80)}
                  >
                    <Typography
                      font='satoshi'
                      className='text-base-icon text-sm hover:text-white md:text-base'
                    >
                      {name}
                    </Typography>
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={href}
                    aria-label={`Menuju halaman ${name}`}
                    className='font-secondary hover:text-base-nav cursor-pointer text-white-main transition-colors duration-75'
                  >
                    <Typography font='satoshi'>{name}</Typography>
                  </Link>
                ),
              )}
            </div>
          </div>
          <div className='flex w-full flex-col items-start gap-y-2.5 md:w-[187px]'>
            <div
              onClick={toggleProgramKerja}
              className='flex items-center gap-2'
            >
              <Typography
                variant='s2'
                className='cursor-pointer font-plus-jakarta-sans font-bold uppercase md:pb-5'
              >
                program kerja
              </Typography>
              <ChevronDown
                className={cn(
                  'text-white md:hidden',
                  'transition-transform duration-200 ease-in-out',
                  isProgramKerjaOpen && 'rotate-180',
                )}
              />
            </div>
            <div
              className={cn(
                'flex flex-col items-start gap-3',
                'overflow-y-hidden transition-all duration-300 ease-in-out',
                isProgramKerjaOpen
                  ? 'max-h-96 opacity-100'
                  : 'max-h-0 opacity-0 md:max-h-96 md:opacity-100',
              )}
            >
              {ProgramKerja.map(({ label, href, offset }, index) => (
                <a
                  key={index}
                  href={href}
                  aria-label={`Scroll ke bagian ${label}`}
                  className='font-secondary hover:text-base-nav cursor-pointer text-white-main transition-colors duration-75'
                  onClick={(e) => handleSmoothAnchorClick(e, offset ?? -80)}
                >
                  <Typography
                    font='satoshi'
                    className='text-base-icon text-sm hover:text-white md:text-base'
                  >
                    {label}
                  </Typography>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* <div className='h-1 w-full border-t border-black-main'></div> */}

      <div className='flex w-full flex-col items-center justify-center gap-y-6 md:flex-row md:justify-between'>
        <Typography
          variant='s2'
          className='font-secondary text-base-icon order-2 font-satoshi text-sm uppercase md:order-1 md:text-center'
        >
          &copy; HMTC ITS 2026 | NIAT BAIK
        </Typography>
        <div className='order-1 flex items-center gap-x-4 md:order-2'>
          {SocialMedia.map(({ icon: Icon, href }, index) => (
            <SocialCard key={index} href={href} icon={Icon} />
          ))}
        </div>
      </div>
    </footer>
  );
}
