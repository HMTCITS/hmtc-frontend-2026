/**
 * Preview-link rate limit: 20 mints per user per hour.
 * Each mint may write an immutable revision row, so unlimited minting would
 * grow `cms_page_revisions` without bound. Keyed by user (the route requires a
 * session). In-memory — valid because each environment runs one container
 * (see the deployment section of docs/hmtc-cms-integration-plan.md). Keys are
 * hashed like the login limiter.
 */
import 'server-only';

import { createHash } from 'node:crypto';

import { CmsError } from '@/lib/cms/errors';

const MAX_MINTS = 20;
const WINDOW_MS = 60 * 60 * 1000;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

function keyOf(userId: string): string {
  return createHash('sha256').update(userId).digest('hex');
}

function liveBucket(key: string, now: number): Bucket | null {
  const bucket = buckets.get(key);
  if (!bucket) return null;
  if (now - bucket.windowStart >= WINDOW_MS) {
    buckets.delete(key);
    return null;
  }
  return bucket;
}

/** Throws 429 before anything is written. */
export function assertPreviewMintAllowed(userId: string): void {
  const bucket = liveBucket(keyOf(userId), Date.now());
  if (bucket && bucket.count >= MAX_MINTS) {
    throw new CmsError(
      'rate_limited',
      'Terlalu banyak tautan pratinjau dibuat. Coba lagi nanti.',
    );
  }
}

/** Count a successful mint. */
export function recordPreviewMint(userId: string): void {
  const now = Date.now();
  const key = keyOf(userId);
  const bucket = liveBucket(key, now) ?? { count: 0, windowStart: now };
  bucket.count += 1;
  buckets.set(key, bucket);
}

/** Test-only. */
export function resetPreviewRateLimitForTests(): void {
  buckets.clear();
}
