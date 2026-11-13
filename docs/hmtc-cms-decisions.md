# HMTC CMS — Decision Log

**Purpose.** The single place that separates **confirmed requirements** from **open questions** for the HMTC CMS. Written for whoever picks this up next — the intent is that **no one has to reconstruct a decision from a Slack thread or an agent transcript.**

**Status legend:** ✅ confirmed · 🟡 recommended, awaiting confirmation · 🔴 open · ⛔ deferred

**Related:** `docs/hmtc-cms-implementation-specification.md` (requirements) · `docs/hmtc-cms-phase-0-report.md` (what was built) · `docs/hmtc-cms-schema-migration-plan.md` (Directus changes, plan only) · `docs/audits/hmtc-cms-data-fetching-audit.md` (findings F1–F18) · `AGENTS.md` §13–§14 (working rules)

**Last updated:** 2026-11-03

---

## 1. Architecture — confirmed

| #   | Decision                                                                                   | Rationale                                                                                                     |
| --- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| A1  | ✅ **Build the CMS inside the existing Next.js app.** Not a separate deployment.           | Reuses the L4 design system, TanStack Query, and the established Route-Handler BFF pattern.                   |
| A2  | ✅ **Directus is the CMS data store, media library, and identity source.**                 | Schema already models pages, blocks, reviews, redirects, forms, templates and site settings (17 collections). |
| A3  | ✅ **CMS mounts at `/dashboard/cms/**`.\*\*                                                | Reuses the existing admin surface and chrome. Inherits the L4 layer (`DESIGN.md` §8).                         |
| A4  | ✅ **`src/proxy.ts` pathname gating is replaced by real session verification** in Phase 1. | Today `/dashboard/**` is blocked by pathname only — no session is ever checked (audit F1, F10).               |
| A5  | ✅ **One long-lived feature branch: `feat/hmtc-cms`.** Not one branch per phase.           | Phases share context; splitting them creates merge churn for no benefit.                                      |
| A6  | ✅ **Scope is proker pages only.** Unrelated public content stays hardcoded.               | Limits blast radius; avoids a big-bang content migration.                                                     |

## 2. Data access — confirmed

| #   | Decision                                                                                                   | Rationale                                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| D1  | ✅ **Server reads via a server-only module** (`src/lib/directus/**`), guarded with `import 'server-only'`. | Keeps the Directus credential out of browser bundles; makes a client-side import a build failure rather than a leak.         |
| D2  | ✅ **Browser mutations via explicit Route Handlers** under `src/app/api/cms/`.                             | A catch-all `/api/cms/[...path]` proxy is explicitly rejected — it erodes into an open proxy.                                |
| D3  | ✅ **Keep TanStack Query; replace the client underneath it.**                                              | Installed, wired, and used in 24 modules. The legacy axios client beneath it is dead (D5).                                   |
| D4  | ✅ **CSP keeps excluding `directus.hmtc-its.com` from `connect-src`.**                                     | Makes "the browser never talks to Directus" a policy, not a convention. Asset URLs still render (`img-src` allows `https:`). |
| D5  | ✅ **The legacy `api.hmtc-its.com` client is retired, not repaired.**                                      | Its gallery/repository/user/request/upload resources return **404**. Phase 0 deleted 15 unreachable modules.                 |
| D6  | ✅ **No `@directus/sdk` in the browser; no second data library; no direct DB access.**                     | Server-only `fetch` is sufficient and smaller.                                                                               |
| D7  | ✅ **Tag-based cache invalidation (`revalidateTag`) on publish.** No time-based `revalidate`.              | The repo currently has **zero** Next.js Data Cache usage; tags are the correct primitive for publish-driven invalidation.    |

## 3. Content and workflow — confirmed

| #   | Decision                                                                                                           | Rationale                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| C1  | ✅ **Typed React blocks. No arbitrary HTML, CSS, or JavaScript.**                                                  | Mandated by the specification. `cms_pages.blocks` is opaque JSON, so the app owns the schema.   |
| C2  | ✅ **Directus Studio is not the page editor.**                                                                     | Every `cms_*` field has `interface: null` — `blocks` renders as a raw JSON textarea.            |
| C3  | ✅ **Workflow: Draft → In review → Published. Self-approval prohibited**, enforced server-side.                    | Comparing submitter vs. acting reviewer must not be bypassable by calling an endpoint directly. |
| C4  | ✅ **Editing a published page must not change public output until republished.**                                   | Failed publication leaves the previous published revision intact.                               |
| C5  | ✅ **Preview links are bearer grants**, scoped to one page + revision, revocable, non-indexable, **72 h** default. | Possession grants access — an accepted, disclosed trade-off. A grant never permits editing.     |
| C6  | ✅ **Page deletion means archive/unpublish, not hard delete.**                                                     | No hard-delete through the CMS UI.                                                              |
| C7  | ✅ **Unpublished content returns a real HTTP 404.** ~~via `dynamicParams = false`~~ — mechanism revised by **R1**. | The root `<React.Suspense>` makes `notFound()` a soft-404 (HTTP 200) — audit F9.                |
| C8  | ✅ **Revision snapshots with restore-to-new-draft.**                                                               | Restoring never erases later history and never publishes automatically.                         |

## 4. Decisions taken in Phase 0 (2026-10-19)

These were the open blockers from the Phase 0 report. All are now answered.

| ID      | Question                                                                                          | Decision                                                                       | Consequence                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q8**  | Is there one page per proker-year, or many?                                                       | ✅ **One.**                                                                    | `cms_pages.slug` loses its global unique. Migration is **M2 Option A**: add `UNIQUE (department, proker, edition_year)`. Route stays `/department/activity/{year}`. |
| **Q9**  | Does the public role's read on `cms_pages` carry a row-level rule?                                | ✅ **Yes — already configured.** Confirmed by the operator in Directus Studio. | ~~Migration **M11 is satisfied.** No permission change needed.~~ **Superseded by R2:** the public read is removed in migration 003.                                 |
| **Q10** | Is all CMS media acceptable as publicly readable?                                                 | ✅ **Yes — everything public except forms.**                                   | Assets at `/assets/<uuid>` staying public is intended. Form submissions (`cms_form_submissions`, `cms_form_answers`) are already private (403).                     |
| **Q12** | `cms_prokers.department` is nullable, so `/{dept}/{activity}/{year}` is not always constructible. | ✅ **Make it required.**                                                       | Migration **M5**: `SET NOT NULL` on `cms_prokers.department`. Zero rows, so no backfill.                                                                            |
| **Q13** | `/gallery` is permanently locked (finding F15).                                                   | ✅ **Drop the gate.** The route is legacy and should not be used.              | Remove the NRP gate from `src/app/gallery/container/galleryPage.tsx` and `src/app/landing/components/gallery/nrpModal.tsx`. **Not yet implemented** — see §5.       |
| **Q14** | What is the vocabulary for `cms_pages.page_type`?                                                 | ✅ **Resolved 2026-11-03 — R4** (`event` \| `program`).                        | Migration **M9** is applied by 003.                                                                                                                                 |
| **B7**  | Dependency security: 109 vulnerabilities, `pnpm.overrides` inert.                                 | ⛔ **Deferred by decision — accepted risk.**                                   | `next@16.2.9` remains inside advisory GHSA-cjq9-62q9-8jv4. Revisit before production launch. See §5.                                                                |

### Q11 — how the composite unique constraints were migrated ✅ **APPLIED**

**Asked:** _"how do you plan to migrate it? does Directus support it?"_

**Answer: Directus does not support composite unique constraints.** Confirmed against Directus's issue tracker and community discussions:

- The Admin UI and schema API expose only per-field `is_unique`. There is **no multi-column unique control**.
- ⚠️ **Marking two fields individually as "Unique" does not work** — it creates two independent single-column constraints.
- Violations surface as a generic `400` rather than a field-specific error, so app-side mapping is required.

**Approach — direct SQL, tracked in the repo.** I originally proposed a Directus migration extension. That was over-engineered, and inspecting the actual deployment showed why:

| Claim I made                                                             | What the deployment showed                                                                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| "Migrate through Directus, not around it — raw DDL desyncs its metadata" | **Wrong.** `directus_fields` has no `is_unique`/`is_nullable` columns at all — Directus _introspects_ Postgres for those.               |
| "Container filesystem isn't durable"                                     | **Wrong.** `extensions/` is a persisted named volume (`hmtc-shared_directus_extensions`), currently empty with no migrations directory. |
| "Migration plumbing is needed for reproducibility"                       | The DB is a persisted named volume too. A tracked `.sql` file gives the same reviewability for far less machinery.                      |

**The one real caveat — Directus caches the introspected schema in memory.** Out-of-band DDL is invisible until the cache rebuilds: after applying the SQL, `directus_read-fields` still reported `slug.is_unique = true` until `docker restart directus` was run. That is now a standing rule (N8).

**Applied** — `scripts/directus-schema/001-page-identity-and-grants.up.sql`:

```sql
ALTER TABLE cms_pages DROP CONSTRAINT cms_pages_slug_unique;
CREATE UNIQUE INDEX cms_pages_department_proker_year_unique
  ON cms_pages (department, proker, edition_year);
CREATE UNIQUE INDEX cms_department_memberships_user_department_unique
  ON cms_department_memberships ("user", department);
```

**App-side handling is still required.** The violation reaches the client as a generic `400`. Map it to a field-specific message in the Route Handler — in addition to, not instead of, Zod validation.

**Status:** ✅ applied 2026-10-19 and verified. `membership_role` was an unconstrained string until `003` (2026-11-03, R6).

### Applied to production — 2026-10-19

Both files live in `scripts/directus-schema/`. Each has a paired `.down.sql`, and each was preceded by a `pg_dump` snapshot on the host.

| File                               | Contents                                                                                                          | Verified by                                                                |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `001-page-identity-and-grants`     | M2 composite page identity, M6 membership uniqueness, M12 page FKs → `RESTRICT`                                   | `pg_indexes`, `\d`, and a rolled-back duplicate-insert test                |
| `002-nullability-slugs-interfaces` | M1 column typo, M3 + M5 `SET NOT NULL`, M7 department slugs, M8 six `select-dropdown` vocabularies, M10 singleton | `information_schema`, `directus_read-fields`, slug and choice-count checks |

**After both, Directus was restarted** and the public API surface re-checked: `/items/cms_pages` still 200, `/items/cms_departments` still 403, `POST /items/cms_pages` still 403, and the OAS still exposes the same 16 role-scoped paths. Only the schema shape changed — no permission changed.

~~**Still unenforced at the database level:** `M9` (CHECK constraints on status values) is deferred, so the Zod layer must carry that validation until `page_type` is defined (N3). `membership_role` likewise (N7).~~ **Superseded — `003` below enforces both.**

### Applied to production — 2026-11-03

| File                           | Contents                                                                                                                                                                                | Verified by                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `003-revisions-preview-grants` | `cms_page_revisions` (immutable), `cms_preview_grants`, `cms_pages.published_revision` / `current_revision`, M9 CHECK constraints (R4, R6, R8), public read on `cms_pages` removed (R2) | `to_regclass` for both tables, `information_schema` for both pointers, `pg_constraint` for all six new CHECKs, public-policy permission diff against the snapshot |

Preconditions checked first: `cms_pages`, `cms_department_memberships` and `cms_review_events` were empty. Snapshot `~/pre-003.sql` (285 KB, complete) was taken on the host, the file ran in one transaction with `ON_ERROR_STOP=1`, and Directus was restarted (N8).

**Public API surface afterwards:** `/items/cms_pages` 200 → **403**. The public policy now reads only `cms_forms` and `directus_files`; `cms_departments` and `cms_prokers` were already 403 before `003`.

### Written, not applied — `004`

| File                  | Contents                                                                                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `004-access-policies` | Generated `editor_/reviewer_/publisher_department` columns on `cms_department_memberships`, `directus_users.cms_memberships` alias, policies `nextjs-reader`, `CMS base/editor/reviewer/publisher`, roles `nextjs-reader` and `CMS member` (R10) |

Applying it to production is a separate DevOps task: `pg_dump` first, run the up file with `ON_ERROR_STOP=1`, restart Directus (N8), then create the reader user with role `nextjs-reader` and set its static token out of band (never in the repository).

## 4b. Decisions taken 2026-11-03

From the integration plan (`docs/hmtc-cms-integration-plan.md`, PR #196, merged) and the owner's answers on the open items.

| ID      | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Consequence                                                                                                                  |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **R1**  | ✅ **404 strategy (revises C7's mechanism).** Remove the root `<React.Suspense>` soft-404 trap so `notFound()` returns HTTP 404. CMS proker routes render on demand (`dynamicParams = true`, `generateStaticParams` returns `[]`) and are tag-cached, so publishing needs no redeploy. Hardcoded proker routes keep `dynamicParams = false`.                                                                                                                                                                                                                                                                                                                     | Suspense fix ships first, with local boundaries for `coming-soon` and any `useSearchParams` page. Verify with `curl -I`.     |
| **R2**  | ✅ **No public read on `cms_pages` (revises Q9/M11).** `cms_pages.blocks` is the working copy; once a published page is edited, a public row rule would leak the draft. Public pages read `cms_page_revisions` with `DIRECTUS_READ_TOKEN`.                                                                                                                                                                                                                                                                                                                                                                                                                       | Migration **003** deletes the public permission. §6 is re-scoped accordingly.                                                |
| **R3**  | ✅ **One Directus instance for staging and production.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Staging editors edit production content. See **N9**.                                                                         |
| **R4**  | ✅ **N3 — `page_type` ∈ `event` \| `program`.** `event`: dated activity with registration/schedule/venue. `program`: ongoing programme or service without a single date.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | CHECK constraint and Studio dropdown in 003; `src/lib/cms/vocab.ts`. Unblocks M9.                                            |
| **R5**  | ✅ **N6 — `/gallery` is removed.** The gallery is now the public gallery widget on the landing page.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Delete the route, the NRP gate (`useValidateNrp`, `nrpModal`) and any links to `/gallery`. Supersedes Q13's "drop the gate". |
| **R6**  | ✅ **N7 — `membership_role` ∈ `editor` \| `reviewer` \| `publisher` \| `template_maintainer`**, one role per (user, department). Editor: drafts, submit, restore, previews. Reviewer: request changes. Publisher: reviewer + publish/unpublish/archive. Template maintainer: templates.                                                                                                                                                                                                                                                                                                                                                                          | CHECK + NOT NULL in 003; role duties encoded in `PAGE_ACTIONS` (`src/lib/cms/vocab.ts`).                                     |
| **R7**  | ✅ **`status` describes the working copy; `published_revision` is what is live.** Editing a published page moves the working copy to `draft` without touching public output (C4). In review the working copy is locked. Archived pages can only be restored. Revisions are hand-rolled (`cms_page_revisions`), not Directus Content Versioning.                                                                                                                                                                                                                                                                                                                  | The full transition table lives in `PAGE_ACTIONS`; the database only enforces "archived ⇒ not live".                         |
| **R8**  | ✅ **M9 — vocabularies are enforced by CHECK constraints** (`cms_pages.status`, `page_type`, `cms_review_events.action`, `cms_templates.status`, `membership_role`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | A unit test fails if `vocab.ts` and migration 003 disagree.                                                                  |
| **R9**  | ✅ **The `/api/cms/*` contract lives in code**: `src/lib/cms/api-contract.ts` (+ `dto.ts`, `errors.ts`, `vocab.ts`, `cache-tags.ts`). `docs/hmtc-cms-api-contract.md` is the readable index.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Route Handlers and editor hooks import the same Zod schemas. New endpoints are added to the registry first.                  |
| **R10** | ✅ **Directus access policies (`004`, not yet on production).** `nextjs-reader` reads minimum fields only (no `cms_pages.blocks`; live preview grants only). All CMS users share one role, `CMS member`, whose editor/reviewer/publisher policies filter on `$CURRENT_USER.cms_memberships.<role>_department`, generated columns on `cms_department_memberships`. Directus enforces department scope, row state and writable fields; **Next.js enforces self-approval, per-role status/action values and the department of a new page**, because Directus 11.1 ANDs `validation` across a user's policies and cannot evaluate m2o→o2m paths in permission rules. | Verified locally: 31 API checks per role (`pnpm directus:setup` from zero), up→down→up clean.                                |

## 5. Open — needs an answer

| ID     | Question                                                                                                                                                          | Why it matters                                                                                                                                          | Blocks               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| ~~N1~~ | ~~Approve the Directus migration-extension approach in §4 (Q11)?~~                                                                                                | ✅ **RESOLVED — rejected.** Direct SQL used instead; the extension added machinery without adding durability. See §4 Q11.                               | —                    |
| ~~N2~~ | ~~Who owns the Directus deployment? Can we write to `extensions/` and restart it?~~                                                                               | ✅ **RESOLVED.** `ssh hmtc`; Directus 11.1 runs in Docker with a persisted `directus_postgres` volume. Restart is safe — nothing consumes Directus yet. | —                    |
| ~~N3~~ | ~~`cms_pages.page_type` — what are the allowed values?~~                                                                                                          | ✅ **RESOLVED — R4.**                                                                                                                                   | —                    |
| **N4** | Revision retention duration (proposed: **2 years**). Are currently-published revisions exempt from routine cleanup?                                               | Needed before the editor phase. Recommended safe default: never purge the live published revision or the only recoverable snapshot.                     | Editor phase         |
| **N5** | Accept the dependency-security debt (B7) until launch, or schedule it?                                                                                            | `pnpm.overrides` is silently inert — every security pin is unapplied.                                                                                   | Production readiness |
| ~~N6~~ | ~~Is the `/gallery` route being removed entirely, or just un-gated?~~                                                                                             | ✅ **RESOLVED — R5: removed.**                                                                                                                          | —                    |
| ~~N7~~ | ~~Should `cms_department_memberships.membership_role` get a constrained vocabulary?~~                                                                             | ✅ **RESOLVED — R6.**                                                                                                                                   | —                    |
| **N9** | Staging shares production Directus (R3). Should `/dashboard/cms` be read-only on staging (`CMS_EDITING_ENABLED=false`), or is staging a second production editor? | Staging edits are real production content. Default in `.env.example` is editing enabled; set it explicitly per environment.                             | Phase 1 rollout      |

**Standing operational rule (N8) — restart Directus after out-of-band DDL.** Directus caches its introspected schema in memory, so `is_unique` / `is_nullable` stay stale until the cache rebuilds — even though those values are not stored in `directus_fields`. Observed directly: after applying `001`, `directus_read-fields` still reported `slug.is_unique = true`; only `docker restart directus` corrected it. This also applies after restoring a backup.

## 6. One verification still outstanding

Q9 was only ever confirmed by reading the policy. R2 replaces it with a stronger rule — **no anonymous read on `cms_pages` at all** — which can be verified on an empty database.

**After migration 003 is applied to production:** ✅ **verified 2026-11-03 — 403.**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://directus.hmtc-its.com/items/cms_pages   # expect 403
```

**Still outstanding:** once the first page is published, confirm the public route renders it (200) and that draft blocks are still not reachable anonymously.

## 7. Deferred items — recorded so they are not forgotten

| Item                                                                                     | Deferred because                           | Revisit                           |
| ---------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------- |
| Dependency security / `next` upgrade (B7)                                                | Explicitly deferred by decision            | Before production launch          |
| `next-themes` removal from `package.json`                                                | Pre-existing deferral — `DESIGN.md` §10 A5 | When the lockfile is next touched |
| Migration of the 5 NocoDB form handlers → `cms_forms`                                    | Separate workstream; specification §15     | After the core CMS                |
| Removing unused deps (`react-hot-toast`, `react-scroll`, `universal-cookie`, `date-fns`) | Forces a lockfile rewrite                  | With the lockfile change above    |
| Consolidating the 3 remaining `/api/schedule` consumers                                  | Functional refactor on live gated pages    | Opportunistically                 |
