import Image from 'next/image';
import { useEffect,useState } from 'react';

const NAV_ITEMS = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Dokumentasi', href: '#dokumentasi' },
  // { label: 'Detail Program', href: '#program' },
  { label: 'Feedback', href: '#feedback' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-[18px] transition-all duration-300 ease-out md:px-8 ${scrolled ? 'bg-white/92 !py-3 shadow-sm backdrop-blur-md' : 'bg-transparent'}`}
    >
      <a href='#top' className='brand' aria-label='Bluecamp'>
        <Image
          src={
            scrolled
              ? '/images/research-and-technology/bluecamp/logo-bluecamp-blue.svg'
              : '/images/research-and-technology/bluecamp/logo-bluecamp-white.svg'
          }
          alt='Logo Bluecamp 2026'
          width={144}
          height={56}
          priority
        />
      </a>

      <nav className='hidden items-center gap-[34px] md:flex'>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`relative text-[0.82rem] font-bold tracking-wider transition-colors duration-300 after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:bg-[#FFB23A] after:transition-all after:duration-300 after:content-[''] hover:after:w-full ${scrolled ? 'text-[#3a424e] hover:text-[#14181f]' : 'text-white/92 hover:text-white'}`}
          >
            {item.label}
          </a>
        ))}
        <a
          href='#top'
          className={`relative rounded-[2px] border-[1.5px] px-4 py-2 text-[0.74rem] font-bold tracking-widest uppercase transition-all after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:bg-[#FFB23A] after:transition-all after:duration-300 after:content-[''] hover:after:w-full ${scrolled ? 'border-[#3a424e] text-[#3a424e]' : 'border-white text-white'}`}
        >
          Bluecamp 2026
        </a>
      </nav>

      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className={`flex border-0 bg-transparent transition-colors hover:cursor-pointer md:hidden ${scrolled ? 'text-[#14181f]' : 'text-white'}`}
        aria-label='Menu'
      >
        <svg
          className='h-6 w-6'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          {menuOpen ? (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18L18 6M6 6l12 12'
            />
          ) : (
            <path d='M3 6h18M3 12h18M3 18h18' />
          )}
        </svg>
      </button>

      {menuOpen && (
        <nav className='animate-fadeIn absolute top-full right-0 left-0 flex flex-col gap-[18px] bg-[#073A76] p-[22px] px-6 text-white shadow-lg md:hidden'>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className='text-[0.82rem] font-bold tracking-wider'
            >
              {item.label}
            </a>
          ))}
          <a
            href='#top'
            onClick={() => setMenuOpen(false)}
            className='inline-block w-fit rounded-[2px] border-[1.5px] border-white px-4 py-2 text-center text-[0.74rem] font-bold tracking-widest uppercase'
          >
            Bluecamp 2026
          </a>
        </nav>
      )}
    </header>
  );
}
