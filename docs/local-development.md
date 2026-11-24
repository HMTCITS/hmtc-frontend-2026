# Local development

Everything needed to pick up any task in this repository, including CMS work, without touching production.

## 1. Prerequisites

| Tool                    | Version                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| Node.js                 | 24 (CI uses 24; ≥ 22 works)                                                   |
| pnpm                    | 10.11 — pinned in `package.json` `packageManager`; run `corepack enable` once |
| Docker + Docker Compose | Docker Desktop on Windows/macOS, Docker Engine on Linux. Needed for CMS work  |
| Git                     | any recent version                                                            |

## 2. App only (no CMS)

```bash
git clone https://github.com/HMTCITS/hmtc-frontend-2026.git
cd hmtc-frontend-2026
git checkout staging
pnpm install
cp .env.example .env.local   # every value may stay empty for most pages
pnpm dev                      # http://localhost:3000
```

Pages that submit forms need the `NOCODB_*` values; ask DevOps. Everything else renders without any variables.

## 3. Local Directus (CMS work)

CMS code must never be developed against production Directus. Run a local copy that has the **production schema** and sample data:

```bash
pnpm directus:setup
```

This starts `compose.directus.yml` (Directus 11.1.2 + Postgres 16) and then:

1. applies `directus/snapshot.json` — the production schema exported after migration 002;
2. applies `directus/post-snapshot.sql` — composite unique indexes and the site-settings singleton, which a snapshot cannot store;
3. applies `scripts/directus-schema/003+` migrations that have not run yet (tracked in `hmtc_local_migrations`);
4. copies `directus/seed/assets/` into the uploads volume;
5. runs every file in `directus/seed/` (departments with production IDs, sample prokers, public permissions, development users, starter templates);
6. restarts Directus so it sees the DDL.

Every step is idempotent: re-run `pnpm directus:setup` after pulling a branch that adds a migration or seed file.

| What                | Where                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Directus Studio/API | http://localhost:8055                                                                            |
| Admin login         | `admin@example.com` / `admin-local`                                                              |
| Stop (keep data)    | `pnpm directus:down`                                                                             |
| Wipe and start over | `pnpm directus:reset && pnpm directus:setup`                                                     |
| SQL shell           | `docker compose -f compose.directus.yml exec directus_postgres psql -U directuspg -d directusdb` |

#### Development users (`directus/seed/30-dev-users.sql`)

Created on top of migration `004`. All three CMS users are members of **Research Technology** (`research-and-technology`), so they can work on the same page and exercise the review workflow.

| User                    | Password          | Directus role   | Membership role |
| ----------------------- | ----------------- | --------------- | --------------- |
| `editor@example.com`    | `editor-local`    | `CMS member`    | `editor`        |
| `reviewer@example.com`  | `reviewer-local`  | `CMS member`    | `reviewer`      |
| `publisher@example.com` | `publisher-local` | `CMS member`    | `publisher`     |
| `reader@example.com`    | — (token only)    | `nextjs-reader` | —               |

The reader's static token is `local-nextjs-reader-token`. It is a local-only value; production uses its own token, set by DevOps.

`CMS member` has no Studio access by design (the editor is `/dashboard/cms`), so these users can only log in through the API. What each one may do is decided by their `cms_department_memberships` row — add a row (as admin) to give a user a role in another department.

#### Starter templates (`directus/seed/40-templates.sql`)

Two published, global templates that any department can create a page from. On a fresh setup their ids are `1` and `2`; look them up in Studio otherwise.

| Template slug | Blocks                          |
| ------------- | ------------------------------- |
| `event`       | hero, eventDetails, agenda, cta |
| `program`     | hero, richText, gallery         |

The content is template placeholders. The program gallery uses a placeholder image that reads "Ganti foto ini" (file `4fb657b6-1b26-4389-b00e-a1f64be8e5d3`, from `directus/seed/assets/template-placeholder.webp`, in the "Public Assets" folder).

Placeholders are allowed in drafts and previews, but publishing is refused with `invalid_blocks` until every one is replaced; the error points at each block and field. `publishBlocksSchema` (`src/lib/directus/blocks.ts`) recognises two forms, and new templates must use them:

- **Text:** the whole value is one bracketed group, such as `[Judul acara]`. Brackets inside real text, as in `Workshop [Online]`, are not a placeholder.
- **Links:** `/#ganti-tautan`. A real path such as `/` cannot be told apart from content.

The gallery image itself is not checked (its file id differs per environment), but its alt text is a bracketed placeholder, so the editor must describe the real photo before publishing. `src/lib/directus/__tests__/template-seed.test.ts` checks that both templates are valid drafts and cannot be published as seeded. Re-running setup never overwrites a template that was edited in Studio. To try one, log in as `editor@example.com` and send `POST /api/cms/pages` with `templateId`.

**Production (DevOps).** The seed only runs locally. To add the templates to production:

1. Snapshot first (`AGENTS.md` §13).
2. In Studio, upload `directus/seed/assets/template-placeholder.webp` to the **Public Assets** folder and copy its file id.
3. Create two `cms_templates` items with the name, slug, description, category and blocks JSON from `40-templates.sql`. In the program blocks, replace the gallery `asset` with the file id from step 2. Set **Status** to `published` and tick **Is Global**.
4. Check: as an editor, create a draft from each template through `POST /api/cms/pages` and check its blocks, then delete the drafts in Studio as admin. The gallery image must load at `/assets/<file id>`.

Point the app at it in `.env.local`:

```env
DIRECTUS_URL=http://localhost:8055
DIRECTUS_READ_TOKEN=local-nextjs-reader-token
```

The CMS-specific variables are listed in `.env.example`.

### Integration tests

`src/**/*.integration.test.ts` run against this local Directus and use the development users above. They are not part of `pnpm test`.

```bash
pnpm directus:setup
pnpm test:integration
```

CI runs the same two commands in `.github/workflows/integration.yml` when Directus, CMS or test-config files change. If a migration or seed file breaks `pnpm directus:setup`, that job fails too.

### Changing the Directus schema

1. Write `scripts/directus-schema/NNN-name.up.sql` and a matching `.down.sql` (next free number).
2. `pnpm directus:setup` applies it locally. Test the `.down.sql` against a fresh `pnpm directus:reset`.
3. Open a PR. Production is changed by DevOps only, following the steps in `AGENTS.md` §13 (snapshot first, restart Directus afterwards).
4. After production is migrated, DevOps re-exports `directus/snapshot.json` only when the baseline is moved forward; until then local setup replays the migration on top of the baseline.

Never edit the production schema through Studio for a change that the app depends on — it would not be reproducible here.

## 4. Before you open a PR

```bash
pnpm typecheck
pnpm lint:strict
pnpm format:check
pnpm test
```

Commit messages follow Conventional Commits (enforced by Husky). Branch from `staging`, keep PRs small, and merge at least every one or two days — see `AGENTS.md`.

## 5. Troubleshooting

| Symptom                                        | Fix                                                                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| `pnpm directus:setup` → `Could not run docker` | Start Docker Desktop, or install Docker Engine + the Compose plugin                    |
| Port 8055 already in use                       | Stop the other process, or change the left side of `127.0.0.1:8055:8055` locally only  |
| Studio still shows an old field constraint     | `docker compose -f compose.directus.yml restart directus` (Directus caches the schema) |
| A migration failed halfway                     | Fix it, then `pnpm directus:reset && pnpm directus:setup`                              |
