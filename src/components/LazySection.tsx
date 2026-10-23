'use client';

import React, { useEffect, useRef, useState } from 'react';

import Loading from '@/components/Loading';

type LazySectionProps = {
  children: React.ReactNode;
  /**
   * Fallback element while waiting (skeleton, spinner, etc).
   * Default: <div style={{height: 300}} />
   */
  fallback?: React.ReactNode;
  /**
   * Once: only fire once and keep visible, or allow hide/show.
   * Default: true
   */
  once?: boolean;
  /**
   * IntersectionObserver threshold
   * Default: 0.15 (15% visible triggers)
   */
  threshold?: number;
  /** Start loading before the section enters the viewport. */
  rootMargin?: string;
  /**
   * Callback when section first becomes visible
   */
  onVisible?: () => void;
  /**
   * Set true to disable lazy and always show (SSR safety)
   */
  forceVisible?: boolean;
  /**
   * Optional height placeholder (number in px, or string CSS)
   */
  skeletonHeight?: number | string;
  /**
   * Optional className for outer wrapper
   */
  className?: string;
  id?: string;
};

const DEFAULT_HEIGHT = 300;

const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  once = true,
  threshold = 0.15,
  rootMargin = '0px',
  onVisible,
  forceVisible = false,
  skeletonHeight,
  className,
  id,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(forceVisible);

  useEffect(() => {
    if (forceVisible) {
      setVisible(true);
      return;
    }
    if (
      typeof window === 'undefined' ||
      !ref.current ||
      !('IntersectionObserver' in window)
    ) {
      setVisible(true);
      return;
    }
    let triggered = false;
    const io = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          onVisible?.();
          if (once) {
            triggered = true;
            io.disconnect();
          }
        } else if (!once && !triggered) {
          setVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold, rootMargin, once, forceVisible, onVisible]);

  const Skeleton = fallback ?? (
    <div
      style={{
        height:
          typeof skeletonHeight === 'number'
            ? `${skeletonHeight}px`
            : (skeletonHeight ?? `${DEFAULT_HEIGHT}px`),
        background:
          'linear-gradient(90deg,#f3f3f3 25%,#ececec 37%,#f3f3f3 63%)',
        borderRadius: 12,
      }}
      aria-busy='true'
      aria-live='polite'
    />
  );

  return (
    <div ref={ref} id={id || ''} className={className} style={{ minHeight: 0 }}>
      {visible ? (
        <React.Suspense fallback={<Loading />}>{children}</React.Suspense>
      ) : (
        Skeleton
      )}
    </div>
  );
};

export default LazySection;
