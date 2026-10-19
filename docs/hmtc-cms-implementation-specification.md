# HMTC CMS — Next-Phase Implementation Specification

**Status:** Draft for implementation planning  
**Baseline:** `hmtc-cms-data-fetching-audit(1).md`, revision 2, dated 19 October 2026  
**Scope:** Specification only. No application code, configuration, dependencies, Directus schema, roles, or permissions have been changed.

## 1. Executive decision

Build the HMTC CMS inside the existing Next.js application, using Directus as the CMS data store, identity source, and media library. Next.js remains responsible for the CMS interface, server-side authorization boundary, typed React rendering, public routing, preview behavior, and cache invalidation.

The first release manages **proker pages only**. Editors work with approved typed React blocks and reusable templates; they cannot author arbitrary executable HTML, CSS, or JavaScript.

### Confirmed decisions

- Directus-managed accounts; invited HMTC/ITS users only; no public self-registration.
- Department-scoped editors with explicit cross-department exceptions.
- Workflow: **Draft → In review → Published**.
- A different authorized reviewer must approve a page; **self-approval is prohibited**.
- Proker pages only; unrelated public content remains hardcoded.
- Typed React blocks and reusable templates.
- Templates are managed by administrators or designated maintainers; department editors use approved templates.
- Basic revision snapshots with restoration.
- Year-specific URLs always target that year. Legacy no-year URLs redirect to a centrally configured default year.
- Shareable preview links are bearer links: possession grants access. They are scoped to one page and revision, revocable, non-indexable, and expire after **72 hours by default**.
- Page deletion means archival/unpublishing, not hard deletion.
- Revision retention must be time-limited; the exact duration remains to be confirmed.
- Directus Assets is the CMS media library.
- CMS and public website share the existing Next.js application and deployment.
- Automated tests are required for critical paths.
- Forms are deferred to a separate workstream.
- The next phase delivers an implementation specification before code or schema changes.

## 2. Audit baseline

The audit reports three main data paths:

1. NocoDB form relay through Next.js Route Handlers: live.
2. Legacy Axios/TanStack Query client targeting `api.hmtc-its.com`: most expected resource endpoints return 404.
3. Directus: 17 collections exist, but there is no Next.js integration and the CMS collections are essentially empty.

Public website content is currently hardcoded in TypeScript. The audit reports no session verification in the Next.js app, dashboard pages with placeholder identities, no Directus integration, image configuration that does not allow Directus media, a production route gate based on path/environment rather than identity, and department slug mismatches.

The audit is read-only. Its recommendations have not been implemented. Re-verify findings against the current repository and deployed Directus configuration before making changes.

## 3. Architecture

### Responsibilities

**Next.js**
- CMS UI and public page rendering.
- Server-side session verification.
- Resource-level authorization for every protected operation.
- Runtime validation of inputs and stored block data.
- Explicit Route Handler endpoints for editor mutations.
- Private preview-link validation.
- Public cache invalidation after successful publication changes.

**Directus**
- User identity and account administration.
- CMS data persistence and asset storage.
- Role/policy enforcement where practical as a second layer.
- Page, department, template, and revision-related records.

### Data-access boundaries

- Add a server-only module, e.g. `src/lib/directus/`, protected with `import 'server-only'`.
- Public Server Components use it for published content reads.
- Browser-driven mutations use explicit Next.js Route Handlers under a CMS API namespace.
- Do not create an unrestricted catch-all proxy forwarding arbitrary client paths, collections, fields, or operations to Directus.
- Never expose privileged Directus credentials or refresh tokens to browser JavaScript, URLs, logs, or error responses.
- Keep the CSP server-side boundary; do not add browser-to-Directus API access just to make requests succeed.
- Keep TanStack Query for interactive editor state, but replace the dead API client underneath it. Do not revive the legacy API layer just to preserve old hooks.
- Configure Next.js image handling for the exact trusted Directus asset hostname.

A privileged static Directus token must not substitute for the acting user's permissions. Any service credential must be server-only, narrowly permissioned, and paired with user/resource authorization in Next.js. Verify the deployed Directus version and available delegated/scoped auth behavior before choosing the exact integration.

## 4. Authentication and authorization

### Authentication requirements

- Directus is the identity source.
- Accounts are provisioned by invitation/administration; public registration is disabled.
- Next.js verifies the user session server-side on every protected page and mutation.
- Use secure `HttpOnly` cookies and appropriate `Secure` and `SameSite` settings.
- Define refresh, expiry, logout, and revocation behavior for the selected Directus authentication flow.
- Never trust client-provided user IDs, roles, department IDs, or display names as authorization evidence.
- Unauthenticated requests cannot access CMS drafts or perform mutations.
- Select the exact Directus authentication flow only after verifying the deployed version and current configuration.

### Permission matrix

Resource scope must be checked against the requested page, not merely the user's role label.

| Operation | Department editor | Cross-department editor | Reviewer/Publisher | Administrator |
|---|---|---|---|---|
| Read published public pages | Yes | Yes | Yes | Yes |
| Read drafts | Assigned departments | Explicitly assigned departments | Authorized review scope | Yes |
| Create/edit draft | Assigned departments | Explicitly assigned departments | Only if also granted editor rights | Yes |
| Submit for review | Authorized pages | Authorized pages | Only if also granted editor rights | Yes |
| Approve/publish | No | No by default | Authorized scope, and not if they authored the current submission | Yes, subject to the same self-approval rule |
| Restore snapshot to a new draft | Authorized pages | Authorized pages | According to granted scope | Yes |
| Manage templates | No by default | No by default | Only if designated template maintainer | Yes |
| Manage users/departments | No | No | No by default | Yes |
| Hard-delete page or revision | No | No | No | No through normal CMS UI; archival is the supported action |

### Cross-department grants

- Cross-department access is explicit, scoped, and revocable.
- The server must determine which departments a user can edit and which pages they can review/publish.
- Department membership or a global role alone must not accidentally grant access to all pages.
- Initial membership and grant administration may remain in Directus Studio; a custom role-management UI is out of scope.
- Tests must include a user with one assigned department and an explicit exception for another.

## 5. Content model and schema work

The audit records these Directus schema defects; no schema change was made during the audit.

| Finding | Required action |
|---|---|
| S1: `cms_form_answers.field_type_snapshow` typo | Plan safe migration to `field_type_snapshot` before form functionality; preserve existing data/references. Not a first-release blocker while forms are deferred. |
| S2: `cms_pages.slug` globally unique | Replace global uniqueness with a constraint consistent with annual route identity, after inspecting existing relationships and indexes. |
| S3: `cms_pages.proker` required | Make the model compatible with the intended page scope, or explicitly constrain this release to proker-only pages. Avoid fake/sentinel relations without a clear need. |
| S4: CMS fields lack configured interfaces | Configure useful Directus Studio interfaces where appropriate. The typed block editor remains in Next.js; raw JSON is not a visual editor. |
| S5: status values only documented in notes | Validate values at runtime and enforce legal state transitions server-side. |
| S6: `cms_pages.status` nullability mismatch | Align database metadata and application types before relying on generated types. |
| S7: site settings not singleton-enforced | Implement a defined singleton strategy or defensively select and validate one canonical settings record. |

### Page identity

The model must support department, proker/activity identity, edition year, canonical route slug, title/metadata, lifecycle status, structured blocks and schema version, optional template reference, creation/update metadata, and the current published revision or equivalent immutable snapshot.

**Proposed constraint:** uniqueness should follow actual route identity, likely department + proker/activity + edition year. Confirm against current relationships before migration.

### Block validation

- Maintain a registry of approved React block types.
- Each block has a stable type identifier, versioned schema, editor controls, and renderer.
- Validate on writes and reads.
- Unknown/malformed blocks fail safely and produce actionable editor errors.
- No arbitrary script execution or untrusted HTML injection.
- Block schema changes require a compatibility/migration strategy.
- Publishing fails if the page contains invalid blocks.

### Templates

- Templates are managed by administrators or designated maintainers.
- Editors can create pages from approved templates.
- Applying a template copies its structure into a new draft.
- Updating a template does not silently overwrite existing pages.
- Templates can reference only supported blocks and valid configuration.
- Template-management permissions are separate from normal page-editing permissions.

## 6. Workflow and publication

Lifecycle: **Draft → In review → Published**.

- Editors save drafts and submit them for review.
- Submission records the submitter and timestamp.
- A different authorized Reviewer/Publisher approves and publishes the page.
- Self-approval is prohibited and enforced server-side by comparing the submitter/author with the acting reviewer.
- Invalid transitions and invalid content are rejected.
- Public queries return only published content.
- Editing a published page creates/updates a draft; it does not change the current published version.
- Publishing records the actor, timestamp, and published revision.
- Unpublishing/archiving is an explicit authorized action.
- Failed publication leaves the previous published version intact.

A reviewer must not bypass self-approval restrictions by calling an endpoint directly or changing client state.

## 7. Revision snapshots and retention

### Snapshot behavior

Store snapshots at meaningful save/publish points with snapshot ID, page ID, revision ordering, author, timestamp, snapshot content/metadata, optional change note, and workflow-event association where applicable.

Restoring a revision creates a **new draft** from the selected snapshot. It does not erase later history or publish automatically. Use optimistic concurrency or equivalent conflict detection to prevent silent overwrites.

### Retention policy

The user requires a defined retention period, but the duration is not yet specified.

**Recommended default for approval: retain snapshots for 2 years.** This is a proposal, not a confirmed requirement.

Before implementation, decide:
- Exact retention period.
- Whether published revisions receive longer retention than drafts.
- Whether snapshots associated with a currently published page can ever be purged.
- What happens when retention expires.
- Whether cleanup is automated and how it is audited.

Recommended safe behavior: never purge the currently published revision or the only recoverable snapshot for a live page. Retention cleanup should be a separate scheduled operation, not part of a save/publish request.

Advanced visual diffs and a comprehensive audit-log UI are out of scope.

## 8. Shareable preview links

**Policy:** bearer link; possession grants access. Default lifetime: **72 hours**.

- Generate a cryptographically random, unguessable token.
- Store only a token hash where practical.
- Bind the grant to one page and one specific revision.
- Record creator, creation time, expiry, revocation state, and scope.
- Enforce expiry server-side on every request and allow immediate revocation.
- A grant permits preview only, never editing, review, or publishing.
- Prevent indexing with appropriate headers/metadata, but do not treat `noindex` as access control.
- Avoid token leakage through analytics, logs, referrer headers, and third-party requests.
- Apply rate limits and safe responses for invalid, expired, or revoked links.
- If a revision is no longer available, return a safe unavailable response rather than previewing another revision.

Anyone who obtains a valid link can view the scoped preview until expiry/revocation. This is an intentional policy decision and should be disclosed when generating a link.

## 9. Annual URLs and redirects

- Year-specific routes follow `/department/activity/{year}`.
- A year-specific URL always resolves to that exact year, regardless of the configured default year.
- A legacy no-year URL redirects to the centrally configured default year.
- The default year is configured centrally, not inferred from the current date.
- Changing the default year does not alter year-specific route behavior.
- Resolve existing department slug mismatches through canonical mappings and explicit redirects where needed.
- Missing page/year combinations return a real HTTP 404.
- Test HTTP status and `Location` headers, not only rendered output.
- Never silently redirect a missing requested year to another year's page.

## 10. Directus Assets and caching

### Media
- Directus Assets is the canonical CMS media library.
- Validate asset references before save/publish.
- Restrict file types and sizes according to approved requirements.
- Ensure private assets do not become public solely because a URL is embedded in page content.
- Allow only the trusted Directus asset hostname in Next.js image configuration.

### Cache
- Use consistent cache tags for page-specific content, public listings, and route data.
- Invalidate affected public data only after successful publication/unpublication.
- Preview reads must not leak draft content into a shared public cache.
- Published changes must appear within the agreed freshness guarantee.
- Use cache APIs compatible with the installed Next.js version; verify semantics with tests.
- A failed publication must leave published content and cache behavior consistent.

## 11. Proposed Next.js API contract

Logical contract only; these routes do not yet exist.

| Operation | Example endpoint | Access |
|---|---|---|
| List pages | `GET /api/cms/pages` | Authenticated; permission-filtered |
| Read editor page | `GET /api/cms/pages/{id}` | Authenticated; resource authorization |
| Create page | `POST /api/cms/pages` | Authorized editor |
| Save draft | `PATCH /api/cms/pages/{id}` | Authorized editor; valid draft state |
| Submit for review | `POST /api/cms/pages/{id}/submit` | Authorized editor |
| Publish | `POST /api/cms/pages/{id}/publish` | Authorized Reviewer/Publisher; different from submitter |
| List revisions | `GET /api/cms/pages/{id}/revisions` | Authorized user |
| Restore revision | `POST /api/cms/pages/{id}/revisions/{revisionId}/restore` | Authorized user; creates a draft |
| Create preview grant | `POST /api/cms/pages/{id}/preview-grants` | Authorized user |
| Revoke preview grant | `DELETE /api/cms/preview-grants/{grantId}` | Grant creator or authorized administrator |
| Public page read | Server-only Directus read | Published content only |

Contract requirements:
- Validate bodies, path parameters, and query parameters with Zod or equivalent.
- Derive identity only from the verified session.
- Use consistent errors: `401` unauthenticated, `403` unauthorized, `404` missing or deliberately concealed resource, `409` state/concurrency conflict, `422` invalid content.
- Do not expose raw Directus errors, tokens, secrets, stack traces, or internal configuration.
- Prevent duplicate side effects on retried mutations through idempotency/state-transition checks where appropriate.
- Apply CSRF/origin protections and suitable rate limits to browser mutations.
- Do not expose an arbitrary collection/path proxy.

## 12. Automated acceptance criteria

### Authentication and authorization
- Unauthenticated users cannot access protected editor pages or mutation routes.
- Invalid/expired sessions cannot access drafts or mutate content.
- An editor cannot access another department's drafts without an explicit grant.
- Cross-department access works only for granted departments.
- Direct API calls cannot bypass role/resource checks.
- A submitter cannot approve/publish their own submission.
- Privileged credentials never appear in browser bundles, URLs, or client-visible errors.

### Content and workflow
- Valid typed blocks can be saved and rendered.
- Malformed/unknown blocks fail safely.
- Only authorized users can submit, review, publish, restore, and archive.
- Draft and in-review pages are never returned by public queries.
- Editing a published page does not change public content until republished.
- Publishing updates the intended revision and invalidates relevant caches.
- Failed publication preserves the prior published version.

### Templates and revisions
- Editors can use approved templates.
- Template edits do not silently overwrite existing pages.
- Restoring a snapshot creates a new draft and preserves later history.
- Retention cleanup respects the approved policy and never deletes protected live content.
- Concurrent edits are detected rather than silently overwritten.

### Preview and media
- A preview link grants access only to its designated page and revision.
- The link expires after 72 hours by default.
- Revoked/expired links fail.
- Preview links do not grant mutation permissions and do not appear in public listings.
- Drafts do not leak through public caching.
- Trusted assets render; invalid/unauthorized asset references fail safely.

### Routing
- Year-specific URLs always serve the requested year.
- Legacy no-year URLs redirect to the configured default year.
- Changing the default year does not alter year-specific behavior.
- Missing years return the correct HTTP status rather than falling back to another year.
- Department slug mappings/redirects are tested.

## 13. Migration and rollout

1. **Baseline verification:** inspect repository, Directus version, collections, indexes, relationships, permissions, deployment environment, and existing routes.
2. **Decision freeze:** resolve remaining policy blockers below.
3. **Migration design:** prepare reviewable schema migrations, preserve data, and document rollback.
4. **Security foundation:** implement session verification, resource authorization, Directus boundaries, validation, and critical security tests.
5. **Public rendering:** implement published-page reads, block registry/renderers, annual routes, and cache invalidation.
6. **Editor:** implement page listing/editing, templates, media, snapshots, preview grants, and review/publish workflow.
7. **Controlled validation:** test with editor, cross-department editor, Reviewer/Publisher, administrator, and unauthenticated accounts.
8. **Gradual rollout:** migrate a controlled subset of proker pages first. Keep unrelated hardcoded content unchanged.

Do not make destructive migrations or switch all public pages at once. Do not remove the legacy client until remaining consumers have been checked.

## 14. Non-functional requirements

- **Security:** resource-level authorization, secure sessions, secret handling, validation, CSRF/origin protections, and no public draft leakage.
- **Reliability:** failed saves/publishes do not corrupt the current published revision.
- **Observability:** structured logs for authorization failures, publishing, revision restoration, preview creation/revocation, and archival—without tokens or sensitive content.
- **Maintainability:** typed contracts, centralized route/slug rules, documented migrations, and versioned block schemas.
- **Performance:** cache public content appropriately; avoid an uncached Directus request for every public render.
- **Accessibility:** keyboard-accessible controls, drag-and-drop alternatives, labels, and useful validation feedback.

## 15. Explicitly out of scope

- Forms, submissions, and form-builder UI.
- Migrating unrelated public pages and sections.
- A custom user/role administration UI.
- Arbitrary HTML/CSS/JavaScript execution.
- Advanced multi-stage approval workflows.
- Advanced visual diffs and a full audit-log UI.
- Rebuilding the legacy API or its missing resources.
- A separate CMS frontend deployment.
- Broad migration of all proker content without a controlled rollout.

## 16. Remaining implementation blockers

### B1 — Revision retention duration
**Unresolved policy decision.** The duration has not been selected. Proposed default: **2 years**. Confirm this and whether currently published revisions are exempt from routine cleanup.

### B2 — Exact Directus authentication and authorization integration
**Technical verification required.** Verify deployed Directus version, supported auth flow, cookie/session behavior, refresh/revocation semantics, current roles/policies, and how Next.js can safely enforce acting-user permissions. Record the selected approach before implementation.

### B3 — Exact annual uniqueness constraint
**Schema verification required.** Confirm the real page identity and route uniqueness scope against current relations and indexes before changing `cms_pages.slug`. The likely target is a constraint matching department/proker/year routing, but it must be grounded in the actual schema.

### B4 — Default-year configuration source
**Verify against existing project configuration.** Earlier decisions specify a centrally configured default year. Verify the source of truth and ensure Directus settings cannot conflict with it. Do not create competing default-year values.

### B5 — Cross-department grant representation
**Schema/permission mapping required.** Inspect `cms_department_memberships` and Directus policies to determine how explicit exceptions are represented, queried, revoked, and audited. Do not assume the schema alone enforces resource access.

### B6 — Directus media visibility policy
**Verify per asset use case.** Confirm whether all proker assets become public when published or whether some media must remain private. Asset delivery and authorization tests depend on this.

Resolve B2–B6 through repository/schema/deployment inspection wherever possible. Only B1 necessarily requires a product-policy confirmation; ask the user about B2–B6 only if inspection reveals a genuine product decision.

## 17. Definition of done for the specification phase

The planning package should contain:
1. This implementation specification.
2. Directus schema migration plan with rollback strategy.
3. Final permission matrix with cross-department scope.
4. Route Handler API contract and error model.
5. Block/template schema and compatibility policy.
6. Workflow, preview-grant, revision, and retention rules.
7. Automated test plan and acceptance checklist.
8. Milestones, dependencies, and rollout plan.
9. Decision log separating confirmed requirements from assumptions.

The specification phase is complete when blockers have been investigated, B1 has been decided, and the implementation team can build without inventing security or lifecycle rules.
