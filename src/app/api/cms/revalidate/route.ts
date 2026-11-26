/**
 * HMTC CMS — Directus Flow cache invalidation endpoint (`POST /api/cms/revalidate`).
 *
 * Because one shared Directus instance serves both `hmtc-prod` and
 * `hmtc-staging` (`docs/hmtc-cms-integration-plan.md` §4), Directus calls this
 * handler on `cms_pages`, `cms_page_redirects`, and `cms_site_settings`
 * updates so every frontend container expires its local Next.js Data Cache.
 *
 * The handler reads `request.text()` first to verify `x-cms-signature` against
 * `getCmsEnv().revalidateSecret` (loaded lazily so CI builds need no CMS
 * secrets; see §5), derives tags server-side, and expires them immediately via
 * `revalidateTag(tag, { expire: 0 })`.
 */

import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { getCmsEnv } from '@/lib/directus/env';
import {
  cmsRevalidatePayloadSchema,
  deriveTagsFromWebhook,
  verifyCmsSignature,
} from '@/lib/directus/revalidate';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
} as const;

export async function POST(request: Request): Promise<NextResponse> {
  let secret: string;
  try {
    secret = getCmsEnv().revalidateSecret;
  } catch {
    return NextResponse.json(
      { error: 'CMS revalidation is not configured' },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }

  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-cms-signature');

  if (!verifyCmsSignature(rawBody, signatureHeader, secret)) {
    return NextResponse.json(
      { error: 'Invalid or missing x-cms-signature' },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const validation = cmsRevalidatePayloadSchema.safeParse(parsedJson);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Invalid revalidation payload',
        issues: validation.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
      { status: 422, headers: NO_STORE_HEADERS },
    );
  }

  const tags = deriveTagsFromWebhook(validation.data);
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json(
    {
      revalidated: true,
      collection: validation.data.collection,
      tags,
    },
    { status: 200, headers: NO_STORE_HEADERS },
  );
}
