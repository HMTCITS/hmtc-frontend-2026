# AGENTS.md — working rules for `hmtc-frontend-2026`

Read this before touching the repository. `DESIGN.md` is the companion design contract; §-references below point into it.

---

## 1. What this repository is

Next.js **16** App Router · React **19** · **Tailwind CSS v4 (CSS-first, no config file)** · TypeScript strict · pnpm.

Public marketing + event site for HMTC ITS, plus an internal dashboard and auth flow.

**Before you style anything, read `DESIGN.md`.** It defines which of five design layers you are in and what may be used.

---

## 2. Non-negotiable constraints

1. **Do not add a CMS or page-builder.** No Directus, Strapi, Sanity, Contentful, Prismic, Builder.io, etc. See `DESIGN.md` §11.
2. **Do not change the content architecture.** Page content is hardcoded TypeScript; the backend is the custom REST API at `api.hmtc-its.com`; form submissions go through NocoDB route handlers.
3. **Do not add a CSS framework, UI kit, or styling runtime.** Tailwind v4 + `cn()` is the whole system.
4. **Do not invent a colour, font, spacing, radius, or breakpoint.** Every value must come from `DESIGN.md` §2 / §3 or from an existing component.
5. **Do not redesign existing pages.** If a page looks wrong, raise it — do not silently restyle it.
6. **Do not create new `max-w-*` values, hand-written `@media` queries, or arbitrary radius values.** Use `layout`, `max-w-[1240px]` (L3) or `max-w-7xl` (L3 Seminar), and the breakpoints listed in `DESIGN.md` §2.3 and §10 B6.

---

## 3. Where things live

| Concern                                      | Path                                      |
| -------------------------------------------- | ----------------------------------------- |
| Routes                                       | `src/app/<domain>/<slug>/page.tsx`        |
| Root layout (fonts, providers, JSON-LD only) | `src/app/layout.tsx`                      |
| Route handlers (NocoDB)                      | `src/app/api/<name>/route.ts`             |
| Middleware / route gating                    | `src/proxy.ts`                            |
| Global CSS + theme tokens                    | `src/styles/globals.css`                  |
| Carousel CSS                                 | `src/styles/embla.css`                    |
| Shared components                            | `src/components/`                         |
| Page chrome (nav / footer / layouts)         | `src/layouts/`                            |
| Font loading                                 | `src/lib/font.ts` + `src/lib/fonts/`      |
| Static content                               | `src/contents/`                           |
| API clients + interceptors                   | `src/lib/api/`                            |
| Class merge helper                           | `src/lib/utils.ts` (`cn`)                 |
| Image size presets                           | `src/constants/components/image-sizes.ts` |
| Design contract                              | `DESIGN.md`                               |

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

---

## 12. Documentation index

| Document    | Purpose                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| `DESIGN.md` | Design contract — layers, tokens, components, a11y, cleanup queue, new-page recipe |
| `README.md` | Setup, commit convention, deployment                                               |

When you make a decision that changes either document, **update it in the same change.**
