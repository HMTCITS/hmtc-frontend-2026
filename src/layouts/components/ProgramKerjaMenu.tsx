'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import Typography from '@/components/Typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PROGRAM_KERJA_LINKS } from '@/contents/layout';
import { cn } from '@/lib/utils';

const TRIGGER_CLASS =
  'font-secondary hover:text-base-nav flex cursor-pointer items-center gap-1 p-2.5 text-white-main transition-colors duration-75';

export function ProgramKerjaDesktopMenu() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          aria-label='Buka menu Program Kerja'
          className={TRIGGER_CLASS}
        >
          <Typography font='satoshi'>Program Kerja</Typography>
          <ChevronDown
            aria-hidden='true'
            className={cn(
              'size-3.5 shrink-0 transition-transform duration-200 ease-in-out',
              isOpen && 'rotate-180',
            )}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='start'
        sideOffset={8}
        className='font-secondary z-[110] min-w-56 rounded-md border-white/10 bg-black p-2 text-white shadow-lg'
      >
        {PROGRAM_KERJA_LINKS.map(({ id, label, href }) => (
          <DropdownMenuItem
            key={id}
            asChild
            className='focus:bg-transparent focus:text-white data-[highlighted]:bg-transparent data-[highlighted]:text-blue-main'
          >
            <Link
              href={href}
              aria-label={`Menuju halaman ${label}`}
              className='font-secondary cursor-pointer text-sm text-white-main transition-colors duration-75'
            >
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

type ProgramKerjaMobileMenuProps = {
  onNavigate?: () => void;
};

export function ProgramKerjaMobileMenu({
  onNavigate,
}: ProgramKerjaMobileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className='flex flex-col items-center'>
      <button
        type='button'
        aria-expanded={isOpen}
        aria-controls='program-kerja-mobile-panel'
        aria-label='Buka menu Program Kerja'
        onClick={() => setIsOpen((prev) => !prev)}
        className='text-base-white flex cursor-pointer items-center gap-2'
      >
        <Typography as='h6' font='satoshi'>
          Program Kerja
        </Typography>
        <ChevronDown
          aria-hidden='true'
          className={cn(
            'size-5 shrink-0 text-white transition-transform duration-200 ease-in-out',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        id='program-kerja-mobile-panel'
        className={cn(
          'flex flex-col items-center gap-4 overflow-y-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 pt-4 opacity-100' : 'max-h-0 pt-0 opacity-0',
        )}
      >
        {PROGRAM_KERJA_LINKS.map(({ id, label, href }) => (
          <Link
            key={id}
            href={href}
            aria-label={`Menuju halaman ${label}`}
            onClick={onNavigate}
            className='text-base-white cursor-pointer'
          >
            <Typography as='h6' font='satoshi'>
              {label}
            </Typography>
          </Link>
        ))}
      </div>
    </div>
  );
}
