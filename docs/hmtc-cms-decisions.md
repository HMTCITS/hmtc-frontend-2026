# HMTC CMS — Decision Log

**Purpose.** The single place that separates **confirmed requirements** from **open questions** for the HMTC CMS. Written for whoever picks this up next — the intent is that **no one has to reconstruct a decision from a Slack thread or an agent transcript.**

**Status legend:** ✅ confirmed · 🟡 recommended, awaiting confirmation · 🔴 open · ⛔ deferred

**Related:** `docs/hmtc-cms-implementation-specification.md` (requirements) · `docs/hmtc-cms-phase-0-report.md` (what was built) · `docs/hmtc-cms-schema-migration-plan.md` (Directus changes, plan only) · `docs/audits/hmtc-cms-data-fetching-audit.md` (findings F1–F18) · `AGENTS.md` §13–§14 (working rules)

**Last updated:** 2026-10-19

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
| C7  | ✅ **Unpublished content returns a real HTTP 404** via `dynamicParams = false`.                                    | The root `<React.Suspense>` makes `notFound()` a soft-404 (HTTP 200) — audit F9.                |
| C8  | ✅ **Revision snapshots with restore-to-new-draft.**                                                               | Restoring never erases later history and never publishes automatically.                         |

## 4. Decisions taken in Phase 0 (2026-10-19)

These were the open blockers from the Phase 0 report. All are now answered.

| ID      | Question                                                                                          | Decision                                                                       | Consequence                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q8**  | Is there one page per proker-year, or many?                                                       | ✅ **One.**                                                                    | `cms_pages.slug` loses its global unique. Migration is **M2 Option A**: add `UNIQUE (department, proker, edition_year)`. Route stays `/department/activity/{year}`. |
| **Q9**  | Does the public role's read on `cms_pages` carry a row-level rule?                                | ✅ **Yes — already configured.** Confirmed by the operator in Directus Studio. | Migration **M11 is satisfied.** No permission change needed. See §6 for the one follow-up test.                                                                     |
| **Q10** | Is all CMS media acceptable as publicly readable?                                                 | ✅ **Yes — everything public except forms.**                                   | Assets at `/assets/<uuid>` staying public is intended. Form submissions (`cms_form_submissions`, `cms_form_answers`) are already private (403).                     |
| **Q12** | `cms_prokers.department` is nullable, so `/{dept}/{activity}/{year}` is not always constructible. | ✅ **Make it required.**                                                       | Migration **M5**: `SET NOT NULL` on `cms_prokers.department`. Zero rows, so no backfill.                                                                            |
| **Q13** | `/gallery` is permanently locked (finding F15).                                                   | ✅ **Drop the gate.** The route is legacy and should not be used.              | Remove the NRP gate from `src/app/gallery/container/galleryPage.tsx` and `src/app/landing/components/gallery/nrpModal.tsx`. **Not yet implemented** — see §5.       |
| **Q14** | What is the vocabulary for `cms_pages.page_type`?                                                 | ⛔ **Deferred.**                                                               | Migration **M9** stays blocked. Note the field is `required` and currently undocumented.                                                                            |
| **B7**  | Dependency security: 109 vulnerabilities, `pnpm.overrides` inert.                                 | ⛔ **Deferred by decision — accepted risk.**                                   | `next@16.2.9` remains inside advisory GHSA-cjq9-62q9-8jv4. Revisit before production launch. See §5.                                                                |

### Q11 — how the composite unique constraints will be migrated 🟡

**Asked:** _"how do you plan to migrate it? does Directus support it?"_

**Answer: Directus does not support composite unique constraints.** Confirmed against Directus's own issue tracker and community discussions:

- The Admin UI and schema API expose only per-field `is_unique`. There is **no multi-column unique control**.
- ⚠️ **Marking two fields individually as "Unique" does not work** — it creates two independent single-column constraints, which is not the intent.
- Community reports warn of UI/backend instability when composite constraints are applied manually to an **existing populated** collection, and of violations surfacing as a generic `400 "Field has to be unique"` rather than a field-specific error.

**Recommended approach — Directus custom migration extension:**

```text
extensions/migrations/<timestamp>-cms-composite-unique.js
```

```js
module.exports = {
  async up(knex) {
    await knex.schema.alterTable('cms_pages', (t) => {
      t.dropUnique(['slug']); // M2: remove global unique
      t.unique(['department', 'proker', 'edition_year']); // M2: one page per proker-year
    });
    await knex.schema.alterTable('cms_department_memberships', (t) => {
      t.unique(['user', 'department']); // M6: one grant per user+dept
    });
  },
  async down(knex) {
    await knex.schema.alterTable('cms_pages', (t) => {
      t.dropUnique(['department', 'proker', 'edition_year']);
      t.unique(['slug']);
    });
    await knex.schema.alterTable('cms_department_memberships', (t) => {
      t.dropUnique(['user', 'department']);
    });
  },
};
```

**Why this mechanism:** it is versioned, tracked in the repository, runs on Directus startup, and is reversible — unlike an ad-hoc `psql` statement that exists only in someone's shell history.

**App-side handling is still required.** The constraint violation reaches the client as a generic `400`. Map it to a readable, field-specific message in the Route Handler rather than surfacing Directus's raw error. This is in addition to — not instead of — Zod validation.

**Two prerequisites:**

1. **Deployment access.** This requires writing to the Directus deployment's `extensions/` directory and restarting it. Confirm who owns that before scheduling M2/M6.
2. **Apply while the tables are empty.** All `cms_*` tables except `cms_departments` have zero rows today. That is the safe window — the community caveats above concern populated collections.

**Status:** approach recommended; **implementation pending your confirmation.** M2 and M6 are the two migrations that depend on it.

## 5. Open — needs an answer

| ID     | Question                                                                                                                                                    | Why it matters                                                                                                                      | Blocks               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **N1** | Approve the Directus migration-extension approach in §4 (Q11)?                                                                                              | It is the only viable route for M2 and M6. Needs deployment access to `extensions/`.                                                | M2, M6               |
| **N2** | Who owns the Directus deployment? Can we write to `extensions/` and restart it?                                                                             | Same.                                                                                                                               | M2, M6               |
| **N3** | `cms_pages.page_type` — what are the allowed values? The field is `required` with an empty note.                                                            | Affects routing and validation.                                                                                                     | M9                   |
| **N4** | Revision retention duration (proposed: **2 years**). Are currently-published revisions exempt from routine cleanup?                                         | Needed before the editor phase. Recommended safe default: never purge the live published revision or the only recoverable snapshot. | Editor phase         |
| **N5** | Accept the dependency-security debt (B7) until launch, or schedule it?                                                                                      | `pnpm.overrides` is silently inert — every security pin is unapplied.                                                               | Production readiness |
| **N6** | Is the `/gallery` route being removed entirely, or just un-gated?                                                                                           | Q13 says drop the gate and that the route is legacy. Un-gating is a 2-file change; removal is a routing decision.                   | Q13 follow-up        |
| **N7** | Should `cms_department_memberships.membership_role` get a constrained vocabulary? Proposed: `editor` \| `reviewer` \| `publisher` \| `template_maintainer`. | Currently a free string; the permission matrix cannot be validated against it.                                                      | M6                   |

## 6. One verification still outstanding

**Q9 was confirmed by the operator, but only by reading the policy — not by observed behaviour**, because `cms_pages` is empty and an empty result is indistinguishable from a filtered one.

**Confirm it once, after the first draft exists:**

```bash
curl -s https://directus.hmtc-its.com/items/cms_pages | jq '.data | length'
```

- **`0`** → the rule is working. Drafts are not public. ✅
- **`> 0`** → the rule is **not** in effect. **Stop and fix before authoring more content** — drafts would be world-readable, bypassing Next.js entirely.

Then republish and confirm the page **does** appear. This is the only acceptance criterion from specification §12 that cannot be verified on an empty database.

## 7. Deferred items — recorded so they are not forgotten

| Item                                                                                     | Deferred because                           | Revisit                           |
| ---------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------------------- |
| `cms_pages.page_type` vocabulary (Q14)                                                   | Needs a content-owner decision             | Before M9                         |
| Dependency security / `next` upgrade (B7)                                                | Explicitly deferred by decision            | Before production launch          |
| `next-themes` removal from `package.json`                                                | Pre-existing deferral — `DESIGN.md` §10 A5 | When the lockfile is next touched |
| Migration of the 5 NocoDB form handlers → `cms_forms`                                    | Separate workstream; specification §15     | After the core CMS                |
| Removing unused deps (`react-hot-toast`, `react-scroll`, `universal-cookie`, `date-fns`) | Forces a lockfile rewrite                  | With the lockfile change above    |
| Consolidating the 3 remaining `/api/schedule` consumers                                  | Functional refactor on live gated pages    | Opportunistically                 |
| Directus Content Versioning vs. hand-rolled `status` + `cms_review_events`               | Specification has not settled it           | Editor phase                      |
| `/gallery` route removal (vs. just un-gating)                                            | Needs a routing decision                   | With Q13                          |
