/**
 * @jest-environment node
 */
import { createHash } from 'node:crypto';

import {
  hashPreviewToken,
  mintPreviewToken,
  previewUrl,
} from '@/lib/directus/preview-token';

jest.mock('server-only', () => ({}));

describe('preview tokens', () => {
  it('is 32 random bytes as unpadded base64url', () => {
    const token = mintPreviewToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Buffer.from(token, 'base64url')).toHaveLength(32);
  });

  it('does not repeat', () => {
    const tokens = new Set(Array.from({ length: 200 }, mintPreviewToken));
    expect(tokens.size).toBe(200);
  });

  it('hashes to lowercase SHA-256 hex', () => {
    const token = mintPreviewToken();
    const hash = hashPreviewToken(token);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(createHash('sha256').update(token).digest('hex'));
    expect(hashPreviewToken(token)).toBe(hash);
    expect(hash).not.toContain(token);
  });

  it('builds a relative preview URL', () => {
    expect(previewUrl('abc')).toBe('/preview/abc');
  });
});
