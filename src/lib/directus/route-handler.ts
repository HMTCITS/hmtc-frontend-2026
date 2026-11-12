/**
 * HMTC CMS — Route Handler toolkit.
 *
 * `defineCmsRoute(name, handler)` produces a Next.js App Router handler that:
 *  1. parses `params`, `query` and `body` (or `formData`) with the schemas
 *     declared on the endpoint in `cmsEndpoints`;
 *  2. enforces the Origin check on mutations (except the HMAC webhook);
 *  3. honours `CMS_EDITING_ENABLED` on content mutations (decision N9);
 *  4. validates the success body against the endpoint's `response` schema in
 *     dev and test — never in production (see plan §6 for why the original
 *     body is returned, not `parsed.data`);
 *  5. normalises every error into a `CmsErrorBody` and a status from
 *     `CMS_ERROR_STATUS`. Raw Directus bodies never leave this layer.
 *
 * Resource authorization, workflow transitions and self-approval stay in the
 * handler: they need the page row and the acting user, which only the handler
 * can load (`docs/hmtc-cms-api-contract.md`, items 4–6).
 *
 * Server-only: a client component importing this fails the build.
 */
import 'server-only';

import type { z } from 'zod';
import { ZodError } from 'zod';

import {
  type CmsEndpointName,
  cmsEndpoints,
  type CmsResponse,
  type EndpointDef,
} from '@/lib/cms/api-contract';
import {
  CMS_ERROR_STATUS,
  CmsError,
  cmsError,
  type CmsErrorBody,
  type CmsErrorCode,
  toValidationIssues,
} from '@/lib/cms/errors';
import { DirectusRequestError } from '@/lib/directus/client';
import { getCmsEnv } from '@/lib/directus/env';
import { logError, logWarn } from '@/lib/directus/logger';

/* ------------------------------------------------------------------ Types */

type EndpointOf<N extends CmsEndpointName> = (typeof cmsEndpoints)[N];

type CmsParams<N extends CmsEndpointName> =
  EndpointOf<N> extends { params: infer P extends z.ZodType }
    ? z.infer<P>
    : undefined;

type CmsQuery<N extends CmsEndpointName> =
  EndpointOf<N> extends { query: infer Q extends z.ZodType }
    ? z.infer<Q>
    : undefined;

type CmsBody<N extends CmsEndpointName> =
  EndpointOf<N> extends { body: infer B extends z.ZodType }
    ? z.infer<B>
    : undefined;

type CmsFormData<N extends CmsEndpointName> =
  EndpointOf<N> extends { multipart: Record<string, string> }
    ? FormData
    : undefined;

type CmsRawBody<N extends CmsEndpointName> =
  EndpointOf<N> extends { body: z.ZodType }
    ? string
    : EndpointOf<N> extends { auth: 'hmac' }
      ? string
      : undefined;

export type CmsRouteContext<N extends CmsEndpointName> = {
  /** The raw Next.js request. */
  request: Request;
  /** Validated path params. `undefined` when the endpoint has none. */
  params: CmsParams<N>;
  /** Validated query string with defaults applied. `undefined` when none. */
  query: CmsQuery<N>;
  /** Parsed + validated JSON body. `undefined` for GET/multipart endpoints. */
  body: CmsBody<N>;
  /**
   * Raw request body text. **HMAC verification only — never log.**
   * Populated for any endpoint with a `body` or `auth === 'hmac'`.
   */
  rawBody: CmsRawBody<N>;
  /** Parsed multipart body. Only when the endpoint declares `multipart`. */
  formData: CmsFormData<N>;
};

export type NextRouteContext = {
  params?: Promise<Record<string, string>> | Record<string, string>;
};

export type CmsRouteHandler = (
  request: Request,
  context?: NextRouteContext,
) => Promise<Response>;

/* ---------------------------------------------------------------- Errors */

/**
 * Thrown when the handler's return value does not match the contract's
 * `response` schema and `NODE_ENV !== 'production'`. Distinct from a plain
 * `ZodError` so the catch branch can log it and the client still sees 500.
 */
export class ResponseSchemaMismatchError extends Error {
  constructor(
    public readonly endpoint: CmsEndpointName,
    public readonly zodError: ZodError,
  ) {
    super(`Response of ${endpoint} does not match its contract schema`);
    this.name = 'ResponseSchemaMismatchError';
  }
}

/* --------------------------------------------------------------- Helpers */

const MUTATION_METHODS = new Set<string>(['POST', 'PUT', 'PATCH', 'DELETE']);

function isMutation(method: string): boolean {
  return MUTATION_METHODS.has(method);
}

/**
 * `/api/cms/auth/*` — login/logout. Skipped from the editing gate (a user in
 * staging with editing disabled must still be able to log out) but **not**
 * from the Origin check (login CSRF is a real attack).
 */
function isAuthEndpoint(path: string): boolean {
  return path.startsWith('/api/cms/auth/');
}

/**
 * Same-origin check. Falls back to `X-Forwarded-*` when present, so it works
 * behind Caddy/Cloudflare. See plan §5 and §8 item 1.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const url = new URL(request.url);
  const proto =
    request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    url.host;
  if (!host) return false;

  return origin === `${proto}://${host}`;
}

const NO_STORE: HeadersInit = { 'Cache-Control': 'no-store' };

function errorResponse(
  code: CmsErrorCode,
  message: string,
  extra?: Pick<CmsErrorBody['error'], 'issues' | 'invalidBlocks'>,
): Response {
  return Response.json(cmsError(code, message, extra ?? {}), {
    status: CMS_ERROR_STATUS[code],
    headers: NO_STORE,
  });
}

/* ----------------------------------------------------------- Run a route */

async function runRoute<N extends CmsEndpointName>(
  name: N,
  endpoint: EndpointDef,
  handler: (
    ctx: CmsRouteContext<N>,
  ) => Promise<CmsResponse<N>> | CmsResponse<N>,
  request: Request,
  context: NextRouteContext | undefined,
): Promise<Response> {
  // 1. Method sanity check (dev only — a mismatch is a route-file bug, not a
  //    client error; Next.js already routed by method).
  if (
    process.env.NODE_ENV !== 'production' &&
    request.method !== endpoint.method
  ) {
    logWarn(name, `expected ${endpoint.method}, got ${request.method}`);
  }

  const mutation = isMutation(endpoint.method);

  // 2. Origin check on mutations. HMAC endpoints are server-to-server.
  if (mutation && endpoint.auth !== 'hmac' && !isSameOrigin(request)) {
    return errorResponse('bad_origin', 'Permintaan lintas-origin ditolak.');
  }

  // 3. Editing gate (decision N9). Content mutations only — auth endpoints
  //    (login, logout) and HMAC webhooks are excluded.
  if (mutation && endpoint.auth !== 'hmac' && !isAuthEndpoint(endpoint.path)) {
    const env = getCmsEnv();
    if (!env.editingEnabled) {
      return errorResponse(
        'editing_disabled',
        'Editing dinonaktifkan di lingkungan ini.',
      );
    }
  }

  // 4. Parse and validate inputs.
  let params: unknown = undefined;
  if (endpoint.params) {
    const rawParams = await Promise.resolve(context?.params ?? {});
    const parsed = endpoint.params.safeParse(rawParams);
    if (!parsed.success) throw parsed.error;
    params = parsed.data;
  }

  let query: unknown = undefined;
  if (endpoint.query) {
    const url = new URL(request.url);
    const rawQuery: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      rawQuery[key] = value;
    });
    const parsed = endpoint.query.safeParse(rawQuery);
    if (!parsed.success) throw parsed.error;
    query = parsed.data;
  }

  let body: unknown = undefined;
  let formData: FormData | undefined = undefined;
  let rawBody: string | undefined = undefined;

  if (endpoint.multipart) {
    try {
      formData = await request.formData();
    } catch {
      throw new ZodError([
        {
          code: 'custom',
          message: 'body bukan form-data yang valid',
          path: [],
        },
      ]);
    }
  } else if (endpoint.body || endpoint.auth === 'hmac') {
    try {
      rawBody = await request.text();
    } catch {
      throw new ZodError([
        {
          code: 'custom',
          message: 'body tidak dapat dibaca',
          path: [],
        },
      ]);
    }
    if (endpoint.body) {
      let json: unknown;
      try {
        json = JSON.parse(rawBody);
      } catch {
        throw new ZodError([
          {
            code: 'custom',
            message: 'body harus JSON yang valid',
            path: [],
          },
        ]);
      }
      const parsed = endpoint.body.safeParse(json);
      if (!parsed.success) throw parsed.error;
      body = parsed.data;
    }
  }

  // 5. Invoke the handler.
  const ctx = {
    request,
    params,
    query,
    body,
    formData,
    rawBody,
  } as CmsRouteContext<N>;

  const result = await handler(ctx);

  // 6. Response validation — dev/test only. Return the ORIGINAL body, never
  //    `parsed.data`: response schemas must be pure validators. If they carry
  //    `.default()` or `.transform()`, dev would emit different wire shapes
  //    from prod, which is exactly what this gate is meant to prevent.
  if (endpoint.response !== null && process.env.NODE_ENV !== 'production') {
    const parsed = endpoint.response.safeParse(result);
    if (!parsed.success) {
      throw new ResponseSchemaMismatchError(name, parsed.error);
    }
  }

  // 7. Serialise.
  if (endpoint.status === 204) {
    if (result !== undefined) {
      throw new Error(`Route ${name} (204) returned a body`);
    }
    return new Response(null, { status: 204, headers: NO_STORE });
  }

  return Response.json(result, {
    status: endpoint.status,
    headers: NO_STORE,
  });
}

/* -------------------------------------------------------- Error mapping */

function mapError(name: CmsEndpointName, error: unknown): Response {
  if (error instanceof ResponseSchemaMismatchError) {
    logError(name, 'response schema mismatch', error.zodError.issues);
    return errorResponse('internal', 'Terjadi kesalahan pada server.');
  }

  if (error instanceof ZodError) {
    return errorResponse('validation_failed', 'Data tidak valid.', {
      issues: toValidationIssues(error),
    });
  }

  if (error instanceof CmsError) {
    return Response.json(error.toBody(), {
      status: error.status,
      headers: NO_STORE,
    });
  }

  if (error instanceof DirectusRequestError) {
    return Response.json(error.toBody(), {
      status: error.status,
      headers: NO_STORE,
    });
  }

  logError(name, 'unhandled error', error);
  return errorResponse('internal', 'Terjadi kesalahan pada server.');
}

/* -------------------------------------------------------------- Public */

/**
 * Wrap a handler with the CMS route pipeline described in the header.
 *
 * Route file example:
 *
 *   export const GET = defineCmsRoute('getPage', async ({ params }) => {
 *     const session = await requireSession();
 *     const page = await getPageForEditor(session, params.id);
 *     if (!page) throw new CmsError('not_found', 'Halaman tidak ditemukan.');
 *     return { page };
 *   });
 */
export function defineCmsRoute<N extends CmsEndpointName>(
  name: N,
  handler: (
    ctx: CmsRouteContext<N>,
  ) => Promise<CmsResponse<N>> | CmsResponse<N>,
): CmsRouteHandler {
  const endpoint: EndpointDef = cmsEndpoints[name];

  return async (request, context) => {
    try {
      return await runRoute(name, endpoint, handler, request, context);
    } catch (error) {
      return mapError(name, error);
    }
  };
}
