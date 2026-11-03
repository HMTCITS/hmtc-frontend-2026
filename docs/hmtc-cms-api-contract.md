# HMTC CMS — API contract

**Source of truth:** `src/lib/cms/api-contract.ts`. This page is a readable index; if it disagrees with the code, the code wins and this page is wrong. The test `src/lib/cms/__tests__/api-contract.test.ts` fails when an endpoint is missing here.

| File                          | Contains                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/lib/cms/api-contract.ts` | Every `/api/cms/*` endpoint: method, path, params, query, body, response, status, auth           |
| `src/lib/cms/dto.ts`          | Wire shapes: `SessionUser`, `PageSummary`, `PageDetail`, `RevisionSummary`, `PreviewGrantDto`, … |
| `src/lib/cms/errors.ts`       | Error codes → HTTP status, `CmsErrorBody`                                                        |
| `src/lib/cms/vocab.ts`        | Status / page-type / role vocabularies and the workflow table `PAGE_ACTIONS`                     |
| `src/lib/cms/cache-tags.ts`   | Cache tags used by publish and the webhook                                                       |
| `src/lib/directus/blocks.ts`  | The block schema stored in `blocks` (already merged)                                             |

All of these are isomorphic (no secrets) and may be imported by both Route Handlers and editor components. Server-only code that talks to Directus lives in `src/lib/directus/**` behind `import 'server-only'`.

## Endpoints

| Method   | Path                                               | Name                 | Auth    | Success | Summary                                                                                                                                                                      |
| -------- | -------------------------------------------------- | -------------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/cms/auth/login`                              | `login`              | none    | 200     | Log in with a Directus account; sets HttpOnly cms_at / cms_rt cookies. Rate-limited.                                                                                         |
| `POST`   | `/api/cms/auth/logout`                             | `logout`             | session | 204     | Revoke the Directus refresh token and clear both cookies.                                                                                                                    |
| `GET`    | `/api/cms/auth/me`                                 | `me`                 | session | 200     | The verified session user and their department memberships.                                                                                                                  |
| `GET`    | `/api/cms/departments`                             | `listDepartments`    | session | 200     | Departments the user may see (all, for page filters).                                                                                                                        |
| `GET`    | `/api/cms/prokers`                                 | `listProkers`        | session | 200     | Prokers, optionally filtered by department.                                                                                                                                  |
| `POST`   | `/api/cms/assets`                                  | `uploadAsset`        | session | 201     | Upload an image into the Directus "Public Assets" folder. Editors only.                                                                                                      |
| `GET`    | `/api/cms/pages`                                   | `listPages`          | session | 200     | Pages in departments the user may read.                                                                                                                                      |
| `POST`   | `/api/cms/pages`                                   | `createPage`         | session | 201     | Create a draft. Department and slug come from the proker. 409 duplicate if (proker, year) exists.                                                                            |
| `GET`    | `/api/cms/pages/:id`                               | `getPage`            | session | 200     | Working copy, history and the actions this user may take.                                                                                                                    |
| `PATCH`  | `/api/cms/pages/:id`                               | `savePage`           | session | 200     | Save the working copy. Never changes public output; a published working copy becomes draft.                                                                                  |
| `POST`   | `/api/cms/pages/:id/submit`                        | `submitPage`         | session | 200     | draft \| changes_requested → in_review. Writes a "submitted" event.                                                                                                          |
| `POST`   | `/api/cms/pages/:id/request-changes`               | `requestChanges`     | session | 200     | in_review → changes_requested. Reviewer or publisher; comment required.                                                                                                      |
| `POST`   | `/api/cms/pages/:id/publish`                       | `publishPage`        | session | 200     | in_review → published. Publisher, not the submitter (403 self_approval). Snapshots a revision, points published_revision at it, revalidates.                                 |
| `POST`   | `/api/cms/pages/:id/unpublish`                     | `unpublishPage`      | session | 200     | Take the live revision down (public URL → 404). Working copy is kept.                                                                                                        |
| `POST`   | `/api/cms/pages/:id/archive`                       | `archivePage`        | session | 200     | Archive instead of delete (C6). Also unpublishes.                                                                                                                            |
| `GET`    | `/api/cms/pages/:id/revisions`                     | `listRevisions`      | session | 200     | Snapshots, newest first.                                                                                                                                                     |
| `POST`   | `/api/cms/pages/:id/revisions/:revisionId/restore` | `restoreRevision`    | session | 200     | Copy a snapshot into the working copy as a draft (C8). Never publishes; history is kept.                                                                                     |
| `GET`    | `/api/cms/pages/:id/preview-grants`                | `listPreviewGrants`  | session | 200     | Grants for this page, including expired and revoked ones.                                                                                                                    |
| `POST`   | `/api/cms/pages/:id/preview-grants`                | `createPreviewGrant` | session | 201     | Snapshot the working copy if it changed and mint a bearer link to that revision.                                                                                             |
| `DELETE` | `/api/cms/preview-grants/:grantId`                 | `revokePreviewGrant` | session | 204     | Revoke a grant. Grant creator or a publisher of the department.                                                                                                              |
| `POST`   | `/api/cms/revalidate`                              | `revalidate`         | hmac    | 200     | Directus Flow → Next.js. Header X-CMS-Signature: hex HMAC-SHA256 of the raw body with CMS_REVALIDATE_SECRET. Tags are derived server-side; raw tag names are never accepted. |

## Rules every handler follows

1. **Origin check** on mutations: `Origin` must equal the site origin → otherwise `403 bad_origin`.
2. **Session** from the HttpOnly cookie, verified against Directus → otherwise `401 unauthenticated`. Identity, role and department are never read from the request.
3. **Validate** params, query and body with the registry's Zod schemas → `422 validation_failed` with `issues[]`. Blocks are validated with `parseBlocksForWrite` → `422 invalid_blocks` with `invalidBlocks[]`.
4. **Authorize the resource**: load the page, then check the user's membership in `page.department` against `PAGE_ACTIONS[action].roles` (Directus admins may act everywhere). A page the user may not read is reported as `404 not_found`, not `403`.
5. **Workflow**: `isActionAllowedFrom(action, state)` → otherwise `409 invalid_transition`. `expectedUpdatedAt` must match `date_updated` → otherwise `409 stale_write`.
6. **Publish only**: the actor must differ from the latest `submitted` event's actor → otherwise `403 self_approval`. Applies to admins too.
7. **Write with the user's Directus token**, so Directus policies are a second layer. Map unique violations to `409 duplicate`.
8. Respond with the registry's response schema. Never forward a raw Directus error, token or stack trace; log structured events without tokens or page content.

`CMS_EDITING_ENABLED=false` makes every mutation return `403 editing_disabled` (decision N9).

## Error body

```json
{
  "error": {
    "code": "stale_write",
    "message": "Halaman sudah diubah orang lain. Muat ulang sebelum menyimpan.",
    "issues": [{ "path": "blocks.3.props.title", "message": "wajib diisi" }]
  }
}
```

| Code                 | Status | When                                             |
| -------------------- | ------ | ------------------------------------------------ |
| `unauthenticated`    | 401    | No or expired session                            |
| `forbidden`          | 403    | Role or department does not allow the action     |
| `self_approval`      | 403    | Publishing your own submission                   |
| `editing_disabled`   | 403    | `CMS_EDITING_ENABLED=false`                      |
| `bad_origin`         | 403    | Cross-origin mutation                            |
| `not_found`          | 404    | Missing, or hidden from this user                |
| `invalid_transition` | 409    | Not allowed from the current status              |
| `stale_write`        | 409    | `expectedUpdatedAt` mismatch                     |
| `duplicate`          | 409    | A page already exists for (proker, edition year) |
| `validation_failed`  | 422    | Params, query or body invalid                    |
| `invalid_blocks`     | 422    | Blocks invalid for draft or publish mode         |
| `rate_limited`       | 429    | Login or preview minting throttled               |
| `internal`           | 500    | Anything else (details only in server logs)      |

## Workflow

`status` is the state of the **working copy**; `published_revision` is what the public sees (decision R7).

| Action            | From                                     | To                | Roles                         | Review event        |
| ----------------- | ---------------------------------------- | ----------------- | ----------------------------- | ------------------- |
| `edit`            | draft, changes_requested, published      | published → draft | editor                        | —                   |
| `submit`          | draft, changes_requested                 | in_review         | editor                        | `submitted`         |
| `request_changes` | in_review                                | changes_requested | reviewer, publisher           | `changes_requested` |
| `publish`         | in_review                                | published         | publisher (not the submitter) | `approved`          |
| `unpublish`       | any except archived, and only while live | published → draft | publisher                     | `unpublished`       |
| `archive`         | any except archived                      | archived          | publisher                     | `archived`          |
| `restore`         | any except in_review                     | draft             | editor                        | —                   |
| `create_preview`  | any except archived                      | unchanged         | editor, reviewer, publisher   | —                   |

## Data (migration 003)

- `cms_page_revisions` — immutable snapshots (`UPDATE` is rejected by a trigger). `(page, revision_number)` unique.
- `cms_preview_grants` — `token_hash` is the SHA-256 hex of the bearer token; the token itself is never stored. Default and maximum lifetime 72 h.
- `cms_pages.published_revision` (`ON DELETE RESTRICT`, so the live revision cannot be purged) and `cms_pages.current_revision`.
- CHECK constraints for every vocabulary; `membership_role`, `user`, `department` on memberships are `NOT NULL`.
- The public role can no longer read `cms_pages` (decision R2).

Applying it to production: `AGENTS.md` §13 (snapshot first, restart Directus afterwards). Locally: `pnpm directus:setup`.
