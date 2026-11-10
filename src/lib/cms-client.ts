/**
 * HMTC CMS — typed browser client for `/api/cms/*`.
 *
 * Browser code never talks to Directus (D4: CSP forbids it). It calls our own
 * Route Handlers, and this module is the only place those requests are built.
 * Every path, param, query, body and response type comes from
 * `src/lib/cms/api-contract.ts`, so the client cannot drift from the contract.
 *
 * Security note: `revalidate` is deliberately excluded. That endpoint is
 * authenticated by an HMAC header and is called by a Directus Flow, never by a
 * browser. Excluding it at the type level turns a mistaken call into a compile
 * error instead of a 403 at runtime.
 *
 * Isomorphic: no secrets, safe to import from client components.
 */
import type { QueryKey } from '@tanstack/react-query';
import { z } from 'zod';

import {
  type CmsEndpointName,
  cmsEndpoints,
  cmsPath,
  type EndpointDef,
} from '@/lib/cms/api-contract';
import {
  cmsError,
  type CmsErrorBody,
  cmsErrorBodySchema,
  type CmsErrorCode,
} from '@/lib/cms/errors';

/** Endpoints a browser may call. `revalidate` is server-to-server only. */
export type CmsClientEndpoint = Exclude<CmsEndpointName, 'revalidate'>;

type EndpointOf<N extends CmsClientEndpoint> = (typeof cmsEndpoints)[N];

/** Path params, inferred from the endpoint's Zod schema. */
export type CmsParamsOf<N extends CmsClientEndpoint> =
  EndpointOf<N> extends { params: infer P extends z.ZodType }
    ? z.input<P>
    : never;

/** Query string params, inferred from the endpoint's Zod schema. */
export type CmsQueryOf<N extends CmsClientEndpoint> =
  EndpointOf<N> extends { query: infer Q extends z.ZodType }
    ? z.input<Q>
    : never;

/** JSON request body, inferred from the endpoint's Zod schema. */
export type CmsBodyOf<N extends CmsClientEndpoint> =
  EndpointOf<N> extends { body: infer B extends z.ZodType }
    ? z.input<B>
    : never;

/** Success response, inferred from the endpoint's Zod schema. */
export type CmsResponseOf<N extends CmsClientEndpoint> =
  EndpointOf<N> extends { response: infer R extends z.ZodType }
    ? z.output<R>
    : undefined;

type ParamsArgument<N extends CmsClientEndpoint> = [CmsParamsOf<N>] extends [
  never,
]
  ? { params?: undefined }
  : { params: CmsParamsOf<N> };

type QueryArgument<N extends CmsClientEndpoint> = [CmsQueryOf<N>] extends [
  never,
]
  ? { query?: undefined }
  : { query?: CmsQueryOf<N> };

type BodyArgument<N extends CmsClientEndpoint> =
  EndpointOf<N> extends { multipart: Record<string, string> }
    ? { body: FormData }
    : [CmsBodyOf<N>] extends [never]
      ? { body?: undefined }
      : { body: CmsBodyOf<N> };

export type CmsUrlOptions<N extends CmsClientEndpoint> = ParamsArgument<N> &
  QueryArgument<N>;

type UrlArgs<N extends CmsClientEndpoint> = [CmsParamsOf<N>] extends [never]
  ? [options?: CmsUrlOptions<N>]
  : [options: CmsUrlOptions<N>];

type FetchArgs<N extends CmsClientEndpoint> = [CmsParamsOf<N>] extends [never]
  ? EndpointOf<N> extends { multipart: Record<string, string> }
    ? [options: CmsFetchOptions<N>]
    : [CmsBodyOf<N>] extends [never]
      ? [options?: CmsFetchOptions<N>]
      : [options: CmsFetchOptions<N>]
  : [options: CmsFetchOptions<N>];

export type CmsFetchOptions<N extends CmsClientEndpoint> = CmsUrlOptions<N> &
  BodyArgument<N> & {
    /** Abort signal, e.g. from TanStack Query. */
    signal?: AbortSignal;
  };

/**
 * Error thrown by `cmsFetch`.
 *
 * Carries the contract code instead of a status number, so callers branch on
 * `error.code` rather than matching strings. The raw Directus response never
 * reaches the browser at all — Route Handlers already normalised it.
 */
export class CmsClientError extends Error {
  readonly code: CmsErrorCode;
  readonly status: number;
  readonly body: CmsErrorBody;

  constructor(body: CmsErrorBody, status: number) {
    super(body.error.message);
    this.name = 'CmsClientError';
    this.code = body.error.code;
    this.status = status;
    this.body = body;
  }
}

function serializeQuery(value: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, raw] of Object.entries(value)) {
    if (raw === undefined || raw === null) continue;

    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (item !== undefined && item !== null) {
          search.append(key, String(item));
        }
      }
      continue;
    }

    search.set(key, String(raw));
  }

  return search.toString();
}

/**
 * Build the request URL for an endpoint.
 *
 * Query and params are validated here, before anything is sent, so a bad filter
 * fails in the caller's console instead of coming back as a 422 from the server.
 * Defaults declared in the contract are applied, which is why an empty query for
 * `listPages` still yields `page=1&limit=25`.
 */
export function cmsUrl<N extends CmsClientEndpoint>(
  name: N,
  ...args: UrlArgs<N>
): string {
  const options = (args[0] ?? {}) as CmsUrlOptions<N>;
  const endpoint: EndpointDef = cmsEndpoints[name];
  let href: string = endpoint.path;

  if (endpoint.params) {
    const params = endpoint.params.parse(options.params);
    href = cmsPath(name, params as Record<string, string>);
  }

  if (endpoint.query) {
    const query = endpoint.query.parse(options.query ?? {});
    const search = serializeQuery(query as Record<string, unknown>);
    if (search) href += `?${search}`;
  }

  return href;
}

/** Map an HTTP status to a contract code, used only when the body is unusable. */
function codeFromStatus(status: number): CmsErrorCode {
  switch (status) {
    case 401:
      return 'unauthenticated';
    case 403:
      return 'forbidden';
    case 404:
      return 'not_found';
    case 422:
      return 'validation_failed';
    case 429:
      return 'rate_limited';
    default:
      return 'internal';
  }
}

const FALLBACK_MESSAGE = 'Permintaan ke CMS gagal. Coba lagi.';

async function toClientError(response: Response): Promise<CmsClientError> {
  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const parsed = cmsErrorBodySchema.safeParse(payload);
  if (parsed.success) return new CmsClientError(parsed.data, response.status);

  return new CmsClientError(
    cmsError(codeFromStatus(response.status), FALLBACK_MESSAGE),
    response.status,
  );
}

/**
 * Call a CMS endpoint and return its validated response.
 *
 * A response that fails its contract schema is a contract violation, not user
 * input, so it surfaces as `internal` and the raw payload stays in the network
 * tab rather than being returned to the caller.
 */
export async function cmsFetch<N extends CmsClientEndpoint>(
  name: N,
  ...args: FetchArgs<N>
): Promise<CmsResponseOf<N>> {
  const options = (args[0] ?? {}) as CmsFetchOptions<N>;
  const endpoint: EndpointDef = cmsEndpoints[name];
  const href = cmsUrl(name, options as CmsUrlOptions<N>);

  const headers: Record<string, string> = { accept: 'application/json' };
  let payload: BodyInit | undefined;

  if (typeof FormData !== 'undefined' && options.body instanceof FormData) {
    payload = options.body;
  } else if (options.body !== undefined) {
    headers['content-type'] = 'application/json';
    payload = JSON.stringify(options.body);
  }

  const response = await fetch(href, {
    method: endpoint.method,
    headers,
    body: payload,
    credentials: 'same-origin',
    cache: 'no-store',
    signal: options.signal,
  });

  if (!response.ok) throw await toClientError(response);

  if (endpoint.response === null) {
    return undefined as CmsResponseOf<N>;
  }

  let payloadJson: unknown = null;
  try {
    payloadJson = await response.json();
  } catch {
    payloadJson = null;
  }

  const parsed = endpoint.response.safeParse(payloadJson);
  if (!parsed.success) {
    throw new CmsClientError(
      cmsError('internal', 'Respons CMS tidak sesuai kontrak.'),
      response.status,
    );
  }

  return parsed.data as CmsResponseOf<N>;
}

/**
 * TanStack Query options for a CMS read.
 *
 * `queryFn` is created here and cannot be omitted, which is the rule Phase 0
 * established: no query may rely on a key-derived fetcher.
 */
export function cmsQuery<N extends CmsClientEndpoint>(
  name: N,
  key: QueryKey,
  options?: CmsUrlOptions<N>,
) {
  return {
    queryKey: key,
    queryFn: ({ signal }: { signal?: AbortSignal }) =>
      cmsFetch(name, {
        ...((options ?? {}) as CmsUrlOptions<N>),
        signal,
      } as CmsFetchOptions<N>),
  };
}
