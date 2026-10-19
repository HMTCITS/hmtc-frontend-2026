# HMTC CMS — Phase 0 Report (Groundwork)

**Status:** Complete and reviewed. Decisions recorded in `docs/hmtc-cms-decisions.md`; migrations `001`/`002` applied (see `docs/hmtc-cms-schema-migration-plan.md`).
**Scope executed:** Specification §13 steps 1–2 (baseline verification + decision freeze), comprising Track A (cleanup) and Track B (Directus/repository verification)
**Baseline spec:** `docs/hmtc-cms-implementation-specification.md`
**Audit:** `docs/audits/hmtc-cms-data-fetching-audit.md` (rev. 2)
**Date:** 2026-10-19

#### Decisions taken before starting

| Decision         | Value                                        |
| ---------------- | -------------------------------------------- |
| Phase to develop | Phase 0 — Groundwork (Tracks A + B)          |
| CMS mount point  | `/dashboard/cms`                             |
| Schema changes   | **None.** Track B is read-only verification. |

> **Not implemented:** no session/auth layer, no Directus integration code, no block registry, no editor, no schema migration. Those are Phase 1+ and depend on the outputs below.

---

## 1. Summary

Phase 0 removed **1,394 lines** of provably-dead code, repaired a type defect that mis-typed every API response in the repository, eliminated the duplicate QueryClient, and — as a side effect — took the dead axios client **out of the global layout bundle**.

Track B resolved **four of the six blockers by inspection** and narrowed a fifth. It also surfaced **one live production bug on a public page** and **one security-relevant finding** that neither the audit nor the specification had caught.

| Gate                                | Before Phase 0    | After Phase 0                                |
| ----------------------------------- | ----------------- | -------------------------------------------- |
| `pnpm typecheck`                    | ✅ pass           | ✅ **pass**                                  |
| `pnpm lint:strict`                  | ✅ pass           | ✅ **pass**                                  |
| `pnpm test`                         | ✅ pass (0 tests) | ✅ **pass**                                  |
| `pnpm build`                        | —                 | ✅ **pass (exit 0, 54 s)**                   |
| `pnpm format:check` (repo)          | ❌ 298 files      | ❌ 298 files (unchanged, pre-existing drift) |
| `pnpm format:check` (changed files) | —                 | ✅ **pass**                                  |

---

## 2. Track A — Cleanup

### 2.1 Files deleted (15)

Every file was verified **unreachable** by a static import graph from all 71 route entrypoints, resolving `@/`, relative specifiers, `import()`, and `require()`. No candidate had an importer outside the dead set itself.

| File                                       | Bytes  |
| ------------------------------------------ | ------ |
| `src/lib/withAuth.tsx`                     | 13,052 |
| `src/components/Grainient.jsx`             | 7,194  |
| `src/lib/api/users.client.ts`              | 3,871  |
| `src/lib/api/repository.client.ts`         | 3,079  |
| `src/hooks/api/useAutoIsScheduleActive.ts` | 2,060  |
| `src/hooks/api/useChangeUserRole.ts`       | 1,592  |
| `src/hooks/api/useUploadUserAvatar.ts`     | 1,454  |
| `src/hooks/api/useUpdateUser.ts`           | 1,399  |
| `src/hooks/api/useUserRequests.ts`         | 1,310  |
| `src/hooks/api/useUsers.ts`                | 1,243  |
| `src/hooks/api/useUserDetail.ts`           | 1,000  |
| `src/lib/query-client.ts`                  | 594    |
| `src/hooks/api/users.ts`                   | 398    |
| `src/lib/api/upload.client.ts`             | 0      |
| `src/components/buttons/IconButton.tsx`    | 0      |

Notable: `src/lib/withAuth.tsx` was 467 lines of Pages-Router-shaped auth (`GetServerSideProps*`) with zero importers — the single largest dead file and the most likely source of a wrong turn next phase.

### 2.2 `src/app/providers.tsx` — QueryClient consolidation

| Change                                                 | Why                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Removed `defaultQueryFn`                               | It derived the endpoint from `queryKey[0]`, so any hook omitting a `queryFn` would silently `GET` whatever the first key segment was. Verified safe: **all 8 remaining `useQuery` sites pass an explicit `queryFn`.**                                                                                                                                                         |
| Removed `suspense: true` from `defaultOptions.queries` | Not the documented v5 mechanism (it is observer-level), and the local `ExtendedQueryObserverOptions` cast existed only to silence the type error. Verified safe: no consumer relies on suspension — `AvatarUploadButton` uses only a mutation, the gallery list page is mock-only, and `gallery/[id]/edit` has its query disabled (`USE_DUMMY = true`) behind a `data` guard. |
| Removed the unused `api` import                        | **Side effect: the dead axios client no longer ships in the global layout bundle.** It was reachable from `src/app/layout.tsx` only via this file.                                                                                                                                                                                                                            |
| Kept the `<React.Suspense>` boundary                   | It is still load-bearing for page-level `next/dynamic` fallbacks. Removing it is a render-behaviour change that belongs with the Phase 1 interface work — see §5.1.                                                                                                                                                                                                           |

### 2.3 `src/types/api.ts` — `ApiResponse<T>` repair

Removed the stray callable member:

```ts
// before
export type ApiResponse<T> = {
  id(id: any): readonly ['galleries', 'detail', number]; // ← copy-paste artefact
  message: string;
  status: boolean;
  code: number;
  data: T;
};
```

Nothing called `.id()`; it was mis-typing every `response.data` access. **Documentation note:** four sibling exports in the same file (`PaginateData`, `PaginatedApiResponse`, `ApiError`, `UninterceptedApiError`) also have **zero external references**, but were left in place — they are inert types with no runtime effect and retire naturally with the legacy client. Flagged rather than deleted to keep this diff focused.

### 2.4 Deliberately **not** done

| Item                                                                                             | Why not                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Removing unused dependencies (`react-hot-toast`, `react-scroll`, `universal-cookie`, `date-fns`) | Forces a `pnpm-lock.yaml` rewrite. `DESIGN.md` §10 A5 / §12 O7 set the precedent of deferring this to a change that already touches the lockfile.                                   |
| Consolidating the 4→3 remaining `/api/schedule` consumers                                        | `useIsScheduleActive`, `useSchedule`, `useScheduleAutoRedirect` sit on **live period-gated pages**. Consolidating them is a functional refactor, not cleanup.                       |
| Removing the broken mutation wiring on the two mock dashboard detail pages                       | They import still-reachable hooks whose endpoints 404. Deleting the wiring would change user-visible behaviour (error toast → no-op). The CMS phase replaces these pages wholesale. |
| Any schema, role, or permission change in Directus                                               | Track B is read-only.                                                                                                                                                               |

### 2.5 Verification

```text
✓ pnpm typecheck        exit 0
✓ pnpm lint:strict      exit 0
✓ pnpm test             exit 0 (no tests found)
✓ npx prettier --check src/app/providers.tsx src/types/api.ts   all files formatted
✓ pnpm build            exit 0, 54s, build + next-sitemap postbuild
```

Because `postbuild` rewrote three tracked artifacts (`public/robots.txt`, `public/sitemap-0.xml`, `public/sitemap.xml`), those were **reverted** — they are an unrelated side effect of verification, not part of this change.

**Diff:** 17 files, +26 / −1,394.

---

## 3. Track B — Verification results

### 3.1 B2 — Directus version and auth integration → **RESOLVED**

| Fact                 | Value                                                   | Method                                                  |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| **Directus version** | **11.1.2**                                              | `GET /server/specs/oas` → `info.version`                |
| Deployment path      | Cloudflare → Caddy → Directus                           | `server: cloudflare`, `via: 1.1 Caddy` response headers |
| Header disclosure    | `x-powered-by: Directus`                                | response headers                                        |
| Public registration  | `false` (with `public_registration_verify_email: true`) | `GET /server/info`                                      |

**Available auth endpoints** (from the role-scoped OAS): `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/password/request`, `POST /auth/password/reset`, `GET /auth/oauth`, `GET /auth/oauth/{provider}`.

#### Implications for the specification's B2

- Directus 11 supports both **session cookies** (`mode: 'session'`, HttpOnly) and **bearer tokens** (`mode: 'json'`). The spec's requirement — HttpOnly cookies, server-side verification — is satisfiable natively; no custom token plumbing is needed.
- ⚠️ **`GET /auth/oauth` and `/auth/oauth/{provider}` are publicly reachable**, meaning OAuth providers are enabled. Confirm which providers are configured and whether that is intended, before layering a second identity path on top.
- ✅ `POST /auth/password/request` returns **204 for any input** (verified with a non-existent address), so it does not leak account existence.

**Useful technique for future verification:** the OAS is **generated per requesting role**. An anonymous request returned exactly **16 paths** — i.e. the precise surface of the public role. This is a reliable way to audit role permissions without Studio access.

#### 3.2 B6 — Asset visibility → **RESOLVED (assets are public)**

| Probe                                                    | Result                                    |
| -------------------------------------------------------- | ----------------------------------------- |
| `GET /assets/833be779-…` (unauthenticated, real file id) | **200 `image/jpeg`** — full binary served |
| `GET /assets/00000000-…` (bogus id)                      | 403                                       |
| `GET /files`, `GET /files/{id}`                          | public read                               |
| `DELETE /files/{id}`                                     | 403                                       |

#### Conclusion — assets are public

All CMS media is publicly readable at `/assets/<uuid>`. There is no private-asset capability in the current configuration.

This directly validates the specification's concern that _"private assets do not become public solely because a URL is embedded in page content."_ Today, **every** asset is public the moment it is uploaded. If any proker media needs to be private (draft-quality photos, internal documents, respondent uploads), that requires a policy change **and** a non-guessable delivery path — a bare UUID is a weak access control.

### 3.3 B3 — Cardinality and constraints → **RESOLVED, and it exposes a gap in the spec**

Verified per-field constraints:

| Collection    | Field          | Nullable | Unique            | Indexed |
| ------------- | -------------- | -------- | ----------------- | ------- |
| `cms_pages`   | `slug`         | **true** | **true (global)** | true    |
| `cms_pages`   | `department`   | **true** | false             | true    |
| `cms_pages`   | `proker`       | **true** | false             | true    |
| `cms_pages`   | `edition_year` | false    | false             | true    |
| `cms_pages`   | `parent_page`  | true     | false             | false   |
| `cms_prokers` | `slug`         | false    | **true (global)** | false   |
| `cms_prokers` | `department`   | **true** | false             | true    |

**There is no composite unique constraint** on `(department, proker, edition_year)`.

**The gap.** The specification's route model (§9) is `/department/activity/{year}` — three segments. But `cms_pages` carries `parent_page` (self-relation) **and** a required, globally-unique `slug` that is _not part of that route_. Nothing prevents **N pages per `(proker, edition_year)`**.

So B3 is not merely "what is the uniqueness constraint" — it is:

> **Is there one page per proker-year, or many — and if many, what is the URL?**

This must be answered before the migration is designed, because it determines both the constraint and the route shape. Recorded as **Q8** in §5.2.

Secondary observations:

- `cms_prokers.slug` being globally unique makes the department segment **decorative for routing** — a proker could be addressed by its slug alone.
- `cms_prokers.department` is **nullable**, so a proker may have no department at all, in which case `/{department}/{activity}/{year}` cannot be constructed.
- **S6 generalises:** 4 of the 7 meta-`required` fields on `cms_pages` — `slug`, `department`, `proker`, `status` — are `is_nullable: true` in the database. Only `title`, `page_type`, `edition_year` are genuinely `NOT NULL`. **Treat every Directus "required" field as possibly null in application types until the migration aligns them.**

### 3.4 B5 — Cross-department grants → **PARTIALLY RESOLVED**

#### Schema — cannot support the permission matrix as designed

| `cms_department_memberships` field | Type             | Unique    | Indexed |
| ---------------------------------- | ---------------- | --------- | ------- |
| `department`                       | uuid             | **false** | true    |
| `user`                             | uuid             | **false** | true    |
| `membership_role`                  | string (no enum) | false     | false   |
| `is_active`                        | boolean          | false     | false   |

**There is no composite unique index on `(user, department)`.** The same user can be granted the same department repeatedly, and `membership_role` is an unconstrained free string. The permission matrix in specification §4 therefore **cannot be enforced by the schema as it stands** — it needs a migration, or enforcement entirely in Next.js.

**Public role surface — verified exhaustively.** Anonymous can reach exactly 16 paths:

```text
GET  /assets/{id}
GET  /files              GET /files/{id}
GET  /items/cms_pages    GET /items/cms_pages/{id}
GET  /items/cms_forms    GET /items/cms_forms/{id}
POST /auth/login  /auth/refresh  /auth/logout  /auth/password/request  /auth/password/reset
GET  /auth/oauth  /auth/oauth/{provider}
GET  /server/info        GET /server/ping
```

For `cms_pages` and `cms_forms`, the public role is **read-only and unfilterable**:

| Operation                                                                                                                                                                          | Result                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Read — all 23 `cms_pages` fields                                                                                                                                                   | **200** (including `status`, `blocks`, `published_by`) |
| Read — all 20 `cms_forms` fields                                                                                                                                                   | **200** (including `privacy_notice`, `retention_days`) |
| Create                                                                                                                                                                             | **403**                                                |
| Update                                                                                                                                                                             | **403**                                                |
| Delete                                                                                                                                                                             | **403**                                                |
| Filter on **any** field (`title`, `slug`, `id`, `status`, `page_type`, `published_at`, `edition_year`)                                                                             | **403 — every one**                                    |
| All other `cms_*` collections (`cms_departments`, `cms_prokers`, `cms_templates`, `cms_page_redirects`, `cms_review_events`, `cms_department_memberships`, all 6 form collections) | **403**                                                |

Read-only is the correct posture. **But note the filter denial is total, not field-specific** — an earlier single-field probe on `status` looked like evidence of a `status = published` permission rule; re-testing every field showed it is simply a blanket "no filter" configuration. **That earlier interpretation was wrong and is withdrawn.**

#### ⚠️ Open item — cannot be resolved while the tables are empty

`GET /items/cms_pages` returns **200 `{"data":[]}`**. The collection is empty, so it is **impossible to determine whether the read permission carries a row-level rule** (e.g. `status = published`). Both "scoped to published" and "returns everything" produce an empty array.

**This must be verified before any content is created.** If no rule exists, the first draft authored in Directus becomes world-readable at:

```text
https://directus.hmtc-its.com/items/cms_pages
```

which would violate the specification's §12 criterion _"Draft and in-review pages are never returned by public queries"_ and its requirement that _"Direct API calls cannot bypass role/resource checks."_ Next.js-side status filtering is necessary but not sufficient — the authoritative fix is a public-role permission rule.

**Verify via:** Directus Studio → Settings → Policies → Public → `cms_pages` → Row-level rule. Or, once one draft exists, `curl …/items/cms_pages` and confirm it returns `[]`.

### 3.5 B4 — Default-year configuration source → **RESOLVED**

#### Single source of truth — `src/lib/config.ts`

```ts
export const PROKER_DEFAULT_YEAR = 2026;
export const PROKER_EDITION_YEARS: Partial<Record<ProkerBasePath, readonly number[]>> = {};
export function prokerHref(basePath, year = PROKER_DEFAULT_YEAR) { … }
```

Confirmed by inspection:

- All seven proker `route.ts` legacy redirects resolve through `PROKER_DEFAULT_YEAR` — **no hardcoded years**.
- `cms_site_settings` contains **no year field** (`site_name`, `logo`, `favicon`, `default_seo_title`, `default_seo_description`, `theme_tokens`, `footer_content`), so Directus **cannot** supply a competing value.
- Remaining `20xx` literals in `src/` are all mock display data inside dashboard pages, or copy text — not configuration.

**No conflict exists.** The repository remains the single source of truth; nothing to do.

### 3.6 B1 — Revision retention → **STILL OPEN (product decision)**

Unchanged from the specification: proposed default **2 years**; whether currently-published revisions are exempt from cleanup remains unconfirmed. **Does not block Phase 0 or Phase 1** — it gates the editor phase only.

---

## 4. New findings

### F15 — The public `/gallery` page is permanently locked (High — live production bug)

Not previously identified by either the audit or the specification.

```text
src/app/gallery/hooks/useValidateNrp.ts
  └─ api.get('/auth/getuser', { params: { nrp } })     ← sends `nrp`
       └─ server: GET /api/auth/getuser expects `email`
            → 400 {"message":"user not found","error":"Email harus diisi"}
       └─ axios rejects → `catch { return false }`      ← failure swallowed
            → validateNrp() ALWAYS returns false
```

Consumers:

- `src/app/gallery/container/galleryPage.tsx:34` — `validateNrp(nrpParam).then(setIsAuthorized)`
- `src/app/landing/components/gallery/nrpModal.tsx:41`

Because `isAuthorized === false`, `galleryPage.tsx:85` renders `<Loading />` + `<RestrictedModal initialOpen />` **and never the gallery**. Every visitor, forever. The NRP gate can never open.

**This cannot be fixed by renaming a parameter.** The endpoint is a _user lookup by email_; the page wants _"is this NRP an authorised alumnus?"_ — a capability the API does not have. It needs a product decision: gate `/gallery` via Directus auth, replace the check, or remove the gate.

**Corrects an earlier statement of mine.** I previously told you exactly one legacy module still reached a live endpoint. That was wrong — there are **two**: `useSubmitEvaluasiCMI.ts` (works correctly) and `useValidateNrp.ts` (reaches a live route but is malformed and always fails). The reachability graph was right; the endpoint-behaviour conclusion was not, because I had not probed `/api/auth/getuser`. It returns 400, not 404.

### F16 — Dependency security baseline is not what it appears (High)

```text
pnpm audit  →  109 vulnerabilities: 3 critical | 63 high | 38 moderate | 5 low
```

`next@16.2.9` is in an advisory range (`>=16.0.0 <16.3.8`, patched in `>=16.3.8`) — see GHSA-cjq9-62q9-8jv4.

Compounding it, **the `pnpm.overrides` block in `package.json` is not being applied.** pnpm 10.11 warns:

> `The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.overrides".`

There is no `pnpm-workspace.yaml` or `.npmrc`, so the pins for `glob`, `lodash`, `js-yaml`, `minimatch`, `picomatch`, `brace-expansion`, and `postcss` are **silently inert**. Treat every "we pinned that" assumption as false.

**Not fixed in Phase 0** — a dependency upgrade is a separate, reviewable change, and `DESIGN.md` §10 A5 establishes the precedent for not bundling lockfile rewrites. **Recommended as a Phase 1 precondition**, since Phase 1 adds an authenticated surface to a framework carrying a known advisory.

### F17 — Directus OpenAPI spec is publicly readable (Low)

`GET /server/specs/oas` → **200**, unauthenticated. It is role-scoped, so it exposes only the public surface — but it is a ready-made endpoint inventory for an attacker, and it is also the tool that let us enumerate the public role precisely. Accepted Directus default; noted for completeness.

### F18 — Internal DTO field name typo confirmed in the API payload (Low)

`cms_form_answers.field_type_snapshow` (should be `_snapshot`). Already recorded as S1 in the audit; confirmed to be the live API field name, so it will propagate into generated types.

---

## 5. Blocker status and next steps

### 5.1 Blocker ledger

| ID        | Blocker                                     | Status          | Resolution                                                                                                   |
| --------- | ------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| B1        | Revision retention duration                 | ⛔ **DEFERRED** | Proposed 2 years. Gates the editor phase only.                                                               |
| B2        | Directus auth/authorization integration     | 🟢 **RESOLVED** | Directus 11.1.2; session-cookie flow native. Open: confirm the public `/auth/oauth` providers are intended.  |
| B3        | Annual uniqueness constraint                | 🟢 **RESOLVED** | **Q8: one page per proker-year** → migration `M2` Option A.                                                  |
| B4        | Default-year source                         | 🟢 **RESOLVED** | `src/lib/config.ts` only; Directus cannot conflict.                                                          |
| B5        | Cross-department grant representation       | 🟢 **RESOLVED** | **Q9** rule confirmed configured. **Q11** approach settled — Directus migration extension. Open: N1, N2, N7. |
| B6        | Asset visibility                            | 🟢 **RESOLVED** | **Q10: all public except forms** — current state is intended.                                                |
| B7        | Dependency security baseline _(new)_        | ⛔ **DEFERRED** | Accepted risk by decision. Revisit before production launch.                                                 |
| **N1/N2** | Directus deployment access to `extensions/` | 🔴 **OPEN**     | Required to execute M2 and M6.                                                                               |
| **N3**    | `cms_pages.page_type` vocabulary            | 🔴 **OPEN**     | Deferred (Q14). Field is `required` with an empty note.                                                      |

### 5.2 Questions — all answered or explicitly deferred

Every Phase 0 question has been settled: **Q8, Q9, Q10, Q12, Q13 answered**; **Q14 and B7 deferred by decision**. Decisions and their consequences are recorded in **`docs/hmtc-cms-decisions.md`** — §4 for what was decided, §5 for what remains open.

The Phase 0 questions and their answers, for the record:

| ID  | Answer                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------- |
| Q8  | **One page per proker-year.** → `M2` Option A.                                                                  |
| Q9  | **The public-role rule is already configured.** No permission change needed; one behavioural check outstanding. |
| Q10 | **Everything public except forms.** Assets at `/assets/<uuid>` staying public is intended.                      |
| Q12 | **Make `cms_prokers.department` required.** → `M5`.                                                             |
| Q13 | **Drop the `/gallery` gate.** The route is legacy and should not be used.                                       |
| Q14 | **Deferred.** `page_type` vocabulary still undefined.                                                           |

Still open, and tracked in the decisions log: **N1/N2** (Directus deployment access), **N3** (`page_type` vocabulary), **N4** (revision retention), **N7** (membership role vocabulary).

### 5.3 Recommended Phase 1 scope

Phase 1 = security foundation (specification §13 step 4). **No preconditions remain for the security work itself** — Q8/Q9 are answered and B7 is deferred by decision.

1. Implement server-side session verification against Directus 11 using the session-cookie flow (B2).
2. Add the resource-authorization helper and the `/dashboard/cms` route group with a real guard, replacing the pathname-based block in `src/proxy.ts` (audit F10, decision A4).
3. Build the permission-denied state component — the one genuinely new UI state (audit F5).
4. Replace the 13 dummy identities in `src/app/dashboard/**`.
5. Run the Q9 behavioural check once a draft exists — `docs/hmtc-cms-decisions.md` §6.

**Deferred out of Phase 1 by decision:** the `next` upgrade and the inert `pnpm.overrides` fix (B7).

Explicitly **not** in Phase 1: block registry, editor, media library, preview, publishing workflow, templates, revisions.

---

## 6. Evidence

### 6.1 Commands

```bash
# Track A verification
pnpm typecheck && pnpm lint:strict && pnpm test
npx prettier --check src/app/providers.tsx src/types/api.ts
pnpm build                                   # exit 0, 54s
git diff --stat HEAD -- src                  # 17 files, +26 / -1394

# Track B — Directus (read-only, unauthenticated unless noted)
curl -s https://directus.hmtc-its.com/server/info
curl -s https://directus.hmtc-its.com/server/specs/oas | jq -r '.info.version'    # → 11.1.2
curl -s -o /dev/null -w '%{http_code}\n' \
  https://directus.hmtc-its.com/assets/833be779-9e5b-49fb-b65b-8a86cfb4ec82       # → 200 (public asset)
curl -s -o /dev/null -w '%{http_code}\n' \
  'https://directus.hmtc-its.com/items/cms_pages'                                 # → 200 {"data":[]}
curl -s -o /dev/null -w '%{http_code}\n' \
  'https://directus.hmtc-its.com/items/cms_departments'                           # → 403

# Track B — legacy API
curl -s -o /dev/null -w '%{http_code}\n' 'https://api.hmtc-its.com/api/auth/getuser?nrp=5025221001'  # → 400 (expects `email`)
curl -s 'https://api.hmtc-its.com/api/auth/getuser'                                                   # → "Email harus diisi"

# Track B — dependency baseline
pnpm audit --audit-level=high
```

### 6.2 Directus MCP calls used (all read-only)

`directus_read-collections`, `directus_read-fields` (`cms_pages`, `cms_prokers`, `cms_department_memberships`, `cms_templates`), `directus_read-items`, `directus_read-users`, `directus_read-flows`, `directus_read-folders`, `directus_read-files`, `directus_users-me`, `directus_system-prompt`.

**No collection, field, role, policy, permission, or item was created, modified, or deleted.** No credentials were transmitted for any HTTP probe, and none appear in this document.

### 6.3 Confidence

| Finding                                          | Confidence  | Basis                                                            |
| ------------------------------------------------ | ----------- | ---------------------------------------------------------------- |
| 15 files unreachable; deletions safe             | **Certain** | Static import graph over 71 entrypoints + `pnpm build` exit 0    |
| All 8 `useQuery` sites pass explicit `queryFn`   | **Certain** | Exhaustive grep                                                  |
| No consumer relies on React Query suspension     | **Certain** | All consumers enumerated and read                                |
| Directus 11.1.2                                  | **Certain** | `info.version` in the OAS                                        |
| Assets are publicly readable                     | **Certain** | Anonymous 200 with binary body                                   |
| Public role read-only on `cms_pages`/`cms_forms` | **Certain** | POST/PATCH/DELETE all 403                                        |
| Public role cannot filter `cms_pages`            | **Certain** | All 7 probed fields 403                                          |
| **Row-level rule on drafts**                     | **UNKNOWN** | Table empty — indistinguishable. See Q9.                         |
| Roles/policies beyond the public role            | **UNKNOWN** | `directus_roles`/`_policies`/`_permissions` are 403; no MCP tool |
| Constraint set on `cms_pages`/`cms_prokers`      | **Certain** | `directus_read-fields`                                           |
| `/gallery` permanently locked                    | **Certain** | Endpoint probe + code read                                       |
| 109 vulnerabilities; `next` in advisory range    | **Certain** | `pnpm audit`                                                     |
| `pnpm.overrides` inert                           | **Certain** | pnpm 10.11 warning; no `pnpm-workspace.yaml`                     |
| Default year single-sourced                      | **Certain** | `src/lib/config.ts` + grep                                       |

### 6.4 Scope statement

**Changed:** 15 files deleted; `src/app/providers.tsx` and `src/types/api.ts` modified.

**Not changed:** no Directus schema, role, policy, or permission; no dependency or lockfile change; no route, layout, or component added; no session or auth code; no `.env` or configuration change. Three build-generated artifacts (`public/robots.txt`, `public/sitemap*.xml`) were reverted after verification.

**New files:** this report, and `docs/hmtc-cms-schema-migration-plan.md`.
