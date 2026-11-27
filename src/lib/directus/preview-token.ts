/**
 * Preview-link tokens. The token is 32 random bytes (base64url); only its
 * SHA-256 hex is stored, so a database leak does not leak working links.
 * The preview page hashes the token from its URL the same way to look it up.
 */
import 'server-only';

import { createHash, randomBytes } from 'node:crypto';

const TOKEN_BYTES = 32;

/** A fresh bearer token: 32 random bytes, base64url without padding (43 chars). */
export function mintPreviewToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

/** The only form of the token that is ever stored or looked up. */
export function hashPreviewToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Relative URL of the preview page; the client resolves it against its origin. */
export function previewUrl(token: string): string {
  return `/preview/${token}`;
}
