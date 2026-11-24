/**
 * HMTC CMS — in-memory rate limits for `/api/cms/*`.
 *
 *  - Login: 5 failed attempts per 10 min per client IP + email. Counted before
 *    Directus is called; a successful login clears the bucket.
 *  - Preview links: 20 mints per user per hour. Each mint may write an
 *    immutable revision row, so unlimited minting would grow
 *    `cms_page_revisions` without bound.
 *
 * In-memory is enough because each environment runs one container (see the
 * deployment section of docs/hmtc-cms-integration-plan.md). Keys are hashed so
 * emails and user ids are not held in memory in clear text.
 *
 * Over the limit, the `assert*` functions throw `CmsError('rate_limited')`,
 * which `defineCmsRoute` turns into a 429.
 *
 * Server-only.
 */
import 'server-only';

import { createHash } from 'node:crypto';

import { CmsError } from '@/lib/cms/errors';

/* ------------------------------------------------- Fixed-window counter */

type Bucket = { count: number; windowStart: number };

export type FixedWindowLimiter = {
  /** True when the key has reached the limit in its current window. */
  isLimited(key: string, now?: number): boolean;
  /** Count one event against the key. */
  hit(key: string, now?: number): void;
  /** Forget the key. */
  reset(key: string): void;
  /** Forget every key. */
  clear(): void;
};

export function createFixedWindowLimiter(
  max: number,
  windowMs: number,
): FixedWindowLimiter {
  const buckets = new Map<string, Bucket>();
  const hashKey = (key: string) =>
    createHash('sha256').update(key).digest('hex');

  function liveBucket(hashed: string, now: number): Bucket | null {
    const bucket = buckets.get(hashed);
    if (!bucket) return null;
    if (now - bucket.windowStart >= windowMs) {
      buckets.delete(hashed);
      return null;
    }
    return bucket;
  }

  return {
    isLimited(key, now = Date.now()) {
      const bucket = liveBucket(hashKey(key), now);
      return bucket !== null && bucket.count >= max;
    },
    hit(key, now = Date.now()) {
      const hashed = hashKey(key);
      const bucket = liveBucket(hashed, now) ?? { count: 0, windowStart: now };
      bucket.count += 1;
      buckets.set(hashed, bucket);
    },
    reset(key) {
      buckets.delete(hashKey(key));
    },
    clear() {
      buckets.clear();
    },
  };
}

/* ------------------------------------------------------------------ Login */

export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_WINDOW_MS = 10 * 60 * 1000;

const loginLimiter = createFixedWindowLimiter(
  LOGIN_MAX_FAILURES,
  LOGIN_WINDOW_MS,
);

/** First `X-Forwarded-For` hop (set by Caddy), then `X-Real-IP`. */
export function clientIp(request: Request): string {
  const forwarded = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

function loginKey(request: Request, email: string): string {
  return `${clientIp(request)}|${email.trim().toLowerCase()}`;
}

/** Throws 429 before Directus is called. */
export function assertLoginAllowed(request: Request, email: string): void {
  if (loginLimiter.isLimited(loginKey(request, email))) {
    throw new CmsError(
      'rate_limited',
      'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
    );
  }
}

export function recordLoginFailure(request: Request, email: string): void {
  loginLimiter.hit(loginKey(request, email));
}

export function resetLoginFailures(request: Request, email: string): void {
  loginLimiter.reset(loginKey(request, email));
}

/* ---------------------------------------------------------- Preview mint */

export const PREVIEW_MINT_MAX = 20;
export const PREVIEW_MINT_WINDOW_MS = 60 * 60 * 1000;

const previewMintLimiter = createFixedWindowLimiter(
  PREVIEW_MINT_MAX,
  PREVIEW_MINT_WINDOW_MS,
);

/** Throws 429 before anything is written. */
export function assertPreviewMintAllowed(userId: string): void {
  if (previewMintLimiter.isLimited(userId)) {
    throw new CmsError(
      'rate_limited',
      'Terlalu banyak tautan pratinjau dibuat. Coba lagi nanti.',
    );
  }
}

/** Count a successful mint. */
export function recordPreviewMint(userId: string): void {
  previewMintLimiter.hit(userId);
}

/* -------------------------------------------------------------- Testing */

/** Test-only: clear every limiter. */
export function resetRateLimitsForTests(): void {
  loginLimiter.clear();
  previewMintLimiter.clear();
}
