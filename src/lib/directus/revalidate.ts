/**
 * HMTC CMS — webhook signature verification and server-side cache tag derivation.
 *
 * Directus Flows sign the raw UTF-8 request body with `CMS_REVALIDATE_SECRET`
 * using HMAC-SHA256 (`x-cms-signature`). Verification operates on the unparsed
 * payload string before `JSON.parse()` to avoid whitespace or key-order drift,
 * and compares 32-byte digests via `crypto.timingSafeEqual`.
 *
 * Cache tags are derived strictly on the server from the validated
 * `{ collection, keys }` payload (see `docs/hmtc-cms-integration-plan.md` §4).
 * Strict Zod schemas reject unexpected fields so callers can never pass raw
 * tag names to purge arbitrary cache entries.
 */

import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

const HEX_SHA256_REGEX = /^[0-9a-f]{64}$/i;
const SAFE_KEY_REGEX = /^[a-zA-Z0-9_-]+$/;

const directusKeySchema = z.union([
  z
    .number()
    .int()
    .positive()
    .transform((value) => String(value)),
  z.string().trim().min(1).regex(SAFE_KEY_REGEX, 'Invalid key format'),
]);

export const cmsRevalidatePayloadSchema = z
  .discriminatedUnion('collection', [
    z
      .object({
        collection: z.literal('cms_pages'),
        keys: z.array(directusKeySchema).min(1, 'At least one page key is required'),
      })
      .strict(),
    z
      .object({
        collection: z.literal('cms_page_redirects'),
        keys: z.array(directusKeySchema).optional().default([]),
      })
      .strict(),
    z
      .object({
        collection: z.literal('cms_site_settings'),
        keys: z.array(directusKeySchema).optional().default([]),
      })
      .strict(),
  ]);

export type CmsRevalidatePayload = z.infer<typeof cmsRevalidatePayloadSchema>;

export function computeCmsSignature(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
}

export function verifyCmsSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!secret || !signatureHeader) {
    return false;
  }

  const normalized = signatureHeader.trim().replace(/^sha256=/i, '');
  if (!HEX_SHA256_REGEX.test(normalized)) {
    return false;
  }

  const expectedBuffer = createHmac('sha256', secret).update(rawBody, 'utf8').digest();
  const receivedBuffer = Buffer.from(normalized, 'hex');

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function deriveTagsFromWebhook(payload: CmsRevalidatePayload): string[] {
  switch (payload.collection) {
    case 'cms_pages': {
      const uniqueKeys = Array.from(new Set(payload.keys));
      return [
        ...uniqueKeys.map((key) => `cms:page-id:${key}`),
        'cms:routes',
      ];
    }
    case 'cms_page_redirects': {
      return ['cms:redirects'];
    }
    case 'cms_site_settings': {
      return ['cms:settings'];
    }
  }
}
