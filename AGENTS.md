# AGENTS.md — working rules for `hmtc-frontend-2026`

Read this before touching the repository. `DESIGN.md` is the companion design contract; §-references below point into it.

---

## 1. What this repository is

Next.js **16** App Router · React **19** · **Tailwind CSS v4 (CSS-first, no config file)** · TypeScript strict · pnpm.

Public marketing + event site for HMTC ITS, plus an internal dashboard and auth flow.

**Before you style anything, read `DESIGN.md`.** It defines which of five design layers you are in and what may be used.

---

## 2. Non-negotiable constraints

1. **Know which content path you are on — the architecture is in transition.** Public page copy is still hardcoded TypeScript. A Directus-backed CMS is being introduced **for proker pages only** (§13). Form submissions go through NocoDB route handlers. **The custom REST API at `api.hmtc-its.com` is legacy, not a live backend** — its gallery/repository/user/request/upload resources return 404 and its client has been deleted (§14).
2. **Do not add a CSS framework, UI kit, or styling runtime.** Tailwind v4 + `cn()` is the whole system.
3. **Do not invent a colour, font, spacing, radius, or breakpoint.** Every value must come from `DESIGN.md` §2 / §3 or from an existing component.
4. **Do not redesign existing pages.** If a page looks wrong, raise it — do not silently restyle it.
5. **Do not create new `max-w-*` values, hand-written `@media` queries, or arbitrary radius values.** Use `layout`, `max-w-[1240px]` (L3) or `max-w-7xl` (L3 Seminar), and the breakpoints listed in `DESIGN.md` §2.3 and §10 B6.

---

## 3. Where things live

| Concern                                          | Path                                      |
| ------------------------------------------------ | ----------------------------------------- |
| Routes                                           | `src/app/<domain>/<slug>/page.tsx`        |
| Root layout (fonts, providers, JSON-LD only)     | `src/app/layout.tsx`                      |
| Route handlers (NocoDB)                          | `src/app/api/<name>/route.ts`             |
| Middleware / route gating                        | `src/proxy.ts`                            |
| Global CSS + theme tokens                        | `src/styles/globals.css`                  |
| Carousel CSS                                     | `src/styles/embla.css`                    |
| Shared components                                | `src/components/`                         |
| Page chrome (nav / footer / layouts)             | `src/layouts/`                            |
| Font loading                                     | `src/lib/font.ts` + `src/lib/fonts/`      |
| Static content                                   | `src/contents/`                           |
| **CMS server data access** (to be created)       | `src/lib/directus/` — see §13             |
| **CMS route handlers** (to be created)           | `src/app/api/cms/` — see §13              |
| **CMS interface** (to be created)                | `src/app/dashboard/cms/` — see §13        |
| **CMS schema migrations** (applied, tracked)     | `scripts/directus-schema/*.sql` — see §13 |
| Legacy API clients — **mostly deleted**, see §14 | `src/lib/api/`                            |
| Class merge helper                               | `src/lib/utils.ts` (`cn`)                 |
| Image size presets                               | `src/constants/components/image-sizes.ts` |
| Design contract                                  | `DESIGN.md`                               |

**Proker note:** proker (_program kerja_) pages are year-scoped — `src/app/<domain>/<proker-slug>/[year]/page.tsx` plus a legacy year-less redirect at `…/<proker-slug>/route.ts`. See `DESIGN.md` §14.

**Tailwind v4 note:** there is **no `tailwind.config.js`**. Theme tokens live in the `@theme` block of `src/styles/globals.css`. (`components.json` still references a `tailwind.config.js` — that reference is stale; do not create the file.)

---

## 4. Styling rules

1. **Identify your layer first** (`DESIGN.md` §1). Most new work is **L1 Canonical**.
2. **Use `<Typography>` for all text.** Do not write raw `font-*`/`text-*` size classes on headings and body copy. See §5 below.
3. **Use `<NextImage>` for all images.** Bare `src` values are auto-prefixed with `/images/`.
4. **All content imagery must live in `public/`.** `next.config.js` `images.remotePatterns` allows only `**.cloudflareinsights.com`; a remote URL will not render.
5. **Footer is mandatory on every public page.**
6. **Seminar blue `#2F6FED` is scoped to `/research-and-technology/seminar-dosen*` only.** Do not use it anywhere else — including the announcement bar.
7. **Sanctioned bespoke themes are frozen.** `DESIGN.md` §9 lists them. Do not "fix" their palettes or fonts.
8. **Keep `public/` assets under 1 MiB.** `<NextImage>` re-encodes at runtime, so a heavy source file buys no extra fidelity — it only inflates git, the Docker image and every clone. Cap raster width at 2560px and re-encode before committing; `pnpm check:images` (pre-commit + CI) enforces the ceiling.

---

## 5. Typography is mandated

```tsx
<Typography as='h1' font='helveticaNeue' weight='thin' variant='k0'>
<Typography as='h2' font='helveticaNeue' weight='regular' variant='k2'>
<Typography font='satoshi' variant='b2'>
```

- **Always pass `font` explicitly.** The declared default is `poppins` — 173 of 351 call sites omit `font` and therefore render Poppins. The base font is Satoshi, so relying on the default gives you the wrong family.
- **The real body font is Satoshi. The real display font is Helvetica Neue.**
- `font='playfair'` now works (fixed — `DESIGN.md` §10 F2). Use `font='libre'` for the editorial serif used across L1/L3.
- The base font is **Satoshi** and resolves on `<body>` (`DESIGN.md` §10 B1). Even so, **set an explicit font on every text element** — the design uses eight families, and `<Typography>` without a `font` prop silently gives you Poppins.

---

## 6. Component rules

- Prefer Tier A components (`DESIGN.md` §5.1) over new ones.
- **Do not create a second button, dialog, or card.** `buttons/Button.tsx` (public) and `ui/button.tsx` (admin) coexist deliberately.
- `buttons/Button.tsx` variants `'warning'` and `'unstyled'` are declared but unimplemented (`DESIGN.md` §10 F3) — do not use them.
- Feature templates (`SeminarEventTemplate`, `AcademicResourcesTemplate`) are the precedent for content-driven pages. **Extend them; do not build a parallel block system.**
- Heavy visual effects (`LiquidEther`, `GlassSurface`) require a reduced-motion guard. See §7.

---

## 7. Accessibility floor

Every change must satisfy all of these:

1. **Exactly one `<h1>` per page.** Hero lines that animate in are `<span>`s inside one `<h1>`.
2. **`aria-label` on every icon-only control.**
3. **`prefers-reduced-motion` guard** on any motion, carousel, or auto-advance. A global CSS guard now covers transitions and keyframes (`DESIGN.md` §10 B2), but **JS/WebGL motion is not covered** — `motion/react`, GSAP and the canvas components still need their own guard.
4. **Decorative micro-type stays at `white/40` or above**, or is marked `aria-hidden`.
5. **Hidden mobile nav must be inert.** `-translate-x-full opacity-0` alone leaves links keyboard-focusable.
6. **Every `<img>` needs `alt`.**

`eslint-plugin-jsx-a11y` is installed but unconfigured; `next/core-web-vitals` provides the active subset. Do not rely on lint to catch these.

---

## 8. Known traps

These 9 class names were **removed** — they never resolved to anything (`DESIGN.md` §10 A4). If you meet them in an older branch or a stale example, they do nothing:

```text
font-secondary   text-base-nav   text-base-white   text-base-icon
text-typo-main   text-typo-dark  text-base-primary text-base-secondary
text-md
```

The A/B/F cleanup in `DESIGN.md` §10 is **applied**. **Check that section before adding a token or class** — you may be re-adding something deliberately removed (e.g. the navy/cerulean ramp steps, `--color-text-link`, `--animate-ping`).

**There is no dark mode.** `.dark` is never applied. Do not add `dark:` styles (`DESIGN.md` §10 A3).

---

## 9. Commands and verification

```bash
pnpm dev        # dev server
pnpm build      # production build (+ next-sitemap postbuild)
pnpm typecheck  # tsc --noEmit
pnpm lint       # next lint
pnpm lint:strict # eslint --max-warnings=0
pnpm format:check
pnpm format:write
pnpm test       # jest
pnpm check:images # fail if any public/ asset exceeds 1 MiB
```

**Before considering any change done:**

```bash
pnpm typecheck && pnpm lint:strict && pnpm format:check && pnpm test
```

Notes:

- `pnpm format:write` runs Prettier with `prettier-plugin-tailwindcss`, which **reorders Tailwind classes**. Run it, do not hand-order.
- Prettier config: single quotes, JSX single quotes, 2-space, semicolons. `cn`/`clsx` are configured as Tailwind functions.
- Husky runs `pre-commit`, `commit-msg`, `pre-push`. Do not bypass with `--no-verify`.
- `pre-commit` runs `pnpm lint:strict` and then `node scripts/check-image-sizes.mjs --staged`, so an oversized asset is rejected before it reaches history.

---

## 10. Commit messages

Conventional Commits, enforced by commitlint:

```text
<type>(optional scope): <description>
```

Types: `feat` `fix` `docs` `style` `chore` `refactor` `ci` `test` `revert` `perf` `vercel`.
Imperative mood, lowercase start, no trailing full stop. Split unrelated changes into separate commits.

---

## 11. Production behaviour to be aware of

`src/proxy.ts` (Next.js 16 middleware) **307-redirects to `/coming-soon` in production** for:

- `/dashboard/**`, `/sandbox/**` (unless `DISABLE_ADMIN_ROUTES=0`)
- `/login`, `/register`, `/change-password/**`

and consults `/api/schedule?path=…` for `/ayomeludaftarmagang/**` and `/hidden-page-cf/**`.

Consequence: **the sandbox pages are not a live visual reference.** Verify component appearance in `pnpm dev`.

`next.config.js` applies a strict CSP in production only, with `connect-src 'self' https://api.hmtc-its.com` and `frame-src` limited to YouTube. A new third-party origin will be blocked.

**The CSP deliberately excludes `directus.hmtc-its.com` from `connect-src`.** Do not add it. This is what makes "the browser never talks to Directus" a policy rather than a convention — CMS reads go through Server Components and CMS writes through `/api/cms/*` (§13). Note the asymmetry: `img-src` allows `https:`, so Directus **asset URLs** are expected to render, while Directus **API calls** from the browser are not.

`/dashboard/cms/**` inherits the `/dashboard/**` production block above. Replacing that pathname gate with real session verification is Phase 1 work (§13).

---

## 12. Documentation index

| Document                                        | Purpose                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `DESIGN.md`                                     | Design contract — layers, tokens, components, a11y, cleanup queue, new-page recipe |
| `README.md`                                     | Setup, commit convention, deployment                                               |
| `docs/hmtc-cms-implementation-specification.md` | CMS requirements, permission matrix, API contract, acceptance criteria             |
| `docs/hmtc-cms-decisions.md`                    | **Decision log** — what is confirmed vs. still open, with the reasoning            |
| `docs/hmtc-cms-schema-migration-plan.md`        | Directus migrations M1–M11 with rollback (plan only, nothing applied)              |
| `docs/hmtc-cms-phase-0-report.md`               | What Phase 0 changed, and the verification evidence                                |
| `docs/audits/hmtc-cms-data-fetching-audit.md`   | Read-only audit of the existing data-fetching layer (findings F1–F18)              |

When you make a decision that changes either document, **update it in the same change.**

---

## 13. The CMS (Directus) — in progress

**Status:** Phase 0 complete (dead-code cleanup + verification). **No CMS code has been written yet.** Everything below is the agreed contract — read it before adding CMS code.

- **Mount point:** `/dashboard/cms/**`. It is **L4** (`DESIGN.md` §8) — `ui/*` primitives and shadcn tokens. Never surface L4 styling on a public page.
- **Directus:** 11.1.2 at `directus.hmtc-its.com`. It is the source of truth for CMS content, media and CMS identity. It does **not** replace `api.hmtc-its.com`; see §14.
- **Scope:** proker (_program kerja_) pages only. Other public content stays hardcoded for now.

### Data access — the rules

| Do                                                                        | Don't                                        |
| ------------------------------------------------------------------------- | -------------------------------------------- |
| Server reads via `src/lib/directus/**`, guarded by `import 'server-only'` | Call Directus from a browser component       |
| Browser mutations via **explicit** routes under `src/app/api/cms/`        | Build a catch-all `/api/cms/[...path]` proxy |
| Keep TanStack Query for editor state, pointed at those routes             | Add a second client-side data library        |
| Tag every Directus read and `revalidateTag()` on publish                  | Add time-based `revalidate`                  |
| Validate payloads **and** responses with Zod at the boundary              | Trust compile-time types alone               |

The Directus credential must be read in exactly one place — the server module — and must never reach browser JavaScript, a URL, a log, or an error response.

### Page composition — typed React blocks

- Content lives in `cms_pages.blocks` as **opaque JSON**. The application owns its shape; there is no Directus-side block editor, and Directus Studio is **not** the page editor.
- Define the block set once as a discriminated union plus a Zod schema, and validate on **read and write**. Unknown or malformed blocks must render a safe fallback and surface an actionable editor error.
- **No arbitrary HTML, CSS, or JavaScript.** Never `dangerouslySetInnerHTML` CMS content. Publishing fails if a page contains an invalid block.
- Block schema changes need a compatibility/migration strategy — this union is the most expensive thing in the CMS to change later.

### Workflow, preview and publishing

- Lifecycle is **Draft → In review → Published**. Self-approval is prohibited and enforced server-side, not in client state.
- Editing a published page must not change public output until it is republished.
- Previews are bearer links scoped to one page + revision, revocable, non-indexable, 72 h by default. A preview grant never permits editing.
- **Unpublished content must return a real HTTP 404** — use `generateStaticParams()` + `export const dynamicParams = false`, **not** `notFound()`. The root `<React.Suspense>` in `src/app/providers.tsx` makes `notFound()` a soft-404 (HTTP 200).

### Changing the Directus schema

Schema changes live in `scripts/directus-schema/` as paired `.up.sql` / `.down.sql` files, applied through `docker exec … psql` on the deployment (`ssh hmtc`). Directus has **no native composite-unique support**, so anything beyond per-field constraints is plain Postgres DDL.

**Two rules, both learned the hard way:**

1. **Restart Directus after any DDL.** `docker restart directus`. Directus does not store `is_unique` / `is_nullable` in `directus_fields` — it introspects Postgres — but it **caches that introspection in memory**. Out-of-band DDL is invisible until the cache rebuilds, so Studio and the REST API keep reporting the old shape. Nothing consumes Directus yet, so a restart is free.
2. **Snapshot first.** `docker exec directus_postgres pg_dump -U directuspg -d directusdb > pre-<n>.sql`. That file is the rollback; the `.down.sql` is the tidy path.

Do not mark two fields individually as `unique` in Studio to emulate a composite constraint — that creates two independent single-column constraints.

### Before you write CMS code

1. Read `docs/hmtc-cms-decisions.md` — it separates confirmed requirements from open questions.
2. Check `docs/hmtc-cms-schema-migration-plan.md` — the Directus schema has known defects; do not build against the current constraints without checking.
3. Confirm your change satisfies the acceptance criteria in `docs/hmtc-cms-implementation-specification.md` §12.

---

## 14. Legacy code — do not revive

Phase 0 deleted 15 modules that were unreachable from every route. **They were removed deliberately — do not restore them from an older branch.**

| Deleted                                                                                                                                       | Why                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `src/lib/withAuth.tsx`                                                                                                                        | Pages-Router-shaped (`GetServerSideProps*`) in an App-Router app; 0 importers |
| `src/lib/query-client.ts`                                                                                                                     | Duplicate `QueryClient` with conflicting defaults                             |
| `src/hooks/api/{users,useUsers,useUserDetail,useUserRequests,useChangeUserRole,useUpdateUser,useUploadUserAvatar,useAutoIsScheduleActive}.ts` | Client for `api.hmtc-its.com` resources that return 404                       |
| `src/lib/api/{users,repository,upload}.client.ts`                                                                                             | Same                                                                          |
| `src/components/Grainient.jsx`, `src/components/buttons/IconButton.tsx`                                                                       | 0 importers / 0 bytes                                                         |

**Still present, but legacy:**

- `api.hmtc-its.com` still serves `/auth/*`, `/evaluasi-cmi/submit`, `/magang/*` and `/shortlink/*`. Only **two** frontend callers remain: `src/hooks/api/useSubmitEvaluasiCMI.ts` (works) and `src/app/gallery/hooks/useValidateNrp.ts` (**broken** — it sends `nrp` to an endpoint that requires `email`, so it always resolves `false` and the `/gallery` gate can never open). Do not build on this API; its Swagger document is stale and incomplete.
- The five NocoDB route handlers are live and correct. Migrating them to `cms_forms` is a separate workstream.

**Do not reintroduce deriving a fetch URL from a React Query key.** That footgun was removed from `src/app/providers.tsx` in Phase 0 — every `useQuery` must pass an explicit `queryFn`, and `suspense` is not set as a client default.
