'use client';

import { Menu, MoveLeft } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import Button from '@/components/buttons/Button';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import { NAVBAR_LINKS } from '@/contents/layout';
import { cn } from '@/lib/utils';

function scrollToId(id: string, offset = 0) {
  const target = document.getElementById(id);
  if (!target) return;
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

export default function Navbar() {
  const [isShift, setIsShift] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // announcementHidden indicates whether the navbar should be positioned at top (true)
  // or below the announcement (false). It is derived from multiple sources:
  // - dismissed flag (localStorage)
  // - scroll position (scrolled past announcement)
  // - announcementForceHidden (explicit signal from HeaderAnnouncement that it is not visible)
  // Start with a server-safe default (announcement not hidden). We will
  // initialize the client-only persisted value inside useEffect after
  // mount to avoid hydration mismatch between server and client renders.
  const [announcementHidden, setAnnouncementHidden] =
    React.useState<boolean>(false);

  // announcementForceHidden tracks whether HeaderAnnouncement told us it is not visible
  // (for example because it's outside schedule window). We keep a ref to use in scroll handler closure.
  // Force-hidden state (HeaderAnnouncement signalled it's not visible).
  // Default to false on server; read persisted value on mount to avoid
  // hydration mismatch.
  const [announcementForceHidden, setAnnouncementForceHidden] =
    React.useState<boolean>(false);
  const announcementForceHiddenRef = React.useRef<boolean>(
    announcementForceHidden,
  );
  React.useEffect(() => {
    announcementForceHiddenRef.current = announcementForceHidden;
  }, [announcementForceHidden]);

  const checkAnnouncementVisibilityFromScroll = React.useCallback(() => {
    const scrollY = window.scrollY;
    return scrollY >= 80; // scrolled past announcement height
  }, []);
  // Throttle scroll handler with rAF to avoid layout thrashing / forced reflow warnings
  const rafRef = React.useRef<number | null>(null);
  const handleScroll = React.useCallback(() => {
    if (rafRef.current != null) return; // already scheduled
    rafRef.current = window.requestAnimationFrame(() => {
      try {
        const scrollY = window.scrollY;
        const shouldShift = scrollY >= 10;
        setIsShift((prev) => (prev !== shouldShift ? shouldShift : prev));

        // determine dismissal flag from localStorage each time (keeps in sync with outside events)
        let isDismissed = false;
        try {
          isDismissed =
            typeof window !== 'undefined' &&
            localStorage.getItem('announcement-dismissed') === 'true';
        } catch {
          isDismissed = false;
        }

        const scrolledPast = scrollY >= 80; // avoid extra layout read by reusing scrollY
        // combine all conditions so once announcement is force-hidden it stays hidden regardless of scroll
        const shouldHide =
          scrolledPast || isDismissed || announcementForceHiddenRef.current;
        setAnnouncementHidden(shouldHide);
      } finally {
        if (rafRef.current != null) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    });
  }, []);

  React.useEffect(() => {
    // On mount, read persisted announcement visibility/dismissal so we
    // can initialize the navbar position without causing a hydration
    // mismatch. This runs only on the client.
    try {
      const persisted = localStorage.getItem('announcement-visible');
      const forceHidden = persisted === 'false';
      setAnnouncementForceHidden(forceHidden);
      announcementForceHiddenRef.current = forceHidden;

      const isDismissed =
        localStorage.getItem('announcement-dismissed') === 'true';
      const scrolledPast = window.scrollY >= 80;
      const initialHidden = scrolledPast || isDismissed || forceHidden;
      setAnnouncementHidden(initialHidden);
    } catch {
      // ignore storage errors
    }

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Listen for announcement dismissed event
    const handleAnnouncementDismissed = () => {
      try {
        // mark dismissed in localStorage (HeaderAnnouncement also does this)
        localStorage.setItem('announcement-dismissed', 'true');
      } catch {
        // ignore
      }
      // when dismissed, always hide announcement area
      setAnnouncementHidden(true);
    };
    window.addEventListener(
      'announcement-dismissed',
      handleAnnouncementDismissed,
    );

    // Listen for announcement visibility updates (fired by HeaderAnnouncement)
    const handleAnnouncementVisibility = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail as
          | { visible: boolean }
          | undefined;
        const visible = detail?.visible ?? false;
        // If HeaderAnnouncement signals it's not visible (visible === false), persist this as a force-hide.
        const forceHidden = !visible;
        setAnnouncementForceHidden(forceHidden);
        announcementForceHiddenRef.current = forceHidden;

        // recompute final hidden flag taking into account scroll/dismissal/forceHidden
        const scrolledPast = checkAnnouncementVisibilityFromScroll();
        let isDismissed = false;
        try {
          isDismissed =
            typeof window !== 'undefined' &&
            localStorage.getItem('announcement-dismissed') === 'true';
        } catch {
          isDismissed = false;
        }
        const shouldHide = scrolledPast || isDismissed || forceHidden;
        setAnnouncementHidden(shouldHide);
      } catch {
        // ignore malformed events
      }
    };
    window.addEventListener(
      'announcement-visibility',
      handleAnnouncementVisibility,
    );

    // Initial check to set correct position on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener(
        'announcement-dismissed',
        handleAnnouncementDismissed,
      );
      window.removeEventListener(
        'announcement-visibility',
        handleAnnouncementVisibility,
      );
    };
  }, [handleScroll, checkAnnouncementVisibilityFromScroll]);

  function openSidebar() {
    setIsSidebarOpen(true);
  }
  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  const handleAnchorClick = (
    e: React.MouseEvent,
    target: string,
    offset?: number,
  ) => {
    e.preventDefault();
    closeSidebar();
    scrollToId(target, offset);
  };

  return (
    <header
      className={cn(
        'fixed z-[100] w-full transition-all duration-200 ease-in-out',
        // When announcement is hidden we place navbar at top, otherwise below announcement height
        announcementHidden ? 'top-0' : 'top-[52px]',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between px-6 py-5.5 min-lg:px-24',
          'transition-colors duration-150',
          isShift && 'bg-black shadow-sm backdrop-blur',
        )}
      >
        <a
          href='#home'
          aria-label='Kembali ke beranda HMTC ITS'
          className='relative h-13 w-28 cursor-pointer'
          tabIndex={0}
          onClick={(e) => handleAnchorClick(e, 'home', 0)}
        >
          {/* <NextImage
            src='logo-hmtc2025-navbar.png'
            alt='Logo HMTC ITS 2025'
            width={100}
            height={20}
            priority
            quality={80}
            className='w-full'
          /> */}
          <span className='flex h-full items-center align-middle font-libre-baskerville text-white-main'>
            NIAT
            <span className='italic'>
              BA<span className='text-blue-500'>I</span>K
            </span>
          </span>
        </a>

        <Button
          icon={Menu}
          aria-label='Buka navigasi'
          className='ml-auto min-lg:hidden'
          onClick={openSidebar}
        />

        <nav className='hidden items-center gap-6 min-lg:flex'>
          {NAVBAR_LINKS.map(({ id, name, href, offset }) =>
            href.startsWith('#') ? (
              <a
                key={id}
                href={href}
                aria-label={`Scroll ke ${name}`}
                className='font-secondary hover:text-base-nav cursor-pointer p-2.5 text-white-main transition-colors duration-75'
                tabIndex={0}
                onClick={(e) =>
                  handleAnchorClick(e, href.replace('#', ''), offset)
                }
              >
                <Typography font='satoshi'>{name}</Typography>
              </a>
            ) : (
              <Link
                key={id}
                href={href}
                aria-label={`Menuju halaman ${name}`}
                className='font-secondary hover:text-base-nav cursor-pointer p-2.5 text-white-main transition-colors duration-75'
              >
                <Typography font='satoshi'>{name}</Typography>
              </Link>
            ),
          )}
        </nav>
      </div>

      <nav
        aria-label='Navigasi seluler'
        className={cn(
          'fixed inset-0 grid h-full w-full grid-rows-2 bg-black-main text-white transition-transform duration-200 ease-in-out min-lg:hidden',
          isSidebarOpen
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0',
        )}
      >
        <div className='z-10 flex flex-col items-center gap-14 px-4 py-24'>
          <a
            href='#home'
            aria-label='Kembali ke beranda HMTC ITS'
            className='w-32'
            onClick={(e) => handleAnchorClick(e, 'home')}
            tabIndex={0}
          >
            <NextImage
              src='logo-hmtc2025-navbar.png'
              alt='Logo HMTC ITS 2025'
              width={128}
              height={34}
              priority
              quality={80}
              className='h-full w-full'
            />
          </a>

          <div className='flex flex-col items-center gap-8'>
            {NAVBAR_LINKS.map(({ id, name, href, offset }) =>
              href.startsWith('#') ? (
                <a
                  key={id}
                  href={href}
                  aria-label={`Scroll ke ${name}`}
                  className='text-base-white cursor-pointer'
                  onClick={(e) =>
                    handleAnchorClick(e, href.replace('#', ''), offset)
                  }
                  tabIndex={0}
                >
                  <Typography as='h6' font='satoshi'>
                    {name}
                  </Typography>
                </a>
              ) : (
                <Link
                  key={id}
                  href={href}
                  className='text-base-white cursor-pointer'
                  aria-label={`Menuju halaman ${name}`}
                  onClick={closeSidebar}
                >
                  <Typography as='h6' font='satoshi'>
                    {name}
                  </Typography>
                </Link>
              ),
            )}
          </div>
        </div>

        <div className='flex flex-col items-center justify-end gap-0 pt-32'>
          <Button
            size='large'
            icon={MoveLeft}
            aria-label='Tutup navigasi'
            className='z-10 rounded-md bg-white text-xl font-bold text-black-main transition-colors hover:bg-gray-200'
            onClick={closeSidebar}
          />
          <div className='relative h-1/2' />
        </div>
      </nav>
    </header>
  );
}
