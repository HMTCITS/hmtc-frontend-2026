# HMTC CMS — Next.js ↔ Directus Integration Plan

## Context

Phase 0 is done: dead code is gone, and Directus migrations 001/002 are applied. No CMS code exists yet (`src/lib/directus/`, `src/app/api/cms/` and `src/app/dashboard/cms/` are all missing). The spec (`docs/hmtc-cms-implementation-specification.md`) and the decision log fix the *rules*: server-only reads, explicit Route Handlers, tag revalidation, typed blocks, bearer previews and real 404s. Nothing yet says *how* the pieces connect end-to-end, or how environment, caching and deployment work. This plan defines that integration. When it is accepted, `docs/hmtc-cms-decisions.md` and `AGENTS.md` §12–§13 should be updated to reference it, as `AGENTS.md` §12 requires.

User decisions taken in this planning round:
- **404 strategy:** fix the root `<Suspense>` soft-404 trap so `notFound()` returns a real 404. CMS pages then render on demand and are tag-cached, so publishing needs no redeploy.
- **Deployment topology (confirmed 2026-10-30):** Directus is the BaaS and the only backend. The shared compose runs `directus`, `docmost`, `nocodb` and `uptime-kuma`, so **one Directus instance serves both staging and production**. The Next.js frontend runs as **exactly one container per environment** (`hmtc-prod`, `hmtc-staging`).
- **Next.js adds no backend of its own.** The `/api/cms/*` route handlers are thin guards in front of Directus: they check the session and the rules Directus can't express (such as no self-approval), then forward to Directus. They exist because CSP forbids browser→Directus calls (D4). They store nothing.

All file paths below are relative to `hmtc-frontend-2026/`.

---

## 1. How Next.js consumes Directus

**Three credentials, three paths. The browser never calls the Directus API**, because CSP `connect-src` stays unchanged (D4).

| Path | Caller | Credential | Used for |
|---|---|---|---|
| Public read | Server Components | `DIRECTUS_READ_TOKEN`: a static token on a read-only "nextjs-reader" policy | Published revisions, prokers, departments, redirects, site settings, preview-grant lookup |
| Editor read/write | `/api/cms/*` Route Handlers and `/dashboard/cms` Server Components | **The acting user's** Directus access token from an HttpOnly cookie | Everything an editor does. Directus policies are the second layer, and Next.js authorization is the first |
| Webhook | Directus Flow → `/api/cms/revalidate` | `CMS_REVALIDATE_SECRET` (HMAC header) | Cache invalidation for changes Next.js didn't make itself (Studio edits, the other environment) |

**Module layout** (every file starts with `import 'server-only'`):
- `src/lib/directus/env.ts`: Zod-parses the env vars once and fails fast. This is the only place the tokens are read.
- `src/lib/directus/client.ts`: a thin `fetch` wrapper with no `@directus/sdk` (D6). `directusRead(path, { tags })` uses `cache: 'force-cache'` plus `next: { tags }`. In Next 15+, `fetch` is uncached by default, so `force-cache` is mandatory. `directusAsUser(token, path, init)` uses `cache: 'no-store'`. The wrapper normalises Directus errors into the spec's 401/403/404/409/422 model and never forwards a raw Directus body.
- `src/lib/directus/schema.ts`: Zod schemas for the collections and status vocabularies (M9 is enforced in the app).
- `src/lib/directus/blocks/`: a discriminated union, a Zod schema and a renderer map, validated on read **and** write. An unknown or invalid block renders a safe fallback. There is no `dangerouslySetInnerHTML`.
- `src/lib/directus/pages.ts`: typed accessors such as `getPublishedPage(dept, proker, year)`, `listPublishedRoutes()` and `getRevisionForPreview(tokenHash)`.
- `src/lib/directus/session.ts` and `authz.ts`: session verification and resource authorization (§2).

**Auth flow.** The login form under `/dashboard/cms/login` posts to `POST /api/cms/auth/login`. That handler calls Directus `/auth/login` with `mode: 'json'` and sets the `cms_at` (short-lived access) and `cms_rt` (refresh) cookies with `HttpOnly; Secure; SameSite=Lax; Path=/`. `session.ts` resolves `/users/me` with the access token and refreshes through `/auth/refresh` when it expires. Logout calls `/auth/logout` and clears both cookies. `src/proxy.ts` replaces the pathname block for `/dashboard/cms/**` with a cheap cookie-presence redirect to login. **Real verification happens in the CMS layout and in every handler**, because middleware is not the security boundary (A4, F10).

**Directus schema additions: migration `003`** (paired up/down SQL, pg_dump first, restart Directus afterwards per N8):
- `cms_page_revisions`: an immutable snapshot of `page`, `revision_number`, `blocks`, `blocks_schema_version`, `title`/SEO fields, `author`, `created_at` and `change_note`.
- `cms_pages.published_revision` (FK → revisions, nullable) and `cms_pages.current_revision`.
- `cms_preview_grants`: `page`, `revision`, `token_hash`, `created_by`, `expires_at` and `revoked_at`.
- **Change the public role:** remove its read on `cms_pages`. Today's row rule exposes all 23 fields of a published row, including `blocks`. Once a published page is edited, that column holds **unpublished draft content**, which would leak through `/items/cms_pages` and break C4. Public reads go through `DIRECTUS_READ_TOKEN` against revisions instead. This revises Q9/M11 in the decision log.

## 2. How the editor saves content

`/dashboard/cms/**` is L4 (`ui/*`, `base-data-table.tsx`). The editor uses TanStack Query against explicit routes from spec §11. Add `cmsKeys` to `src/lib/query-keys.ts`, and give every query an explicit `queryFn` (the Phase 0 rule).

Every mutation handler runs the same pipeline:
1. **Origin check**: `Origin` must equal the site origin (CSRF), on top of `SameSite=Lax`.
2. **Session**: `session.ts` returns the verified user and access token, or 401.
3. **Zod** validation of params and body, or 422 with block-level error paths for the editor.
4. **Authorize the resource**: load the page, then check the user's `cms_department_memberships` and grants against `page.department`, or 403. Never trust client-sent IDs or roles.
5. **State-transition check** (draft/changes_requested → in_review → published), or 409.
6. **Write with the user's token** so Directus policies apply too. Map the composite-unique `400` to a field error.
7. Return a normalised response. Log structured events without tokens or content.

**Save draft** (`PATCH /api/cms/pages/{id}`): the body carries `blocks` plus `expected_updated_at`. If the stored `date_updated` differs, the handler returns 409 so concurrent edits are detected rather than lost. It writes `cms_pages.blocks` (the working copy) only. **Public output does not change**, because public pages read `published_revision`.

**Submit** writes `status=in_review` plus a `cms_review_events{action:submitted, actor}`.

**Publish** (`POST /api/cms/pages/{id}/publish`) runs in an order that keeps a failure safe, since Directus has no cross-request transaction:
1. Reject if the actor equals the latest `submitted` event's actor (no self-approval, enforced server-side).
2. Re-validate the blocks, or return 422. Publishing fails on any invalid block.
3. Insert a `cms_page_revisions` snapshot. It is harmless if a later step fails.
4. **A single atomic PATCH** of `cms_pages`: `published_revision`, `status=published`, `published_at` and `published_by`. Until this succeeds, the old revision stays live.
5. Insert the `approved` review event.
6. `revalidateTag` (§4).

Restore copies a snapshot into `cms_pages.blocks` as a new draft and never publishes. Archive/unpublish clears `published_revision`, sets `status=archived` and revalidates.

## 3. How previews render

- **Mint:** `POST /api/cms/pages/{id}/preview-grants` creates a snapshot of the current working copy (if it changed), generates 32 random bytes as a base64url token, stores only its **SHA-256 hash** with `expires_at = now + 72h`, and returns the URL `/preview/{token}` once. The UI states the bearer-link policy.
- **Render:** `src/app/preview/[token]/page.tsx` has `export const dynamic = 'force-dynamic'`. It hashes the token, looks up the grant with `cache: 'no-store'` and requires it to be unexpired, unrevoked and pointing at an existing revision. Anything else gets one generic "link unavailable" response. It renders **that revision only**, through the same block renderers as the public page, so the preview matches publication exactly.
- **Isolation:** drafts never go through `force-cache` or tag cache. Preview reads use `no-store`, so they cannot land in the shared Data Cache.
- **No leakage:** the response sends `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer` and `Cache-Control: private, no-store`, plus `robots: { index: false }` metadata. The preview route skips analytics. `next-sitemap` excludes `/preview/*`. `proxy.ts` must not gate `/preview`, and the route gets a basic rate limit.
- **Revoke:** `DELETE /api/cms/preview-grants/{id}` sets `revoked_at`, which takes effect on the next request because nothing is cached.

## 4. How published content reaches the public website

**Remove the soft-404 trap (user decision).** Move the root `<React.Suspense>` out of `src/app/providers.tsx:48`, and give the routes that use `next/dynamic` fallbacks or `useSearchParams` (`gallery/container/galleryPage.tsx`, `coming-soon/page.tsx`) their own local boundaries or `loading.tsx`. Then `notFound()` before the first flush returns HTTP 404. Verify with `curl -I`. The existing `dynamicParams=false` proker routes keep working unchanged.

**Route shape.** Keep the existing per-proker folders (`src/app/<dept>/<proker>/[year]/page.tsx`). A proker moves to the CMS **one at a time** (the controlled rollout from spec §13). Its `[year]/page.tsx` switches from hardcoded `PageContent` to this:

```tsx
export const dynamicParams = true;            // render on demand
export async function generateStaticParams() { return []; } // CI build needs no Directus
export default async function Page({ params }) {
  const page = await getPublishedPage(DEPT, PROKER, Number((await params).year));
  if (!page) notFound();                      // real 404 once Suspense is fixed
  return <><CmsBlocks blocks={page.blocks} /><Footer /></>;
}
```

The first request renders the page and caches it under its tags. Later requests are served from cache until a tag is invalidated. Legacy `route.ts` year-less redirects keep using `PROKER_DEFAULT_YEAR` in `src/lib/config.ts`. That stays the **single default-year source** (B4), and `cms_site_settings` must not get a competing field. A missing year returns 404 and never falls back to another year.

**Cache tags** (the only freshness mechanism; no time-based `revalidate`, per D7):

| Tag | Attached to | Invalidated by |
|---|---|---|
| `cms:page:{dept}/{proker}/{year}` | that page's published read | publish, unpublish, archive, restore-then-publish |
| `cms:page-id:{id}` | the same read, keyed by ID for webhook use | the same events |
| `cms:routes` | `listPublishedRoutes()`, sitemap, nav listings | any publish or unpublish |
| `cms:redirects` | `cms_page_redirects` read | redirect edits (webhook) |
| `cms:settings` | `cms_site_settings` | settings edits (webhook) |

**Invalidation call.** In Next 16, `revalidateTag` takes a second argument. Route Handlers use `revalidateTag(tag, { expire: 0 })` for immediate expiry, because `updateTag` is Server-Action-only. **Confirm this against the installed `node_modules/next/dist/docs/` before coding.** Revalidation runs only after the step 4 PATCH succeeds, so a failed publish leaves both the content and the cache untouched.

**Webhook.** A Directus Flow ("Event Hook, action, on `cms_pages`/`cms_page_redirects`/`cms_site_settings` update") POSTs `{collection, keys}` to `/api/cms/revalidate` on **every** deployed environment. The request carries an HMAC of the body using `CMS_REVALIDATE_SECRET`. This covers Studio edits and the shared Directus: a publish from either environment clears the cache on both frontends. The handler resolves IDs to tags itself and never accepts raw tag names from the request.

**Media.** Add `{ protocol: 'https', hostname: 'directus.hmtc-its.com', pathname: '/assets/**' }` to `next.config.js` `images.remotePatterns`. Q10 says CMS media is public. A block stores the asset UUID, and the renderer builds the URL from `NEXT_PUBLIC_DIRECTUS_ASSET_URL` and passes `serverStaticImg` to `<NextImage>` so it isn't given the `/images/` prefix. `img-src https:` already allows the URL in CSP. Assets are validated as existing `directus_files` on save and publish. `AGENTS.md` §4.4 ("all imagery in `public/`") gets a CMS-media exception.

## 5. Environment configuration

| Variable | Scope | Notes |
|---|---|---|
| `DIRECTUS_URL` | server | Prefer the internal docker-network URL (e.g. `http://directus:8055`) if Next and Directus share a compose network; otherwise `https://directus.hmtc-its.com` |
| `DIRECTUS_READ_TOKEN` | server, secret | Static token of the read-only "nextjs-reader" user/policy |
| `CMS_REVALIDATE_SECRET` | server, secret | Shared with the Directus Flow |
| `CMS_SESSION_COOKIE_DOMAIN` | server, optional | Defaults to host-only |
| `CMS_EDITING_ENABLED` | server, optional | `false` on staging makes the editor read-only, since staging shares production Directus. Defaults to `true` |
| `NEXT_PUBLIC_DIRECTUS_ASSET_URL` | public | `https://directus.hmtc-its.com/assets`, used only to build image URLs |

- All of these are **runtime** env vars. They go in `.env.prod`/`.env.staging` on the host (read by `docker compose --env-file`), never in the image. The GitHub Actions build needs none of them because `generateStaticParams` returns `[]`. The one exception is `NEXT_PUBLIC_DIRECTUS_ASSET_URL`, which is inlined at build: pass it as a Docker build-arg, or derive asset URLs on the server so it can stay a non-public variable (preferred).
- Add the variables to `.env.example` with empty values. `env.ts` throws on missing server vars only when a CMS code path runs, so non-CMS pages still work without them.
- Directus side: create the "nextjs-reader" policy, editor/reviewer policies filtered by `$CURRENT_USER` memberships, and the Flow. Document these as runbook steps in `scripts/directus-schema/` (policies are not SQL).

## 6. Deployment approach

- **Unchanged pipeline:** push to `staging`/`main` → `docker-build.yml` builds the standalone image to GHCR → SSH → `docker compose pull && up -d` with `hmtc-prod` / `hmtc-staging`. `ecosystem.config.js` (PM2 cluster) looks stale. Confirm it is unused, because cluster mode would break per-process tag caching.
- **Cache durability:** the Next.js Data/ISR cache lives in `.next/cache` inside the container and resets on every deploy. That's acceptable: the first request after a deploy re-fetches from Directus. Optionally mount a volume at `/app/.next/cache` for warmer restarts.
- **One container per environment (confirmed):** the built-in Next.js cache and `revalidateTag` are sufficient. No Redis or custom `cacheHandler` is needed.
- **Shared Directus (confirmed):** staging editors are editing **production content**. Either make `/dashboard/cms` read-only on staging (`CMS_EDITING_ENABLED=false`), or accept staging as a second production editor. The Flow webhook targets both environments.
- **Order of rollout:** migration 003 + Directus policies → env vars on the host → deploy with the Suspense fix (no visible change) → deploy the CMS module behind `/dashboard/cms` → migrate one low-risk proker (e.g. `bluecamp`), checking with curl that the page returns 200 when published, 404 when unpublished and a 301 for the legacy URL → expand.
- **Pre-launch blockers carried forward:** B7 (`next@16.2.9` advisory, inactive `pnpm.overrides`) and the outstanding M11 behavioural draft-leak test, which now runs against `cms_page_revisions` and the removed public read.

## Critical files

- New: `src/lib/directus/{env,client,schema,pages,session,authz}.ts`, `src/lib/directus/blocks/`, `src/app/api/cms/**` (explicit routes, plus `auth/login`, `auth/logout` and `revalidate`), `src/app/preview/[token]/page.tsx`, `src/app/dashboard/cms/**`, `scripts/directus-schema/003-revisions-preview-grants.{up,down}.sql`
- Modified: `src/app/providers.tsx` (Suspense), `src/proxy.ts` (CMS cookie gate, `/preview` pass-through), `next.config.js` (remotePatterns only; CSP stays as it is), `src/lib/query-keys.ts`, `.env.example`, `next-sitemap.config.js` (exclude `/preview`), `docs/hmtc-cms-decisions.md` (Q9 revision, 404 strategy, new decisions), `AGENTS.md` §4.4/§13
- Reused: `src/lib/config.ts` (`PROKER_BASE_PATHS`, `PROKER_DEFAULT_YEAR`, `prokerHref`), `src/components/NextImage.tsx` (`serverStaticImg`), `src/components/table/base-data-table.tsx`, `src/components/ui/*`, the existing NocoDB route-handler style in `src/app/api/*/route.ts`, the page-builder mockups in `src/app/sandbox/page-builder/` as the visual spec

## Verification

- `pnpm typecheck && pnpm lint:strict && pnpm format:check && pnpm test` (Jest suites to be added: block schema, authz matrix including the cross-department case, self-approval, state transitions, preview-grant expiry and revocation, webhook HMAC).
- `pnpm build && pnpm start` locally against staging Directus, then:
  - `curl -I /<dept>/<proker>/<year>`: 200 when published, **404** when missing or unpublished; the legacy URL returns 301 with `Location` set to the default year.
  - Edit a published page, then curl it: the output is unchanged. Publish, then curl: the update shows on the next request (tag invalidated).
  - `curl https://directus.hmtc-its.com/items/cms_pages` with no auth returns 403 after migration 003, and draft blocks are not reachable anonymously.
  - Preview URL: renders the exact revision with `X-Robots-Tag: noindex`; once revoked or expired, the generic unavailable page is shown.
  - `grep -r DIRECTUS_READ_TOKEN .next/static` returns nothing (no secret in client bundles).
- On the host: check whether the frontend containers share a Docker network with Directus. If they do, `DIRECTUS_URL` can use the internal URL; otherwise use the public one.
