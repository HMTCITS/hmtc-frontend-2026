'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Loading from '@/components/Loading';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';
import { useSchedule } from '@/hooks/api/useSchedule';
import debug from '@/lib/debugLogger';

/**
 * ComingSoon page
 *
 * Reorganized for readability and single responsibility:
 * - Small helpers grouped at top
 * - Stable, memoized LogoGraphic to prevent repeated image re-fetches
 * - Encapsulated fresh schedule probe logic with clear intent
 * - Clear redirect decision flow preserved exactly as original
 *
 * Behavior preserved: schedule polling, fresh probes, redirect after brief delay
 * when schedule becomes active, status texts (upcoming/open/closed), and UI.
 */

/* -------------------------
   Types & Constants
   ------------------------- */

type PageKey = 'ayomeludaftarmagang' | 'hidden-page-cf' | string;
const COUNT_LABELS = ['Hari', 'Jam', 'Menit', 'Detik'] as const;
const MIN_FRESH_CHECK_INTERVAL_MS = 1200;
const FRESH_SERVER_DRIFT_MS = 15_000;
const REDIRECT_WAIT_MS = 2500;

/* -------------------------
   Utilities
   ------------------------- */

function breakdownTime(ms: number | null) {
  if (ms == null) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

/* -------------------------
   Stable Logo (memoized)
   ------------------------- */

const LOGO_PROPS = {
  src: '/logo-hmtc2025-footer.png',
  alt: 'HMTC Logo',
  width: 171,
  height: 492,
} as const;

const LogoGraphic = React.memo(function LogoGraphic({
  className,
}: {
  className?: string;
}) {
  return <NextImage {...LOGO_PROPS} className={className} />;
});
LogoGraphic.displayName = 'LogoGraphic';

/* -------------------------
   Component
   ------------------------- */

function ComingSoonContent() {
  // routing / query
  const search = useSearchParams();
  const router = useRouter();
  const page = (search?.get('page') || '') as PageKey;
  const showCountdown =
    page === 'ayomeludaftarmagang' || page === 'hidden-page-cf';

  // choose which schedule path to poll
  const schedulePath = useMemo(
    () =>
      page === 'hidden-page-cf' ? '/hidden-page-cf' : '/ayomeludaftarmagang',
    [page],
  );

  // schedule polling hook (external)
  const { data: scheduleData, now, loading } = useSchedule(schedulePath, 7000);

  // -- Fresh probe state & refs --
  const [freshScheduleOk, setFreshScheduleOk] = useState(false);
  const freshCheckAbortRef = useRef<AbortController | null>(null);
  const lastFreshCheckRef = useRef<number>(0);

  // Run a single fresh schedule check that bypasses caches. Throttled to MIN_FRESH_CHECK_INTERVAL_MS.
  const runFreshScheduleCheck = useCallback(async () => {
    const nowTs = Date.now();
    if (nowTs - (lastFreshCheckRef.current || 0) < MIN_FRESH_CHECK_INTERVAL_MS)
      return;
    lastFreshCheckRef.current = nowTs;

    // abort previous probe if any
    if (freshCheckAbortRef.current) {
      try {
        freshCheckAbortRef.current.abort();
      } catch {
        /* ignore */
      }
      freshCheckAbortRef.current = null;
    }

    const ac = new AbortController();
    freshCheckAbortRef.current = ac;

    try {
      const url = new URL('/api/schedule', window.location.origin);
      url.searchParams.set('path', schedulePath);
      url.searchParams.set('_ts', String(Date.now()));
      debug.group('[coming-soon] freshScheduleCheck ->', url.toString());

      const res = await fetch(url.toString(), {
        signal: ac.signal,
        cache: 'no-store',
      });
      if (!res.ok) {
        debug.log('[coming-soon] freshScheduleCheck non-ok', res.status);
        setFreshScheduleOk(false);
        debug.groupEnd();
        return;
      }

      const json = await res.json().catch(() => null);
      debug.log('[coming-soon] freshScheduleCheck result', json);

      const serverNowIso = json?.now;
      let serverNowFresh = false;
      if (serverNowIso) {
        try {
          const serverNowMs = new Date(serverNowIso).getTime();
          const drift = Math.abs(Date.now() - serverNowMs);
          serverNowFresh = drift <= FRESH_SERVER_DRIFT_MS;
        } catch {
          serverNowFresh = false;
        }
      }

      setFreshScheduleOk(
        Boolean(json && typeof json.active === 'boolean' && serverNowFresh),
      );
    } catch (err: any) {
      if (err && (err.name === 'AbortError' || err.code === 'ERR_ABORTED')) {
        debug.info('[coming-soon] freshScheduleCheck aborted (normal)');
      } else {
        debug.log('[coming-soon] freshScheduleCheck error', err);
        setFreshScheduleOk(false);
      }
    } finally {
      debug.groupEnd();
    }
  }, [schedulePath]);

  // run an initial fresh probe on mount & clean up abort on unmount
  useEffect(() => {
    if (typeof window !== 'undefined') void runFreshScheduleCheck();
    return () => {
      if (freshCheckAbortRef.current) {
        try {
          freshCheckAbortRef.current.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, [runFreshScheduleCheck]);

  // also probe on page show (bfcache restore)
  useEffect(() => {
    const onPageShow = (ev: PageTransitionEvent) => {
      debug.log(
        '[coming-soon] pageshow event. persisted=',
        (ev as any)?.persisted,
      );
      void runFreshScheduleCheck();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [runFreshScheduleCheck]);

  // compute time until start/end from scheduleData & now
  const timeUntilStart = useMemo(() => {
    if (!scheduleData?.start || !now) return null;
    try {
      const start = new Date(scheduleData.start).getTime();
      const n = now.getTime();
      return Math.max(0, start - n);
    } catch {
      return null;
    }
  }, [scheduleData?.start, now]);

  // trigger additional fresh probe when near start or when scheduleData.active is true
  useEffect(() => {
    const nearStart = timeUntilStart !== null && timeUntilStart <= 15_000;
    const shouldProbe = scheduleData?.active === true || nearStart;
    if (shouldProbe) {
      void runFreshScheduleCheck();
    }
  }, [scheduleData?.active, timeUntilStart, runFreshScheduleCheck]);

  // determine page status: upcoming / open / closed / unknown
  const pageStatus = useMemo<'upcoming' | 'open' | 'closed' | 'unknown'>(() => {
    if (!showCountdown) return 'unknown';
    try {
      const startMs = scheduleData?.start
        ? new Date(scheduleData.start).getTime()
        : null;
      const endMs = scheduleData?.end
        ? new Date(scheduleData.end).getTime()
        : null;
      const nowMs = now?.getTime();

      if (endMs !== null && nowMs !== undefined && nowMs > endMs)
        return 'closed';

      if (
        (startMs !== null &&
          endMs !== null &&
          nowMs !== undefined &&
          nowMs >= startMs &&
          nowMs <= endMs) ||
        scheduleData?.active === true
      ) {
        return 'open';
      }

      if (startMs !== null && nowMs !== undefined && nowMs < startMs)
        return 'upcoming';

      return 'unknown';
    } catch {
      return 'unknown';
    }
  }, [scheduleData, now, showCountdown]);

  // redirect logic: wait a short amount (REDIRECT_WAIT_MS) so user sees coming-soon UI briefly,
  // then redirect only if fresh checks confirm server time and active window membership.
  useEffect(() => {
    if (!showCountdown) return;

    const serverNowIso = scheduleData?.now;
    let serverNowFresh = false;
    if (serverNowIso) {
      try {
        const serverNowMs = new Date(serverNowIso).getTime();
        const drift = Math.abs(Date.now() - serverNowMs);
        serverNowFresh = drift <= FRESH_SERVER_DRIFT_MS;
      } catch {
        serverNowFresh = false;
      }
    }

    // determine whether server-reported now is inside the window
    let withinWindow = false;
    try {
      if (scheduleData?.start && scheduleData?.end && scheduleData?.now) {
        const s = new Date(scheduleData.start).getTime();
        const e = new Date(scheduleData.end).getTime();
        const serverNowMs = new Date(scheduleData.now).getTime();
        withinWindow = serverNowMs >= s && serverNowMs <= e;
      }
    } catch {
      withinWindow = false;
    }

    const shouldConsiderRedirect =
      (scheduleData?.active === true ||
        (timeUntilStart === 0 && withinWindow)) &&
      serverNowFresh &&
      freshScheduleOk;

    if (!shouldConsiderRedirect) return;

    const id = window.setTimeout(() => {
      // Re-evaluate before redirecting
      let reWithinWindow = false;
      try {
        if (scheduleData?.start && scheduleData?.end && scheduleData?.now) {
          const s = new Date(scheduleData.start).getTime();
          const e = new Date(scheduleData.end).getTime();
          const serverNowMs = new Date(scheduleData.now).getTime();
          reWithinWindow = serverNowMs >= s && serverNowMs <= e;
        }
      } catch {
        reWithinWindow = false;
      }

      if (
        (scheduleData?.active === true ||
          (timeUntilStart === 0 && reWithinWindow)) &&
        serverNowFresh &&
        freshScheduleOk
      ) {
        debug.group('[coming-soon] Redirect decision');
        debug.log('page', page);
        debug.log('scheduleData', scheduleData);
        debug.log('timeUntilStart', timeUntilStart);
        debug.log('serverNowFresh', serverNowFresh);
        debug.log('freshScheduleOk', freshScheduleOk);
        debug.groupEnd();
        if (page === 'hidden-page-cf') router.replace('/hidden-page-cf');
        else router.replace('/ayomeludaftarmagang');
      }
    }, REDIRECT_WAIT_MS);

    return () => window.clearTimeout(id);
  }, [
    scheduleData,
    timeUntilStart,
    page,
    router,
    showCountdown,
    freshScheduleOk,
  ]);

  // countdown numbers prepared
  const { days, hours, minutes, seconds } = useMemo(
    () => breakdownTime(timeUntilStart),
    [timeUntilStart],
  );

  // title & subtitle selection
  const { titleText, subtitleText } = useMemo(() => {
    if (!showCountdown)
      return {
        titleText: 'Coming Soon',
        subtitleText: 'This page is still under development. Stay tuned!',
      };

    switch (pageStatus) {
      case 'upcoming':
        return {
          titleText: 'Sek Yo Rek . . .',
          subtitleText: 'Pendaftaran akan dibuka dalam:',
        };
      case 'open':
        return {
          titleText: 'Wes dibuka rek',
          subtitleText: 'Pendaftaran telah dibuka',
        };
      case 'closed':
        return {
          titleText: 'Wes ditutup rek',
          subtitleText: 'Pendaftaran telah ditutup',
        };
      default:
        return {
          titleText: 'Sek Yo Rek . . .',
          subtitleText: 'Pendaftaran akan dibuka dalam:',
        };
    }
  }, [pageStatus, showCountdown]);

  // --- Render: non-countdown default UI
  if (!showCountdown) {
    return (
      <main className='flex min-h-screen w-full flex-col items-center justify-center bg-[#201F1F] px-6 py-10 text-center text-white sm:px-8 md:px-12 lg:px-16'>
        <LogoGraphic className='absolute opacity-30' />
        <div className='flex flex-col items-center space-y-4 sm:space-y-6'>
          <Typography
            as='h1'
            variant='k0'
            font='libre'
            className='bg-blue-gradient bg-clip-text text-5xl leading-tight font-bold text-transparent italic sm:text-7xl md:text-[80px] lg:text-[110px] xl:text-[140px]'
          >
            Coming Soon
          </Typography>
          <Typography
            as='p'
            variant='b1'
            font='adelphe'
            className='text-base sm:text-lg md:text-xl lg:text-2xl'
          >
            This page is still under development. Stay tuned!
          </Typography>
          <Link
            href='/'
            aria-label='Back to home'
            className='mt-2 border-b border-b-white font-satoshi text-sm font-medium transition-colors duration-150 hover:text-gray-400 sm:text-base lg:text-lg'
          >
            &larr; Go back
          </Link>
        </div>
      </main>
    );
  }

  // --- Render: countdown / schedule UI ---
  return (
    <main className='relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0e0e10] via-[#16161a] to-[#1e1e22] px-4 py-10 text-white sm:px-6 md:px-10 lg:px-14 xl:px-20'>
      <div className='absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-[140px] sm:h-[500px] sm:w-[500px] md:h-[600px] md:w-[600px]' />
      </div>

      <LogoGraphic className='mb-6 opacity-30 sm:mb-8 sm:w-[130px]' />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className='flex flex-col items-center text-center'
      >
        <Typography
          as='h1'
          variant='k0'
          font='libre'
          className='bg-gradient-to-r from-[#33ccff] via-[#66ffcc] to-[#3399ff] bg-clip-text text-5xl font-bold text-transparent italic drop-shadow-[0_0_20px_rgba(51,204,255,0.25)] sm:text-6xl md:text-7xl lg:text-[90px] xl:text-[120px]'
        >
          {titleText}
        </Typography>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className='mt-8 flex flex-col items-center gap-6 sm:gap-8 md:gap-10'
        >
          <Typography
            as='p'
            variant='b2'
            font='satoshi'
            className='text-base text-gray-300 sm:text-lg md:text-xl'
          >
            {loading ? 'Memuat jadwal...' : subtitleText}
          </Typography>

          <div
            role='status'
            aria-live='polite'
            className='flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6'
          >
            {COUNT_LABELS.map((label, i) => {
              const values = [days, hours, minutes, seconds];
              const displayValue = loading
                ? '--'
                : pageStatus === 'upcoming'
                  ? String(values[i]).padStart(2, '0')
                  : '00';
              return (
                <motion.div
                  key={label}
                  whileHover={{ scale: 1.05 }}
                  className='flex min-w-[70px] flex-col items-center rounded-xl bg-white/10 px-3 py-2 shadow-md backdrop-blur-sm sm:min-w-[80px] sm:px-4 sm:py-3 md:min-w-[90px] lg:min-w-[100px]'
                >
                  <span className='font-mono text-2xl font-bold sm:text-3xl md:text-4xl'>
                    {displayValue}
                  </span>
                  <span className='mt-1 text-[10px] tracking-wider text-gray-400 uppercase sm:text-xs md:text-sm'>
                    {label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function ComingSoon() {
  return (
    <Suspense fallback={<Loading />}>
      <ComingSoonContent />
    </Suspense>
  );
}
