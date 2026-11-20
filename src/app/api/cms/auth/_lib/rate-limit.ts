/**
 * Login rate limit: 5 failed attempts per 10 min per ip + email.
 * In-memory — valid because each environment runs one container (docs/hmtc-cms-integration-plan.md §6).
 * Keys are hashed so emails are not held in memory in clear text.
 */
import 'server-only';

import { createHash } from 'node:crypto';

import { CmsError } from '@/lib/cms/errors';

const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60 * 1000;

type Bucket = { failures: number; windowStart: number };
const buckets = new Map<string, Bucket>();

function clientIp(request: Request): string {
  const forwarded = request.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'unknown';
}

function keyOf(request: Request, email: string): string {
  return createHash('sha256')
    .update(`${clientIp(request)}|${email.trim().toLowerCase()}`)
    .digest('hex');
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

/** Throws 429 before Directus is called. */
export function assertLoginAllowed(request: Request, email: string): void {
  const bucket = liveBucket(keyOf(request, email), Date.now());
  if (bucket && bucket.failures >= MAX_FAILURES) {
    throw new CmsError(
      'rate_limited',
      'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.',
    );
  }
}

export function recordLoginFailure(request: Request, email: string): void {
  const now = Date.now();
  const key = keyOf(request, email);
  const bucket = liveBucket(key, now) ?? { failures: 0, windowStart: now };
  bucket.failures += 1;
  buckets.set(key, bucket);
}

export function resetLoginFailures(request: Request, email: string): void {
  buckets.delete(keyOf(request, email));
}

/** Test-only. */
export function resetRateLimitForTests(): void {
  buckets.clear();
}
