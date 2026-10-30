# HMTC CMS - Approved Block Schema

**Status:** implemented. Schema in `src/lib/directus/blocks.ts`, renderers in `src/lib/directus/block-renderers.tsx`, tests in `src/lib/directus/blocks.test.ts` and `src/lib/directus/block-renderers.test.tsx`.
**Companion:** `docs/hmtc-cms-implementation-specification.md` §5, `docs/hmtc-cms-decisions.md`, `AGENTS.md` §13.

This document is jobdesk output for two questions:

1. Define a JSON schema for approved React blocks, including block types, properties, validation rules, ordering, and default values.
2. Establish how block data is stored in Directus and rendered by Next.js, including where the schema itself is stored.

---

## 1. What this contract covers

Covered:

- the closed set of block types,
- the exact shape and limits of every block's properties,
- structural, write-time and read-time validation,
- ordering semantics,
- default values for newly inserted blocks,
- how the block JSON is persisted in Directus,
- how Next.js dispatches a block to a React renderer.

Not covered:

- the CMS editor UI, drag and drop, or the block palette implementation,
- the publishing and review workflow,
- media upload and asset policy,
- per-page themes and theme tokens,
- routing, caching, and `revalidateTag` wiring.

---

## 2. Where the schema lives

There are three different things, and conflating them is the usual source of confusion.

| Layer             | What it is                                                    | Where it lives                                                          | Who owns it                           |
| ----------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| Schema definition | The allowed block types, props, limits, and cross-block rules | Git: `src/lib/directus/blocks.ts` (Zod)                                 | This repository                       |
| Schema version    | `version` on every block, plus `BLOCKS_SCHEMA_VERSION`        | Travels **with the data**, inside each block                            | Written by the app, never by Directus |
| Data              | The actual page content                                       | `cms_pages.blocks` and `cms_templates.blocks` in Directus (opaque JSON) | Editors, through the CMS              |

**The schema is stored in git, the data is stored in Directus, and only the version travels with the data.**

### Why the schema is not stored in Directus

A tempting alternative is a `cms_block_schemas` collection, so "the CMS owns its own schema". That was rejected:

- **It creates a second source of truth.** The React renderers are TypeScript. A schema stored in a database row can drift from the renderer that must consume it, and nothing would catch the drift at build time.
- **It cannot be enforced.** Directus stores `cms_pages.blocks` as opaque JSON with no interface configured (`docs/audits/hmtc-cms-data-fetching-audit.md`, S4). A schema row would be documentation with no validation power.
- **It breaks review.** A schema change must be code-reviewed together with its renderer and its migration. A database row has no diff, no CI, and no rollback.

The schema is therefore a code artifact. Directus only ever holds data plus a version number.

### Why a version still lives with the data

Stored JSON outlives the code that wrote it. A page published today must still render after a block gains a property. The `version` field on each block is the seam that lets the reader upgrade old data before validating it. See §8.

---

## 3. How block JSON is stored in Directus

Two columns hold blocks:

| Collection      | Column   | Contents                                                                                  |
| --------------- | -------- | ----------------------------------------------------------------------------------------- |
| `cms_pages`     | `blocks` | The page body: one JSON array of blocks                                                   |
| `cms_templates` | `blocks` | A reusable starting point, copied into a new draft when a page is created from a template |

Properties of the storage model:

- **One page, one row, one `blocks` array.** There is no child table per block.
- **Order is array order.** There is no `order` field and no position column. See §6.
- **The column is opaque to Directus.** Studio renders it as a raw JSON textarea. It is not an editor and must not be treated as one.
- **Size is bounded by the schema**, not by the database: at most 60 blocks per page, 40 paragraphs per rich text block, 24 images per gallery, 30 agenda items, and so on. The full list is `BLOCK_LIMITS` in `blocks.ts`.
- **Cross-block rules are application rules.** "Exactly one hero" and "ids are unique" cannot be expressed in Postgres over a JSON column, so they live in `publishBlocksSchema`.
- **No database migration is required for the current shape.** `cms_pages.blocks` already exists. Adding a block type or a property is a code change, not DDL.

### What the page row looks like

```json
{
  "title": "Syukuran Wisudawan",
  "department": "uuid-department",
  "proker": "uuid-proker",
  "edition_year": 2026,
  "status": "draft",
  "blocks": [
    {
      "type": "hero",
      "version": 1,
      "id": "6c1f0e5a-4d7e-4a0e-9c1a-2f5e8b7d1a33",
      "props": {
        "eyebrow": "Internal Affairs",
        "title": "Syukuran Wisudawan ke-133",
        "align": "center"
      }
    },
    {
      "type": "agenda",
      "version": 1,
      "id": "b0a1c2d3-1111-4222-8333-444455556666",
      "props": {
        "heading": "Susunan Acara",
        "items": [{ "time": "08.00", "title": "Registrasi" }]
      }
    }
  ]
}
```

Every block carries exactly four keys: `type`, `version`, `id`, `props`. Anything else is rejected.

---

## 4. Block catalog

All blocks are version `1`. The union is exhaustive: `blockSchema` is a `z.discriminatedUnion('type', [...])`, so an unknown `type` fails validation.

| `type`         | Purpose                                         | Key props                                                                       | Hard limits                                                  |
| -------------- | ----------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `hero`         | Page banner. The only block that renders `<h1>` | `title`, `align`, optional `eyebrow`, `description`, `image`, `imageAlt`, `cta` | title 1-140 chars, eyebrow 80, description 600, imageAlt 160 |
| `richText`     | Body copy as paragraphs                         | `paragraphs`, optional `heading`                                                | max 40 paragraphs, 2000 chars each                           |
| `eventDetails` | Date, time, venue, ticket rows                  | `items[]` of `{ label, value, icon? }`                                          | max 12 items, label 40, value 160                            |
| `agenda`       | Run of show                                     | `items[]` of `{ time, title, description? }`                                    | max 30 items, time 40, title 120, description 300            |
| `gallery`      | Photo grid or masonry wall                      | `layout`, `images[]` of `{ asset, alt, caption? }`                              | max 24 images, alt required, caption 160                     |
| `cta`          | Closing call to action                          | `heading`, `action { label, href }`, `tone`                                     | heading 120, label 40, href 2048                             |
| `divider`      | Vertical rhythm between sections                | `spacing`                                                                       | `sm` \| `md` \| `lg`                                         |

Enumerations, exactly as defined:

- `hero.align`: `left` | `center`
- `eventDetails.items[].icon`: `calendar` | `clock` | `location` | `ticket` | `link` (optional)
- `gallery.layout`: `grid` | `masonry`
- `cta.tone`: `accent` | `neutral`
- `divider.spacing`: `sm` | `md` | `lg`

Common fields:

- `id`: 1-64 chars, `[A-Za-z0-9_-]`. It is a React key and an editor selection handle, not content.
- `version`: currently the literal `1` for every block type.
- `props`: a strict object. Unknown keys are an error.

Adding a block starts in three places, in this order: the Zod object, `BLOCK_TYPES`, and `BLOCK_RENDERERS`.

---

## 5. Validation rules

Validation runs at three strengths. They are not duplication: each one protects a different failure.

### 5.1 Structural (every block, always)

- Strict objects. Unknown keys are rejected rather than stripped, so a typo such as `titel` fails loudly instead of silently producing an empty heading.
- `type` must be one of the seven known values.
- `version` must match the block's declared version.
- `id` must match `[A-Za-z0-9_-]{1,64}`.
- Assets are Directus **uuids**, never `/images/...` paths. This prevents content that breaks the moment the asset moves.
- `href` allowlist: an internal path (`/...` but not `//host`), `https://`, or `mailto:`. `javascript:` and `data:` are rejected.
- `gallery.images[].alt` is required. The renderer must never invent alt text.

### 5.2 Write time

Entry point: `parseBlocksForWrite(input, mode)` where `mode` is `'draft'` (default) or `'publish'`.

| Rule                            | `draft` | `publish` |
| ------------------------------- | ------- | --------- |
| Structural rules                | yes     | yes       |
| Unique block ids                | yes     | yes       |
| 1-60 blocks per page            | yes     | yes       |
| Exactly one `hero`              | no      | yes       |
| `richText.paragraphs` non-empty | no      | yes       |
| `agenda.items` non-empty        | no      | yes       |
| `eventDetails.items` non-empty  | no      | yes       |
| `gallery.images` non-empty      | no      | yes       |

A draft may be incomplete. Publishing may not. A `ZodError` from this call is meant to be mapped to HTTP 422 by the Route Handler, with the issue path preserved (`blocks.2.props.items.0.time`) so the editor can focus the offending field. The Route Handlers are not written yet; see §12.

The single-hero rule is what guarantees the public page has exactly one `<h1>` (`AGENTS.md` §7). It is enforced here rather than in CSS or in review.

### 5.3 Read time

Entry point: `parseBlocksForRead(input)`. It never throws.

- Each block is validated independently.
- Valid blocks are returned for rendering.
- Invalid blocks are dropped from the render payload and returned in `invalid[]` with their array index, their declared `type`, and a readable reason.
- A page whose blocks contain no valid `hero` gets an additional page-level entry explaining the missing `<h1>`.

The asymmetry is deliberate. **Write is strict; read degrades.** A block can become invalid because the code changed after the data was written, for example when a block type is retired. That must not turn a published page into a 500. The editor still sees an actionable error and cannot publish.

---

## 6. Ordering

Order is array order, full stop.

- The renderer walks `blocks` from index 0 upward.
- Reordering is `moveBlock(blocks, from, to)`, a pure array move that returns a new array.
- There is deliberately **no `order`, `position`, or `sort` field**. Storing both an array and an explicit position gives two sources of truth, and they drift the first time one writer updates only one of them.
- `id` exists for React keys and editor selection, not for sorting.

---

## 7. Default values

Defaults live in `blockDefaults`, one factory per block type, and are consumed through `createBlock(type)`.

```ts
const block = createBlock('agenda');
// { type: 'agenda', version: 1, id: '<uuid>', props: { heading: 'Susunan Acara', items: [...] } }
```

Rules:

- **Factories, not shared literals.** A shared default object would be mutated in place by the editor and leak content between blocks.
- **Every factory produces a fresh `id`.**
- **A new `gallery` is intentionally incomplete.** Its default has `images: []`, which is valid for a draft and rejected at publish. The editor is nudged to upload before publishing instead of being handed a fake asset.
- Defaults are editor convenience only. They are not injected during read; stored data is never rewritten.

---

## 8. Versioning and migration

Two version concepts, with different scopes:

| Constant                | Scope              | When to bump                                             |
| ----------------------- | ------------------ | -------------------------------------------------------- |
| each block's `version`  | One block type     | A required prop is added, removed, or changes meaning    |
| `BLOCKS_SCHEMA_VERSION` | The whole registry | A change spans multiple block types or the page envelope |

Rules for changing a block:

1. **Additive optional prop**: keep the version. Old data still parses because the prop is optional.
2. **New required prop, or a semantic change** (for example renaming `title` to `heading`): bump the block version and add a branch to `migrateBlock` that upgrades the stored value before parsing.
3. **Removing a block type**: keep reading it, or migrate existing pages first. Removing a type without a migration silently drops published sections at read time.

`migrateBlock(raw)` runs on **read only**. Stored JSON is never rewritten in place, for two reasons:

- revision snapshots must remain reproducible,
- a rewrite during a read can race with an editor save and lose content.

A migration that must rewrite stored data is a deliberate, separate, one-off job, not a side effect of rendering.

---

## 9. How Next.js renders blocks

The chain is: page Server Component -> `BlockList` -> `BlockRenderer` -> typed renderer map -> block component.

```tsx
const Renderer = BLOCK_RENDERERS[block.type];
if (!Renderer) return <UnknownBlock type={block.type} />;
return <Renderer block={block} context={context} />;
```

Key properties:

- **`BLOCK_RENDERERS` is the registry.** It is typed with `satisfies { [T in BlockType]: ... }`, so adding a `BlockType` without adding a renderer is a compile error.
- **Unknown types render a neutral fallback**, not a crash and not an empty gap. In practice the read path drops invalid blocks first, so the fallback is a last line of defence.
- **Renderers are typed React components**, not an interpreter. There is no `dangerouslySetInnerHTML`, no CSS string, and no `eval` anywhere in the path.
- **Assets are resolved by the caller.** `BlockRenderContext.resolveAssetUrl(assetId)` is supplied by the page Server Component, so credentials and environment variables never enter a renderer.
- **Styling reads theme tokens with fallbacks**, for example `bg-[var(--cms-surface,var(--color-white))]`. A theme can restyle every block without editing block code, and no new colour is invented.
- **Text goes through `<Typography>` with an explicit `font`**, per `AGENTS.md` §5.
- **`BlockList` renders in array order and keys on `block.id`.**

Server rendering: `BlockList` has no client hooks and no event handlers, so it can be used directly from a Server Component.

---

## 10. JSON Schema export

`blocks.ts` is the source of truth. A portable JSON Schema can be derived from it on demand. This command is verified to work in this repository:

```bash
pnpm exec ts-node --compiler-options '{"module":"commonjs"}' \
  -e "import { z } from 'zod'; import { blockSchema } from './src/lib/directus/blocks'; console.log(JSON.stringify(z.toJSONSchema(blockSchema), null, 2))"
```

Or, inside the app or a script:

```ts
z.toJSONSchema(blockSchema); // JSON Schema draft 2020-12, one anyOf branch per block
```

Rules for the derived artifact:

- It is **generated, never hand-edited.**
- It is **not committed** and not read at runtime.
- It must never become a second source of truth. If the export and `blocks.ts` disagree, `blocks.ts` wins and the export is regenerated.
- It exists for external tooling: form generators, documentation, or a future editor schema panel.

---

## 11. Deliberately excluded

- **Arbitrary HTML, CSS, or JavaScript.** No block accepts markup. `richText` takes paragraphs, not HTML.
- **Free-form layout blocks** (`section`, `columns`, `container`). Once an editor can build arbitrary layout, accessibility, responsiveness, and the design system stop being enforceable.
- **Forms.** `cms_forms` is a separate workstream (`docs/hmtc-cms-implementation-specification.md` §15).
- **Per-theme blocks in v1.** Bespoke L5 themes are handled later; see §12.
- **Any link scheme outside the allowlist.** No `javascript:`, `data:`, or protocol-relative URLs.
- **`next/image` for Directus assets** until the asset host is whitelisted; see §12.

---

## 12. Open items

These are **not implemented** and must not be assumed:

| Item                                 | Current state                                                                                                                                                                                                                      | Blocks                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Page theme selection                 | `cms_pages` has no `theme` column. Theme tokens are read by renderers but nothing populates them yet.                                                                                                                              | Theme rollout                 |
| Revision snapshots                   | No revisions collection exists. The `cms_*` inventory is pages, prokers, departments, memberships, templates, site_settings, page_redirects, review_events, plus 6 form collections. Needs a table or Directus content versioning. | Editor phase                  |
| `cms_pages.page_type` vocabulary     | Field is required but its allowed values are undefined (decision **N3**).                                                                                                                                                          | Migration **M9**              |
| Directus assets through `next/image` | `next.config.js` `images.remotePatterns` allows only `**.cloudflareinsights.com`. Renderers therefore use a plain `<img>` with mandatory `alt`.                                                                                    | Asset policy (**F7**, **B6**) |
| Bespoke L5 pages                     | `syukuran-wisudawan`, `bluecamp`, and `tc-run` have their own palettes, fonts, and in some cases their own chrome (`DESIGN.md` §9). They are out of scope for v1.                                                                  | Phase 2                       |

---

## 13. References

- `src/lib/directus/blocks.ts` - schema, limits, defaults, validation entry points
- `src/lib/directus/block-renderers.tsx` - renderer registry and components
- `src/lib/directus/blocks.test.ts` - behavioural tests for the rules above
- `src/lib/directus/block-renderers.test.tsx` - render tests for the one-h1 rule, asset resolution and CTA markup
- `AGENTS.md` §13 - CMS working rules
- `docs/hmtc-cms-implementation-specification.md` §5 - content model and block validation requirements
- `docs/hmtc-cms-decisions.md` - confirmed decisions and open questions (N3, N7)
- `docs/audits/hmtc-cms-data-fetching-audit.md` §5.4 - why a GrapesJS-style builder was rejected
