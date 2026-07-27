import Image from 'next/image';
import { useState } from 'react';

const footerData = [
  {
    title: 'HMTC',
    links: [
      { name: 'Beranda', link: '/' },
      {
        name: 'Academic Resources', link: '/student-welfare/academic-resources',
      },
      { name: 'Info', link: '/info' },
    ],
  },
  {
    title: 'Program Kerja',
    links: [
      { name: 'Syukuran Wisuda', link: '/internal-affairs/syukuran-wisudawan' },
      { name: 'Video Tutorial', link: '/student-welfare/academic-resources' },
      { name: 'Seminar Dosen', link: '/research-and-technology/seminar-dosen' },
      { name: 'Bluecamp', link: '#top' },
      { name: 'TCharity Run', link: '/student-social-development/tcharity-run' },
    ],
  },
  {
    title: 'Bluecamp',
    links: [
      { name: 'Tentang', link: '#tentang' },
      { name: 'Dokumentasi', link: '#dokumentasi' },
      { name: 'Detail Program', link: '#program' },
      { name: 'Feedback', link: '#feedback' },
    ],
  },
];

export default function Footer() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  return (
    <footer className='relative overflow-hidden bg-gradient-to-br from-[#0d4ea0] via-[#073a76] to-[#062b56] pt-20 pb-[30px] text-white'>
      <div className='absolute top-[-30px] right-[-40px] h-[260px] w-[260px] bg-white/5 [clip-path:polygon(0_0,100%_0,100%_100%)]'></div>

      <div className='relative z-10 mx-auto max-w-[1180px] px-6 md:px-8'>
        <div className='flex flex-wrap items-end justify-between gap-10 border-b border-white/16 pb-[48px]'>
          <div className='bc'>
            <Image
              src='/images/research-and-technology/bluecamp/logo-bluecamp-white.svg'
              alt='Logo Bluecamp 2026'
              width={240}
              height={96}
              priority
            />
            <div className='mt-[18px] text-[1.7rem] font-bold tracking-tight'>
              #BlueCamp
            </div>
            <div className='mt-0.5 text-[0.95rem] text-[#bcd3f0]'>
              Research and Technology
            </div>
          </div>

          <div className='flex w-full flex-wrap gap-14 md:w-auto'>
            {footerData.map((item, index) => (
              <div key={item.title} className='flex w-full flex-col md:w-auto'>
                <button
                  onClick={() =>
                    setActiveMenu(activeMenu === index ? null : index)
                  }
                  className='flex items-center justify-between text-left md:pointer-events-none'
                >
                  <div className='mb-3.5 text-[0.7rem] font-bold tracking-widest text-[#7fa6da] uppercase'>
                    {item.title}
                  </div>
                  <span className='text-[#7fa6da] md:hidden'>
                    {activeMenu === index ? '-' : '+'}
                  </span>
                </button>

                <div
                  className={`${
                    activeMenu === index ? 'flex' : 'hidden'
                  } flex-col md:flex`}
                >
                  {item.links.map((link) => (
                    <a
                      key={link.name}
                      href={link.link}
                      className='mb-2 text-[0.92rem] text-[#dce8f8] opacity-90 transition-all hover:text-[#FFC466] hover:opacity-100'
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='flex flex-wrap items-center justify-between gap-4 pt-[30px] text-[0.82rem] text-[#a0c2ed]'>
          <span>
            © 2026 Bluecamp · HMTC ITS. Seluruh dokumentasi merupakan bagian
            dari kegiatan keilmiahan.
          </span>

          <a
            className='site-link flex items-center gap-2'
            href='https://hmtc-its.com/info'
            target='_blank'
            rel='noopener noreferrer'
          >
            <svg
              className='h-4 w-4'
              viewBox='0 0 24 24'
              fill='none'
              stroke='#ffb23a'
              strokeWidth='2'
            >
              <circle cx='12' cy='12' r='9'></circle>
              <path d='M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18'></path>
            </svg>
            <p className='font-semibold text-[#dce8f8]'>hmtc-its.com/info</p>
          </a>
        </div>
      </div>
    </footer>
  );
}

