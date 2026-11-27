/**
 * @jest-environment node
 */
import { CmsError } from '@/lib/cms/errors';
import {
  assertLoginAllowed,
  assertPreviewMintAllowed,
  clientIp,
  createFixedWindowLimiter,
  LOGIN_MAX_FAILURES,
  PREVIEW_MINT_MAX,
  recordLoginFailure,
  recordPreviewMint,
  resetLoginFailures,
  resetRateLimitsForTests,
} from '@/lib/directus/rate-limit';

jest.mock('server-only', () => ({}));

function req(ip: string): Request {
  return new Request('http://localhost/api/cms/auth/login', {
    method: 'POST',
    headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` },
  });
}

function expectRateLimited(fn: () => void) {
  try {
    fn();
  } catch (error) {
    expect(error).toBeInstanceOf(CmsError);
    expect((error as CmsError).code).toBe('rate_limited');
    expect((error as CmsError).status).toBe(429);
    return;
  }
  throw new Error('expected rate_limited');
}

beforeEach(() => resetRateLimitsForTests());

describe('createFixedWindowLimiter', () => {
  it('limits at max and frees the key once the window passes', () => {
    const limiter = createFixedWindowLimiter(2, 1000);
    limiter.hit('k', 0);
    expect(limiter.isLimited('k', 10)).toBe(false);
    limiter.hit('k', 10);
    expect(limiter.isLimited('k', 20)).toBe(true);
    expect(limiter.isLimited('k', 1000)).toBe(false);
  });

  it('keeps keys apart and resets one key', () => {
    const limiter = createFixedWindowLimiter(1, 1000);
    limiter.hit('a', 0);
    expect(limiter.isLimited('b', 0)).toBe(false);
    limiter.reset('a');
    expect(limiter.isLimited('a', 0)).toBe(false);
  });
});

describe('clientIp', () => {
  it('takes the first forwarded hop, then x-real-ip', () => {
    expect(clientIp(req('1.2.3.4'))).toBe('1.2.3.4');
    const real = new Request('http://localhost/', {
      headers: { 'x-real-ip': '5.6.7.8' },
    });
    expect(clientIp(real)).toBe('5.6.7.8');
    expect(clientIp(new Request('http://localhost/'))).toBe('unknown');
  });
});

describe('login limit', () => {
  it('returns rate_limited after too many failures from one IP', () => {
    for (let i = 0; i < LOGIN_MAX_FAILURES; i++) {
      assertLoginAllowed(req('1.2.3.4'), 'a@its.ac.id');
      recordLoginFailure(req('1.2.3.4'), 'A@its.ac.id ');
    }
    expectRateLimited(() => assertLoginAllowed(req('1.2.3.4'), 'a@its.ac.id'));
    expect(() =>
      assertLoginAllowed(req('9.9.9.9'), 'a@its.ac.id'),
    ).not.toThrow();
  });

  it('clears on a successful login', () => {
    for (let i = 0; i < LOGIN_MAX_FAILURES; i++) {
      recordLoginFailure(req('1.2.3.4'), 'a@its.ac.id');
    }
    resetLoginFailures(req('1.2.3.4'), 'a@its.ac.id');
    expect(() =>
      assertLoginAllowed(req('1.2.3.4'), 'a@its.ac.id'),
    ).not.toThrow();
  });
});

describe('preview mint limit', () => {
  it('returns rate_limited per user', () => {
    for (let i = 0; i < PREVIEW_MINT_MAX; i++) {
      assertPreviewMintAllowed('user-1');
      recordPreviewMint('user-1');
    }
    expectRateLimited(() => assertPreviewMintAllowed('user-1'));
    expect(() => assertPreviewMintAllowed('user-2')).not.toThrow();
  });
});
