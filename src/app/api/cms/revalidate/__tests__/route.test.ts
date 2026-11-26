/**
 * Unit tests for the CMS revalidation webhook (`POST /api/cms/revalidate`).
 *
 * The DoD requires coverage of valid and invalid `x-cms-signature` headers
 * (raw hex, `sha256=` prefix, missing header, wrong secret, and tampered raw
 * body bytes) alongside server-side tag derivation and rejection of raw tag
 * names (`422`).
 *
 * `jest.mock('server-only', () => ({}))` must run before the imports; Jest's
 * transformer hoists it above them automatically, while `resetCmsEnvForTests()`
 * isolates the cached env parse across test cases.
 *
 * @jest-environment node
 */

import { revalidateTag } from 'next/cache';

import { POST } from '@/app/api/cms/revalidate/route';
import { resetCmsEnvForTests } from '@/lib/directus/env';
import { computeCmsSignature, verifyCmsSignature } from '@/lib/directus/revalidate';

jest.mock('server-only', () => ({}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

const TEST_SECRET = 'test-cms-revalidate-secret-key-2026';

function buildWebhookRequest(
  rawBody: string,
  signature?: string | null,
): Request {
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (signature !== undefined && signature !== null) {
    headers.set('x-cms-signature', signature);
  }

  return new Request('http://localhost:3000/api/cms/revalidate', {
    method: 'POST',
    headers,
    body: rawBody,
  });
}

describe('POST /api/cms/revalidate', () => {
  const mockedRevalidateTag = jest.mocked(revalidateTag);

  beforeEach(() => {
    jest.clearAllMocks();
    resetCmsEnvForTests();
    process.env.DIRECTUS_URL = 'http://directus:8055';
    process.env.DIRECTUS_READ_TOKEN = 'test-directus-read-token';
    process.env.CMS_REVALIDATE_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    resetCmsEnvForTests();
    delete process.env.DIRECTUS_URL;
    delete process.env.DIRECTUS_READ_TOKEN;
    delete process.env.CMS_REVALIDATE_SECRET;
  });

  describe('verifyCmsSignature', () => {
    it('returns true for a valid hex HMAC-SHA256 signature', () => {
      const rawBody = '{"collection":"cms_pages","keys":["42"]}';
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      expect(verifyCmsSignature(rawBody, signature, TEST_SECRET)).toBe(true);
    });

    it('returns true for a valid sha256=-prefixed signature', () => {
      const rawBody = '{"collection":"cms_site_settings"}';
      const signature = `sha256=${computeCmsSignature(rawBody, TEST_SECRET)}`;

      expect(verifyCmsSignature(rawBody, signature, TEST_SECRET)).toBe(true);
    });

    it('returns false when signature is invalid, wrong length, or empty', () => {
      const rawBody = '{"collection":"cms_pages","keys":["42"]}';
      const validSig = computeCmsSignature(rawBody, TEST_SECRET);
      const alteredSig = `${validSig.slice(0, -1)}${validSig.endsWith('0') ? '1' : '0'}`;

      expect(verifyCmsSignature(rawBody, alteredSig, TEST_SECRET)).toBe(false);
      expect(verifyCmsSignature(rawBody, 'not-a-valid-hex', TEST_SECRET)).toBe(false);
      expect(verifyCmsSignature(rawBody, '', TEST_SECRET)).toBe(false);
      expect(verifyCmsSignature(rawBody, null, TEST_SECRET)).toBe(false);
      expect(verifyCmsSignature(rawBody, validSig, 'wrong-secret')).toBe(false);
    });

    it('is sensitive to exact raw body bytes including whitespace', () => {
      const compactBody = '{"collection":"cms_pages","keys":["42"]}';
      const spacedBody = '{ "collection": "cms_pages", "keys": ["42"] }';
      const signature = computeCmsSignature(compactBody, TEST_SECRET);

      expect(verifyCmsSignature(spacedBody, signature, TEST_SECRET)).toBe(false);
    });
  });

  describe('signature verification on HTTP handler', () => {
    it('returns 500 when CMS env is not configured', async () => {
      delete process.env.CMS_REVALIDATE_SECRET;
      resetCmsEnvForTests();

      const rawBody = JSON.stringify({ collection: 'cms_pages', keys: ['10'] });
      const signature = computeCmsSignature(rawBody, TEST_SECRET);
      const response = await POST(buildWebhookRequest(rawBody, signature));

      expect(response.status).toBe(500);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });

    it('returns 401 and does not revalidate when x-cms-signature header is missing', async () => {
      const rawBody = JSON.stringify({ collection: 'cms_pages', keys: ['10'] });
      const response = await POST(buildWebhookRequest(rawBody, null));

      expect(response.status).toBe(401);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });

    it('returns 401 and does not revalidate when x-cms-signature is invalid', async () => {
      const rawBody = JSON.stringify({ collection: 'cms_pages', keys: ['10'] });
      const invalidSig = computeCmsSignature(rawBody, 'wrong-secret');
      const response = await POST(buildWebhookRequest(rawBody, invalidSig));

      expect(response.status).toBe(401);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });

    it('returns 401 when raw body was modified after signing', async () => {
      const signedBody = '{"collection":"cms_pages","keys":["10"]}';
      const tamperedBody = '{"collection":"cms_pages","keys":["99"]}';
      const signature = computeCmsSignature(signedBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(tamperedBody, signature));

      expect(response.status).toBe(401);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });
  });

  describe('server-side tag derivation & raw tag rejection', () => {
    it('derives cms:page-id:{id} and cms:routes for cms_pages', async () => {
      const rawBody = JSON.stringify({
        collection: 'cms_pages',
        keys: ['page-uuid-1', 202, 'page-uuid-1'],
      });
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(rawBody, signature));
      const json = (await response.json()) as {
        revalidated: boolean;
        collection: string;
        tags: string[];
      };

      expect(response.status).toBe(200);
      expect(json).toEqual({
        revalidated: true,
        collection: 'cms_pages',
        tags: ['cms:page-id:page-uuid-1', 'cms:page-id:202', 'cms:routes'],
      });
      expect(mockedRevalidateTag).toHaveBeenCalledTimes(3);
      expect(mockedRevalidateTag).toHaveBeenNthCalledWith(1, 'cms:page-id:page-uuid-1', {
        expire: 0,
      });
      expect(mockedRevalidateTag).toHaveBeenNthCalledWith(2, 'cms:page-id:202', {
        expire: 0,
      });
      expect(mockedRevalidateTag).toHaveBeenNthCalledWith(3, 'cms:routes', {
        expire: 0,
      });
    });

    it('derives cms:redirects for cms_page_redirects', async () => {
      const rawBody = JSON.stringify({
        collection: 'cms_page_redirects',
        keys: ['1'],
      });
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(rawBody, signature));
      const json = (await response.json()) as { tags: string[] };

      expect(response.status).toBe(200);
      expect(json.tags).toEqual(['cms:redirects']);
      expect(mockedRevalidateTag).toHaveBeenCalledTimes(1);
      expect(mockedRevalidateTag).toHaveBeenCalledWith('cms:redirects', { expire: 0 });
    });

    it('derives cms:settings for cms_site_settings', async () => {
      const rawBody = JSON.stringify({
        collection: 'cms_site_settings',
      });
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(rawBody, signature));
      const json = (await response.json()) as { tags: string[] };

      expect(response.status).toBe(200);
      expect(json.tags).toEqual(['cms:settings']);
      expect(mockedRevalidateTag).toHaveBeenCalledTimes(1);
      expect(mockedRevalidateTag).toHaveBeenCalledWith('cms:settings', { expire: 0 });
    });

    it('rejects payloads attempting to pass raw tag names', async () => {
      const rawBody = JSON.stringify({
        collection: 'cms_pages',
        keys: ['42'],
        tags: ['cms:settings', 'raw-arbitrary-tag'],
      });
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(rawBody, signature));

      expect(response.status).toBe(422);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });

    it('rejects payloads with only raw tags and no valid collection', async () => {
      const rawBody = JSON.stringify({
        tags: ['cms:routes'],
      });
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(rawBody, signature));

      expect(response.status).toBe(422);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });

    it('rejects keys containing tag delimiters or path characters', async () => {
      const rawBody = JSON.stringify({
        collection: 'cms_pages',
        keys: ['42:cms:settings'],
      });
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(rawBody, signature));

      expect(response.status).toBe(422);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });

    it('returns 400 for malformed JSON even with a valid signature', async () => {
      const rawBody = '{invalid-json';
      const signature = computeCmsSignature(rawBody, TEST_SECRET);

      const response = await POST(buildWebhookRequest(rawBody, signature));

      expect(response.status).toBe(400);
      expect(mockedRevalidateTag).not.toHaveBeenCalled();
    });
  });
});
