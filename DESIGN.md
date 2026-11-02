# HMTC ITS — Design System

> **Authority.** This document is **descriptive of what exists today** and **prescriptive for what must be built next**.
> Where the two conflict, the prescribed rule wins for _new_ work, and the descriptive note explains what you will see in _existing_ work.
>
> **Provenance.** Every value here was verified against `src/styles/globals.css`, component source, and the deployed CSS of
> `https://hmtc-its.com`. Values marked **†** were additionally cross-checked in the production CSS bundle.
> Where a claim could not be verified in a browser it is labelled **(inferred)**.
>
> Last audited: repository `main` @ `f177e03`, live site `hmtc-its.com`.

---

## 0. Read this first

1. **There are two styling systems.** The `Typography` component (§4) and raw Tailwind utilities on markup (§6). `Typography` is **mandated** for new work.
2. **The base font is Satoshi**, declared on `<body>` (§10 B1). Text elements should _still_ carry an explicit font — the design uses eight families, and `<Typography>` without `font` silently gives you Poppins (173 call sites omit it, §10 F4).
3. **9 dead class names were removed** (§10 A4). If you meet `font-secondary`, `text-base-nav`, `text-md` etc. in a branch older than the cleanup, they do nothing.
4. **There is no dark mode.** Do not add dark styles. See §10 A3.

---

## 1. The five design layers

| #      | Layer                               | Routes                                                                                  | Defining file                                                                                                     | Status                                          |
| ------ | ----------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **L1** | **2026 Canonical (editorial dark)** | `/`, and the standard for all **new** pages                                             | `src/app/landing/**`, `src/layouts/{Navbar,NavbarLanding,Footer}.tsx`                                             | **Canonical — build new pages here**            |
| **L2** | **Foundation tokens**               | available everywhere                                                                    | `src/styles/globals.css` `@theme`                                                                                 | **Source of brand colour + `Typography` scale** |
| **L3** | **Event microsite (light)**         | `/research-and-technology/seminar-dosen{,-2,-3}`, `/student-welfare/academic-resources` | `src/components/seminar/SeminarEventTemplate.tsx`, `src/components/student-welfare/AcademicResourcesTemplate.tsx` | Supported template family — extend, do not fork |
| **L4** | **Admin (shadcn/ui)**               | `/dashboard/**` (incl. the CMS at `/dashboard/cms`), `src/app/(auth)/**`                | `src/components/ui/**`                                                                                            | Internal only — never surface on public pages   |
| **L5** | **Sanctioned bespoke themes**       | Bluecamp, TC Run, Syukuran Wisudawan, Info, Magical Message, Coming Soon, CMI, Magang   | per-route                                                                                                         | **Sanctioned and frozen — see §9**              |

### Which layer am I in?

```text
New public page?
├─ Marketing / organisation content ...................... L1 Canonical  (§2)
├─ Event with registration or a video collection ........ L3 Microsite  (§3)
├─ Internal admin / auth ................................ L4 Admin      (§8)
└─ A one-off campaign with its own art direction ........ L5 — sanctioned; copy the closest example in §9,
                                                          keep L2 tokens for colour, and freeze it after launch.
```

**L2 is not a layer you build in. It is the palette and type scale the other layers draw from.**

---

## 2. L1 — The 2026 Canonical layer

Editorial, dark, typographic. High-contrast black surfaces, thin display type, generous whitespace, and a **restrained hint of brand blue** as the only chromatic accent.

### 2.1 Palette

#### Surfaces

| Role                    | Value                             | Token / class                          | Evidence                                                      |
| ----------------------- | --------------------------------- | -------------------------------------- | ------------------------------------------------------------- |
| Hero / deepest          | `#000000`                         | `bg-black`                             | `cover/Cover.tsx` †                                           |
| Primary section surface | `#121212`                         | `bg-[#121212]`                         | `showcase/ShowCase.tsx`, `RevealKabinet.tsx` †                |
| Detail surface          | `#0B0B0C`                         | `bg-[#0B0B0C]`                         | `RevealKabinet.tsx` †                                         |
| Chrome bar              | `#040404`                         | `bg-[#040404]`                         | `NavbarLanding.tsx` †                                         |
| Footer                  | `#212121`                         | `bg-text-black` (`--color-text-black`) | `Footer.tsx` †                                                |
| Light section           | `#FFFFFF`                         | `bg-white`                             | `about/About.tsx`                                             |
| Muted light section     | Tailwind `gray-100`               | `bg-gray-100`                          | `showcase/ShowCase.tsx`                                       |
| Global page fallback    | `oklch(0.96 0.01 80)` ≈ `#F5F1EA` | `bg-background`                        | `globals.css` † — only visible when a page sets no background |

#### Text on dark surfaces

| Role                | Value                                                 | Class                                    | Evidence                         |
| ------------------- | ----------------------------------------------------- | ---------------------------------------- | -------------------------------- |
| Primary             | `#FFFFFF`                                             | `text-white`                             | †                                |
| Editorial parchment | `#EDEAE2`                                             | `text-[#EDEAE2]`                         | `RevealKabinet.tsx` †            |
| Brand warm white    | `#FDFAF0`                                             | `text-white-main` (`--color-white-main`) | `Navbar.tsx`, `Footer.tsx` †     |
| Secondary body      | `white/60`                                            | `text-white/60`                          | `cover/Cover.tsx`                |
| Micro-label         | `white/40`–`white/55` + `tracking-[0.18em] uppercase` |                                          | `Cover.tsx`, `RevealKabinet.tsx` |
| Hairline / rule     | `white/10`–`white/20`                                 | `border-white/10`                        | `Cover.tsx`                      |

#### Brand blue accent — the only chromatic colour in L1

Use **one** of these per surface. Never introduce a hex outside this list.

| Role                            | Value     | Token                   | Evidence                                                     |
| ------------------------------- | --------- | ----------------------- | ------------------------------------------------------------ |
| Cerulean (canonical brand blue) | `#00AAE7` | `--color-cerulean-blue` | †                                                            |
| French blue                     | `#0076C0` | `--color-french-blue`   | †                                                            |
| Accent / focus                  | `#0078B4` | literal                 | `LoadingScreen.tsx`, `SeminarEventTemplate.tsx` focus ring † |
| Editorial emphasis              | `#2B7FFF` | literal                 | `RevealKabinet.tsx:2299` †                                   |
| Action (buttons)                | `#2176FF` | `--color-blue-main`     | `buttons/Button.tsx` primary †                               |
| Warm editorial accent           | `#D4C9A8` | literal                 | `RevealKabinet.tsx` active-slide marker †                    |

Canonical gradient (text and background share one definition):

```css
linear-gradient(270deg, var(--color-cerulean-blue) 40%, var(--color-french-blue) 65%)
```

Available as `text-gradient` and `bg-blue-gradient`. **Use the utilities; do not re-declare the gradient.** †

#### Functional

| Role       | Value     | Token                     |
| ---------- | --------- | ------------------------- |
| Error      | `#F93232` | `--color-text-error` †    |
| Success    | `#439F6E` | `--color-text-success`    |
| Validation | `#FFB82E` | `--color-text-validation` |
| Disabled   | `#C5C0DB` | `--color-text-disabled` † |

### 2.2 Typography

**Mandate: use `<Typography>` for all text in L1/L3.** Raw font classes are permitted inside L5 themes, and in L1 **only** for `clamp()` display sizing (§6).

#### Font assignment

| Font              | Token                      | Class                    | Use                                                                                                                            |
| ----------------- | -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Helvetica Neue    | `--font-helveticaNeue`     | `font-helveticaNeue`     | Headings and display numerals, via `Typography font='helveticaNeue'`. **Thin (100) is its lightest cut.**                      |
| Satoshi           | `--font-satoshi`           | `font-satoshi`           | **The base font (`body`), plus body/UI/labels/captions.** ~144 explicit usages vs 0 for Poppins                                |
| Libre Caslon      | `--font-libre`             | `font-libre`             | Editorial italic emphasis                                                                                                      |
| Libre Baskerville | `--font-libre-baskerville` | `font-libre-baskerville` | Brand wordmark, form dialog titles. **Only 400/700 exist — there is no lighter cut**                                           |
| Plus Jakarta Sans | `--font-plus-jakarta-sans` | `font-plus-jakarta-sans` | Micro-labels, nav, forms (L3)                                                                                                  |
| Adelphe Floreal   | `--font-adelphe`           | `font-adelphe`           | **The L1 hero headline and hero stat bar**, plus the homepage About/Vision headings. **Only 400/600/700 exist — no light cut** |
| JetBrains Mono    | `--font-jetbrains-mono`    | `font-jetbrains-mono`    | L3 Seminar headings only                                                                                                       |
| Poppins           | `--font-poppins`           | `font-poppins`           | **Not the base font.** Retained only as the `Typography` default, which 173 call sites rely on (§10 F4)                        |
| Inter             | `--font-inter`             | `font-inter`             | Long-form reading                                                                                                              |
| Playfair Display  | `--font-playfair-display`  | `font-playfair-display`  | Available and working (§10 F2). High stroke contrast — a lighter-reading serif alternative at display sizes                    |
| Archivo           | `--font-archivo`           | `font-archivo`           | Bluecamp (L5) only                                                                                                             |
| Harry Potter      | `--font-harry-potter`      | `font-harry-potter`      | Syukuran Wisudawan (L5) only                                                                                                   |

#### Semantic roles — the prescribed mapping

| Role                   | Recipe                                                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Display / hero**     | `font='adelphe'`. The live hero uses raw classes because it needs `clamp()` **and** per-line motion spans: `font-adelphe text-[clamp(2.6rem,9.5vw,8.5rem)] leading-[0.9] font-normal tracking-tight` |
| **Page title**         | `as='h1' font='helveticaNeue' weight='regular' variant='k2'`                                                                                                                                         |
| **Section title**      | `as='h2' font='helveticaNeue' weight='regular' variant='k2'`                                                                                                                                         |
| **Editorial emphasis** | `font='libre'` + `italic`                                                                                                                                                                            |
| **Row / card title**   | `as='h3' font='satoshi' weight='bold' variant='h3'`                                                                                                                                                  |
| **Body**               | `font='satoshi' weight='regular' variant='b2'`                                                                                                                                                       |
| **Lead paragraph**     | `font='satoshi' weight='regular' variant='s1'`                                                                                                                                                       |
| **Caption / meta**     | `font='satoshi' variant='c0'`                                                                                                                                                                        |
| **Eyebrow**            | `variant='c0'` + `uppercase tracking-[0.18em]`                                                                                                                                                       |
| **Nav link**           | `font='satoshi'` inside a `p-2.5` anchor                                                                                                                                                             |

Fluid display sizing (when `k0` is not enough) uses `clamp()`, never a new breakpoint:

```css
text-[clamp(2.6rem,9.5vw,8.5rem)]   /* hero headline (Adelphe Floreal 400, tracking-tight) */
text-[min(48px,8vw)]                /* inline display numerals                     */
text-[clamp(40px,5.4vw,72px)]       /* L3 page title                               */
```

**Hero stat bar** (`Cover.tsx`) — `grid grid-cols-2 sm:grid-cols-4` with `border-white/10` dividers and a `border-t border-white/10` top rule. Both lines use Adelphe Floreal:

- value → `font-adelphe text-[2rem] leading-none font-normal text-white lg:text-[2.6rem]`
- label → `font-adelphe text-[10px] tracking-[0.22em] text-white/40 uppercase`

_Provenance:_ the deployed original used Helvetica Neue **Thin (100)** for the headline and stat values, and Satoshi for the stat labels. Moved to Adelphe Floreal **400** at brand request — Adelphe has no thin cut, so 400 is the floor and `font-thin` would be inert.

### 2.3 Spacing and layout

| Concern                 | Canonical value                                                              |
| ----------------------- | ---------------------------------------------------------------------------- |
| Section wrapper         | `px-12 py-18 sm:p-18 md:p-24` (add `lg:px-[8%]` for wide carousels)          |
| Neutral surface section | `px-12 pt-16 pb-8 sm:px-18 md:px-24 lg:px-20 lg:pt-24`                       |
| Max content width       | `max-w-[1240px]` (L3) / `max-w-7xl` (1280px, L3 Seminar) — pick one per page |
| Column gap              | `gap-8 md:gap-14 xl:gap-21` for two-column editorial                         |
| Block rhythm            | `py-12` / `py-16` / `py-18` / `py-24` between sections                       |
| Nav geometry            | Bar `py-4`/`py-5.5`, links `h-13`, mobile panel `px-4 py-24`, `gap-14`       |
| Announcement allowance  | `52px` (`Navbar.tsx` positions itself at `top-[52px]`)                       |

`gap-18`, `gap-21`, `py-18`, `h-13` are valid in Tailwind v4 (arbitrary multiples of `--spacing: 0.25rem`).

### 2.3.1 Breakpoints

Tailwind v4 defaults are in force and are the only scale to use:

| Variant | Min width      |
| ------- | -------------- |
| `sm:`   | 40rem / 640px  |
| `md:`   | 48rem / 768px  |
| `lg:`   | 64rem / 1024px |
| `xl:`   | 80rem / 1280px |
| `2xl:`  | 96rem / 1536px |

Observed usage: `md:` is by far the most common (≈417 uses), then `lg:` (≈220) and `sm:` (≈199). `2xl:` is used **once**. `min-lg:` is used 12 times and is identical to `lg:`.

**Rules**

- Prefer `md:` → `lg:` → `xl:` for section layout. **Do not add breakpoints beyond this scale.**
- Do not hand-write `@media` queries. Two legacy exceptions are tolerated and are **not** precedents: `styles/embla.css` (`500px`, plus 1024/768/640px) and `globals.css`'s swiper block (now `768px` after the B6 fix).
- Mobile-first: base styles are mobile, variants add up.

### 2.4 Radius

Applies to L1/L3; L4 uses the shadcn scale (§8).

| Token           | Value             | Class                         |
| --------------- | ----------------- | ----------------------------- |
| `--radius-sm`   | `0.1875rem` (3px) | `rounded-sm`                  |
| `--radius-md`   | `0.375rem` (6px)  | `rounded-md`                  |
| `--radius-lg`   | `0.5rem` (8px)    | `rounded-lg`                  |
| `--radius-xl`   | `0.75rem` (12px)  | `rounded-xl`                  |
| Tailwind extras | `1rem` / `1.5rem` | `rounded-2xl` / `rounded-3xl` |

**Rule:** use `rounded-lg` for buttons/inputs, `rounded-2xl` for cards and portraits, `rounded-full` for pills and icon buttons. **Do not introduce new arbitrary radius values** (`rounded-[10px]`, `rounded-[2px]`, `rounded-[3px]` exist in the tree and are legacy).

### 2.5 Motion

| Concern                         | Value                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Entrance easing (canonical)** | `cubic-bezier(0.22, 1, 0.36, 1)` — used in `Cover.tsx`, `LoadingScreen.tsx`, `tc-run/styles.module.css` |
| Colour / state                  | `duration-75`                                                                                           |
| Chrome (nav, announcement)      | `duration-150` / `duration-200` with `ease-in-out`                                                      |
| Accordion                       | `duration-300`                                                                                          |
| Entrance choreography           | `500–780ms`                                                                                             |
| Line-mask reveal                | `translateY(108%)` → `0` inside `overflow-hidden`                                                       |
| Loading screen                  | 2.45 s, dismisses once, then releases hero animation                                                    |
| Scale transitions               | Tailwind v4 `scale-*` sets the `scale` property — use `transition-[scale,…]`, not `transform`           |

**Mandate:** every motion must respect `prefers-reduced-motion`. A global CSS guard now covers transitions and keyframes (§10 B2), but **JS and WebGL motion is not covered** — guard it inside the component.

### 2.6 Section recipe (L1)

```text
Navbar/Announcement  →  Hero (dark, full-bleed, display type)  →  alternating
surface sections (bg-white / bg-[#121212] / bg-gray-100)  →  Footer
```

Reference: `src/app/landing/LandingPage.tsx` — `LoadingScreen` → `HeaderAnnouncement` → `Cover` → `Navbar` → `About` → `ShowCase` (Vision/Mission, Quotes, Ketua carousel) → `RevealKabinet` → `GalleryCarousel` ("Gallery of HMTC", `#gallery`). The opening animation is preserved; `RevealKabinet` and `GalleryCarousel` load as they approach the viewport (`lazy: true` in `HOME_SECTIONS`, mounted through `LazySection`). Two requested exceptions in `GalleryCarousel`: its heading copies the `RevealKabinet` heading above it (`font-serif text-[48px]`, raw classes) so the pair reads as one, and its cards use `rounded-lg` instead of the `rounded-2xl` card default.

`src/layouts/Navbar.tsx` = scroll-reveal over a dark hero (transparent → `bg-black` at `scrollY ≥ 80`).
`src/layouts/NavbarLanding.tsx` = sticky, always `bg-[#040404]`. **Use this one for L3 template pages** (`<NavbarLanding isActive />`).

`Footer` is **mandatory on every public page**.

---

## 3. L3 — Event microsite layer

Two template families exist. Extend them; do not build a third.

### 3.1 Seminar template

`SeminarEventTemplate` + `SeminarEventContent` (`src/components/seminar/SeminarEventTemplate.tsx`).
Driven by a typed object in `src/app/research-and-technology/seminar-dosen*/page.tsx`.

```text
breadcrumb    { orgName, divisionName }
title, summary
cta           { href, label }
heroImage     { src, alt }
speaker       { name, title, description, imageSrc, badges[], stats[] }
metaItems[]   { label, value }
topics[]      { title, description, iconKey }
benefits[]    string
registration  { id, eyebrow, title, description, eligibilityNote, fields[], submitLabel,
                apiEndpoint, successMessage, rsvpClosesAt, closedMessage, quota }
```

`iconKey` is a closed enum: `brainCircuit | cog | refreshCcw | gamepad2 | glasses | bookOpen`.

**Palette — scoped to `/research-and-technology/seminar-dosen*` ONLY** (see §10 A2):

| Role                 | Value                                          |
| -------------------- | ---------------------------------------------- |
| Primary action       | `#2F6FED` (hover `#275CC7`)                    |
| Section surfaces     | `#E9ECEF`, `#F8F9FA`                           |
| Border               | `#CED4DA`; divider `#E2E2E2`                   |
| Badge                | bg `#C0D5FF`, text `#00026C`                   |
| Body text            | `#212121`; stat label `#454654`                |
| Eyebrow / focus ring | `#0078B4`                                      |
| Info banner          | bg `#EAF1FF`, border `#C0D5FF`, text `#1B2B4B` |
| Success banner       | bg `#E8F6EB`, border `#C7E2CD`, text `#216E39` |
| Input                | border `#6B6B6B`, text `#575757`               |
| Card shadow          | `4px 4px 8px rgba(0,0,0,0.05)`                 |
| Form shadow          | `4px 4px 32px #CED4DA`                         |

Headings use `font-jetbrains-mono` `font-bold tracking-tighter`; body uses `font-plus-jakarta-sans`. Page `<main>` is `bg-white`; form dialog title uses `font-libre-baskerville`.

### 3.2 Academic Resources (paper) template

`AcademicResourcesTemplate` + `AcademicResourcesContent` (`src/components/student-welfare/AcademicResourcesTemplate.tsx`).

```text
breadcrumb  { orgName, sectionName }
title       { main, emphasis }
lede
hashtags[]  string
tutorials[] { id, course, title, type:'ETS'|'EAS', year, semester:'Ganjil'|'Genap',
              duration, tutor, role?, desc, youtubeId }
```

| Role              | Value                                |
| ----------------- | ------------------------------------ |
| Page              | `#FBFAF7`                            |
| Ink / heading     | `#131312`                            |
| Body              | `#2A2A28`                            |
| Muted             | `#6B6A65`                            |
| Border            | `#E6E3DC`; chip bg `#EEEAE0`         |
| ETS badge         | `#1F2937`                            |
| EAS badge         | `#7A1D2E`                            |
| Portrait fallback | `linear-gradient(#C9BFAE → #7A6F5C)` |

Display type is `font-libre` (`clamp(40px,5.4vw,72px)`), body `font-plus-jakarta-sans`. Video is YouTube-only, embedded from `youtubeId`; thumbnails come from `img.youtube.com`.

---

## 4. `Typography` — the mandated text API

`src/components/Typography.tsx`. Props: `as` (default `p`), `children`, `weight` (default `regular`), `font` (default `poppins`), `variant` (default `b2`), `className`, plus any intrinsic prop.

**26 variants** (full reference table is also documented in-file):

| Group | Variants       | Base → `md`               |
| ----- | -------------- | ------------------------- |
| K     | `k0` `k1` `k2` | 36→80px, 32→52px, 36→52px |
| J     | `j0` `j1` `j2` | 16→48px, 36px, 30px       |
| I     | `i1` `i2`      | 16→24px, 20px             |
| H     | `h1`–`h5`      | 16→24px … 14px            |
| S     | `s0`–`s4`      | 16→20px … 12px            |
| B     | `b1`–`b5`      | 16→18px … 14px            |
| C     | `c0` `c1` `c2` | 12px, 12px, 11px          |

Weights: `thin` `extralight` `light` `regular` `medium` `semibold` `bold` `extrabold` `black`.

### Rules

- `className` is merged last via `cn()`, so overrides win — but **prefer an existing variant over an override**.
- Accepted `font` keys: `poppins` `satoshi` `adelphe` `libre` `jetbrainsMono` `inter` `helveticaNeue` `playfair`. (`playfair` was broken and is now fixed — §10 F2.)
- The declared default is `poppins`, so **a `<Typography>` with no `font` prop renders Poppins**, not the Satoshi base font. **Always pass `font` explicitly** (§10 F4).

---

## 5. Component inventory

### 5.1 Tier A — use these

| Component                       | Path                                    | Notes                                                                                                                                           |
| ------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Typography`                    | `src/components/Typography.tsx`         | Mandated text API. 54 importers.                                                                                                                |
| `NextImage`                     | `src/components/NextImage.tsx`          | Wraps `next/image`; auto-prefixes `src` with `/images/`; skeleton, error fallback, SVG handling. 22 importers.                                  |
| `Button`                        | `src/components/buttons/Button.tsx`     | `variant: primary \| secondary \| netral \| light`; `size: small \| base \| large`. `icon`/`leftIcon`/`rightIcon` render circular icon buttons. |
| `ButtonLink`                    | `src/components/links/ButtonLink.tsx`   | `Button` inside `BaseLink`.                                                                                                                     |
| `BaseLink`                      | `src/components/links/BaseLink.tsx`     | Internal vs. `target=_blank` + `rel=noopener`.                                                                                                  |
| `BaseDialog` + `useDialogStore` | `src/components/dialog/BaseDialog.tsx`  | Promise-based confirm.                                                                                                                          |
| `ConfirmModal`                  | `src/components/ui/confirm-modal.tsx`   | `variant: neutral \| info \| success \| danger \| warning`, `size: sm \| md \| lg`.                                                             |
| `StatusBadge`                   | `src/components/table/status-badge.tsx` | pending / in-review / approved / rejected.                                                                                                      |
| `Loading`                       | `src/components/Loading.tsx`            | Suspense fallback (`Providers`).                                                                                                                |
| `LazySection`                   | `src/components/LazySection.tsx`        | IntersectionObserver, `threshold 0.15`.                                                                                                         |
| `JsonLd`                        | `src/components/JsonLd.tsx`             | Required on public pages.                                                                                                                       |
| `Toaster`                       | `src/components/ui/sonner.tsx`          | `position='top-center'`.                                                                                                                        |

### 5.2 Tier B — shadcn/ui (L4 only)

`button` `card` `input` `textarea` `label` `select` `dialog` `dropdown-menu` `popover` `calendar` `date-picker` `avatar` `progress` `separator` `switch` `skeleton` `pagination` `table` `field` `confirm-modal`.

> **Do not add a second button or dialog.** `ui/button.tsx` (L4, 6 variants) and `buttons/Button.tsx` (L1/L3) coexist deliberately. Know which layer you are in.

### 5.3 Tier C — feature templates

`SeminarEventTemplate`, `SeminarRegistrationForm`, `AcademicResourcesTemplate`, `RevealKabinet`, `base-data-table`. **These are the precedent for content-driven pages. Extend them instead of inventing a block system.**

### 5.4 Tier D — decorative effects

`src/components/reactbits/`: `DotGrid` `GlassSurface` `GradientText` `LiquidEther` `ShinyText` `Stepper` `TextPressure`; plus `PixelBlast`.

`LiquidEther` (2205 lines, WebGL/OGL) and `GlassSurface` (736) are the heaviest assets in the repo. **Do not place them on a page that is not already motion-heavy**, and always pair with a reduced-motion guard.

---

## 6. When raw Tailwind is permitted

| Layer        | `Typography` required?                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| L1 Canonical | **Yes** — raw font classes only for `clamp()` display sizing                                                                   |
| L3 Microsite | **Yes** — `font-jetbrains-mono` / `font-libre` are acceptable as raw classes on template headings, matching existing templates |
| L4 Admin     | `Typography` preferred; `text-sm`/`text-xs` on shadcn primitives is expected                                                   |
| L5 Bespoke   | Raw utilities permitted — these pages are frozen (§9)                                                                          |

---

## 7. Images and media

- **`NextImage` is mandatory** for all content imagery.
- Bare `src` values are auto-prefixed with `/images/`. Pass `serverStaticImg` to bypass, or a leading `/` for root-absolute.
- **All content imagery must live in `public/`.** `next.config.js` `images.remotePatterns` allows **only** `**.cloudflareinsights.com`. A remote hero image will not render.
- Formats: AVIF → WebP (`images.formats`). `dangerouslyAllowSVG: true`.
- Presets: `ImageSizes.{Square|Widescreen|Standard}.{sm|md|lg|xl}` in `src/constants/components/image-sizes.ts`.
- `useSkeleton` for lists and anything loaded asynchronously; `priority` for the hero and the navbar logo only.
- Treatment: heroes `object-cover object-center`; portraits `object-cover object-top`; collection cards `h-56` + `group-hover:scale-105` over `duration-300`.
- Video: YouTube only. CSP `frame-src` permits `youtube.com` and `youtube-nocookie.com`. Thumbnails via `img.youtube.com/vi/{id}/hqdefault.jpg`.

---

## 8. L4 — Admin layer

shadcn/ui, style `new-york`, base colour `neutral`, CSS variables. Tokens are the shadcn set in `globals.css`: `background` `foreground` `card` `popover` `primary` `secondary` `muted` `accent` `destructive` `border` `input` `ring`.

Verified resolved values †: `background` `oklch(0.96 0.01 80)` ≈ `#F5F1EA`, `foreground` ≈ `#101A21`, `primary` ≈ `#186BEC`, `secondary` ≈ `#F2CB00`, `muted` ≈ `#E0EDF8`, `muted-foreground` ≈ `#457B9F`, `accent` ≈ `#E1F5FF`, `destructive` ≈ `#D2001E`, `border` / `input` ≈ `#D0E5F4`, `ring` ≈ `#186BEC`.

**These values are unreconciled with L1's brand blue.** Do not surface them on public pages. Reconciling `primary`/`ring` with `--color-cerulean-blue` is an open item (§12).

---

## 9. L5 — Sanctioned bespoke themes

These are **approved as-is and must not be modified or "corrected"**. Each is documented here so that its divergence is intentional and traceable.

| Route                                     | Palette                                                                                                                                                                                                                                                                  | Fonts                                               | Note                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------------- |
| `/research-and-technology/bluecamp`       | `#073A76` `#0A4A98` `#0D4EA0` `#062B56` `#1561BD` `#1763C0` `#3978C4` `#5D92D0` `#9FC0EA` `#BCD3F0` `#CFE0F6` `#DCE8F8` `#EAF1FA` `#F3F7FC` `#E4E9F0` + accent `#FFB23A` `#FFC466` `#E88E00` `#B56F00` `#FFE2B3` `#FFF0D9` `#FEEDBA` + ink `#14181F` `#3A424E` `#6B7585` | `font-archivo`                                      | Own navbar + hero; **uses the global `Footer`**. Module CSS: `styles.module.css`. |
| `/student-social-development/tc-run`      | `#000D3A` `#100D3A` `#0A1931` `#F4F5F7` `#F8F9FA` + Tailwind `gray-*` / `blue-*`                                                                                                                                                                                         | `font-plus-jakarta-sans`                            | Own inline header, self-contained multi-step flow.                                |
| `/internal-affairs/syukuran-wisudawan`    | parchment `#EFDFC4`, gold `#FDC100`, stroke `#7B4100`, `#360000`, `#784747`, `text-yellow-500`, CTA `bg-red-950` + `outline-amber-800`                                                                                                                                   | `font-harry-potter` + `font-plus-jakarta-sans`      | Three `<h1>` sections by design. Two CSS Modules.                                 |
| `/info`                                   | `from-cyan-500 to-blue-900`, `border-white/50`, `rounded-full` pills                                                                                                                                                                                                     | `font-poppins` + `font-plus-jakarta-sans`           | Full-bleed gradient, no chrome.                                                   |
| `/magical-message`                        | `#0078B4` `#006A9E` `#811FEE` `#322145` `#B2B2B2` `#6B6B6B`                                                                                                                                                                                                              | `font-libre-baskerville` + `font-plus-jakarta-sans` | Gradient text `#0078B4 → #811FEE`.                                                |
| `/coming-soon`                            | `#0E0E10` `#16161A` `#1E1E22` `#201F1F` `#3399FF` `#33CCFF` `#66FFCC`                                                                                                                                                                                                    | system                                              | Also the redirect target for gated routes (`src/proxy.ts`).                       |
| `/evaluasi-cmi`                           | `#012236` `#003556` `#011724` `#000D15` `#B0B0B0` `#F9A602`                                                                                                                                                                                                              | system                                              |                                                                                   |
| `/ayomeludaftarmagang`, `/hidden-page-cf` | `#0040FF` `#0052D4` `#2E6AF7` `#3B82F6` `#66A3FF` `#68B7FF` `#1C1C1C`, `#F59E0B` `#FDE68A`                                                                                                                                                                               | `font-satoshi`                                      | Period-gated by `src/proxy.ts`.                                                   |

**Sanctioning rule for a _new_ L5 page:** it may define its own surfaces and display font, but its **primary accent must come from the §2.1 brand-blue list**, and it must use the global `Footer`. If it cannot meet that bar, it is not a sanctioned theme — use L1 or L3.

---

## 10. Cleanup and repairs

> **Status: applied.** A1–A5, B1–B6 and F1–F3 were executed in the change that introduced this document.
> The status of every item is marked inline. Two deliberate deviations (B6, A5) and the residual work
> that remains are collected below.

### Deliberate deviations from the original plan

| Item | Deviation                                                   | Why                                                                                                                                                                                 |
| ---- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1   | `--color-text-success` / `--color-text-validation` **kept** | Only success/warning colours in the system; deleting removes the capability. Now marked `Reserved` in `globals.css`.                                                                |
| A2   | `layout` utility **kept**                                   | It is the intended answer to the ad-hoc-max-width problem (§12).                                                                                                                    |
| A5   | `next-themes` **left in `package.json`**                    | Its last import was removed, but deleting the dependency means a `pnpm-lock.yaml` rewrite. Deferred so the diff stays reviewable.                                                   |
| B2   | Global CSS guard added; **JS-driven motion not guarded**    | `motion/react`, GSAP and the WebGL canvases need per-component guards.                                                                                                              |
| B6   | `769px → 768px` fixed; **`embla.css` `500px` left as-is**   | Moving it to 640px would change carousel slide density on real devices — a visual change that was never reviewed.                                                                   |
| B1   | Base font set to **Satoshi**, not Poppins                   | The original B1 plan said Poppins. Satoshi is the de-facto body font (~144 explicit usages vs 0 for Poppins), so the inherited base now matches the design. Requested after review. |

### A. Applied deletions

**A1 — Unused theme tokens** (verified unreferenced as a class _and_ not referenced by any CSS). Removing them is a no-op.

```text
navy-50…400, navy-600…900
french-blue-50, french-blue-200…900
cerulean-blue-50…900
white-50…900
black-600…900
white-light-1…5, white-dark-1…5
text-link, text-gray, text-light-gray
destructive-foreground
chart-1…5
yellow-main, red-main, green-main, purple-main, teal-main
font-jakarta            (duplicate alias of --font-plus-jakarta-sans)
--animate-ping, --animate-bounce, --ease-fluid, --ease-snappy
```

**Keep** (referenced by `text-gradient` / `bg-blue-gradient` or by live components):
`--color-navy`, `--color-french-blue`, `--color-cerulean-blue`, `--color-navy-500`, `--color-french-blue-100`, `--color-white`, `--color-black`, `--color-black-main`, `--color-blue-main`, `--color-orange-main`, `--color-white-main`, `--color-text-black`, `--color-text-white`, `--color-text-error`, `--color-text-disabled`, `--animate-spin`, `--animate-pulse`, `--animate-gradient`, `--radius-sm|md|lg|xl`.
**Decided: KEPT.** `--color-text-success` and `--color-text-validation` were retained — they are the only success/warning semantic colours in the system, and removing them removes the capability to express those states. They are now commented as `Reserved:` in `globals.css`.

**A2 — Unused `@utility` definitions**: `text-macro`, `leading-110`, `drop-shadow-glow`, `bg-gradient-radial`, `bg-gradient-conic`.
**Decided: KEPT.** `layout` (`max-width:98.75rem; width:91.6666%`) was retained. It is the intended answer to the ad-hoc-max-width problem (§12); deleting it re-opens that problem. It remains unused in markup — adopting it is still O2 §12.

**A3 — Unused global helper classes**: `.adelphe-fructidor`, `.animated-gradient-text`, `.gradient-overlay`, `.text-content`, and the orphan keyframes `rkImgIn` (`.animate-shine` and the `gradient` / `shine` keyframes are in use and must stay).

**A4 — Dead class strings in JSX.** These resolve to nothing today, so removing them causes **zero visual change**:

| Class                 | Occurrences | Files                                                                                            |
| --------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| `font-secondary`      | 16          | `navbarGallery.tsx`, `buttons/Button.tsx`, `dialog/BaseDialog.tsx`, `ProgramKerjaMenu.tsx`       |
| `text-base-nav`       | 10          | `navbarGallery.tsx`, `ProgramKerjaMenu.tsx`, `Footer.tsx`, `Navbar.tsx`, `NavbarLanding.tsx`     |
| `text-base-white`     | 7           | `navbarGallery.tsx`, `ProgramKerjaMenu.tsx`, `Navbar.tsx`, `NavbarLanding.tsx`                   |
| `text-base-icon`      | 5           | `Footer.tsx`                                                                                     |
| `text-typo-main`      | 3           | `forms/Input.tsx`, `forms/Textarea.tsx`                                                          |
| `text-typo-dark`      | 1           | `forms/Input.tsx`                                                                                |
| `text-base-primary`   | 1           | `dialog/BaseDialog.tsx`                                                                          |
| `text-base-secondary` | 1           | `dialog/BaseDialog.tsx`                                                                          |
| `text-md`             | 7           | `ApplyMagangFormStep.tsx`, `DivisionQuestionStep.tsx`, `EvaluasiCMIFormStep.tsx`, `Lightbox.tsx` |

> **Note on hover states.** `hover:text-base-nav` is the documented hover colour on every nav and footer link — and it does not exist. Removing the class leaves the current behaviour unchanged; if a hover colour is wanted, specify it explicitly from §2.1.

**A5 — Dark mode — APPLIED.** Confirmed unreachable (`.dark` never applied anywhere). Removed `@custom-variant dark`, the `@variant dark { :root { … } }` block (12 surface tokens + 5 chart tokens), and all `dark:` class usages in `Loading.tsx`, `ui/button.tsx`, `ui/calendar.tsx` and `ui/field.tsx`. `ui/sonner.tsx` no longer imports `next-themes` and passes a literal `theme='light'`.
_Residual:_ `next-themes` is still listed in `package.json` (see Deviations above). Verified absent from the compiled CSS.

### B. Repairs

**B1 — Base font — FIXED.** The original bug: `@theme` emitted `--font-poppins: var(--font-poppins)` into `:root`. Because `:root` is `html`, that is a self-reference cycle, so `html`'s value was invalid at computed-value time and `html { font-family: var(--font-poppins) }` overrode Tailwind's preflight declaration with a property-initial value — **the UA default font**.

**Fix applied:** the base declaration was moved to `body`, and the family was changed from **Poppins to Satoshi** (`body { font-family: var(--font-satoshi) }`). Satoshi is the de-facto body font of this system (~144 explicit usages vs 0 for Poppins), so the inherited base now matches the design instead of fighting it. `next/font` defines `--font-satoshi: "satoshi","satoshi Fallback"` on the `<body>` class — a real literal that overrides the inherited cyclic value.

_Verified in the compiled CSS:_ `html{font-family:var(--font-poppins)}` is gone, `html` uses preflight's valid `var(--default-font-family, ui-sans-serif, …)` fallback, and `body{…font-family:var(--font-satoshi)}` is present.

_Consequence:_ elements with **no** font class now render **Satoshi** instead of the browser default. On `/` this affects `KetuaCard`'s chairman names and years, whose `font-['Libre_Caslon_Condensed']` references a family that is **not loaded** (only `libreCaslon` is) — so they silently inherit rather than using the intended face. See O9.

_Known residual:_ `@theme inline` in Tailwind 4.0.6 **still emits** the token into `:root`, so the inert `--font-poppins:var(--font-poppins)` line remains there. Nothing on `<html>` reads it now, so it is harmless. Eliminating it would require renaming the `next/font` variables (touches all 12 families) — not worth the churn.

Text elements should still carry an explicit font, because the design uses many families (§2.2).

**B2 — Reduced motion — PARTIALLY FIXED.** A global guard was added to `globals.css` under `@media (prefers-reduced-motion: reduce)` (animation-duration/iteration-count, transition-duration, scroll-behavior). Verified present in the compiled CSS.
_Residual:_ the guard covers CSS transitions and keyframes only. Motion driven from JavaScript — `motion/react` choreography, GSAP, and the WebGL canvases (`LiquidEther`, `GlassSurface`, `PixelBlast`) — still needs a per-component guard, and the 2.45 s `LoadingScreen` still holds the user. **New motion work must guard itself.**

**B3 — Heading hierarchy — FIXED on the homepage.** It had **8 `<h1>` elements**. `Cover.tsx` now renders a single `<h1>` whose four animated lines are `<motion.span>`s inside `block overflow-hidden` `<span>` wrappers; `VisiMisi.tsx` is `as='h2'`; `KetuaCarousel.tsx` and `RevealKabinet.tsx` were demoted to `<h2>`. Visually identical — Tailwind v4's universal preflight (`*,::backdrop,:after,:before{…margin:0…}`) zeroes heading margins, so the tag change has no layout effect.

_Not changed by design:_ `/internal-affairs/syukuran-wisudawan` (3 `<h1>`, a sanctioned L5 theme, §9) and the L4 admin/auth routes.

**Rule for new pages: exactly one `<h1>` per page.**

**B4 — Mobile nav focus trap — FIXED.** `Navbar.tsx` and `NavbarLanding.tsx` now set `aria-hidden={!isSidebarOpen}` and `inert={!isSidebarOpen}` on the mobile `<nav>`, so its links are no longer keyboard-focusable while off-screen. React 19 supports `inert` as a boolean attribute; confirmed by a clean `tsc` run and production build.

**B5 — Contrast — FIXED.** `Cover.tsx`'s rotated `TEKNIK INFORMATIKA - ITS` label is `text-white/40` (was `/28`) and its wrapper is now `aria-hidden='true'`. Keep decorative micro-type at `white/40` or above.

**B6 — Off-scale breakpoints — PARTIALLY FIXED.** `globals.css`'s swiper query was `min-width: 769px` (a 1px off-by-one typo) and is now `768px`.
_Deliberately left:_ `embla.css`'s `max-width: 500px`. Moving it onto the 640px step would make blog carousel slides jump to 100% width between 501px and 640px — a real visual change nobody reviewed. It is now an accepted micro-breakpoint.

**Do not add more hand-written breakpoints.**

**F1 — Font folder typo — FIXED.** `src/lib/fonts/helevtica-neue/` was renamed to `helvetica-neue/` via `git mv`, and all 16 paths in `src/lib/font.ts` were updated in the same change. No stale references remain.

**F2 — `Typography` `playfair` option — FIXED.** `FONT_FAMILY_CLASSES.playfair` now maps to `'font-playfair-display'`, matching the `--font-playfair-display` token. `<Typography font='playfair'>` resolves. (Only `sandbox/typography` used it, so the impact was confined to that gated route.)

**F3 — `buttons/Button.tsx` variants — RESOLVED.** `'warning'` was removed from `ButtonVariant` (declared, unimplemented, zero usages). `'unstyled'` was **kept** and is now documented in the type: it is used deliberately by `oprecCover.tsx` and `magical-message/page.tsx`, and "no variant styling, supply your own className" is its correct meaning.

**F4 — `Typography`'s default `font` is still `poppins`.** Measured: **173 of 351** `<Typography>` call sites omit `font`, so they render Poppins regardless of the base font — heaviest in the dashboard/admin views (`user-requests/[id]`, `user-uploads/[id]`, `repository/[id]`, `RepositoryForm`). Changing the default to `satoshi` is the right direction and is **not** a no-op: it must ship as its own reviewed change with visual regression across the dashboard, auth and form flows. **Always pass `font` explicitly in new code.**

---

## 11. Content architecture

Four mechanisms exist. **Know which one you are on** — two are live, one is being introduced, one is legacy.

| Mechanism                                  | Where                                                                                         | Serves                                                 | Status                                                                                         |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Hardcoded TS content objects**           | `src/app/*/page.tsx`, `src/contents/{layout,announcement,gallery,magangForm,evaluasiCMI}.ts`  | **All public page copy and section structure**         | **Live — the default.** Most public content is still this                                      |
| **NocoDB** (self-hosted)                   | `src/app/api/{magical-message,seminar-dosen,seminar-dosen-2,seminar-dosen-3,tc-run}/route.ts` | **Form submissions only**                              | **Live.** Inserts via `/api/v2/tables/{id}/records`                                            |
| **Directus**                               | `src/lib/directus/`, `src/app/api/cms/`, `src/app/dashboard/cms/`                             | CMS content, media, CMS identity                       | **Being introduced** — proker pages only. See `AGENTS.md` §13                                  |
| ~~Custom REST backend~~ `api.hmtc-its.com` | `src/lib/api/`                                                                                | gallery, repository, users, uploads, requests, profile | ⚠️ **Legacy.** Those resources return 404 and most of the client was deleted — `AGENTS.md` §14 |

Per-period gating lives in `src/proxy.ts` (Next.js 16 middleware) which redirects `/dashboard`, `/sandbox`, `/login`, `/register`, `/change-password` to `/coming-soon` in production and consults `/api/schedule?path=…` for `/ayomeludaftarmagang` and `/hidden-page-cf`.

---

## 12. Open items requiring a human decision

| #   | Item                                                                                                        | Why it needs a decision                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| O1  | Reconcile L4 `primary`/`ring` (`#186BEC`) with the L1 brand blue (`#00AAE7`)                                | Not done. Should not be changed silently.                                                                                                |
| O2  | **Adopt `layout` as the standard container**                                                                | Resolved to _keep_ it — but it is still unused in markup. Adopting it is the open half: it would replace the 24 ad-hoc `max-w-*` values. |
| O3  | ~~Keep or delete `--color-text-success` / `--color-text-validation`~~                                       | **Resolved: kept** (marked `Reserved` in `globals.css`).                                                                                 |
| O4  | Change `Typography`'s default `font` to `satoshi`                                                           | Visual change across 173 of 351 call sites. Requires its own reviewed change.                                                            |
| O5  | ~~Confirm F1 folder rename~~                                                                                | **Resolved: applied.**                                                                                                                   |
| O6  | Whether `font-adelphe` on the homepage About/Vision sections is intended to remain now that L1 is canonical | Currently a mixed serif/sans heading story on `/`.                                                                                       |
| O7  | Remove `next-themes` from `package.json` + lockfile                                                         | Deferred to keep this diff reviewable (see §10 deviations).                                                                              |
| O8  | Per-component reduced-motion guards for JS/WebGL motion                                                     | The global CSS guard does not cover them (§10 B2).                                                                                       |
| O9  | `KetuaCard` uses `font-['Libre_Caslon_Condensed']`, which is **not loaded** — it silently inherits          | Either load the face or switch to `font-libre` (Libre Caslon Text). Changing it alters rendering, so it needs a decision.                |

> **CMS-scoped open items are tracked separately.** Asset privacy, revision retention, the `cms_pages.page_type` vocabulary and the dependency-security baseline are architecture decisions, not design-contract ones — see `docs/hmtc-cms-decisions.md`.

---

## 13. New page — the prescribed recipe

1. **Pick the layer** (§1).
2. **Choose a route** under `src/app/<domain>/<slug>/page.tsx`; export a `Metadata` object with `title`, `description`, `alternates.canonical`, `robots`, OpenGraph and Twitter cards — copy `src/app/info/page.tsx` as the Metadata template. **Proker (_program kerja_) pages are year-scoped — see §14.**
3. **Render `<JsonLd />`.**
4. **Compose chrome:** `<NavbarLanding isActive />` … `<Footer />`. Footer is mandatory.
5. **Define a typed `…Content` object** in the page file (do not inline JSX per field) and pass it to a template in `src/components/<domain>/`.
6. **Style from §2 / §3 only.** No new hex values, no new breakpoints, no new max-widths, no new radii.
7. **Use `<Typography>`** with explicit `font`, `weight`, `variant` (§4).
8. **Use `<NextImage>`** with images in `public/` (§7).
9. **Accessibility floor:** exactly one `<h1>`; `aria-label` on every icon-only control; `prefers-reduced-motion` guard on any motion; keep decorative type at `white/40`+.
10. **Verify:**

    ```bash
    pnpm typecheck && pnpm lint:strict && pnpm format:check && pnpm test
    ```

11. **Confirm content type:** if the page needs editor-managed copy, extend the NocoDB route-handler pattern (§11).

---

## 14. Proker pages — year-scoped routes

Proker (program kerja) pages are published per edition year and are served from
`/<domain>/<proker-slug>/<year>` — e.g. `/internal-affairs/syukuran-wisudawan/2026`.
Every proker route is three files:

```text
src/app/<domain>/<proker-slug>/
  PageContent.tsx   # the page implementation (server or client component)
  [year]/page.tsx   # edition route: generateStaticParams + dynamicParams = false
  route.ts          # legacy year-less URL -> real HTTP 301 to PROKER_DEFAULT_YEAR
```

The edition year is **never** hardcoded. `src/lib/config.ts` is the single
source of truth:

- `PROKER_BASE_PATHS` — named proker base paths, reused by the route `[year]`
  and redirect files.
- `PROKER_DEFAULT_YEAR` — the edition the legacy year-less URLs redirect to.
  Change this one value to roll the site over to another edition.
- `PROKER_EDITION_YEARS` — `basePath -> published years`. A proker that is not
  listed publishes `PROKER_DEFAULT_YEAR` only.- `prokerHref(basePath)` — builds the year-suffixed URL for internal links.

Rules:

- An unpublished or malformed year must stay a **404**. Enforce it in the router
  (`generateStaticParams` + `dynamicParams = false`) — not with a render-time
  `notFound()`.
- The legacy redirect must live in a **route handler**, not a page. The root
  `<Suspense>` in `src/app/providers.tsx` wraps every page and flushes a 200
  shell before the page body renders, so a page-level `permanentRedirect()`
  degrades into a client-side redirect and `notFound()` into a soft-404. A route
  handler sets the status itself: `NextResponse.redirect(url, 301)`.
- Internal links, nav, breadcrumbs and cards use `prokerHref(PROKER_BASE_PATHS.<key>)`
  — see `src/contents/layout.ts`.
- Never add a second `[year]` page or a hand-written redirect list per route.

---

_Companion document: `AGENTS.md` — agent-facing working rules for this repository._
