'use client';

import { ArrowUpRight, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import Button from '@/components/buttons/Button';
import Typography from '@/components/Typography';
import {
  ANNOUNCEMENT_CONFIG,
  isAnnouncementTimeValid,
} from '@/contents/announcement';
import { useSchedule } from '@/hooks/api/useSchedule';
import { cn } from '@/lib/utils';

/**
 * HeaderAnnouncement
 *
 * - Always runs the same hooks in the same order (no early returns).
 * - Emits a stable custom event 'announcement-visibility' whenever the
 *   announcement's computed visibility changes so outer components (e.g. Navbar)
 *   can react without coupling to internal logic.
 *
 * Rendering:
 * - The component always returns a wrapper <div>. When the announcement should
 *   be hidden we render it with display:none and aria-hidden so React's hook
 *   order never changes between renders.
 */

export function useAnnouncementState() {
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    try {
      const dismissed =
        typeof window !== 'undefined' &&
        localStorage.getItem('announcement-dismissed') === 'true';
      setIsDismissed(dismissed);
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const dismissAnnouncement = React.useCallback(() => {
    setIsDismissed(true);
    try {
      localStorage.setItem('announcement-dismissed', 'true');
      window.dispatchEvent(new CustomEvent('announcement-dismissed'));
    } catch {
      // ignore
    }
  }, []);

  const handleScroll = React.useCallback(() => {
    const shouldHide = typeof window !== 'undefined' && window.scrollY >= 80;
    setIsScrolled(shouldHide);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const isTimeValid = isAnnouncementTimeValid();
  const isAnnouncementVisible =
    ANNOUNCEMENT_CONFIG.isActive && isTimeValid && !isDismissed && !isScrolled;

  return {
    isAnnouncementVisible,
    isDismissed,
    isScrolled,
    isTimeValid,
    dismissAnnouncement,
  };
}

type HeaderAnnouncementProps = { active?: boolean };

export default function HeaderAnnouncement({
  active,
}: HeaderAnnouncementProps) {
  // UI state hook (always run)
  const { dismissAnnouncement, isAnnouncementVisible } = useAnnouncementState();

  // Schedule hook (always run)
  const {
    data: scheduleData,
    now,
    loading: _scheduleLoading,
  } = useSchedule('/ayomeludaftarmagang', 7000);

  // Compute derived schedule state (always run)
  const scheduleActive =
    typeof active === 'boolean' ? active : (scheduleData?.active ?? true);
  const isLoading = Boolean(_scheduleLoading);

  const timeUntilStart = React.useMemo(() => {
    if (!scheduleData?.start || !now) return null;
    try {
      const start = new Date(scheduleData.start).getTime();
      const n = now.getTime();
      return Math.max(0, start - n);
    } catch {
      return null;
    }
  }, [scheduleData?.start, now]);

  const _timeUntilEnd = React.useMemo(() => {
    if (!scheduleData?.end || !now) return null;
    try {
      const end = new Date(scheduleData.end).getTime();
      const n = now.getTime();
      return Math.max(0, end - n);
    } catch {
      return null;
    }
  }, [scheduleData?.end, now]);

  const isClosed = React.useMemo(() => {
    if (!scheduleData?.end || !now) return false;
    try {
      const endMs = new Date(scheduleData.end).getTime();
      const nowMs = now.getTime();
      return nowMs > endMs;
    } catch {
      return false;
    }
  }, [scheduleData?.end, now]);

  // Format remaining helper (stable)
  const formatRemaining = React.useCallback((ms: number | null) => {
    if (ms == null) return '';
    const total = Math.floor(ms / 1000);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (days > 0)
      return `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, []);

  const isCountdownFinished = timeUntilStart === 0;
  const effectiveActive = scheduleActive || isCountdownFinished;

  // ----- Emit announcement-visibility event so Navbar or other consumers can react -----
  React.useEffect(() => {
    try {
      const ev = new CustomEvent('announcement-visibility', {
        detail: { visible: isAnnouncementVisible && !isClosed },
      });
      // Persist visibility briefly so consumers that mount after this effect
      // can still read the initial state (avoids race where Navbar mounts
      // after HeaderAnnouncement already dispatched the event).
      try {
        localStorage.setItem(
          'announcement-visible',
          String(Boolean(isAnnouncementVisible && !isClosed)),
        );
      } catch {
        // ignore storage errors
      }
      window.dispatchEvent(ev);
    } catch {
      // ignore
    }
  }, [isAnnouncementVisible, isClosed]);

  // We avoid early returns: always render a container so hooks order is stable.
  // If announcement is not visible or closed, we hide it with display:none and aria-hidden.
  const shouldShow = isAnnouncementVisible && !isClosed;

  return (
    <div
      // keep the wrapper always present to ensure consistent hook order across renders
      className={cn(
        'relative z-[110] w-full transition-transform duration-300 ease-in-out',
        ANNOUNCEMENT_CONFIG.backgroundColor,
        ANNOUNCEMENT_CONFIG.textColor,
      )}
      role='region'
      aria-label='Pengumuman HMTC'
      aria-hidden={!shouldShow}
      style={{ display: shouldShow ? undefined : 'none' }}
    >
      <div className='mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-3 sm:px-6 md:px-8'>
        <div className='flex min-w-0 items-center gap-4'>
          <Typography
            as='p'
            font='satoshi'
            className='truncate text-sm leading-snug font-medium sm:text-base'
          >
            {isLoading
              ? `${ANNOUNCEMENT_CONFIG.message} — Memuat...`
              : effectiveActive
                ? `${ANNOUNCEMENT_CONFIG.message} — Akan Dimulai!`
                : `${ANNOUNCEMENT_CONFIG.message} — Sudah Selesai`}
          </Typography>
        </div>

        <div className='flex items-center gap-3'>
          {!effectiveActive ? (
            <div
              className='flex items-center rounded-md bg-white/8 px-3 py-1 font-plus-jakarta-sans text-xs sm:text-sm'
              role='status'
              aria-live='polite'
            >
              {isLoading
                ? 'Memuat...'
                : timeUntilStart != null
                  ? formatRemaining(timeUntilStart)
                  : '--:--:--'}
            </div>
          ) : (
            !isLoading &&
            ANNOUNCEMENT_CONFIG.actionText &&
            ANNOUNCEMENT_CONFIG.actionUrl && (
              <Link
                href={ANNOUNCEMENT_CONFIG.actionUrl}
                aria-label={ANNOUNCEMENT_CONFIG.actionText}
              >
                <Button className='rounded-md bg-white/90 text-primary px-3 py-1 text-sm font-plus-jakarta-sans font-semibold transition-colors hover:bg-white/60' leftIcon={ArrowUpRight} >
                  {ANNOUNCEMENT_CONFIG.actionText}
                </Button>
              </Link>
            )
          )}

          {ANNOUNCEMENT_CONFIG.dismissible && (
            <button
              onClick={dismissAnnouncement}
              aria-label='Tutup pengumuman'
              title='Tutup pengumuman'
              className='-mr-1 rounded p-1 text-current hover:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none'
            >
              <X className='h-4 w-4' aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
