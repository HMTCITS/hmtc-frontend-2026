# HMTC CMS — Data-Fetching Audit (Phase One)

**Repository:** `hmtc-frontend-2026`
**Audit type:** Read-only. No application code, configuration, dependency, or Directus schema/permission was modified.
**Date of audit:** 2026-10-19
**Revision:** 2 — Directus schema inspected (rev. 1 was blocked); legacy-API status verified against the live server.

> **Status: awaiting review.** No CMS interface has been implemented. Phase Two/Three below are recommendations only.

**Revision 2 changes**

| #   | Change                                                                                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | §9.1 was "NOT INSPECTED" — now complete. All 17 Directus collections, field definitions, and row counts were read via MCP.                                                                                                    |
| R2  | **The legacy application API is confirmed dead at both ends.** `api.hmtc-its.com` is alive, but its Swagger document lists 5 endpoints — none of which are `galleries`/`users`/`requests`/`uploads`/`repositories`. New §2.4. |
| R3  | §5 recommendation materially revised: the axios + React Query layer **must not be reused** — it is a client for routes that return 404.                                                                                       |
| R4  | §6 revised against the real Directus schema (which already models pages, blocks, reviews, redirects, forms, templates, and site settings).                                                                                    |
| R5  | Open question Q1 answered; Q2–Q4 re-scoped; three new schema defects recorded (§4.3).                                                                                                                                         |

---

## 1. Executive summary

### 1.1 What actually exists

The repository contains **three data layers, of which only one is live**:

| #   | Layer                 | Transport                                     | Backend                                  | Status                                                                                                                                                                                                                                   |
| --- | --------------------- | --------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **NocoDB form relay** | native `fetch` inside Route Handlers (server) | self-hosted NocoDB                       | ✅ **LIVE.** The only data path that works end to end.                                                                                                                                                                                   |
| 2   | **Legacy app API**    | `axios` + TanStack Query (browser)            | `api.hmtc-its.com`                       | ❌ **DEAD.** The client calls `/galleries`, `/users`, `/requests`, `/uploads`, `/repositories`, `/users/me`, `/auth/change-password` — **all return 404**. Only `/auth/*`, `/evaluasi-cmi/submit`, `/magang/*` and `/shortlink/*` exist. |
| 3   | **Directus CMS**      | none — no integration exists                  | `directus.hmtc-its.com` (17 collections) | ⬜ **SCHEMA ONLY.** Complete, well-modelled, essentially empty. No code reads or writes it.                                                                                                                                              |

Plus a fourth, non-network layer: **hardcoded TypeScript content** compiled into the build (`src/contents/`, `PageContent.tsx`), which serves every public page today.

The user's summary is confirmed and now provable: the pre-2026 data-fetching layer is legacy (every file under `src/lib/api/**` and `src/hooks/api/**` was last touched in **2025**; none in 2026), and there is **no auth configuration** anywhere in the Next.js app.

### 1.2 The single most important finding

**The legacy client and the legacy server have diverged, and neither side knows about the other.**

```
FRONTEND calls                    SERVER has (Swagger, basePath /api)
──────────────────────────────    ─────────────────────────────────────
GET  /api/galleries        404    POST /api/evaluasi-cmi/submit
GET  /api/users            404    GET  /api/magang/get-token
GET  /api/requests         404    POST /api/magang/upload
GET  /api/uploads          404    POST /api/shortlink/generate
GET  /api/repositories     404    GET  /api/shortlink/redirect/{shorturl}
GET  /api/users/me         404
POST /api/auth/change-password 404
```

`api.hmtc-its.com/health` returns **200** — the service is deployed and healthy. It simply no longer serves the routes the frontend depends on. This is not a bug in one file; it is an entire client library pointing at a decommissioned surface.

This explains, and is corroborated by, the state of the code:

- `src/app/dashboard/gallery/[id]/edit/page.tsx:32` — `const USE_DUMMY = true;` with the comment _"Temporary: … prevents Axios 404 while UI is still mocked. TODO: remove this flag when API is ready / backend available."_
- `src/app/dashboard/user-requests/[id]/page.tsx:77` — _"Mock Data — In production, use: `const { data: requestDetail, isLoading } = useRequestDetail(requestId);`"_
- 13 of 13 dashboard pages contain mock generators; only 3 reference a real hook, and of those, two are write-only.

### 1.3 Can the current architecture support a CMS interface?

**Yes — but not by extending the legacy layer.** The reframing:

- ❌ **Do not reuse `src/lib/api/**`or`src/hooks/api/**`.** They are a dead client for a dead API. Reviving them means rebuilding 6 REST resources on a Go service that does not have them, _and_ reimplementing from scratch what Directus already provides.
- ✅ **Do reuse the Route-Handler BFF pattern** (`src/app/api/*/route.ts`). It is the one live server-side convention, it correctly keeps secrets server-side, and it is where the Directus proxy belongs.
- ✅ **Do reuse TanStack Query** — it is installed, wired into `providers.tsx`, and used by 24 hook modules. Keep the library; replace the client underneath it.
- ✅ **Do reuse the L4 design system and the ≈10,900 lines of page-builder mockups** as the visual specification. They are high quality and design-compliant.

The work is **additive on the server, substitutive on the client** — not a rewrite of the UI.

### 1.4 Hard blockers

| #   | Blocker                                                                                                                                                                                          | Ref |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| 1   | `images.remotePatterns` allows only `**.cloudflareinsights.com` → **Directus media cannot render** through `next/image`. Media Library and preview canvas are blocked.                           | F7  |
| 2   | Production CSP `connect-src` excludes `directus.hmtc-its.com` → browser-side Directus calls are blocked. **Keep it this way**; it enforces the server-proxy boundary.                            | F6  |
| 3   | **No session verification exists in the Next.js app.** No NextAuth, no session middleware, no cookie validation. All 13 dashboard pages hardcode a dummy identity.                               | F1  |
| 4   | Directus has **1 user** (the admin) and **0 rows** in `cms_department_memberships` — the intended permission model exists in schema but is unseeded, and no editor/reviewer role is provisioned. | F13 |
| 5   | `cms_departments.slug` values **do not match** the repo's route segments (`research-technology` vs `research-and-technology`).                                                                   | F14 |

### 1.5 Headline recommendation

**Introduce one new server-side Directus data-access module, and retire the legacy client rather than extending it.**

- Server reads → new `src/lib/directus/**` (`import 'server-only'`), consumed by Server Components.
- Browser mutations → new `src/app/api/cms/**` Route Handlers (session check → allowlist → Directus).
- Client cache → keep TanStack Query, point it at the new BFF routes; delete the axios client.
- Cache invalidation → tag-based `revalidateTag` (currently there is **zero** Next.js Data Cache usage).

§5 evaluates the "rewrite" option you asked about and explains why a **substitution** is now the right call rather than the strangler extension I recommended in revision 1.

---

## 2. Data-fetching inventory

### 2.1 Stack assumptions verified

| Assumption                      | Verified? | Evidence                                                                        |
| ------------------------------- | --------- | ------------------------------------------------------------------------------- |
| Next.js App Router              | ✅        | `next@16.2.9`; `src/app/**`; no `pages/` directory                              |
| React 19                        | ✅        | `react@^19.2.5`, `react-dom@^19.2.5`, `@types/react@19.2.14`                    |
| TypeScript strict               | ✅        | `tsconfig.json` → `"strict": true`                                              |
| Tailwind CSS v4, CSS-first      | ✅        | `tailwindcss@4.0.6`, `@tailwindcss/postcss`; **no `tailwind.config.js`** exists |
| pnpm                            | ✅        | `packageManager: pnpm@10.11.0+sha512…`                                          |
| Directus CMS already integrated | ❌        | No `@directus/sdk`; zero `src/` references outside "No Directus" comments       |
| Directus schema exists          | ✅        | 17 collections, all prefixed `cms_` + Directus system collections (§9.1)        |
| Legacy app API decommissioned   | ✅        | Swagger + 404 probes (§2.4)                                                     |

### 2.2 Strategy table

| Strategy                            | Actual usage                                                                                                                                                                                                   | Representative files                                                                                                                                                 | Server / client         | Recommendation                                                                                                                |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **NocoDB relay via Route Handlers** | **LIVE — the only working data path.** 5 POST handlers + 1 GET quota. Each re-reads env, validates the payload by hand, and posts to `/api/v2/tables/{id}/records` with an `xc-token` header.                  | `src/app/api/{magical-message,seminar-dosen,seminar-dosen-2,seminar-dosen-3,tc-run}/route.ts`                                                                        | Server                  | **Reuse as the CMS BFF template.** Copy the env-guard + error-normalisation shape; add session check + Zod + tags.            |
| **`/api/schedule` handler**         | Live. Reads `src/lib/schedule-config.ts`, resolves "now" from worldtimeapi.org → timeapi.io → system clock. `Cache-Control: no-store`.                                                                         | `src/app/api/schedule/route.ts`, `src/lib/schedule-config.ts`                                                                                                        | Server                  | **Keep.** Unrelated to the CMS, but it runs in middleware on every gated request (F10).                                       |
| **Axios instance factory**          | **DEAD.** 1 factory + 6 client modules calling REST resources the server does not expose.                                                                                                                      | `src/lib/api/api.ts`, `src/lib/api/{gallery,me,repository,requests,uploads,users}.client.ts`                                                                         | Client (nominally both) | **Retire.** Do not extend. Nothing calls it that can succeed.                                                                 |
| **Axios response interceptors**     | Dead but well-built: single-flight `/auth/refresh`, `_retry` guard, queue drain, SSR `Set-Cookie` forwarding, error normalisation.                                                                             | `src/lib/api/api.interceptors.ts` (`applyInterceptors`), `src/lib/api/api.utils.ts` (`transformApiError`)                                                            | Client                  | **Retire the code, mine the pattern.** If Directus needs token refresh, port the single-flight idea — do not import the file. |
| **TanStack Query — queries**        | Installed and wired. 24 hook modules; central key factory. Most read hooks are unreachable from any route (§2.3).                                                                                              | `src/hooks/api/**`, `src/lib/hooks/useProfile.ts`, `src/app/dashboard/gallery/hooks/gallery.ts`, `src/lib/query-keys.ts`                                             | Client                  | **Keep the library; replace the consumers.** Add `cmsKeys`; delete the dead hooks.                                            |
| **TanStack Query — mutations**      | Conventions: `onSuccess` → `invalidateQueries` + `toast.success`; `onError` → `toast.error`. Only `useApproveRequest`/`useRejectRequest`/`useApproveUpload`/`useRejectUpload`/`useUploadAvatar` are reachable. | `src/hooks/api/useApproveRequest.ts`, `src/lib/hooks/useProfile.ts`                                                                                                  | Client                  | **Reuse the convention** (not the files) for CMS mutations.                                                                   |
| **TanStack Query — global client**  | **Two instances, one dead.** Active: inline in `providers.tsx`. Dead: `src/lib/query-client.ts` (0 importers).                                                                                                 | `src/app/providers.tsx:53`, `src/lib/query-client.ts`                                                                                                                | Client                  | **Consolidate to one** (F2).                                                                                                  |
| **Native `fetch()` — client**       | Live, for public forms and schedule polling. Bypasses axios entirely.                                                                                                                                          | `src/app/magical-message/page.tsx:37`, `src/app/student-social-development/tc-run/PageContent.tsx:337`, `src/components/seminar/SeminarRegistrationForm.tsx:121,190` | Client                  | **Keep.** Extend to CMS only via BFF routes, never direct to Directus.                                                        |
| **Next.js Route Handlers**          | 6 handlers, all NocoDB writes or `/api/schedule`. None proxies the legacy API.                                                                                                                                 | `src/app/api/**/route.ts`                                                                                                                                            | Server                  | **Reuse as the CMS BFF pattern.**                                                                                             |
| **Server Components (data reads)**  | **Zero.** 29 `page.tsx` files are Server Components; none `await`s a data source.                                                                                                                              | `src/app/page.tsx`, `src/app/info/page.tsx`, `src/app/*/[year]/page.tsx`                                                                                             | Server                  | **Introduce here.** The new path for CMS-driven pages.                                                                        |
| **Server Actions**                  | **Zero.** `grep -rl "'use server'" src` → empty.                                                                                                                                                               | —                                                                                                                                                                    | —                       | **Do not introduce** unless a concrete need appears; the Route-Handler pattern is established.                                |
| **SWR**                             | **Zero.** Not installed, not imported. (`swrt` is a division name.)                                                                                                                                            | —                                                                                                                                                                    | —                       | **Do not introduce.**                                                                                                         |
| **Next.js Data Cache / ISR**        | **Zero.** No `revalidate`, `revalidateTag`, `unstable_cache`, `cacheTag`, `cacheLife`, or tagged `fetch`.                                                                                                      | —                                                                                                                                                                    | —                       | **Introduce deliberately.** See §5.4.                                                                                         |
| **Direct database access**          | **Zero.** No `pg`, `prisma`, `drizzle`, `@directus/sdk`.                                                                                                                                                       | —                                                                                                                                                                    | —                       | **Do not introduce.**                                                                                                         |
| **Generated clients / codegen**     | **Zero.** All types hand-written.                                                                                                                                                                              | `src/types/{api,gallery,request,upload,profile,repository}.ts`                                                                                                       | n/a                     | **Generate Directus types once** into `src/lib/directus/types.ts`.                                                            |
| **Zod validation**                  | `zod@^4.0.16` as a **devDependency**, used only for client-side form schemas. **No API response is validated.**                                                                                                | `src/lib/validation/**`                                                                                                                                              | Client                  | **Promote to runtime dependency.** Validate CMS payloads and responses.                                                       |

### 2.3 Dead-code confirmation (import-graph reachability)

Reachability was computed over a static import graph from all **71** route entrypoints (`page`/`layout`/`route`/`global-error`/`not-found`/`error`), resolving both `@/` and relative specifiers.

**40 data modules → 27 reachable, 13 unreachable.**

**Unreachable from any route (13):**

```
src/hooks/api/useAutoIsScheduleActive.ts     src/lib/api/repository.client.ts
src/hooks/api/useChangeUserRole.ts           src/lib/api/upload.client.ts      (0 bytes)
src/hooks/api/useUpdateUser.ts               src/lib/api/users.client.ts
src/hooks/api/useUploadUserAvatar.ts         src/lib/query-client.ts
src/hooks/api/useUserDetail.ts               src/lib/withAuth.tsx
src/hooks/api/useUserRequests.ts
src/hooks/api/useUsers.ts
src/hooks/api/users.ts
```

**Reachable but non-functional or mock-gated:**

| File                                            | Reality                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/app/dashboard/gallery/[id]/edit/page.tsx`  | Calls `useGallery(...)` but with `USE_DUMMY = true`, so the query is disabled (`enabled: !USE_DUMMY && !!id`) |
| `src/app/dashboard/user-requests/[id]/page.tsx` | `useRequestDetail` appears **only in a comment**; the page renders `getMockRequestDetail()`                   |
| `src/app/dashboard/user-uploads/[id]/page.tsx`  | `useUploadDetail` appears **only in a comment**; renders `getMockUploadDetail()`                              |
| `src/app/dashboard/gallery/hooks/gallery.ts`    | `useGalleries`/`useGallery` are reachable and enabled, but hit 404 endpoints                                  |
| `src/lib/api/api.ts`                            | Reached by `src/app/layout.tsx` via `providers.tsx` → **ships to every page in the global bundle**            |

Other dead artefacts:

| Item                                                         | Evidence                                        |
| ------------------------------------------------------------ | ----------------------------------------------- |
| `src/lib/api/upload.client.ts`                               | 0 bytes                                         |
| `src/components/buttons/IconButton.tsx`                      | 0 bytes                                         |
| `src/components/Grainient.jsx`                               | 0 importers (`ogl` still used by `Threads.jsx`) |
| `FORM_URLENCODED_ENDPOINTS` whitelist                        | `new Set([])` — dead switch                     |
| `process.env.NEXT_PUBLIC_API_URL` (in `useIsScheduleActive`) | Not declared in `.env.example`; dead fallback   |

### 2.4 NEW — Legacy API surface audit (live server evidence)

Unauthenticated, read-only probes. **No credentials were transmitted and none are reproduced here.**

`GET https://api.hmtc-its.com/health` → **200** `{"status":true,"message":"Health check successful","data":{"env":"production","status":"OK"}}`

`GET https://api.hmtc-its.com/swagger/doc.json` → **200**. Swagger 2.0, `info.title = "HMTC API Documentation"`, `info.version = "1.0"`, `basePath = "/api"`, `host = "localhost:5000"` (**stale** — the doc was generated for localhost), `securityDefinitions = null`.

**Complete documented surface — 5 operations:**

| Method | Path (relative to `/api`)        | Summary                            |
| ------ | -------------------------------- | ---------------------------------- |
| POST   | `/evaluasi-cmi/submit`           | Mengunggah hasil evaluasi CMI 2025 |
| GET    | `/magang/get-token`              | Generate login URL untuk developer |
| POST   | `/magang/upload`                 | Upload dokumen magang              |
| POST   | `/shortlink/generate`            | buat short link                    |
| GET    | `/shortlink/redirect/{shorturl}` | Redirect ke url asli               |

**Existing but undocumented** (proven by non-404 responses):

| Method | Path                | Observed response                                       |
| ------ | ------------------- | ------------------------------------------------------- |
| GET    | `/api/auth/me`      | 401 `"No access token and refresh token, please login"` |
| GET    | `/api/auth/admin`   | 401 (same)                                              |
| POST   | `/api/auth/login`   | 400 `"user login failed" / "Email harus diisi"`         |
| POST   | `/api/auth/refresh` | 401 (same)                                              |
| POST   | `/api/auth/logout`  | 401 (same)                                              |

**Confirmed absent — every resource the legacy client modules call:**

`/api/galleries`, `/api/users`, `/api/users/me`, `/api/requests`, `/api/uploads`, `/api/repositories`, `/api/auth/change-password`, `/api/auth/register` → **all `404 page not found`** (Go `http.NotFound`).

Two secondary findings from these probes:

- **`GET /api/magang/get-token` is broken.** It returns an HTML anchor whose OAuth URL has an **empty `client_id`**:
  `https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=&response_type=code&scope=…drive.file+…spreadsheets&state=state-token`
  The Google OAuth client is not configured server-side, so the magang Drive/Sheets integration cannot complete. (`src/app/ayomeludaftarmagang/page.tsx` depends on `useUploadMagang` → `POST /api/magang/upload`.)
- **The Swagger document is itself stale and incomplete**: `host` points at `localhost:5000`, and the entire `/auth/*` group is undocumented. It is not a reliable contract; the 404/401 probes are.

> **Consequence for the CMS:** there is no legacy auth service worth integrating with. Directus must supply authentication, users, roles and content. Nothing should be built on `api.hmtc-its.com/api/auth/*` beyond what already exists.

### 2.5 Declared-but-unused dependencies

Zero importers in `src/` (including `.jsx`), verified by grep:

`next-themes`, `react-hot-toast`, `react-scroll`, `universal-cookie`, `date-fns`, `depcheck`, `autoprefixer`, `lightningcss`

- `next-themes` is a **documented deferral** — `DESIGN.md` §10 A5 / §12 O7. Do not "fix" it here.
- `autoprefixer` / `lightningcss` are **not** referenced by `postcss.config.js` (which configures `@tailwindcss/postcss` + `cssnano`). `lightningcss` may be transitive via Tailwind v4 — do not assume it is safe to remove.
- `depcheck` sits in `dependencies`, not `devDependencies`, and no script invokes it.

Single-importer dependencies: `@tanstack/react-virtual` (`base-data-table.tsx`), `auto-zustand-selectors-hook` + `immer` + `zustand` (`src/store/useDialogStore.tsx`), `postprocessing`/`three` (`PixelBlast.jsx`, `ColorBends.jsx`), `react-day-picker` (`ui/calendar.tsx`), `react-dropzone` (`gallery/FileUpload.tsx`), `swiper` (`carousel/Kepengurusan.tsx`).

---

## 3. Representative data-flow traces

### 3.1 Trace A — the live path: public form → Route Handler → NocoDB

This is the **only** end-to-end working data path, and the correct template for the CMS BFF.

```
src/app/magical-message/page.tsx                    ('use client')
  └─ fetch('/api/magical-message', { method: 'POST', body: JSON.stringify(...) })
       └─ src/app/api/magical-message/route.ts      POST()
            ├─ getRequiredEnv()
            │    reads NOCODB_BASE_URL | NOCODB_API_TOKEN | NOCODB_MAGICAL_MESSAGE_TABLE_ID
            │    missing → 500 + human-readable Indonesian message
            ├─ request.json()  → validate doaHarapan/namaPenulis non-empty → 400
            ├─ fetch(`${NOCODB_BASE_URL}/api/v2/tables/${tableId}/records`, {
            │      method: 'POST',
            │      headers: { 'xc-token': process.env.NOCODB_API_TOKEN },   ← server-only ✅
            │      body: JSON.stringify(rowData),
            │      cache: 'no-store',
            │  })
            ├─ !ok → passthrough status + NocoDB `message`/`msg`
            └─ 201 { message: 'Pesan berhasil dikirim.' }
```

**Auth:** none — the endpoint is public by design. **Cache:** `no-store` everywhere; nothing is tagged or revalidated. **Validation:** hand-rolled; no schema library.

Sibling handlers add: file validation (`/api/tc-run`: MIME `image/jpeg|png`, ≤5 MiB), server-side quota (`/api/seminar-dosen-3`: `GET` count endpoint, `409` when full).

**Weaknesses to fix in the CMS copy:** no rate limiting, no origin/CSRF check, no captcha, no Zod, no tagged caching.

### 3.2 Trace B — the live axios path: Evaluasi CMI (works)

```
src/app/evaluasi-cmi/page.tsx                              (Server Component)
  └─ <EvaluasiCMIFormStep />                               ('use client')
       └─ useSubmitEvaluasiCMI({ onSuccess, onError })      src/hooks/api/useSubmitEvaluasiCMI.ts
            └─ transformToBackendPayload(formData)          flattens nested form → flat snake_case payload
            └─ api.post('/evaluasi-cmi/submit', payload, { headers: { 'Content-Type': 'application/json' } })
                 └─ src/lib/api/api.ts  baseURL = NEXT_PUBLIC_API_URL_{DEV,PROD}   ← i.e. https://api.hmtc-its.com/api
                      └─ applyInterceptors → 401? refresh, else transformApiError
                 └─ server: POST /api/evaluasi-cmi/submit → 400 validation error naming Go type `EvalCmi25Req`
            └─ onSuccess: invalidateQueries(['evaluasi-cmi','list']) — a key nothing else uses
            └─ toast.success / toast.error
```

**This is the only axios call in the repository that reaches a live route.** `POST /api/evaluasi-cmi/submit` genuinely exists (probed: 400 with a Go validator message for `EvalCmi25Req.Nama`).

**But it is inconsistent with the stated direction:** the user's position is that data-related forms now go through NocoDB `fetch`. This form still posts to the legacy Go API. **Decide whether Evaluasi CMI migrates to NocoDB or to Directus** — it is the one live exception that will otherwise become an orphan (see Q6).

### 3.3 Trace C — the dead path: dashboard reads

```
src/app/dashboard/user-requests/[id]/page.tsx                ('use client')
  ├─ useParams() → requestId
  ├─ getMockRequestDetail(requestId)                        ← MOCK. Renders fabricated data.
  │    // line 77: "Mock Data - In production, use:
  │    //            const { data: requestDetail, isLoading } = useRequestDetail(requestId);"
  ├─ useApproveRequest() / useRejectRequest()               ← LIVE CODE, DEAD ENDPOINT
  │    └─ api.post(`/requests/${id}/approve`)  →  GET/POST /api/requests/... → 404
  └─ handleConfirmApprove() → mutateAsync → toast.error     ← always fails
```

Same shape in `gallery/[id]/edit` (`USE_DUMMY = true`), `users`, `repository`, `user-uploads`, `gallery` list. 13/13 dashboard pages carry mock generators; the read hooks are either disabled by flag, commented out, or pointed at 404s.

### 3.4 Trace D — period gating (middleware ↔ handler ↔ four client hooks)

```
src/proxy.ts   (Next 16 middleware — exported as `proxy`, config.matcher)
  ├─ isSafeMethod(req.method) → non-GET/HEAD passes untouched
  ├─ handlePeriodGating(req, pathname)      for /ayomeludaftarmagang, /hidden-page-cf
  │    └─ fetch(`${origin}/api/schedule?path=…`, { cache: 'no-store' })
  │         !ok → retry once with `_ts` → still !ok → ALLOW  (fail-open)
  │         ok + active:false → retry → redirect('/coming-soon?page=…')
  │         parse throw → redirect('/coming-soon')            (fail-closed)
  └─ handleAdminBlocking(req, pathname, shouldDisableAdminRoutes())
       prod default (DISABLE_ADMIN_ROUTES !== '0'):
         /sandbox/**, /dashboard/**, /login, /register, /change-password/** → /coming-soon
```

Four independent consumers of one endpoint:

| Consumer                  | File                                       | Mechanism                                                                 |
| ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| `useIsScheduleActive`     | `src/hooks/api/useIsScheduleActive.ts`     | `useQuery`, `staleTime: 30 s`                                             |
| `useAutoIsScheduleActive` | `src/hooks/api/useAutoIsScheduleActive.ts` | raw `setInterval(5 s)` + `CustomEvent('hmtc:schedule')` — **unreachable** |
| `useSchedule`             | `src/hooks/api/useSchedule.ts`             | raw `useState`/`useEffect` + 1 s UI ticker                                |
| `useScheduleAutoRedirect` | `src/hooks/api/useSchedule.ts`             | raw `setInterval(5 s)` + `router.replace`                                 |

**This is not an authorization mechanism.** No cookie is read, no session validated.

### 3.5 Trace E — public page render (no data fetching at all)

```
src/app/page.tsx                                  (Server Component)
  ├─ import LandingPage from '@/app/landing/LandingPage'   ('use client')
  ├─ <JsonLd />, <Footer />
  └─ LandingPage: dynamic(() => import('./components/about/About'), { ssr: true })
       HOME_SECTIONS = [about, showcase, kabinet]        ← several sections commented out
```

Content is imported as TypeScript constants (`src/contents/{layout,announcement,gallery,magangForm,evaluasiCMI}.ts`) or inlined in `PageContent.tsx`. Confirmed by `DESIGN.md` §11. **This is the flow a CMS must replace, and it has no server-side fetch step to hook into.**

### 3.6 Is there one consistent pattern?

**No — and the picture is worse than "three competing patterns", because only one of the three still works:**

1. ✅ **NocoDB `fetch` in Route Handlers** — live, correct secret handling, the only working path.
2. ❌ **axios + React Query → `api.hmtc-its.com`** — a client for a decommissioned surface. One endpoint (`/evaluasi-cmi/submit`) still resolves; everything else is 404.
3. ⬜ **Directus** — no integration exists, despite a complete schema.

Plus a latent fourth: `src/lib/withAuth.tsx` defines `createApiLocal()`, an axios instance **without** `applyInterceptors` — no refresh, no error normalisation. Pages-Router-shaped and unimported; reviving it would silently bypass auth refresh.

---

## 4. Architecture and security findings

### 4.1 Application findings

---

#### F1 — No session verification anywhere (Critical)

`src/proxy.ts` gates `/dashboard/**` and `/sandbox/**` by **pathname only**, in production only, via a redirect to `/coming-soon`. `handleAdminBlocking()` receives `req`, `pathname`, `shouldDisable` and never reads a cookie or validates a session.

All 13 dashboard pages hardcode an identity:

```tsx
// representative — src/app/dashboard/users/page.tsx:257
const user: UserType = { name: 'Jane Smith', role: 'Administrator', avatarUrl: '' };
<DashboardLayout navItems={navItem} user={user} onLogout={() => {/* Handle logout */}}>
```

| Page                                    | Fake identity                  |
| --------------------------------------- | ------------------------------ |
| `dashboard/users/page.tsx`              | `Jane Smith` / `Administrator` |
| `dashboard/user-requests/[id]/page.tsx` | `John Doe (Administrator)`     |
| `dashboard/profile/page.tsx`            | `Sumira`                       |
| …10 more                                | similar                        |

`src/lib/withAuth.tsx` — the only auth abstraction — has **0 importers** and imports `GetServerSideProps*` from `next/types` (Pages-Router APIs) in an App-Router-only codebase.

There is **no** NextAuth/Auth.js, no `iron-session`, no JWT verification, no cookie parsing. `grep -ri "next-auth\|authjs\|iron-session\|jose\|jsonwebtoken"` on `src/` and `package.json` → nothing.

> **Impact:** an unauthenticated visitor who reaches the CMS route in production is stopped only by an environment-variable-dependent pathname redirect. No CMS screen can be called done until this is replaced.

---

#### F2 — Two TanStack Query clients, contradictory configuration (High)

| Location                   | `staleTime` | `gcTime` | `retry`               | queryFn          | `suspense` | Status     |
| -------------------------- | ----------- | -------- | --------------------- | ---------------- | ---------- | ---------- |
| `src/app/providers.tsx:53` | 3 min       | default  | `0` dev / `3` prod    | `defaultQueryFn` | `true`     | **Active** |
| `src/lib/query-client.ts`  | 5 min       | 10 min   | never 4xx, else `< 3` | none             | none       | **Dead**   |

Also in the active client:

- `suspense: true` in `defaultOptions.queries` is not the documented v5 mechanism (observer-level option), and is cast through a locally-declared `ExtendedQueryObserverOptions` to silence TypeScript.
- `defaultQueryFn` derives the endpoint from `queryKey[0]`:

  ```ts
  const endpoint = queryKey[0] as string;
  const { data } = await api.get(endpoint);
  ```

  Every current hook passes an explicit `queryFn`, so this is latent — but any hook that forgets one silently issues `GET /users`. Given the CMS will add hooks, remove it.

---

#### F3 — `ApiResponse<T>` contains a stray member (High — type safety)

`src/types/api.ts`:

```ts
export type ApiResponse<T> = {
  id(id: any): readonly ['galleries', 'detail', number]; // ← stray copy-paste artifact
  message: string;
  status: boolean;
  code: number;
  data: T;
};
```

`ApiResponse<T>` declares a callable `id`. Load-bearing across 6 client modules and 24 hooks → **24 importers** (see the import-graph table). Should be a 4-field interface.

---

#### F4 — Responses are typed, never validated (High)

`ApiResponse<T>` is a compile-time assertion over `response.data`; nothing checks the payload matches `T`. A backend change yields `undefined` deep inside a component rather than a caught error — precisely what a CMS makes more likely, because content shape becomes editor-controlled.

`zod@^4.0.16` is installed as a **devDependency** and used only for client form schemas. No response schema exists.

---

#### F5 — Zero authorization checks; the UI cannot distinguish 401/403 (High)

- No route handler verifies identity.
- No `page.tsx` or component checks role.
- The permission matrix is implied by display strings (`ROLE_CONFIG` in `dashboard/users/page.tsx`: Admin Repository, Admin Gallery, User, Editor, Viewer) and enforced nowhere.
- 403 is normalised by the interceptor but only rendered as a toast. **There is no permission-error UI state.**

> The brief requires the CMS to "show meaningful permission-related errors" and "avoid pretending that an operation succeeded when it failed". Neither is currently possible. This is the one genuinely new state component to build.

---

#### F6 — Production CSP excludes Directus (High — architectural constraint, arguably correct)

`next.config.js`:

```
default-src 'self';
connect-src 'self' https://api.hmtc-its.com;
script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
frame-src https://www.youtube.com https://www.youtube-nocookie.com;
```

- `connect-src` omits `directus.hmtc-its.com` → browser→Directus API calls are blocked in production. **Keep it.** This makes "the browser never talks to Directus" a policy rather than a convention.
- `img-src 'self' data: https:` **does** permit any HTTPS image origin → Directus asset URLs render. Note the asymmetry: images allowed, API calls not.

Also: `script-src` includes `'unsafe-inline'` in production and `'unsafe-eval'` in development; `next.config.js` is CommonJS and cannot import TS config.

---

#### F7 — `images.remotePatterns` blocks Directus media (Critical)

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '**.cloudflareinsights.com' },
  ];
}
```

`AGENTS.md` §4.4 and `DESIGN.md` §7 codify this. A Directus asset URL (`https://directus.hmtc-its.com/assets/<uuid>`) throws at render through `next/image` / `<NextImage>` (`src/components/NextImage.tsx`, 22 importers) — and Directus **does** hold assets (`directus_files`, folder "Public Assets").

**Must be resolved before any Media Library or preview work.** Options in §8 Q4.

---

#### F8 — Public write endpoints unauthenticated and unthrottled (Medium)

`/api/magical-message`, `/api/seminar-dosen*`, `/api/tc-run` accept anonymous POSTs writing to NocoDB; `/api/tc-run` accepts a ≤5 MiB upload. No rate limit, no origin/CSRF check, no captcha. Business rules depend on client-side checks (`useUploadMagang` refuses to submit unless `useIsScheduleActive` — bypassable with `curl`). `/api/seminar-dosen-3`'s server-side quota is the right precedent.

Establish the convention (auth + rate limit) in the same layer that will host the Directus proxy.

---

#### F9 — Root `<Suspense>` changes page-level error/status semantics (Medium)

`src/app/providers.tsx` wraps all children in `<React.Suspense fallback={<Loading />}>`, rendered from `src/app/layout.tsx`. Consequence (already recorded in the repo's own notes): inside a `page.tsx`, `notFound()` returns **HTTP 200** rendering the 404 UI, and `redirect()`/`permanentRedirect()` emit in-stream `NEXT_REDIRECT` rather than a real 3xx + `Location`.

Working alternatives already established here (proker routes):

- real 404 → `generateStaticParams()` + `export const dynamicParams = false`
- real 301 → a `route.ts` returning `NextResponse.redirect(url, 301)`

> Preview/draft URLs and "unpublished → 404" **must** use these, not `notFound()`.

---

#### F10 — Middleware will swallow the CMS in production (Medium)

`src/proxy.ts` blocks `/dashboard/**` and `/sandbox/**` in production unless `DISABLE_ADMIN_ROUTES=0`. A CMS under either prefix is unreachable until the matcher and blocked list are updated. `handlePeriodGating` additionally adds an external HTTP call to the critical path for gated prefixes.

Note `GATED_PREFIXES` includes `/hidden-page-cf`, whose schedule window is `2025-10-24T09:55+07:00 → 10:00+07:00` — a five-minute window in the past, so that page is permanently redirected today.

---

#### F11 — No tests; lint cannot catch the a11y floor (Medium)

- `pnpm test` → `jest --passWithNoTests`; zero test files exist. `jest.config.ts` is stock (jsdom, v8 coverage, `next/jest`).
- `eslint.config.mjs` sets `'@typescript-eslint/no-unused-vars': 'off'` and `'no-explicit-any': 'off'`, and **does not register `eslint-plugin-jsx-a11y`** despite it being installed. `AGENTS.md` §7 states this explicitly.

> The a11y floor (one `<h1>`/page, `aria-label` on icon-only controls, reduced-motion guard, inert hidden nav) must be enforced by review and by tests you add.

---

#### F12 — Shared nav a11y / readability defects (Low — pre-existing)

`src/layouts/DashboardLayout.tsx` hides the mobile sidebar with `hidden` / `-translate-x-full` on an `<aside>` whose `className` string embeds a comment block (`'/* Desktop - Always */ /* Mobile - Hidden by default…'`) and a template literal that resolves to the same value in both branches (`lg:${sidebarOpen ? 'block' : 'block'}`). `AGENTS.md` §7.5 flags the general pattern.

Also: `DashboardLayout` renders children only after `setMounted(true)` in `useEffect` — the entire admin UI is client-only, with no server-rendered first paint.

---

#### F13 — Legacy client points at a decommissioned API surface (Critical — new in rev. 2)

See §2.4 for full evidence. Summary:

| Frontend calls                                                                                                                                           | Server response |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `/api/galleries`, `/api/users`, `/api/users/me`, `/api/requests`, `/api/uploads`, `/api/repositories`, `/api/auth/change-password`, `/api/auth/register` | **404**         |

The server is healthy (`/health` → 200) and exposes exactly 5 documented operations plus an undocumented `/auth/*` group. **No code that calls the gallery/repository/user/request/upload resources can ever succeed.**

`POST /api/magang/get-token` additionally returns an OAuth URL with an **empty `client_id`** — the Google Drive/Sheets integration is misconfigured server-side, so the magang upload flow is broken even though its routes exist.

**Implication:** do not extend this layer, and do not model the CMS's auth or content on it.

---

#### F14 — `cms_departments.slug` does not match the repo's route segments (High — new in rev. 2)

`cms_departments.slug` is documented in Directus as _"Slug digunakan sebagai suffix untuk navigasi halaman departemen. Contoh: /internal-affairs"_ — i.e. a route segment. Compared with the repo's actual routes:

| Directus `cms_departments.slug` | Repo route under `src/app/`    | Match?                      |
| ------------------------------- | ------------------------------ | --------------------------- |
| `internal-affairs`              | `internal-affairs/`            | ✅                          |
| `student-welfare`               | `student-welfare/`             | ✅                          |
| `student-social-development`    | `student-social-development/`  | ✅                          |
| **`research-technology`**       | **`research-and-technology/`** | ❌                          |
| `creative-media-information`    | — (no route)                   | ⚠️                          |
| `external-affairs`              | — (no route)                   | ⚠️                          |
| `student-talent-interest`       | — (no route)                   | ⚠️                          |
| `student-resource-development`  | — (no route)                   | ⚠️                          |
| `enterpreneurship-development`  | — (no route)                   | ⚠️ typo: "Enterpreneurship" |

The `research-technology` → `research-and-technology` mismatch is a **hard 404 generator** if `slug` is used to build URLs. Also note `DESIGN.md` §14 and `src/lib/config.ts` define `PROKER_BASE_PATHS` as the single source of truth for proker routing — that literal set must be reconciled with `cms_departments.slug` / `cms_prokers.slug` before any CMS-driven URL construction.

### 4.2 Security boundary audit — the requested checklist

| Check                                            | Result                                                                                                                                                                                                                  | Evidence                                    |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Private credentials stay server-side             | ✅ **Pass.** `NOCODB_API_TOKEN` is read via `process.env` in Route Handlers only, sent as `xc-token` server-to-server.                                                                                                  | `src/app/api/*/route.ts` `getRequiredEnv()` |
| Public env vars leak secrets                     | ✅ **Pass.** Only `NEXT_PUBLIC_*` base URLs, a run mode, and an analytics ID. **`DIRECTUS_*` appears nowhere in `.env.example`.**                                                                                       | `.env.example`                              |
| Browser components call Directus directly        | ✅ **Pass (vacuously).** No Directus call exists. CSP would block one in production.                                                                                                                                    | `grep -ri directus src`; `next.config.js`   |
| Sessions and permissions verified                | ❌ **Fail.** No session check, no auth library, no cookie validation, no session config of any kind.                                                                                                                    | F1                                          |
| API responses validated or typed                 | ⚠️ **Typed only.** Hand-written types; `ApiResponse<T>` is itself malformed; no runtime validation despite `zod` being installed.                                                                                       | F3, F4                                      |
| Mutations have authorization checks              | ⚠️ **Client-side none; server-side unverifiable.** The app sends a cookie and trusts the API. The live NocoDB handlers have no auth at all.                                                                             | F5, F8                                      |
| Preview/draft content cannot be publicly exposed | ⚠️ **Not implemented.** No preview exists. Directus has `status` (`draft, in_review, changes_requested, published, archived`) but no code reads it, and the root `<Suspense>` makes `notFound()` a soft-404 (HTTP 200). | F9, §9.1                                    |
| Legacy API used for anything sensitive           | ⚠️ **Its `/auth/*` group still answers**, but is undocumented and unreferenced by any working code path except login/register pages that are proxy-blocked in production.                                               | F13                                         |
| Secrets printed in this report                   | ✅ **None.** No env value, token, password, or key appears here. All probes were unauthenticated.                                                                                                                       | —                                           |

### 4.3 NEW — Directus schema defects

Recorded as findings; **no schema change was made** (out of scope for this phase).

| #   | Defect                                                      | Detail                                                                                                                                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | Typo in a field name                                        | `cms_form_answers.field_type_snapshow` — should be `field_type_snapshot`. The misspelling is in both the column name and the API payload, so it will propagate into generated types and any form-rendering code.                                                                                                                               |
| S2  | `cms_pages.slug` is **globally unique** (`is_unique: true`) | Content is year-scoped (`edition_year` is required and indexed). A slug like `welcome-party` cannot exist in both the 2026 and 2027 editions. Global uniqueness conflicts with the edition model defined in `DESIGN.md` §14 / `src/lib/config.ts`.                                                                                             |
| S3  | `cms_pages.proker` is `required: true`                      | Every page must belong to a proker. Standalone pages (e.g. `/info`, About, Contact, a landing page) have no valid value. Either make it nullable or introduce a sentinel proker.                                                                                                                                                               |
| S4  | Every `cms_*` field has `"interface": null`                 | The schema was created programmatically. Directus Studio will render these as **raw inputs**, not dropdowns/relations. Corollary: `cms_pages.blocks` gets a **plain JSON textarea** — there is no Directus-side block editor. The typed block registry must therefore live in the Next.js app, and Studio is not a viable editor for `blocks`. |
| S5  | Enum values are documentation-only                          | `cms_pages.status`, `cms_pages.page_type`, `cms_forms.status`, `cms_form_versions.status`, `cms_review_events.action` are plain `string`/`varchar` with the allowed set written in the field `note`. Nothing enforces them at the database or API level. Validation must live in application code (Zod).                                       |
| S6  | `cms_pages.status` nullability disagrees with itself        | Schema: `is_nullable: true`. Meta: `required: true`. Resolve before generating types.                                                                                                                                                                                                                                                          |
| S7  | `cms_site_settings` is not marked as a singleton            | `id` is a plain `integer` PK with no singleton guarantee in the API response. Treat as "expect one row" defensively.                                                                                                                                                                                                                           |

---

## 5. Proposed data-access architecture

### 5.1 Guiding principle

> **One new server-side data module. One new BFF route group. Keep TanStack Query. Retire the legacy client.**

### 5.2 Decision: substitute, not extend (revised in rev. 2)

You asked me to evaluate a rewrite versus a minimal extension. **Revision 1 recommended extending the axios layer. That recommendation is now withdrawn**, because the layer it proposed to extend turned out to be a client for a decommissioned API (§2.4, F13).

| Option                                                         | Verdict                                                                                                                                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Extend the legacy axios client** — rev. 1 recommendation  | ❌ **Withdrawn.** Its targets do not exist (404). Extending it means rebuilding 6 REST resources on a service that does not have them, duplicating Directus.                                       |
| **B. Big-bang rewrite of all dashboard code onto a new stack** | ❌ Not recommended. 13 pages are already mock-only; rewriting them before the CMS contract exists is wasted motion. The UI shell is fine.                                                          |
| **C. Substitution (recommended)**                              | ✅ **New server module + new BFF routes for the CMS; keep the Query library and the L4 UI; delete the dead client files as they are replaced.** The legacy client is not migrated — it is retired. |

**Concretely, what is kept and what is lost by retiring the axios layer:**

| Asset                                          | Decision            | Rationale                                                                                                                    |
| ---------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `applyInterceptors` single-flight refresh      | ❌ Retire           | Its entire purpose was refreshing a cookie against `/api/auth/refresh`. Directus has its own auth; do not port a second one. |
| `transformApiError` normalisation              | ❌ Retire           | Directus returns `{ errors: [{ message, extensions: { code } }] }`. Write a Directus-shaped normaliser instead.              |
| `buildPayload` / FormData handling             | 🟡 Mine the idea    | Directus uses the same multipart/JSON split. Reimplement in ~15 lines rather than importing a dead module.                   |
| **TanStack Query itself**                      | ✅ **Keep**         | Installed, wired, understood by the team. Replace the client underneath it, not the library.                                 |
| **`src/components/table/base-data-table.tsx`** | ✅ **Keep**         | Client + server modes, CSV export, column persistence, virtualization. Directly reusable for CMS lists.                      |
| **L4 shadcn/ui primitives + tokens**           | ✅ **Keep**         | `DESIGN.md` §8.                                                                                                              |
| **The ≈10,900-line page-builder mockups**      | ✅ **Keep as spec** | High-fidelity visual reference for Phases 3–5.                                                                               |

### 5.3 Proposed module layout

```text
src/lib/directus/
  client.ts        # server-only fetch wrapper. `import 'server-only'`.
                   #   - base URL + static/role token from process.env
                   #   - cache tags on every call
                   #   - Directus error normalisation
  types.ts         # generated Directus collection types — SINGLE SOURCE OF TRUTH
  schema.ts        # Zod schemas for cms_pages / blocks / forms (enforces S5's doc-only enums)
  collections.ts   # typed accessors: listPages(), getPageBySlug(), listProkers(), …
  blocks.ts        # the typed React block registry (schema + renderer map) — validates cms_pages.blocks
  preview.ts       # draft/preview token verification (server-only)

src/app/api/cms/
  [...path]/route.ts   # authenticated BFF: session check → operation allowlist → Directus
```

**Server-side reads** — public pages `await` `src/lib/directus/collections.ts`. That module is the _only_ place a Directus credential is read, guarded with `import 'server-only'` so a client import fails the build rather than leaking.

**Interactive editor** — keep TanStack Query; add `cmsKeys` to `src/lib/query-keys.ts`. Follow the existing mutation convention (`onSuccess` → `invalidateQueries` + `toast.success`; `onError` → `toast.error`) but call the BFF, never Directus.

**Mutations** — browser → `src/app/api/cms/[...path]/route.ts` → Directus. Authorization is enforced in the Route Handler (session check **then** an allowlist of permitted operations), never in the browser. Payloads validated with Zod. This is what makes F1/F5 fixable at all.

**Preview and publishing** — drafts fetched server-side only, gated by a signed short-lived token; unpublished content answered with a **real 404** via `dynamicParams = false` (F9). Publishing calls `revalidateTag()` for the affected tags. Note `cms_review_events` already records `submitted / approved / changes_requested / unpublished / archived` — the workflow vocabulary exists in the schema; it needs `revalidateTag` wired to it.

**Type safety** — one source of truth. Derive Directus types once into `src/lib/directus/types.ts`. Do **not** re-declare collections in `src/types/`. The existing `ApiResponse<T>` types retire with the legacy client.

### 5.4 The block registry — the crux (revised by S4)

`cms_pages.blocks` and `cms_templates.blocks` are **untyped `json` columns with no Directus interface configured** (S4). That is a deliberate-looking design: Directus stores the tree opaquely, and the application owns its shape. It also means:

- **Directus Studio cannot edit blocks.** It offers a raw JSON textarea. Do not plan around Studio for page composition.
- **The registry is the contract.** Define it once as a discriminated union, paired with a Zod schema, and validate on _both_ read and write:

  ```ts
  // src/lib/directus/blocks.ts  (sketch)
  const BlockSchema = z.discriminatedUnion('type', [HeroBlock, RichTextBlock, AgendaBlock, GalleryBlock, …]);
  type Block = z.infer<typeof BlockSchema>;
  const renderers: Record<Block['type'], React.ComponentType<...>> = { … };
  ```

- **Unknown types must render a safe fallback**, never `dangerouslySetInnerHTML`. The brief mandates "Do not execute arbitrary HTML, CSS, or JavaScript supplied through CMS content" — an opaque JSON column makes that a live risk if reads are unvalidated.

The mockup's implied set (from `src/app/sandbox/page-builder/editor/page.tsx`: Hero / About / Event Details / Event Agenda / Gallery / Footer CTA, under Layout / Text / Media / Embeds categories) is a **design artifact, not a contract** — freeze it before Phase 4 (Q2).

### 5.5 Caching: the deliberate gap

There is currently **no** cache story. The minimum viable one:

- Tag every Directus read: `fetch(url, { next: { tags: ['cms:page:' + slug, 'cms:collection:pages'] } })`.
- On publish/unpublish, the BFF calls `revalidateTag()` for the item tag and its collection tag.
- Keep public pages statically generated (`generateStaticParams`) with tag-driven invalidation — matching the proker-route precedent in `DESIGN.md` §14.
- **Do not** add ISO-time `revalidate`; it reintroduces the staleness tags exist to remove.
- Keep middleware out of the read path (F10).

### 5.6 What must **not** be introduced

| Not this                                                      | Because                                                                                                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| A revivable legacy axios client                               | Its endpoints 404 (F13).                                                                                                               |
| `@directus/sdk` in the browser bundle                         | Directus is server-only here by CSP policy (F6).                                                                                       |
| A second client-side data library (SWR, another Query client) | TanStack Query is installed and wired in 24 modules.                                                                                   |
| A GrapesJS / framework block builder                          | The brief mandates a **typed React block registry**; a runtime HTML/CSS/JS executor contradicts it, and `blocks` is untyped JSON (S4). |
| Direct database access                                        | Directus owns the schema.                                                                                                              |
| Directus Studio as the page editor                            | F4/S4 — `blocks` renders as a raw JSON textarea.                                                                                       |
| React Server Actions for CMS writes                           | The Route-Handler BFF pattern is established (F-strategy table). Revisit only on demonstrated need.                                    |
| Generated `tailwind.config.js`                                | `AGENTS.md` §3 — `components.json`'s reference is stale. Tokens live in `globals.css`.                                                 |

---

## 6. Integrated interface proposal

### 6.1 What exists — and its true status

**Verified route structure** (these are real Next.js routes):

| Prototype file                                  | Real route                        | Lines | Status                                                                                                                         |
| ----------------------------------------------- | --------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/app/sandbox/page-builder/dashboard.tsx`    | `/sandbox/page-builder/dashboard` | 1,340 | **Static mockup.** Header: _"No Directus, GrapesJS, API, auth or persistence."_ Controls are `type='button'` with no handlers. |
| `src/app/sandbox/page-builder/content/page.tsx` | `/sandbox/page-builder/content`   | 1,217 | Static mockup — Posts & Pages                                                                                                  |
| `src/app/sandbox/page-builder/reviews/page.tsx` | `/sandbox/page-builder/reviews`   | 1,441 | Static mockup — Review & Approval                                                                                              |
| `src/app/sandbox/page-builder/media/page.tsx`   | `/sandbox/page-builder/media`     | 1,579 | Static mockup — Media Library                                                                                                  |
| `src/app/sandbox/page-builder/preview/page.tsx` | `/sandbox/page-builder/preview`   | 1,469 | Static mockup — Page Preview                                                                                                   |
| `src/app/sandbox/page-builder/users/page.tsx`   | `/sandbox/page-builder/users`     | 1,752 | Static mockup — Users & Roles                                                                                                  |
| `src/app/sandbox/page-builder/editor/page.tsx`  | `/sandbox/page-builder/editor`    | 1,862 | Static mockup — Visual Page Editor                                                                                             |
| `src/app/sandbox/page-builder/page.tsx`         | `/sandbox/page-builder`           | 245   | Index                                                                                                                          |

≈**10,900 lines** of design-compliant, non-functional UI, added in one commit (`422d679`).

**Operational admin surface:** `/dashboard/**`, 13 pages, ≈3,500 lines — routed, L4-styled, **mostly mock data**, and (per F13) structurally unable to work against the legacy API:

| Route                               | Real API?     | Notes                                                       |
| ----------------------------------- | ------------- | ----------------------------------------------------------- |
| `/dashboard/user-requests/[id]`     | ⚠️ write-only | Approve/reject mutations call 404 endpoints; read is mocked |
| `/dashboard/user-uploads/[id]`      | ⚠️ write-only | Same                                                        |
| `/dashboard/profile`                | ⚠️ partial    | `useUploadAvatar` reachable; endpoint 404s                  |
| `/dashboard/users`, `/users/[id]`   | ❌ mock       | `generateMockUsers(30)`                                     |
| `/dashboard/repository`, `/gallery` | ❌ mock       | `USE_DUMMY = true`, 404 endpoints                           |

### 6.2 The Directus schema already models the CMS (new in rev. 2)

This materially changes the estimate: **the target schema is not vapourware — it exists**, with 17 collections and sensible relations. Coverage of the seven requested screens:

| Requested screen        | Directus collections that back it                                                                                                                       | Notes                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**           | `cms_pages` (+ `cms_review_events`)                                                                                                                     | Counts by `status`; recent activity from review events                                                                                                |
| **Posts & Pages**       | `cms_pages`                                                                                                                                             | `title, slug, page_type, department, proker, edition_year, parent_page, status, published_at`                                                         |
| **Visual Editor**       | `cms_pages.blocks` (json) + `cms_templates.blocks`                                                                                                      | ⚠️ Opaque JSON, no Studio interface (S4) — the app owns the shape                                                                                     |
| **Media Library**       | `directus_files` + `directus_folders`                                                                                                                   | 1 folder ("Public Assets") seeded; 1 test asset. ⚠️ Blocked by F7                                                                                     |
| **Review & Approval**   | `cms_review_events` + `cms_pages.status`                                                                                                                | Vocabulary exists: `submitted / approved / changes_requested / unpublished / archived`                                                                |
| **Preview**             | `cms_pages.status` + `published_at`                                                                                                                     | ⚠️ Needs signed-token mechanism + real-404 rule (F9)                                                                                                  |
| **Users & Roles**       | `directus_users` + `cms_department_memberships`                                                                                                         | ⚠️ 1 user, 0 memberships, no editor role provisioned (F13/§9.1)                                                                                       |
| _(bonus)_ Redirects     | `cms_page_redirects`                                                                                                                                    | `source_path`, `destination_path`, `http_status`, `is_active` — better than the current hardcoded proker `route.ts` files                             |
| _(bonus)_ Site settings | `cms_site_settings`                                                                                                                                     | Singleton: `site_name`, `logo`, `favicon`, `default_seo_*`, `theme_tokens`, `footer_content`                                                          |
| _(bonus)_ Forms         | `cms_forms` → `cms_form_versions` → `cms_form_fields` → `cms_form_field_options`, `cms_form_submissions` → `cms_form_answers` → `cms_form_answer_files` | **A complete form-builder model** — versioned schemas, submission statuses, retention. This is the intended replacement for the NocoDB form handlers. |
| _(bonus)_ Departments   | `cms_departments`, `cms_prokers`                                                                                                                        | 9 departments seeded; prokers empty. ⚠️ Slug mismatch (F14)                                                                                           |

**Content inventory at audit time:**

| Collection                                               | Rows                              |
| -------------------------------------------------------- | --------------------------------- |
| `cms_departments`                                        | **9** (seeded, `is_active: true`) |
| `cms_prokers`                                            | 0                                 |
| `cms_pages`                                              | 0                                 |
| `cms_templates`                                          | 0                                 |
| `cms_forms` / `_versions` / `_fields` / `_field_options` | 0 / 0 / 0 / 0                     |
| `cms_form_submissions` / `_answers` / `_answer_files`    | 0 / 0 / 0                         |
| `cms_review_events`                                      | 0                                 |
| `cms_page_redirects`                                     | 0                                 |
| `cms_site_settings`                                      | 0                                 |
| `directus_users`                                         | **1** (admin only)                |
| `directus_folders`                                       | 1 ("Public Assets")               |
| `cms_department_memberships`                             | 0                                 |
| Directus flows                                           | 0                                 |

So: **schema complete, content empty, permissions unseeded.**

### 6.3 Initial scope recommendation

Ranked by value ÷ risk, updated for the real schema:

| #     | Section                         | Why now                                                                                                                                            | Depends on        |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **0** | **Foundations** (not a screen)  | F13 retirement, F2 QueryClient consolidation, F3 type repair, F7 asset decision, F10 middleware prefix. Nothing else is safe first.                | Q3, Q4            |
| **1** | **Session + shell**             | F1 is the wall. One authenticated layout, real identity, real logout, permission-denied state.                                                     | Q1 (answered), Q5 |
| **2** | **Content list** (`cms_pages`)  | `BaseDataTable` + `cmsKeys`. Highest value per line; the `/content` mockup is directly reusable.                                                   | Phase 2           |
| **3** | **Editor** (`cms_pages.blocks`) | The core. Requires the block union frozen first (Q2) — and per S4 the app, not Studio, is the only editor.                                         | Q2                |
| **4** | **Media** (`directus_files`)    | Blocked by **F7**. Also needs a folder/asset policy.                                                                                               | Q4                |
| **5** | **Preview + publishing**        | Needs the signed-token mechanism, the real-404 rule (F9), and `revalidateTag` wiring.                                                              | Q3                |
| **6** | **Forms** (`cms_forms` family)  | Genuinely valuable — it is the designed replacement for the 5 NocoDB handlers — but it is a form _builder_, not a CMS screen. Separate workstream. | Q6                |
| **7** | **Review/Approval**             | Defer. Schema supports it (`cms_review_events`), but it needs roles first (F13).                                                                   | Q1                |
| **8** | **Users & Roles**               | Defer indefinitely. Directus Studio already does users/roles/policies well; rebuilding it is the WordPress trap the brief warns against.           | —                 |

Note `cms_page_redirects` is a cheap, high-value win: it would replace the seven hand-written proker `route.ts` redirect files (`DESIGN.md` §14) with data.

### 6.4 Reuse map

| Need                  | Reuse                                                                                                                                                                                                                                                            | Do not create                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Tables/lists          | `src/components/table/base-data-table.tsx` (client + server modes, CSV export, column persistence, virtualization)                                                                                                                                               | a second data-table                                   |
| Status chips          | `src/components/table/status-badge.tsx` — **extend the union**: it currently supports `pending \| in-review \| approved \| rejected` (request-approval vocabulary), but `cms_pages.status` is `draft \| in_review \| changes_requested \| published \| archived` | a second badge                                        |
| Empty state           | `src/components/table/empty-state.tsx`                                                                                                                                                                                                                           | inline `<p>No data</p>`                               |
| Loading               | `src/components/table/skeleton-rows.tsx`, `src/components/ui/skeleton.tsx`, `src/components/Loading.tsx`                                                                                                                                                         | a fourth spinner                                      |
| Errors                | `sonner` toast (existing convention) + **new** shared permission-error component                                                                                                                                                                                 | silent failures                                       |
| Buttons/dialogs/cards | `src/components/ui/{button,card,dialog,confirm-modal}.tsx` (L4)                                                                                                                                                                                                  | `buttons/Button.tsx` is L1/L3 — **do not mix layers** |
| Nav chrome            | `src/layouts/{header-bar,sidebar-nav,user-menu}.tsx`                                                                                                                                                                                                             | a second sidebar                                      |
| Design tokens         | `src/styles/globals.css` `@theme` — `DESIGN.md` §8                                                                                                                                                                                                               | any new hex, radius, breakpoint, `max-w-*`            |

`DESIGN.md` §8 notes L4 `primary`/`ring` (`#186BEC`) are unreconciled with L1 brand blue (`#00AAE7`) (§12 O1). The CMS is L4, so this is acceptable — but do not surface L4 tokens on public pages.

### 6.5 Required states

Every CMS screen must render five states; three have primitives already:

- **loading** → `SkeletonRows` / `Skeleton`
- **error** → `toast.error` + inline retry
- **empty** → `EmptyState` with an action
- **populated** → `BaseDataTable`
- **permission denied** → **does not exist; must be built** (F5). The one genuinely new component.

---

## 7. Implementation plan

Each phase is independently shippable and ends with the repo's own gate:

```bash
pnpm typecheck && pnpm lint:strict && pnpm format:check && pnpm test
```

### Phase 0 — Foundations & cleanup (no Directus work)

| Task                                                                                                 | Files                                                                                                                                                                                                  | Acceptance criteria                                                         |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 0.1 Delete confirmed-dead modules                                                                    | `src/lib/api/upload.client.ts`, `src/components/buttons/IconButton.tsx`, `src/lib/query-client.ts`, `src/lib/withAuth.tsx`, `src/hooks/api/useAutoIsScheduleActive.ts`, `src/components/Grainient.jsx` | Build + typecheck clean; no importer broken                                 |
| 0.2 Collapse to one QueryClient; remove `suspense: true` from client defaults; drop `defaultQueryFn` | `src/app/providers.tsx`                                                                                                                                                                                | One client; every hook passes an explicit `queryFn`                         |
| 0.3 Repair `ApiResponse<T>` (remove stray `id`) — or delete it with the legacy client (0.5)          | `src/types/api.ts`                                                                                                                                                                                     | `pnpm typecheck` passes                                                     |
| 0.4 Resolve asset delivery (**F7**)                                                                  | `next.config.js` or a new asset proxy route                                                                                                                                                            | A Directus-hosted image renders through `<NextImage>` in `pnpm dev`         |
| 0.5 Decide the CMS route prefix and update middleware (**F10**)                                      | `src/proxy.ts` (`BLOCKED_PREFIXES`, `config.matcher`)                                                                                                                                                  | CMS route reachable in a production build with `DISABLE_ADMIN_ROUTES` unset |
| 0.6 Reconcile `cms_departments.slug` with repo routes (**F14**)                                      | Seed fix in Directus (_needs approval_) + `src/lib/config.ts`                                                                                                                                          | Every department slug resolves to a real route                              |
| 0.7 Add the permission-error state component                                                         | new `src/components/cms/permission-denied.tsx`                                                                                                                                                         | Renders on a simulated 403                                                  |
| 0.8 Decide the fate of the dead axios client                                                         | `src/lib/api/api.ts`, 6 `*.client.ts`, 20 hooks                                                                                                                                                        | Either retired (recommended) or explicitly parked with a documented owner   |

**Blockers:** 0.4, 0.5, 0.6, 0.8 are decisions (Q3–Q6), not code.

### Phase 1 — Session & shell

| Task                                                                               | Acceptance criteria                                                                                         |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1.1 Choose and implement server-side session verification against Directus         | Unauthenticated request to the CMS route is rejected server-side, not by a pathname redirect                |
| 1.2 Replace the dummy `user` object in all 13 dashboard pages                      | `grep -rn "John Doe\|Jane Smith\|Sumira" src/app/dashboard` → empty                                         |
| 1.3 Real logout                                                                    | `onLogout` clears the session server-side                                                                   |
| 1.4 Seed roles/users in Directus (editor, reviewer) + `cms_department_memberships` | At least one non-admin role can reach the CMS; an unauthorized role gets a rendered permission-denied state |

**Depends on:** Q5 (route prefix). **Do not start before Phase 0.5.**

### Phase 2 — Server data layer

| Task                                                                             | Acceptance criteria                                        |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 2.1 `src/lib/directus/{client,types,collections}.ts` with `import 'server-only'` | A client-side import of `client.ts` fails the build        |
| 2.2 Generate Directus types once (single source of truth)                        | No collection is declared twice in `src/`                  |
| 2.3 Zod schemas enforcing the doc-only enums (**S5**)                            | An invalid `status`/`page_type` is rejected, not persisted |
| 2.4 Tag every read                                                               | grep proves zero untagged Directus fetches                 |

### Phase 3 — Public rendering (first real payoff)

| Task                                                              | Acceptance criteria                                                                           |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 3.1 One public page renders from `cms_pages`                      | Statically generated via `generateStaticParams`; published edits appear after `revalidateTag` |
| 3.2 Unpublished content → real 404                                | `curl -i` shows `404`, not 200 (`dynamicParams = false`; **not** `notFound()` — F9)           |
| 3.3 Deck floors                                                   | `Footer` present, exactly one `<h1>`, `Typography` with explicit `font`                       |
| 3.4 _Optional, high value:_ `cms_page_redirects` drives redirects | Replaces hand-written proker `route.ts` files                                                 |

### Phase 4 — Content list + editor

| Task                                                                        | Acceptance criteria                                                                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 4.1 Block registry: discriminated union + Zod + renderer map                | Unknown block type renders a safe fallback; **no `dangerouslySetInnerHTML` anywhere** |
| 4.2 Content list on `BaseDataTable` + `cmsKeys`                             | loading / empty / error / populated / permission-denied all reachable                 |
| 4.3 Editor: insert/reorder/edit blocks → BFF mutation → `invalidateQueries` | Allowlisted block types only                                                          |
| 4.4 Server-side payload validation on save                                  | Unexpected block type rejected with a readable error, never silently persisted        |

**Depends on:** Q2 (frozen block set).

### Phase 5 — Media, preview, publishing

| Task                                                     | Acceptance criteria                                                           |
| -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 5.1 Media Library over `directus_files`                  | Thumbnails render; **requires 0.4**                                           |
| 5.2 Preview route with signed short-lived token          | Unauthenticated preview URL rejected; drafts never enter the public cache     |
| 5.3 Publish → `revalidateTag` → public page updates      | Lag bounded by the tag call, not a timer                                      |
| 5.4 `cms_review_events` + `cms_pages.status` transitions | `submitted → in_review → approved/changes_requested → published` all recorded |

### Phase 6 — Forms workstream (separate, conditional on Q6)

`cms_forms` → `cms_form_versions` → `cms_form_fields` is a designed replacement for the 5 NocoDB handlers. Migrating is a project in its own right. **Note:** `cms_form_answers.field_type_snapshow` should be corrected before any code depends on it (**S1**).

### Phase 7 — Verification hardening

| Task                                                                                           | Acceptance criteria                                                                 |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 7.1 First real tests (BFF route handlers, Directus error normalisation, block-registry schema) | `pnpm test` runs non-zero tests; `--passWithNoTests` no longer masks an empty suite |
| 7.2 Update `DESIGN.md` §11 and `AGENTS.md` §3 with the new data path                           | `AGENTS.md` §12 satisfied ("update in the same change")                             |

> Run `pnpm format:write` before every phase gate — `prettier-plugin-tailwindcss` reorders classes (`AGENTS.md` §9), so hand-ordering fails `format:check`.

---

## 8. Open questions

**Q1 — What does the Directus schema contain?** ✅ **ANSWERED** — see §6.2 and §9.1. 17 collections; complete page/block/review/redirect/form/template/settings model; only `cms_departments` seeded (9 rows); 1 user; 0 flows; roles not enumerable via MCP. Three schema defects recorded in §4.3.

#### Q2 — What is the initial set of approved React blocks?

Since `blocks` is opaque JSON with no Directus-side editor (**S4**), this union _is_ the CMS contract and is the most expensive thing to change later. The editor mockup implies Hero / About / Event Details / Event Agenda / Gallery / Footer CTA under Layout / Text / Media / Embeds — a design artifact, not a contract. **Who owns this list, and when is it frozen?**

#### Q3 — How do drafts, preview and publishing actually work?

Revision 2 narrowed this. The schema answers the vocabulary question — `cms_pages.status` is `draft, in_review, changes_requested, published, archived`, and `cms_review_events` records `submitted, approved, changes_requested, unpublished, archived`. What is **not** settled:

- Does Directus's own Content Versioning feature get used, or is `status` + `cms_review_events` hand-rolled into a workflow? (`cms_form_versions` suggests a versioning pattern is intended for forms; nothing equivalent exists for pages.)
- Where does the preview token live, and who mints it?
- Who is allowed to move a page to `published`?

**Q4 — How are Directus assets delivered to the browser?** (**F7** + **F6**)
Two coherent options:
(a) add the Directus host to `images.remotePatterns` — simplest, but every asset URL becomes public and unauthenticated;
(b) proxy assets through a same-origin Route Handler — keeps CSP tight, allows signed/expiring URLs and per-role access, costs one more hop and a cache policy.
A security-posture decision, not a preference.

**Q5 — Is the CMS mounted under `/dashboard/**`or a new prefix?**`src/proxy.ts`blocks`/dashboard/**`and`/sandbox/**`in production by default (**F10**). Reusing`/dashboard` requires the middleware to gain a real session check — the right direction anyway, and coupled to Phase 1.

**Q6 — What is the fate of the legacy surfaces?** (expanded in rev. 2)

- **Legacy axios client** — `src/lib/api/**` + `src/hooks/api/**` (dead per F13). Retire, or park with an owner?
- **`api.hmtc-its.com/api/*`** — still serves `/auth/*`, `/evaluasi-cmi/submit`, `/magang/*`, `/shortlink/*`. Keep, freeze, or decommission? Note `/magang/get-token` is already broken (empty OAuth `client_id`).
- **NocoDB handlers** — 5 live Route Handlers. Migrate to `cms_forms`, or keep alongside?
- **Evaluasi CMI** — the one axios call that still works (§3.2). Migrate to NocoDB or Directus, or consciously keep?

**Q7 — Should `src/app/sandbox/page-builder/**`be deleted after the CMS ships?**
≈10,900 lines of mockup.`AGENTS.md`§11 notes sandbox pages are 307'd to`/coming-soon` in production. Valuable as a spec during Phases 3–5; a maintenance liability afterwards.

#### Q8 — `cms_pages.proker` is required (S3). What value do standalone pages use?

Landing, `/info`, About, Contact have no proker. Either relax the constraint or introduce a sentinel — this affects the URL model, not just a column.

---

## 9. Evidence and confidence

### 9.1 Directus — inspection results (rev. 2: complete)

Read via the `directus` MCP server (20 tools) using `directus_read-collections`, `directus_read-fields`, `directus_read-items`, `directus_read-users`, `directus_read-flows`, `directus_read-folders`, `directus_read-files`, `directus_users-me`. **All calls were reads. No collection, field, role, policy, permission or item was created, modified or deleted.**

**Collections discovered — 17:**

| Group   | Collections                                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content | `cms_pages`, `cms_templates`, `cms_prokers`, `cms_departments`, `cms_department_memberships`, `cms_page_redirects`, `cms_site_settings`            |
| Review  | `cms_review_events`                                                                                                                                |
| Forms   | `cms_forms`, `cms_form_versions`, `cms_form_fields`, `cms_form_field_options`, `cms_form_submissions`, `cms_form_answers`, `cms_form_answer_files` |
| System  | `directus_files`, `directus_users`                                                                                                                 |

**Verified identity & connectivity:**

| Claim                              | Method                                 | Result                                                      |
| ---------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| MCP connects and authenticates     | `mcp({ connect: 'directus' })`         | **20 tools**                                                |
| Token grants admin read            | `directus_users-me`                    | `{"id":"fa14e6b5-…","status":"active","role":"fe981c6e-…"}` |
| Instance reachable                 | `GET /server/health` (unauthenticated) | **200** `{"status":"ok"}`                                   |
| Anonymous collection access denied | `GET /collections` (unauthenticated)   | **403** `FORBIDDEN`                                         |
| Public registration off            | `GET /server/info`                     | `"public_registration": false`                              |
| Project not branded                | `GET /server/info`                     | `"project_name": "Directus"`                                |

**Row counts:** see §6.2. `cms_departments` = 9. Every other `cms_*` collection = 0. `directus_users` = 1. Directus flows = 0. `directus_folders` = 1 ("Public Assets"). `directus_files` ≥ 1 (a 168,265-byte JPEG).

**NOT inspected — MCP tooling does not expose it:**

- **Roles** — `directus_read-items` rejects core collections (`"Cannot use readItems for core collections"`), and there is no `read-roles` tool. The admin role id is known (`fe981c6e-fd55-448f-878a-3a82135d7838`) but its name, permissions and any sibling roles are not.
- **Policies and permission rules** — no tool.
- **Field-level permissions** — no tool.
- **Directus Content Versioning** state — no tool.
- **Storage adapter / asset URL shape** — inferable (`/assets/<uuid>`) but not confirmed.

**Deliberately not retrieved:** `cms_form_submissions.respondent_name` / `respondent_email` and any other respondent PII. Those collections are empty anyway (0 rows), and only `id`/`status`/`submission_number` were ever requested.

### 9.2 Legacy API — inspection results (new in rev. 2)

All probes unauthenticated, read-only, no credentials transmitted.

| Endpoint                    | Method   | Status       | Interpretation                                                   |
| --------------------------- | -------- | ------------ | ---------------------------------------------------------------- |
| `/health`                   | GET      | **200**      | Service alive, `env: production`                                 |
| `/swagger/doc.json`         | GET      | **200**      | Swagger 2.0, basePath `/api`, **`host: localhost:5000`** (stale) |
| `/swagger/index.html`       | GET      | **200**      | Swagger UI served                                                |
| `/api/galleries`            | GET      | **404**      | Route absent                                                     |
| `/api/users`                | GET      | **404**      | Route absent                                                     |
| `/api/users/me`             | GET      | **404**      | Route absent                                                     |
| `/api/requests`             | GET      | **404**      | Route absent                                                     |
| `/api/uploads`              | GET      | **404**      | Route absent                                                     |
| `/api/repositories`         | GET      | **404**      | Route absent                                                     |
| `/api/auth/change-password` | GET/POST | **404**      | Route absent                                                     |
| `/api/auth/register`        | GET      | **404**      | Route absent                                                     |
| `/api/auth/me`              | GET      | **401**      | Exists                                                           |
| `/api/auth/admin`           | GET      | **401**      | Exists                                                           |
| `/api/auth/login`           | POST     | **400**      | Exists (`"Email harus diisi"`)                                   |
| `/api/auth/refresh`         | POST     | **401**      | Exists                                                           |
| `/api/auth/logout`          | POST     | **401**      | Exists                                                           |
| `/api/evaluasi-cmi/submit`  | POST     | **400**      | Exists (`EvalCmi25Req.Nama` validation)                          |
| `/api/magang/get-token`     | GET      | **200**      | Exists — **OAuth `client_id` is empty ⇒ broken**                 |
| `/api/shortlink/*`          | —        | (documented) | Not referenced by the frontend                                   |

### 9.3 Verified codebase facts

| Claim                                     | File(s)                                                                                                                                                                             |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack versions, dependency inventory      | `package.json`, `tsconfig.json`, `next.config.js`, `postcss.config.js`, `eslint.config.mjs`, `jest.config.ts`, `components.json`, `.env.example`                                    |
| Three data layers                         | `src/lib/api/api.ts`, `src/lib/api/*.client.ts`, `src/app/api/**/route.ts`                                                                                                          |
| Legacy client call targets → 404          | §9.2 probes                                                                                                                                                                         |
| Interceptor / refresh logic               | `src/lib/api/api.interceptors.ts`, `src/lib/api/api.utils.ts`                                                                                                                       |
| Two QueryClients                          | `src/app/providers.tsx`, `src/lib/query-client.ts`                                                                                                                                  |
| Query-key conventions                     | `src/lib/query-keys.ts`                                                                                                                                                             |
| Mutation convention                       | `src/hooks/api/useApproveRequest.ts`, `src/lib/hooks/useProfile.ts`                                                                                                                 |
| No session verification / no auth library | `src/proxy.ts` (`handleAdminBlocking`, `shouldDisableAdminRoutes`)                                                                                                                  |
| Dead auth module                          | `src/lib/withAuth.tsx` (0 importers)                                                                                                                                                |
| Dummy identities                          | `src/app/dashboard/**/page.tsx` (13 files)                                                                                                                                          |
| Mock-gated reads                          | `USE_DUMMY = true` in `dashboard/gallery/[id]/edit/page.tsx:32`; commented hooks in `user-requests/[id]:77`, `user-uploads/[id]:87`                                                 |
| Static page-builder mockups               | `src/app/sandbox/page-builder/**`                                                                                                                                                   |
| Zero Next Data Cache / Server Actions     | grep across `src/` → 0 hits                                                                                                                                                         |
| CSP and image config                      | `next.config.js`                                                                                                                                                                    |
| Content architecture                      | `DESIGN.md` §11; `src/contents/*.ts`                                                                                                                                                |
| Proker URL model                          | `DESIGN.md` §14; `src/lib/config.ts`; `src/app/*/*/route.ts`                                                                                                                        |
| A11y floor and known gaps                 | `AGENTS.md` §7; `DESIGN.md` §10 B2; `eslint.config.mjs`                                                                                                                             |
| Commit-year evidence                      | `git log --format=%ad --date=format:%Y \| sort \| uniq -c` → 23 (2023), 25 (2024), 365 (2025), 147 (2026); every `src/lib/api/**` and `src/hooks/api/**` file last touched **2025** |

### 9.4 Confidence

| Finding                                                                                                                                                                                                     | Confidence  | Basis                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Directus schema: 17 collections, listed fields                                                                                                                                                              | **Certain** | `directus_read-collections` + `directus_read-fields`                                                                |
| Directus content empty except `cms_departments` (9)                                                                                                                                                         | **Certain** | Per-collection reads                                                                                                |
| Directus: 1 user, 0 memberships, 0 flows                                                                                                                                                                    | **Certain** | `directus_read-users`, `cms_department_memberships`, `directus_read-flows`                                          |
| Directus roles/policies                                                                                                                                                                                     | **UNKNOWN** | Core collections blocked; no roles tool                                                                             |
| Legacy API does not serve galleries/users/requests/uploads/repositories                                                                                                                                     | **Certain** | 404 on every path, plus a Swagger doc listing only 5 operations                                                     |
| Legacy API is otherwise alive                                                                                                                                                                               | **Certain** | `/health` 200; `/api/auth/*` 401/400; `/api/evaluasi-cmi/submit` 400                                                |
| `/magang/get-token` OAuth client unconfigured                                                                                                                                                               | **Certain** | Full response body captured; `client_id=` empty                                                                     |
| Legacy data layer is pre-2026 and unreachable                                                                                                                                                               | **Certain** | `git log` per file + static import-graph reachability over 71 route entrypoints                                     |
| No session verification / no auth library in the app                                                                                                                                                        | **Certain** | `src/proxy.ts` read in full; grep for auth libraries → 0                                                            |
| Dashboard predominantly mock                                                                                                                                                                                | **Certain** | 13/13 files contain mock generators; `USE_DUMMY` flag; commented hooks                                              |
| `remotePatterns` blocks Directus media                                                                                                                                                                      | **Certain** | `next.config.js`                                                                                                    |
| Production CSP blocks browser→Directus                                                                                                                                                                      | **Certain** | `next.config.js`                                                                                                    |
| Statistic counts (13 dashboard pages, 24 hook modules, 6 route handlers, 29 Server-Component pages, 127 `'use client'` files, ≈10,900 mockup lines, 71 route entrypoints, 40 data modules / 13 unreachable) | **High**    | `find` / `grep` / `wc -l` / scripted import-graph over the working tree; exact at time of audit                     |
| Unused-dependency list                                                                                                                                                                                      | **High**    | Grep over `src/**` incl. `.jsx`; caveat: transitive/build-time usage checked only for `autoprefixer`/`lightningcss` |

### 9.5 Recommendations vs. assumptions

**Recommendations** (§5, §6, §7) — my judgement, explicitly not facts:

- Substitute rather than extend; retire the legacy client (rev. 2 change, driven by F13)
- Phase ordering and the scope call in §6.3
- Tag-based invalidation over time-based `revalidate`
- Keeping TanStack Query while replacing the client beneath it

**Interpretations I applied, which you should confirm:**

- Your statement "any changes that is before 2026 should [be] deemed legacy and is now unused" is treated as **a policy decision about intent**, and independently corroborated by two objective checks: (a) every data-fetching file was last touched in 2025, and (b) the endpoints they call return 404. Where the two disagree, I have said so — notably **Evaluasi CMI** (§3.2), which is pre-2026 _and_ still reaches a working endpoint.
- "There is currently no auth config" is read as **no auth configuration in the Next.js application** — confirmed (F1). I did **not** interpret it as "Directus has no auth", since Directus has its own auth, 1 user, and a role id.

**Assumptions carried in, not verified here:**

- That `NEXT_PUBLIC_API_URL_PROD` points at `https://api.hmtc-its.com/api` (inferred from the correlation between the frontend's `/evaluasi-cmi/submit` call and the server's `/api/evaluasi-cmi/submit` route; no `.env` exists in the repository to confirm).
- That the seven page-builder mockups represent the intended final information architecture — they are a design artifact, and the brief says to treat them as investigation targets, not requirements.
- That Directus is intended to own content _and_ forms, while `api.hmtc-its.com` retains evaluasi-cmi/magang/shortlink (Q6).

**Explicitly out of scope:** any Directus schema/permission/role change; any dependency installation or configuration change; any application-code modification. Only this file was created.

---

## Appendix — Verification commands

```bash
# ── Reproduce the legacy-API finding (no credentials sent) ─────────────────
curl -s https://api.hmtc-its.com/health                      # → {"status":true,…}
curl -s https://api.hmtc-its.com/swagger/doc.json | head -c 200
curl -s -o /dev/null -w '%{http_code}\n' https://api.hmtc-its.com/api/galleries      # → 404
curl -s -o /dev/null -w '%{http_code}\n' https://api.hmtc-its.com/api/users          # → 404
curl -s -o /dev/null -w '%{http_code}\n' https://api.hmtc-its.com/api/auth/me        # → 401
curl -s -o /dev/null -w '%{http_code}\n' https://api.hmtc-its.com/api/repositories   # → 404

# ── Reproduce the legacy-code findings ────────────────────────────────────
grep -rl "'use server'" src                                       # → no output
grep -rn "revalidate\|unstable_cache\|cacheTag\|cacheLife\|next: { tags" src   # → no output
grep -rn "next-auth\|authjs\|iron-session\|jose\|jsonwebtoken" src package.json # → no output
grep -rn "new QueryClient" src                                    # → 2 (one dead)
grep -rn "withAuth" src | grep -v '^src/lib/withAuth.tsx'         # → no output
grep -rn "USE_DUMMY" src/app/dashboard                            # → gallery edit page
grep -rln "generateMock\|getMock\|Dummy" src/app/dashboard        # → 13 files
grep -ri directus src | grep -v 'No Directus'                     # → no output

# Which data modules are unreachable from any route (see §2.3 for the script)

# ── Reproduce the legacy-year finding ─────────────────────────────────────
git log -1 --format='%ad' --date=format:%Y -- src/lib/api/api.ts         # → 2025
git log -1 --format='%ad' --date=format:%Y -- src/hooks/api/useUsers.ts  # → 2025
git log --format='%ad' --date=format:%Y | sort | uniq -c                 # → counts by year

# ── Directus (MCP) — read-only ────────────────────────────────────────────
# mcp({ tool: 'directus_read-collections' })
# mcp({ tool: 'directus_read-fields', args: { collection: 'cms_pages' } })
# mcp({ tool: 'directus_read-items',  args: { collection: 'cms_departments', query: { fields: ['slug'] } } })
# mcp({ tool: 'directus_read-users',  args: { query: { fields: ['id','status','role'] } } })

# ── Repo gate (run before any phase is called done) ───────────────────────
pnpm typecheck && pnpm lint:strict && pnpm format:check && pnpm test
```
