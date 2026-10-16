'use client';

import { Menu, MoveLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import Button from '@/components/buttons/Button';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import { NAVBAR_LINKS } from '@/contents/layout';
import { cn } from '@/lib/utils';

export default function NavbarGallery() {
  const [isShift, setIsShift] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsShift(window.scrollY >= 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className='fixed top-0 z-[100] w-full'>
      <div
        className={cn(
          'flex items-center justify-between px-6 py-5.5 min-lg:px-24',
          isShift
            ? 'bg-white shadow-sm backdrop-blur transition-colors duration-150'
            : 'bg-transparent',
        )}
      >
        <Link
          aria-label='Back to home'
          href='/'
          scroll={false}
          className='relative h-13 w-28'
        >
          <NextImage
            src='logo-hmtc2025-navbar-black.png'
            alt='Kunci Transformasi Logo'
            className='h-full w-full'
            width={112}
            height={28}
            priority
          />
        </Link>

        <Button
          aria-label='Buka menu sidebar'
          icon={Menu}
          className='ml-auto min-lg:hidden'
          onClick={() => setIsSidebarOpen(true)}
        />

        <nav className='hidden items-center gap-6 min-lg:flex'>
          {NAVBAR_LINKS.map(({ id, name, href }) => {
            const anchor = href.replace('#', '');
            return (
              <Link
                key={id}
                href={`/#${anchor}`}
                aria-label='Scroll to section'
                scroll={false}
                className='p-2.5 text-white-main transition-colors duration-75'
              >
                <Typography
                  font='satoshi'
                  weight='medium'
                  className={cn(
                    name === 'Gallery' ? 'text-black' : 'text-zinc-600',
                  )}
                >
                  {name}
                </Typography>
              </Link>
            );
          })}
        </nav>
      </div>

      <nav
        className={cn(
          'fixed top-0 left-0 grid h-full w-full grid-rows-2 bg-black-main text-white transition-transform duration-200 ease-in-out min-lg:hidden',
          isSidebarOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0',
        )}
      >
        <div className='flex flex-col items-center gap-14 px-4 py-24'>
          <Link
            href='/'
            aria-label='Back to home'
            scroll={false}
            onClick={() => setIsSidebarOpen(false)}
            className='w-32'
          >
            <NextImage
              src='logo-hmtc2025-navbar.png'
              alt='Logo HMTC 2024'
              className='h-full w-full'
              width={700}
              height={730}
              priority
            />
          </Link>

          <div className='flex flex-col items-center gap-8'>
            {NAVBAR_LINKS.map(({ id, name, href }) => {
              const anchor = href.replace('#', '');
              return (
                <Link
                  key={id}
                  href={`/#${anchor}`}
                  aria-label='Scroll to section'
                  scroll={false}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Typography
                    as='h6'
                    font='satoshi'
                    weight='medium'
                    className={cn(
                      name === 'Gallery'
                        ? 'text-text-white'
                        : 'text-text-disabled',
                    )}
                  >
                    {name}
                  </Typography>
                </Link>
              );
            })}
          </div>
        </div>

        <div className='flex flex-col items-center justify-end pb-10'>
          <Button
            aria-label='Buka menu sidebar'
            size='large'
            icon={MoveLeft}
            className='rounded-md bg-white text-xl font-bold text-black-main hover:bg-gray-200'
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>
      </nav>
    </header>
  );
}
