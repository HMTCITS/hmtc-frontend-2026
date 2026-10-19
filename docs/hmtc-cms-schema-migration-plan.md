# HMTC CMS — Directus Schema Migration Plan

**Status:** Plan only. **No migration has been executed.**
**Deliverable:** Specification §17 item 2 ("Directus schema migration plan with rollback strategy")
**Companion:** `docs/hmtc-cms-phase-0-report.md`, `docs/audits/hmtc-cms-data-fetching-audit.md` (rev. 2), `docs/hmtc-cms-implementation-specification.md`
**Target:** Directus 11.1.2 at `https://directus.hmtc-its.com`
**Date:** 2026-10-19

> **Nothing in this document has been applied.** No collection, field, index, relation, role, policy, or permission was created, modified, or deleted during Phase 0. Track B was strictly read-only.

---

## 1. Why this migration is cheaper now than it will ever be again

The CMS tables are empty:

| Collection                                                                                                  | Rows             |
| ----------------------------------------------------------------------------------------------------------- | ---------------- |
| `cms_departments`                                                                                           | **9** (seeded)   |
| `cms_pages`, `cms_prokers`, `cms_templates`, `cms_site_settings`, `cms_page_redirects`, `cms_review_events` | **0**            |
| All 6 `cms_form_*` collections                                                                              | **0**            |
| `cms_department_memberships`                                                                                | **0**            |
| `directus_files`                                                                                            | ≥ 1 (test asset) |
| `directus_users`                                                                                            | 1 (admin)        |

Two migrations below are trivial against an empty table and expensive against a populated one:

- **M2 (`cms_pages.slug` global uniqueness)** — a uniqueness change on a populated table requires detecting and resolving collisions first, which means a content-owner decision per collision.
- **M4 (`cms_pages.proker` required)** — making a column `NOT NULL` fails outright if any existing row is null.

**Recommendation: complete the schema migration before authoring any proker content.** The window is open now and closes on first publish.

---

## 2. Migration inventory

| ID      | Item                                                              | Origin               | Blocking decision    | Risk                |
| ------- | ----------------------------------------------------------------- | -------------------- | -------------------- | ------------------- |
| **M1**  | `field_type_snapshow` → `field_type_snapshot`                     | S1                   | none                 | Low                 |
| **M2**  | `cms_pages.slug` unique constraint                                | S2                   | **Q8 (cardinality)** | Medium              |
| **M3**  | `cms_pages.slug` / `department` / `proker` / `status` nullability | S6 (generalised)     | none                 | Low                 |
| **M4**  | `cms_pages.proker` required semantics                             | S3                   | Q8, Q12              | Medium              |
| **M5**  | `cms_prokers.department` nullability                              | Q12                  | none                 | Low                 |
| **M6**  | `cms_department_memberships` grant uniqueness + role vocabulary   | B5                   | Q11                  | Medium              |
| **M7**  | Department slug canonicalisation                                  | F14                  | none                 | Low                 |
| **M8**  | Field interfaces for Directus Studio                              | S4                   | none                 | Low                 |
| **M9**  | Enum enforcement for status vocabularies                          | S5                   | none                 | Low                 |
| **M10** | `cms_site_settings` singleton enforcement                         | S7                   | none                 | Low                 |
| **M11** | Public-role row-level rule for published content                  | **Q9 — new, urgent** | none                 | **High if skipped** |

---

## 3. Migration detail

### M1 — `field_type_snapshow` typo

**Problem.** `cms_form_answers.field_type_snapshow` should read `field_type_snapshot`. Confirmed to be the live API field name, so any generated TypeScript type inherits the misspelling.

**Change.** Rename the field to `field_type_snapshot`.

**Why now.** Zero rows in `cms_form_answers`. Once form submissions exist, the rename becomes a data migration plus a coordinated code change.

**Forward (Directus).** Directus has no field-rename endpoint. The safe sequence is: create `field_type_snapshot` → copy values → drop `field_type_snapshow`. With zero rows, this is two metadata operations.

**Rollback.** Recreate `field_type_snapshow` and drop `field_type_snapshot`. Lossless while empty.

**Verify.** `directus_read-fields` on `cms_form_answers` shows `field_type_snapshot` and not `field_type_snapshow`.

**Note.** Forms are deferred (specification §15), so this is **not** a first-release blocker — but it is a one-minute fix while the table is empty. Doing it later costs more.

---

### M2 — `cms_pages.slug` uniqueness 🔴 **BLOCKED on Q8**

**Problem.** `cms_pages.slug` is **globally unique** (`is_unique: true`, indexed), while content is year-scoped (`edition_year` is required and indexed). A slug such as `welcome-party` therefore cannot exist in both the 2026 and 2027 editions — which contradicts the edition model in `DESIGN.md` §14 and `src/lib/config.ts`.

**The blocking question (Q8).** The specification's route is `/department/activity/{year}` — three segments — but `cms_pages` also carries a `parent_page` self-relation and a required unique `slug` that is **not part of that route**. Nothing prevents N pages per `(proker, edition_year)`. So:

> **Is there exactly one page per proker-year, or many — and if many, what is the URL?**

**Two mutually exclusive resolutions:**

#### Option A — one page per proker-year

```text
Route:   /{department.slug}/{proker.slug}/{edition_year}
Change:  drop UNIQUE on cms_pages.slug
         add  UNIQUE (department, proker, edition_year)
         slug becomes non-unique display/SEO metadata, or is removed
```

#### Option B — many pages per proker-year

```text
Route:   /{department.slug}/{proker.slug}/{edition_year}/{slug}
Change:  keep cms_pages.slug
         replace global UNIQUE(slug) with UNIQUE (department, proker, edition_year, slug)
         parent_page carries the nesting
```

**Do not choose by assumption.** Option B is implied by `parent_page` existing; Option A is implied by the specification's route shape. The two are not reconcilable without a decision.

**Why blocking matters.** This determines the constraint, the route builder, the cache-tag scheme, and the redirect source format. Migrating before deciding means migrating twice.

**Forward.** Drop the existing unique index, add the composite one. Directus exposes per-field `is_unique` via the schema API; composite unique indexes need a database-level migration plus a Directus metadata reload.

**Rollback.** Drop the composite index, restore the single-column unique on `slug`. **Only safe while the table is empty or collision-free** — record the pre-migration constraint definition before touching it.

**Verify.** Attempt to insert two rows differing only in `edition_year` with the same slug (expect success); attempt to insert two identical `(department, proker, edition_year, slug)` tuples (expect failure).

---

### M3 — Nullability drift on `cms_pages`

**Problem (generalises S6).** Four of the seven fields that Directus marks `required` are `is_nullable: true` in the database:

| Field          | `meta.required` | `is_nullable` | Consistent? |
| -------------- | --------------- | ------------- | ----------- |
| `title`        | true            | false         | ✅          |
| `page_type`    | true            | false         | ✅          |
| `edition_year` | true            | false         | ✅          |
| `slug`         | true            | **true**      | ❌          |
| `department`   | true            | **true**      | ❌          |
| `proker`       | true            | **true**      | ❌          |
| `status`       | true            | **true**      | ❌          |

Directus `required` is **application-level metadata**; it does not imply a `NOT NULL` constraint. The database therefore permits rows that the application considers invalid, and no generated type can be trusted for these fields.

**Change.** Align the database with the intended contract — `ALTER COLUMN … SET NOT NULL` for the four fields — **after** M2/M4 settle `slug` and `proker`.

**Forward.** `SET NOT NULL` per column.

**Rollback.** `DROP NOT NULL` per column. Lossless (removing a constraint cannot lose data).

**Verify.** Directus `directus_read-fields` reports `is_nullable: false` for all four.

**Interim rule until migrated.** Treat **every** Directus `required` field as possibly `null` in application types, and validate with Zod at the boundary. This is the safe default regardless of migration timing.

---

### M4 — `cms_pages.proker` required semantics 🔴 **BLOCKED on Q8 / Q12**

**Problem.** `cms_pages.proker` is `required: true`, so **every page must belong to a proker**. Standalone pages — landing, `/info`, About, Contact — have no valid value.

**The specification's own guidance (§5) is the right instinct:** _"Avoid fake/sentinel relations without a clear need."_ Its stated resolution is to **constrain the first release to proker-only pages**, which defers the problem rather than solving it.

**Two acceptable resolutions:**

| Option                                    | Change                                                                                  | Consequence                                                                                           |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **A. Narrow the scope** (spec §5 default) | Leave `proker` required; CMS manages proker pages only; standalone pages stay hardcoded | Nothing to migrate now. The constraint bites the moment someone wants an editor-managed landing page. |
| **B. Widen the model**                    | Make `proker` nullable, and require `department` + `edition_year` instead               | Standalone pages become expressible; route construction needs a dept-only branch                      |

**Recommendation:** adopt **A** for the first release (it matches "Proker pages only" in specification §1) and record B as a deliberate future migration. Adopting A means **M4 is a no-op** — but it must be recorded as an accepted limitation, not an oversight.

**Verify.** `cms_pages.proker` accepts null after M3 (or is documented as intentionally required).

---

### M5 — `cms_prokers.department` nullability

**Problem.** `cms_prokers.department` is `is_nullable: true` and indexed, but **not required**. A proker may therefore exist with no department — in which case `/{department}/{activity}/{year}` **cannot be constructed at all**. Combined with `cms_prokers.slug` being globally unique, the department segment is decorative for routing.

**Change.** `SET NOT NULL` on `cms_prokers.department`.

**Forward.** One `SET NOT NULL`. Zero rows, so no backfill needed.

**Rollback.** `DROP NOT NULL`.

**Verify.** Attempt to insert a proker without a department (expect failure).

**Note.** Because `cms_prokers.slug` is globally unique, department-scoping is not enforced by uniqueness — only by this `NOT NULL` plus application validation. If a future requirement is "two departments may each have a proker named `open-house`", the unique constraint must also become `(department, slug)`.

---

### M6 — Department membership grants 🔴 **BLOCKED on Q11**

**Problem.** `cms_department_memberships` cannot express the specification's §4 permission matrix:

| Field             | Type             | Unique    | Indexed |
| ----------------- | ---------------- | --------- | ------- |
| `department`      | uuid             | **false** | true    |
| `user`            | uuid             | **false** | true    |
| `membership_role` | string (no enum) | false     | false   |
| `is_active`       | boolean          | false     | false   |

- **No composite unique on `(user, department)`** → the same grant can be created repeatedly. Duplicate rows make "which departments can this user edit?" ambiguous.
- **`membership_role` is an unconstrained free string** → no vocabulary to validate against.

**Change.**

```text
add    UNIQUE (user, department)
add    CHECK / application-level validation for membership_role
       (proposed vocabulary: 'editor' | 'reviewer' | 'publisher' | 'template_maintainer')
```

**Q11 — the blocking decision.** Cross-department grants cannot be uniquely constrained as-is. **Migrate the schema, or enforce entirely in Next.js?** Migration is strongly preferred: the specification requires that _"Direct API calls cannot bypass role/resource checks"_ (§12), which is unachievable if the only enforcement lives in application code.

**Forward.** Add the composite unique index; introduce a constrained vocabulary for `membership_role`.

**Rollback.** Drop the index; revert `membership_role` to a free string. **Check for duplicates before rolling back a unique index.**

**Verify.** Insert `(user A, dept 1)` twice → second fails. Assign an invalid `membership_role` → rejected.

---

### M7 — Department slug canonicalisation

**Problem (F14).** `cms_departments.slug` is documented as the route segment (_"Contoh: /internal-affairs"_) but does not match the repository's routes:

| `cms_departments.slug`         | Repo route under `src/app/`    | Status                                             |
| ------------------------------ | ------------------------------ | -------------------------------------------------- |
| `internal-affairs`             | `internal-affairs/`            | ✅                                                 |
| `student-welfare`              | `student-welfare/`             | ✅                                                 |
| `student-social-development`   | `student-social-development/`  | ✅                                                 |
| **`research-technology`**      | **`research-and-technology/`** | ❌ **404 generator**                               |
| `creative-media-information`   | —                              | ⚠️ no route yet                                    |
| `external-affairs`             | —                              | ⚠️ no route yet                                    |
| `student-talent-interest`      | —                              | ⚠️ no route yet                                    |
| `student-resource-development` | —                              | ⚠️ no route yet                                    |
| `enterpreneurship-development` | —                              | ⚠️ **misspelled** — should be `entrepreneurship-*` |

**Change.** Correct `research-technology` → `research-and-technology`, and `enterpreneurship-development` → `entrepreneurship-development`. Decide whether the four route-less departments should exist yet.

**Forward.** Two field-value updates on 9 rows.

**Rollback.** Revert the two values. Capture the pre-migration values first.

**Verify.** `grep` the corrected slugs against `src/lib/config.ts` `PROKER_BASE_PATHS` and the `src/app/` directory list — all must resolve.

**Note.** This is a **content** change to a seeded table, not a structural one. Because `cms_prokers` is empty, no cascade is needed. `DESIGN.md` §14 and `src/lib/config.ts` remain the routing source of truth (B4); this migration only makes the database agree with them.

---

### M8 — Directus Studio field interfaces

**Problem (S4).** Every `cms_*` field has `"interface": null`, so Directus Studio renders raw inputs — including `cms_pages.blocks` as a **plain JSON textarea**.

**Change.** Configure sensible interfaces: `select-dropdown` for the status vocabularies, `input-multiline` for descriptions, `file-image` for `featured_image` (already set), relation display templates for `department`/`proker`/`template`.

**Important.** Setting an interface on `blocks` **does not** create a visual block editor, and must not be mistaken for one. Per the specification, the typed block editor lives in Next.js and the app owns the block schema. A raw JSON textarea in Studio is acceptable _provided_ Studio is not treated as a page-composition tool — and app-side validation is the real guarantee.

**Forward.** Metadata-only changes via the Directus schema API.

**Rollback.** Set `interface` back to `null`. Purely presentational; no data impact.

**Verify.** Open each collection in Studio and confirm the intended control renders.

---

### M9 — Enum enforcement for status vocabularies

**Problem (S5).** `cms_pages.status`, `cms_pages.page_type`, `cms_forms.status`, `cms_form_versions.status`, and `cms_review_events.action` are plain `varchar` columns whose allowed values exist **only in the field `note`**. Nothing enforces them — not the database, not the API.

**Change.** Two layers, both recommended:

1. **Application layer (required, no migration).** Zod schemas enforcing the documented vocabularies, plus server-side legal-transition checks. This is where the specification's workflow rules must live regardless (§6, §12).
2. **Database layer (optional).** `CHECK` constraints mirroring the vocabularies.

**Recommendation:** implement (1) unconditionally; treat (2) as optional, since adding a new status later then requires a migration.

#### Canonical vocabularies (from the field notes)

```text
cms_pages.status           draft | in_review | changes_requested | published | archived
cms_pages.page_type        (unconstrained — needs its own definition)
cms_forms.status           draft | published | closed | archived
cms_form_versions.status   draft | published | retired
cms_review_events.action   submitted | approved | changes_requested | unpublished | archived
```

⚠️ **`cms_pages.page_type` has no documented vocabulary at all** — the note is empty. This must be defined before M2/M9 can be completed, and it affects routing. Added as **Q14**.

**Rollback.** Application-layer validation reverts with code. `CHECK` constraints drop cleanly.

---

### M10 — `cms_site_settings` singleton

**Problem (S7).** `id` is a plain `integer` primary key with no singleton guarantee; the API can return multiple rows. Application code would then need to guess which is canonical.

**Change.** Enforce exactly one row: either a `CHECK (id = 1)` constraint, or defensive "select and validate exactly one canonical record" in the data layer.

**Recommendation.** Both — the constraint for integrity, defensive selection because the app should not silently pick a row.

**Forward.** Zero rows, so insert the canonical row as part of the same change.

**Rollback.** Drop the constraint; the row can remain harmlessly.

**Verify.** `GET /items/cms_site_settings` returns exactly one row.

---

### M11 — Public-role row-level rule for published content 🔴 **URGENT — verify before authoring content**

**Origin:** Track B (§3.4 of the Phase 0 report), not the audit.

**The situation.** The public role can read `cms_pages` and `cms_forms` directly:

```text
GET https://directus.hmtc-its.com/items/cms_pages   →  200  {"data":[]}
```

Read is **all 23 fields** (including `status`, `blocks`, `published_by`). Create/update/delete are all **403**. Filtering on **every** probed field is **403**.

**What is NOT known.** The collection is empty, so `{"data":[]}` is consistent with **both**:

- a row-level rule `status = published` (drafts never returned) — **safe**, and
- no row-level rule (every row returned) — **unsafe**: the first draft becomes world-readable.

**I cannot distinguish these while the table is empty.** An earlier single-field `status` filter probe appeared to suggest a rule; re-testing all fields showed the filter denial is blanket, so **that interpretation was withdrawn**.

**Change if no rule exists.** Add a public-role permission rule on `cms_pages` and `cms_forms`:

```text
cms_pages   read   rule: status = published
cms_forms   read   rule: status = published   (form definitions; submissions stay 403)
```

**Why this is the authoritative fix.** The specification requires _"Draft and in-review pages are never returned by public queries"_ and _"Direct API calls cannot bypass role/resource checks"_ (§12). Filtering in Next.js satisfies the first only for requests that go through Next.js. Anyone can query Directus directly:

```bash
curl 'https://directus.hmtc-its.com/items/cms_pages'
```

Next.js-side filtering remains **necessary defence in depth**, but it is not sufficient on its own.

**Forward.** Add the rule in Studio (Settings → Policies → Public) or via `/permissions`.

**Rollback.** Remove the rule. ⚠️ Rolling back **exposes drafts** — treat this as a security-relevant revert.

**Verify — two-step, and the second step is the one that matters.**

1. Immediately: inspect the rule in Studio. Do not infer it from an empty response.
2. **After the first draft is authored:** `curl …/items/cms_pages` must **not** return it. Repeat once a page is published, and confirm it then **does** appear.

---

## 4. Sequencing

```text
Phase M-A  (no blockers, zero-risk, do together)
  M1  field_type_snapshot rename
  M7  department slug canonicalisation
  M10 site_settings singleton
  M8  Studio interfaces
  M5  cms_prokers.department NOT NULL
  M3  nullability alignment (partially — after M2/M4 settle slug/proker)
        │
        ▼
Phase M-B  (blocked — needs Q8, Q11, Q12, Q14 answered)
  M2  slug uniqueness          ← Q8
  M4  proker required          ← Q8, Q12   (may resolve to a documented no-op)
  M6  membership uniqueness    ← Q11
  M9  enum enforcement         ← Q14
        │
        ▼
Phase M-C  (security — verify immediately, no schema change)
  M11 public-role published rule   ← MUST be confirmed before any content is authored
```

**M11 is deliberately outside the structural sequence.** It is a permission check, not a schema migration, and its verification is a **precondition for creating the first page** — not part of a phased rollout.

---

## 5. Global rollback strategy

#### Principles

1. **Snapshot first.** Take a full logical backup of the Directus database **and** an export of Directus's own configuration (`directus_collections`, `directus_fields`, `directus_relations`, `directus_permissions`) before any migration. Directus keeps its schema metadata in those tables — a database restore that misses them leaves Directus desynchronised from the physical schema.
2. **Migrate through Directus, not around it.** Use the Directus schema API or Studio so `directus_fields`/`directus_relations` stay consistent. Raw `ALTER TABLE` against the database will silently desync Directus's metadata and produce a UI that disagrees with reality.
3. **Additive before destructive.** Add the new constraint or column, verify, then remove the old one — never drop first.
4. **One migration, one commit, one rollback script.** Each of M1–M10 is independently revertible. Do not bundle.
5. **Record the "before" state in the commit message** (constraint definitions, field metadata, row values). A rollback you cannot describe is not a rollback.
6. **Rollback rehearsal on a restored copy** before applying anything to production.

#### Per-migration rollback

| Migration | Mechanism                                          | Data loss risk                             |
| --------- | -------------------------------------------------- | ------------------------------------------ |
| M1        | Recreate old field, copy back, drop new            | None while empty                           |
| M2        | Drop composite index, restore single-column unique | ⚠️ **Fails if collisions were introduced** |
| M3        | `DROP NOT NULL`                                    | None                                       |
| M4        | Restore `required` metadata                        | None                                       |
| M5        | `DROP NOT NULL`                                    | None                                       |
| M6        | Drop unique index, revert to free string           | ⚠️ Check for duplicates first              |
| M7        | Restore two slug values                            | Capture originals first                    |
| M8        | Set `interface` back to `null`                     | None                                       |
| M9        | Drop `CHECK` constraints / revert Zod              | None                                       |
| M10       | Drop constraint                                    | None                                       |
| M11       | Remove rule                                        | 🔴 **Exposes drafts — security revert**    |

---

## 6. What this plan deliberately does not migrate

| Not migrated                                | Why                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Legacy `api.hmtc-its.com` resources         | Decommissioned — galleries/users/requests/uploads/repositories return 404. Nothing to migrate _to_.                                                           |
| The 5 NocoDB form handlers → `cms_forms`    | A separate workstream (specification §15). M1 only prepares the field name.                                                                                   |
| `cms_departments` beyond the two slug fixes | 9 rows are correct and in use.                                                                                                                                |
| Directus Content Versioning                 | No version data exists, and the specification has not settled whether native versioning or a hand-rolled `status` + `cms_review_events` workflow is intended. |
| Roles and policies beyond the public role   | Not enumerable with the available tooling (§7). Must be inspected in Studio.                                                                                  |
| Asset privacy                               | M11 covers page drafts. Asset visibility is **fully public today** and needs its own decision (Q10) — see §7.                                                 |

---

## 7. Decisions required before this plan can be executed

| ID      | Decision                                                                                                                         | Blocks                                   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| **Q8**  | One page per proker-year, or many? Determines the route shape.                                                                   | M2, M4 — and the migration design itself |
| **Q9**  | Does the public role's read on `cms_pages` carry a `status = published` rule? **Verify in Studio.**                              | M11 — and any content creation           |
| **Q10** | Is all CMS media acceptable as publicly readable at `/assets/<uuid>`? No private-asset path exists today.                        | Media phase                              |
| **Q11** | Migrate `cms_department_memberships` for unique grants, or enforce in Next.js only?                                              | M6, Phase 1 authorisation                |
| **Q12** | Make `cms_prokers.department` required and use a sentinel for standalone pages — or constrain release to proker pages (spec §5)? | M4, M5                                   |
| **Q13** | `/gallery` is permanently locked (Phase 0 report F15). Gate via Directus auth, replace the check, or remove the gate?            | Gallery, not the CMS                     |
| **Q14** | What is the vocabulary for `cms_pages.page_type`? Undocumented, and it affects routing.                                          | M9, M2                                   |
| **B1**  | Revision retention duration (proposed: 2 years).                                                                                 | Editor phase only — not this plan        |

**How to resolve Q9 (the urgent one).** Directus Studio → Settings → Policies → Public → `cms_pages`. Look for a row-level rule. If there is none, add `status = published` **before** authoring the first page. Do not infer the answer from an empty API response — that is the trap this document exists to flag.

---

## 8. Evidence

All constraints, nullability, and row counts below come from read-only MCP calls and unauthenticated HTTP probes performed in Phase 0:

```bash
# Schema (directus_read-collections, directus_read-fields — MCP, read-only)
#   cms_pages, cms_prokers, cms_departments, cms_department_memberships,
#   cms_templates, cms_form_answers

# Permission surface (unauthenticated)
curl -s https://directus.hmtc-its.com/server/specs/oas | jq -r '.info.version'   # → 11.1.2
curl -s -o /dev/null -w '%{http_code}\n' https://directus.hmtc-its.com/items/cms_pages      # → 200
curl -s -o /dev/null -w '%{http_code}\n' https://directus.hmtc-its.com/items/cms_departments # → 403
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://directus.hmtc-its.com/items/cms_pages \
     -H 'Content-Type: application/json' -d '{"title":"x"}'                                  # → 403
curl -s -o /dev/null -w '%{http_code}\n' 'https://directus.hmtc-its.com/items/cms_pages?filter[status][_eq]=draft'  # → 403
```

**No mutation of any kind was performed against Directus.** No credentials were transmitted, and none appear in this document.
