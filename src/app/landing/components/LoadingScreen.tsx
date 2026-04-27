'use client';

import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Timing constants (seconds unless noted)
const WIPE_DELAY        = 0.3;
const WIPE_DURATION     = 1.4;
const REVEAL_DELAY      = 1.05; // logo appears
const REVEAL_DURATION   = 0.55;
const PERCENT_DURATION  = 2.0;  // 0→100 count — starts immediately, finishes before dismiss
const DISMISS_AFTER_MS  = 2450; // ms before exit animation
const EXIT_DURATION     = 0.35;

interface Props {
  onComplete?: () => void;
}

export default function LoadingScreen({ onComplete }: Props) {
  const [show, setShow] = useState(true);

  const progress = useMotionValue(0);
  const displayPercent = useTransform(progress, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    // Count starts immediately so the number is ticking from the very first frame
    animate(progress, 100, {
      duration: PERCENT_DURATION,
      ease: [0.22, 1, 0.36, 1],
    });

    const dismiss = setTimeout(() => setShow(false), DISMISS_AFTER_MS);

    return () => {
      clearTimeout(dismiss);
    };
  }, [progress]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {show && (
        <motion.div
          key='loading-screen'
          className='fixed inset-0 z-[9999] flex items-center justify-center bg-white'
          exit={{ opacity: 0 }}
          transition={{ duration: EXIT_DURATION, ease: 'easeIn' }}
        >
          {/* ── Black wipe: grows left → right ─────────────────────── */}
          <motion.div
            className='absolute inset-0 bg-black'
            style={{ originX: 0 }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: WIPE_DURATION,
              delay: WIPE_DELAY,
              ease: [0.76, 0, 0.24, 1],
            }}
          />

          {/* ── Centred column: logo + percent ─────────────────────── */}
          <div className='relative z-10 flex flex-col items-center gap-6'>
            {/* Logo — fades in once black covers the centre */}
            <motion.div
              className='flex h-[120px] w-[120px] items-center justify-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: REVEAL_DURATION,
                delay: REVEAL_DELAY,
                ease: 'easeOut',
              }}
            >
              <Image
                src='/images/logo-hmtc-2026.svg'
                alt='Logo HMTC 2026'
                width={120}
                height={120}
                priority
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </motion.div>

            {/* Percent */}
            <motion.span
              className='text-[#0078B4] font-plus-jakarta-sans text-3xl font-bold tracking-[0.15em]'
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {displayPercent}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
