# HMTC CMS — Data Access, Permissions, and Workflow Contract

- **Status:** Implementation reference. Grounded in the applied schema (`001`–`003`), the decision log (`docs/hmtc-cms-decisions.md`), the API contract (`src/lib/cms/api-contract.ts`), and the approved block schema (`docs/hmtc-cms-block-schema.md`).
- **Audience:** Whoever implements `/dashboard/cms/**`, `src/lib/directus/**`, and the Directus policies/Flows. This document removes the need to re-derive collection names, query shapes, permissions, or workflow rules from transcripts.
- **Companion files:** `src/lib/cms/{api-contract,dto,errors,vocab,cache-tags}.ts`, `src/lib/directus/{blocks,block-renderers}.tsx`, `src/lib/directus/queries.ts` (generated alongside this document), `scripts/directus-schema/00{1,2,3}-*.sql`.

---

## 1. Canonical collection inventory

All CMS content lives in `cms_*` collections. Directus system collections are used only where noted. Field names are the physical/API names; the wire DTOs in `src/lib/cms/dto.ts` are camelCase projections of these.

### 1.1 Content collections

| Collection                   | Purpose                                                                                     | Key fields                                                                                                                                                                                                                                                                                                                                                                                                                           | Relations                                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cms_departments`            | Organisational unit; route segment.                                                         | `id` (uuid), `name`, `slug` (unique, canonicalised in `002`), `description`, `is_active`                                                                                                                                                                                                                                                                                                                                             | self `parent` (nullable); referenced by `cms_prokers`, `cms_pages`, `cms_department_memberships`, `cms_templates`                                                                                                 |
| `cms_prokers`                | Activity/programme under a department.                                                      | `id`, `department` (**NOT NULL**, `M5`), `title`, `slug` (globally unique), `is_active`                                                                                                                                                                                                                                                                                                                                              | M2O `department` → `cms_departments`; O2M `pages`                                                                                                                                                                 |
| `cms_pages`                  | Working copy of a page. **`blocks` is the draft**, not what the public sees.                | `id`, `title`, `slug`, `page_type` (`event`\|`program`), `department`, `proker`, `edition_year`, `parent_page` (nullable, not used in v1 routing), `status` (`draft`\|`in_review`\|`changes_requested`\|`published`\|`archived`), `blocks` (json), `published_revision`, `current_revision`, `published_at`, `published_by`, `excerpt`, `featured_image`, `seo_title`, `seo_description`, `template`, `date_created`, `date_updated` | M2O `department`, `proker`, `parent_page`, `template`; M2O `published_revision`/`current_revision` → `cms_page_revisions` (`ON DELETE RESTRICT` / `SET NULL`); O2M `revisions`, `review_events`, `preview_grants` |
| `cms_page_revisions`         | **Immutable** published/working snapshots. Public reads target this table, not `cms_pages`. | `id`, `page`, `revision_number`, `title`, `blocks`, `blocks_schema_version`, `excerpt`, `featured_image`, `seo_title`, `seo_description`, `change_note`, `author`, `date_created`                                                                                                                                                                                                                                                    | M2O `page` → `cms_pages` (`RESTRICT`); M2O `author` → `directus_users`; M2O `featured_image` → `directus_files`                                                                                                   |
| `cms_preview_grants`         | Bearer preview links. Only the SHA-256 hash is stored.                                      | `id`, `page`, `revision`, `token_hash` (char(64), unique), `created_by`, `date_created`, `expires_at`, `revoked_at`, `revoked_by`                                                                                                                                                                                                                                                                                                    | M2O `page` → `cms_pages`, `revision` → `cms_page_revisions`; creator/revoker → `directus_users`                                                                                                                   |
| `cms_review_events`          | Workflow audit trail.                                                                       | `id`, `page`, `action` (`submitted`\|`approved`\|`changes_requested`\|`unpublished`\|`archived`), `from_status`, `to_status`, `comment`, `actor`, `date_created`                                                                                                                                                                                                                                                                     | M2O `page` → `cms_pages`; M2O `actor` → `directus_users`                                                                                                                                                          |
| `cms_department_memberships` | Per-department grant. One row per `(user, department)` (`M6`).                              | `id`, `department` (NOT NULL), `user` (NOT NULL), `membership_role` (NOT NULL: `editor`\|`reviewer`\|`publisher`\|`template_maintainer`), `is_active`                                                                                                                                                                                                                                                                                | M2O `department` → `cms_departments`, `user` → `directus_users`                                                                                                                                                   |
| `cms_templates`              | Reusable starting point. Applying a template copies `blocks` into a new page draft.         | `id`, `department`, `name`, `blocks` (json), `status` (`draft`\|`published`\|`archived`), `date_created`, `date_updated`                                                                                                                                                                                                                                                                                                             | M2O `department` → `cms_departments`                                                                                                                                                                              |
| `cms_site_settings`          | Singleton (`id = 1`, `M10`).                                                                | `id`, `site_name`, `logo`, `favicon`, `default_seo_title`, `default_seo_description`, `theme_tokens`, `footer_content`                                                                                                                                                                                                                                                                                                               | M2O `logo`/`favicon` → `directus_files`                                                                                                                                                                           |
| `cms_page_redirects`         | Data-driven redirects; replaces hand-written proker `route.ts` files.                       | `id`, `source_path`, `destination_path`, `http_status` (301/302), `is_active`                                                                                                                                                                                                                                                                                                                                                        | none                                                                                                                                                                                                              |
| `cms_forms` family           | **Deferred** (spec §15). Not in first release.                                              | —                                                                                                                                                                                                                                                                                                                                                                                                                                    | —                                                                                                                                                                                                                 |

### 1.2 System collections

| Collection         | Used for                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `directus_files`   | Media library. Assets are public (`Q10`); `/assets/<uuid>` is stable across storage adapters. |
| `directus_folders` | One seeded folder: **Public Assets**. Uploads go here.                                        |
| `directus_users`   | Identity source. Bridge from `cms_department_memberships.user`.                               |

---

## 2. Relationship map

```
cms_departments ──1:N──► cms_prokers
│ │
│ └──1:N──► cms_pages ──N:1──► cms_departments
│ │
├──1:N──► cms_department_memberships │
│ │ ├──1:N──► cms_page_revisions ──N:1──► directus_users (author)
│ └──N:1──► directus_users│ └──N:1──► directus_files (featured_image)
│ │
├──1:N──► cms_templates ├──1:N──► cms_review_events ──N:1──► directus_users (actor)
│ │
└──1:N──► cms_pages ├──1:N──► cms_preview_grants ──N:1──► cms_page_revisions
│ └──N:1──► directus_users (created_by, revoked_by)
├──N:1──► cms_page_revisions (published_revision, current_revision)
└──N:1──► cms_templates

cms_site_settings (singleton) ──N:1──► directus_files (logo, favicon)
cms_page_redirects (standalone)
```

**Identity tuple:** a page is identified by `(department, proker, edition_year)` — enforced by the unique index `cms_pages_department_proker_year_unique` (`M2`). `slug` is display/SEO metadata and the lookup key for redirects/breadcrumbs, **not** the route identity.

---

## 3. Authentication

Directus is the identity source. There is no public registration (`/server/info` → `public_registration: false`).

### 3.1 Login

1. `POST /api/cms/auth/login` receives `{ email, password }`.
2. The handler calls Directus `POST /auth/login` with `mode: 'json'`.
3. On success it sets two cookies:
   - `cms_at` — short-lived access token
   - `cms_rt` — refresh token
     with `HttpOnly; Secure; SameSite=Lax; Path=/`.
4. It returns `{ user: SessionUser }` (see `src/lib/cms/dto.ts`), including `isAdmin` and `memberships[]`.

Rate limiting is required on this endpoint (`429 rate_limited`).

### 3.2 Session verification

- `src/lib/directus/session.ts` reads `cms_at`, calls Directus `GET /users/me`, and resolves the user's `cms_department_memberships`.
- On expiry it refreshes via `POST /auth/refresh` using `cms_rt`, rotates the cookies, and retries once.
- If refresh fails, both cookies are cleared and the handler returns `401 unauthenticated`.
- **Identity is never read from the request body, query string, or headers.** `userId`, `role`, and `departmentId` sent by the client are ignored.

### 3.3 Route gating

- `src/proxy.ts` performs a **cheap cookie-presence check** for `/dashboard/cms/**` and redirects to `/dashboard/cms/login` when absent.
- **The proxy is not the security boundary.** Every CMS layout and every `/api/cms/*` handler verifies the session again. This satisfies `A4` / `F10`.

### 3.4 Logout

`POST /api/cms/auth/logout` calls Directus `POST /auth/logout`, revokes the refresh token, and clears both cookies. Returns `204`.

---

## 4. Authorization

Two layers, in this order:

1. **Next.js resource authorization** — the authoritative check. Loads the resource, resolves the acting user's membership in that page's department, and compares against `PAGE_ACTIONS`.
2. **Directus policies** — a second layer. The request is written with the **user's own access token**, so Directus also enforces its policy.

A privileged static token (`DIRECTUS_READ_TOKEN`) is used **only for public reads** and is never used for a mutation.

### 4.1 Roles

Defined in `src/lib/cms/vocab.ts` (`MEMBERSHIP_ROLES`, `PAGE_ACTIONS`).

| Role                           | May                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------- |
| `editor`                       | Edit drafts, submit, restore, mint previews.                                             |
| `reviewer`                     | Everything an editor may **in their department's review scope**, plus `request_changes`. |
| `publisher`                    | Everything a reviewer may, plus `publish`, `unpublish`, `archive`.                       |
| `template_maintainer`          | Manage templates for the department.                                                     |
| Administrator (Directus admin) | May act in every department, **but self-approval still applies**.                        |

`(user, department)` is unique (`M6`), so a user holds **one role per department**. Cross-department access is explicit: an additional membership row. There is no global "editor" role that grants all departments.

### 4.2 Resource authorization algorithm

For any page-scoped action `A`:

1. Load `cms_pages` row → `department`, `status`, `published_revision`.
2. If the user is not an admin and has no active `cms_department_memberships` row for `page.department`, return `404 not_found` (not `403` — do not confirm existence).
3. Check `PAGE_ACTIONS[A].roles.includes(membership_role)`. If not, return `403 forbidden`.
4. Check `isActionAllowedFrom(A, { status, isLive })`. If not, return `409 invalid_transition`.
5. For `publish` only: compare the actor to the actor of the latest `submitted` event. Equal → `403 self_approval`.

### 4.3 Directus policies to create

These are runbook steps in `scripts/directus-schema/` (policies are not SQL). Names are suggestions; the implementation may rename them, but the **permission shape** must hold.

| Policy            | Attached to                                            | Permissions                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public**        | anonymous                                              | Read `cms_forms` and `directus_files` only. **No read on `cms_pages`** (`R2`/`003`). No create/update/delete anywhere.                                                                                                                                                                                                          |
| **nextjs-reader** | a static token held only by the Next.js server         | Read: `cms_page_revisions`, `cms_pages` (fields `id, department, proker, edition_year, status, page_type, title, slug, published_revision, date_updated` — **not `blocks`**), `cms_departments`, `cms_prokers`, `cms_site_settings`, `cms_page_redirects`, `cms_templates` (`status = published`), `directus_files`. No writes. |
| **cms-editor**    | authenticated users with an active `editor` membership | Read `cms_pages`, `cms_page_revisions`, `cms_review_events`, `cms_templates`, `cms_departments`, `cms_prokers`, `directus_files`, `directus_folders`. Create/update `cms_pages` (working copy), create `cms_page_revisions`, create `cms_review_events`, create/read `cms_preview_grants`, create `directus_files`.             |
| **cms-reviewer**  | `reviewer` membership                                  | As editor, plus create `cms_review_events` with `changes_requested`.                                                                                                                                                                                                                                                            |
| **cms-publisher** | `publisher` membership                                 | As reviewer, plus update `cms_pages.published_revision`/`status` and create `cms_review_events` with `approved`/`unpublished`/`archived`.                                                                                                                                                                                       |
| **cms-admin**     | Directus admin role                                    | Full on all `cms_*` and `directus_files`.                                                                                                                                                                                                                                                                                       |

**Important:** Directus cannot easily express “this user is a member of `page.department`” as a relational row filter. That is why **Next.js performs the resource check first** and writes with the user's token. The Directus policy prevents a compromised Next.js route from doing arbitrary writes; it is not expected to encode the department matrix by itself.

---

## 5. Page-by-page data access

The CMS mounts at `/dashboard/cms/**` (`A3`). Public proker pages remain where they are (`src/app/<dept>/<proker>/[year]/page.tsx`) and are migrated one proker at a time.

| Page / route                                               | Collections and fields                                                                                                                           | Query shape                                                                                                                                       | Cache tags                                               | Permission                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------ |
| **Login** `/dashboard/cms/login`                           | `directus_users` (via Directus auth)                                                                                                             | `POST /auth/login` with `mode: 'json'`                                                                                                            | none                                                     | public                               |
| **CMS dashboard** `/dashboard/cms`                         | `cms_pages` (counts by `status`), `cms_review_events` (recent, joined `actor`)                                                                   | Aggregate `cms_pages` filtered by readable departments; latest 10 `cms_review_events` ordered by `date_created`                                   | none (editor data is `no-store`)                         | session                              |
| **Pages list** `/dashboard/cms/pages`                      | `cms_pages` + `department`, `proker`; fields: `id, title, slug, page_type, status, edition_year, published_at, date_updated, published_revision` | Filter by `department` in readable set; optional `status`, `edition_year`, `q` (title search); paginate 25                                        | none                                                     | session; `listPages`                 |
| **Page editor** `/dashboard/cms/pages/[id]`                | `cms_pages` + `blocks` + `review_events` + `revisions` + `department`/`proker`; `cms_review_events` joined `actor`                               | Read one page by id; validate `blocks` with `parseBlocksForRead`; compute `allowedActions` from `PAGE_ACTIONS`                                    | none (draft — `no-store`)                                | session; resource authz              |
| **Revisions** `/dashboard/cms/pages/[id]/revisions`        | `cms_page_revisions` + `author`; fields: `id, revision_number, title, author, change_note, date_created, page`                                   | Filter `page = :id`, sort `revision_number desc`                                                                                                  | none                                                     | session                              |
| **Review queue** `/dashboard/cms/reviews`                  | `cms_pages` where `status = in_review`, `cms_review_events` latest `submitted`                                                                   | Filter by departments where user has `reviewer` or `publisher`; include latest submitter to show self-approval state                              | none                                                     | session; reviewer/publisher          |
| **Media library** `/dashboard/cms/media`                   | `directus_files` + `directus_folders`; fields: `id, title, type, width, height, filesize, folder`                                                | Filter `folder = Public Assets`; paginate                                                                                                         | none                                                     | session; editors                     |
| **Templates** `/dashboard/cms/templates`                   | `cms_templates`; fields: `id, name, status, department, date_updated`                                                                            | Filter by readable departments; `status != archived`                                                                                              | none                                                     | session; template maintainer / admin |
| **Preview management** `/dashboard/cms/pages/[id]/preview` | `cms_preview_grants` + `revision`; fields as DTO                                                                                                 | Filter `page = :id`, sort `date_created desc`                                                                                                     | none                                                     | session; creator or publisher        |
| **Public proker page** `/{dept}/{proker}/{year}`           | `cms_pages` (to resolve `published_revision`) → `cms_page_revisions` (the live row)                                                              | `filter[department][slug][_eq]=…&filter[proker][slug][_eq]=…&filter[edition_year][_eq]=…&fields=id,published_revision.*`; then read that revision | `cmsTags.page(dept, proker, year)`, `cmsTags.pageId(id)` | `DIRECTUS_READ_TOKEN` (server only)  |
| **Preview render** `/preview/[token]`                      | `cms_preview_grants` (`token_hash`) → `cms_page_revisions`                                                                                       | Hash the token with SHA-256 hex, look up grant, require `expires_at > now`, `revoked_at IS NULL`; read the bound revision                         | none (`no-store`)                                        | bearer grant                         |
| **Sitemap / route listing**                                | `cms_pages` where `published_revision IS NOT NULL` and `status != archived`                                                                      | Fields `department.slug, proker.slug, edition_year, date_updated`                                                                                 | `cmsTags.routes`                                         | `DIRECTUS_READ_TOKEN`                |
| **Redirects**                                              | `cms_page_redirects` where `is_active = true`                                                                                                    | Read all                                                                                                                                          | `cmsTags.redirects`                                      | `DIRECTUS_READ_TOKEN`                |
| **Site settings**                                          | `cms_site_settings` (`id = 1`)                                                                                                                   | Read one                                                                                                                                          | `cmsTags.settings`                                       | `DIRECTUS_READ_TOKEN`                |

**Editor reads are `cache: 'no-store'`.** Only published public reads use the Data Cache with tags. A draft must never enter a shared cache (`§10` of the specification, `R2`).

---

## 6. Draft retrieval

There are three distinct reads, and confusing them is the most likely source of a draft leak.

1. **Editor working copy** — `/api/cms/pages/:id` reads `cms_pages` with the **user's token**, `cache: 'no-store'`. Returns `blocks` (draft), `invalidBlocks` from `parseBlocksForRead`, `history`, and `allowedActions`.
2. **Public published read** — the public page reads `cms_page_revisions` where `id = cms_pages.published_revision`. `cms_pages.blocks` is **never** exposed to the public. This is the `R2` rule: once a published page is edited, `cms_pages.blocks` holds unpublished draft content, so public reads must not touch it.
3. **Preview read** — `/preview/[token]` reads the revision bound to the grant, `cache: 'no-store'`, with `noindex`/`no-referrer`/`private, no-store` headers.

`status` describes the **working copy** (`R7`). `published_revision` is what is live. Editing a published page moves `status` to `draft` but does not change public output until the next `publish`.

---

## 7. Preview grants

Policy (`C5`): bearer link, possession grants access, scoped to one page + one revision, revocable, non-indexable, **72 h default / maximum**.

### 7.1 Mint

`POST /api/cms/pages/:id/preview-grants`

1. Authorize `create_preview` for the page.
2. If the working copy differs from `current_revision`, snapshot it into `cms_page_revisions` first (so the grant points at a stable revision).
3. Generate **32 random bytes**, base64url-encode → the token shown to the user **once**.
4. Store only `sha256(token)` hex in `cms_preview_grants.token_hash`.
5. Set `expires_at = now() + ttlHours` (`1..72`).
6. Return `{ grant, url: "/preview/<token>" }`. Never log the token.

### 7.2 Render

`src/app/preview/[token]/page.tsx`:

- `export const dynamic = 'force-dynamic'`.
- Hash the path token, look up `cms_preview_grants` with `cache: 'no-store'`.
- Require `expires_at > now()` and `revoked_at IS NULL`; otherwise one generic “link unavailable” page (do not reveal whether the token existed).
- Read the bound `cms_page_revisions` row and render it through the **same** `BlockList`/`BLOCK_RENDERERS` as the public page.
- Headers: `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, `Cache-Control: private, no-store`; `robots: { index: false }`; skip analytics.
- `next-sitemap` excludes `/preview/*`. `proxy.ts` must **not** gate `/preview`. Apply a basic rate limit.

### 7.3 Revoke

`DELETE /api/cms/preview-grants/:grantId` sets `revoked_at`/`revoked_by`. Because nothing is cached, revocation takes effect on the next request. Allowed for the grant creator or a `publisher` in the page's department.

---

## 8. Review workflow

The state machine is `PAGE_ACTIONS` in `src/lib/cms/vocab.ts`; the database only enforces “archived ⇒ not live” (`cms_pages_archived_not_public`). Legal transitions:

| Action            | From                                       | To                                | Roles                           | Review event        |
| ----------------- | ------------------------------------------ | --------------------------------- | ------------------------------- | ------------------- |
| `edit`            | `draft`, `changes_requested`, `published`  | unchanged, or `published → draft` | editor                          | —                   |
| `submit`          | `draft`, `changes_requested`               | `in_review`                       | editor                          | `submitted`         |
| `request_changes` | `in_review`                                | `changes_requested`               | reviewer, publisher             | `changes_requested` |
| `publish`         | `in_review`                                | `published`                       | publisher **not the submitter** | `approved`          |
| `unpublish`       | any except `archived`, and only while live | `published → draft`               | publisher                       | `unpublished`       |
| `archive`         | any except `archived`                      | `archived`                        | publisher                       | `archived`          |
| `restore`         | any except `in_review`                     | `draft`                           | editor                          | —                   |
| `create_preview`  | any except `archived`                      | unchanged                         | editor, reviewer, publisher     | —                   |

- **Self-approval** is enforced server-side by comparing the acting user's id to the `actor` of the latest `submitted` review event. It applies to admins too. It cannot be bypassed by calling the publish endpoint directly.
- Every transition writes a `cms_review_events` row with `from_status`, `to_status`, `comment` (where applicable), and `actor`.
- `comment` is required for `request_changes` (≥ 1 char, ≤ 1000).

---

## 9. Publishing pipeline

`POST /api/cms/pages/:id/publish`, in order. Directus has no cross-request transaction, so the order is chosen so a failure leaves the previous published revision live:

1. **Authorize** `publish`: publisher in the page's department, and actor ≠ latest `submitted` actor → `403 self_approval`.
2. **Validate blocks** with `parseBlocksForWrite(blocks, 'publish')` → `422 invalid_blocks` with `invalidBlocks[]`. Publishing fails on any invalid block.
3. **Insert** a `cms_page_revisions` snapshot (`revision_number = max + 1`, `blocks_schema_version = BLOCKS_SCHEMA_VERSION`). Harmless if a later step fails; an orphan revision is not live.
4. **One atomic PATCH** of `cms_pages`: `published_revision = <new revision id>`, `status = 'published'`, `published_at = now()`, `published_by = actor`, `current_revision = <new revision id>`. Until this succeeds, the old revision is live.
5. **Insert** the `approved` review event.
6. **Invalidate** tags: `cmsTags.page(dept, proker, year)`, `cmsTags.pageId(id)`, `cmsTags.routes`. Route Handlers use `revalidateTag(tag, { expire: 0 })` (verify against the installed `next` docs before coding).

`unpublish` clears `published_revision`, sets `status = 'draft'`, and revalidates. `archive` additionally sets `status = 'archived'`; the CHECK constraint prevents an archived page from having a live revision.

**Restore** copies a snapshot's `blocks`/metadata into `cms_pages` as a **new draft** (`restore` action), never publishes, and preserves later history (`C8`).

---

## 10. Error handling

All `/api/cms/*` handlers return `CmsErrorBody` (`src/lib/cms/errors.ts`). Raw Directus errors are never forwarded — they contain SQL, table names, and constraint names.

```json
{
  "error": {
    "code": "stale_write",
    "message": "Halaman sudah diubah orang lain. Muat ulang sebelum menyimpan.",
    "issues": [{ "path": "blocks.3.props.title", "message": "wajib diisi" }]
  }
}
```

| Code                 | HTTP | When                                                |
| -------------------- | ---- | --------------------------------------------------- |
| `unauthenticated`    | 401  | No or expired session                               |
| `forbidden`          | 403  | Role/department does not allow the action           |
| `self_approval`      | 403  | Publishing your own submission                      |
| `editing_disabled`   | 403  | `CMS_EDITING_ENABLED=false`                         |
| `bad_origin`         | 403  | Cross-origin mutation                               |
| `not_found`          | 404  | Missing, or hidden from this user                   |
| `invalid_transition` | 409  | Not allowed from the current status                 |
| `stale_write`        | 409  | `expectedUpdatedAt` mismatch                        |
| `duplicate`          | 409  | Page already exists for `(proker, edition_year)`    |
| `validation_failed`  | 422  | Params/query/body invalid; `issues[]`               |
| `invalid_blocks`     | 422  | Blocks invalid for draft/publish; `invalidBlocks[]` |
| `rate_limited`       | 429  | Login or preview minting throttled                  |
| `internal`           | 500  | Anything else; details only in server logs          |

**Mutation pipeline, every handler:**

1. **Origin check** (`Origin` equals site origin) → `403 bad_origin`.
2. **Session** via `session.ts` → `401 unauthenticated`.
3. **Zod** validation → `422 validation_failed` (blocks → `422 invalid_blocks`).
4. **Resource authorization** → `404` if unreadable, `403` if unreadable-by-role.
5. **Workflow** via `isActionAllowedFrom` → `409 invalid_transition`; `expectedUpdatedAt` check → `409 stale_write`.
6. **Publish-only** self-approval check → `403 self_approval`.
7. **Write with the user's token**; map unique violations to `409 duplicate`.
8. Return the registry response schema. Log structured events without tokens or page content.

---

## 11. Custom endpoints

The full contract is `src/lib/cms/api-contract.ts` and its readable index `docs/hmtc-cms-api-contract.md`. The endpoint list is authoritative there. Summary of what exists and why:

- **Auth:** `POST /api/cms/auth/login`, `POST /api/cms/auth/logout`, `GET /api/cms/auth/me`.
- **Lookups:** `GET /api/cms/departments`, `GET /api/cms/prokers`, `POST /api/cms/assets`.
- **Pages:** `GET /api/cms/pages`, `POST /api/cms/pages`, `GET /api/cms/pages/:id`, `PATCH /api/cms/pages/:id`, `POST …/submit`, `POST …/request-changes`, `POST …/publish`, `POST …/unpublish`, `POST …/archive`.
- **Revisions:** `GET …/revisions`, `POST …/revisions/:revisionId/restore`.
- **Preview grants:** `GET …/preview-grants`, `POST …/preview-grants`, `DELETE /api/cms/preview-grants/:grantId`.
- **Webhook:** `POST /api/cms/revalidate` (HMAC, not session).

**Why these are explicit routes, not a catch-all proxy:** `D2` rejects `/api/cms/[...path]` because it erodes into an open proxy. Every endpoint has a named schema, an action, and a permission check.

---

## 12. Directus Flows

Only one Flow is required for the first release. The others are documented so they are not forgotten.

### 12.1 Revalidate webhook — required

- **Trigger:** Event Hook, `action` = `create`/`update`/`delete` on `cms_pages`, `cms_page_redirects`, `cms_site_settings`.
- **Action:** HTTP request to `https://<staging-host>/api/cms/revalidate` **and** `https://<prod-host>/api/cms/revalidate`.
- **Body:** `{ "collection": "<trigger collection>", "keys": ["<id>", …] }`.
- **Header:** `X-CMS-Signature: <hex HMAC-SHA256(rawBody, CMS_REVALIDATE_SECRET)>`.
- **Handler behaviour:** verifies the HMAC, derives tags server-side from `collection` + `keys` (never accepts raw tag names), calls `revalidateTag(tag, { expire: 0 })`, returns `{ revalidated: n }`.

This covers Studio edits and the shared Directus instance (`R3`): a publish from staging clears the production frontend cache too.

### 12.2 Revision retention cleanup — deferred (`N4`)

- **Trigger:** scheduled (e.g. daily).
- **Action:** delete `cms_page_revisions` rows older than the agreed retention, **except**:
  - the row referenced by `cms_pages.published_revision` (`ON DELETE RESTRICT` already prevents this),
  - the only recoverable snapshot for a live page.
- **Status:** blocked on `N4` (retention duration and published-exemption policy). Do not implement until decided.

### 12.3 Preview-grant cleanup — optional

Expired/revoked grants are checked on read, so a cleanup Flow is not required for correctness. If added, delete grants where `expires_at < now() - interval '30 days'` and `revoked_at IS NOT NULL`, to bound table growth.

### 12.4 Form submission automation — deferred

Not in scope. The `cms_forms` family is deferred to a separate workstream (`spec §15`).

---

## 13. Environment variables

| Variable                         | Scope            | Notes                                                                                                                                      |
| -------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `DIRECTUS_URL`                   | server           | Prefer the internal Docker network URL if Next and Directus share a compose network; otherwise the public URL.                             |
| `DIRECTUS_READ_TOKEN`            | server, secret   | Static token of the **nextjs-reader** policy. Used for published reads only.                                                               |
| `CMS_REVALIDATE_SECRET`          | server, secret   | Shared with the Directus Flow.                                                                                                             |
| `CMS_SESSION_COOKIE_DOMAIN`      | server, optional | Defaults to host-only.                                                                                                                     |
| `CMS_EDITING_ENABLED`            | server, optional | `false` on staging makes every mutation `403 editing_disabled` (`N9`). Defaults to `true`.                                                 |
| `NEXT_PUBLIC_DIRECTUS_ASSET_URL` | public           | `https://directus.hmtc-its.com/assets`; only used to build image URLs. Prefer deriving asset URLs server-side so this can stay non-public. |

All are runtime variables except `NEXT_PUBLIC_DIRECTUS_ASSET_URL` (build-time if used). `src/lib/directus/env.ts` Zod-parses them once and fails fast when a CMS code path runs.

---

## 14. Caching and invalidation

Tags are defined in `src/lib/cms/cache-tags.ts`. There is **no time-based `revalidate`** (`D7`).

| Tag                               | Attached to                           | Invalidated by                                    |
| --------------------------------- | ------------------------------------- | ------------------------------------------------- |
| `cms:page:{dept}/{proker}/{year}` | the published read                    | publish, unpublish, archive, restore-then-publish |
| `cms:page-id:{id}`                | the same read, keyed by id            | same events                                       |
| `cms:routes`                      | `listPublishedRoutes()`, sitemap, nav | any publish or unpublish                          |
| `cms:redirects`                   | `cms_page_redirects`                  | redirect edits (webhook)                          |
| `cms:settings`                    | `cms_site_settings`                   | settings edits (webhook)                          |

Invalidation runs **only after** step 4 of the publish pipeline succeeds. A failed publish leaves both content and cache untouched.

Public reads use `cache: 'force-cache'` + `next: { tags }` (Next 15+ defaults to uncached `fetch`). Editor and preview reads use `cache: 'no-store'`.

---

## 15. Open items affecting this contract

| ID                                     | Item                                                                                                                                | Effect                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `N4`                                   | Revision retention duration                                                                                                         | Blocks the cleanup Flow (§12.2).                                    |
| `N9`                                   | Staging editing mode                                                                                                                | `CMS_EDITING_ENABLED` must be set explicitly per environment.       |
| `B7`                                   | `next@16.2.9` advisory / inert `pnpm.overrides`                                                                                     | Pre-launch blocker; does not change this contract.                  |
| `R2` verification                      | After the first publish, confirm anonymous `GET /items/cms_pages` is 403 and drafts are unreachable.                                | Already verified 2026-11-03 (403). Re-verify after any policy edit. |
| Directus policy names                  | Suggested names in §4.3; confirm against the deployed instance.                                                                     | Policy shape is what matters.                                       |
| `cms_review_events` exact column names | DTO uses `fromStatus`/`toStatus`/`actorId`/`createdAt`; physical names must be confirmed against Directus (`directus_read-fields`). | The query builder in `queries.ts` must match the physical names.    |

---

## 16. Verification checklist

- [ ] `curl -I` a published proker page → `200`; an unpublished/missing one → `404` (real, not soft-404).
- [ ] Edit a published page → public output unchanged; publish → next request shows the update.
- [ ] Anonymous `GET https://directus.hmtc-its.com/items/cms_pages` → `403`; draft `blocks` never reachable anonymously.
- [ ] Preview URL renders the bound revision with `X-Robots-Tag: noindex`; after revoke/expiry → generic unavailable page.
- [ ] A publisher who submitted the page → `403 self_approval`; a different publisher → `200`.
- [ ] An editor in department A cannot read department B's page → `404`.
- [ ] `expectedUpdatedAt` mismatch → `409 stale_write`.
- [ ] Publish with an empty `gallery` → `422 invalid_blocks` with `invalidBlocks[]`.
- [ ] `grep -r DIRECTUS_READ_TOKEN .next/static` → no output.
- [ ] `pnpm typecheck && pnpm lint:strict && pnpm format:check && pnpm test` pass.
