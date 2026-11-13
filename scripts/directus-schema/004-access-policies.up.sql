-- 004 — access policies: nextjs-reader, CMS editor/reviewer/publisher (UP)
-- NOT applied to production yet (separate DevOps task).
--
-- Target:  Directus 11.1.2, directus_postgres (PostgreSQL 16)
-- Database: directusdb   User: directuspg
--
-- What it does
--   1. Per-role generated columns on cms_department_memberships
--      (editor_department, reviewer_department, publisher_department) and an
--      o2m alias directus_users.cms_memberships, so permission filters can ask
--      "does $CURRENT_USER hold role X in this page's department?" as
--        {"department":{"_in":"$CURRENT_USER.cms_memberships.editor_department"}}
--      Directus 11.1.2 cannot evaluate department → memberships (m2o → o2m)
--      paths inside permission rules: `_some` is rejected below the top level
--      and nested o2m objects compile to invalid SQL. The generated columns
--      keep role and department on the same row by construction.
--   2. Policy + role "nextjs-reader": read-only, minimum fields, for
--      DIRECTUS_READ_TOKEN (integration plan §1, §5)
--   3. Policies "CMS base", "CMS editor", "CMS reviewer", "CMS publisher", all
--      attached to one role "CMS member". Every page-scoped rule filters on
--      cms_department_memberships of $CURRENT_USER *with the matching role*,
--      so a user who is editor in A and publisher in B may only publish in B.
--
-- These policies are the SECOND layer. Next.js (src/lib/directus/authz.ts) is
-- the first, and is the only place that enforces what Directus cannot express:
--   - self-approval (C3);
--   - the department of a NEW page (create permissions only see the payload);
--   - which revision a page may point to;
--   - which status / review action each membership role may write. Directus
--     11.1 ANDs `validation` across all policies of a user, so per-role
--     validations on a shared role would block every role. Roles are still
--     separated by row filters (department + membership role) and field lists.
--
-- Users are not created here. The reader user and its static token are
-- environment-specific: locally they come from directus/seed/30-dev-users.sql;
-- in production DevOps creates the user with role "nextjs-reader" and sets
-- the token out of band.
--
-- ⚠️  Before:  docker exec directus_postgres pg_dump -U directuspg -d directusdb > pre-004.sql
-- ⚠️  After:   docker restart directus   (Directus caches its schema — N8)
--
-- Rollback: 004-access-policies.down.sql

SET lock_timeout = '5s';

BEGIN;

-- Fixed IDs, referenced by the seed and the down migration.
--   5660b60e-05e8-4dfa-befe-6be6d3fb0efd  policy  nextjs-reader
--   687cac00-5468-472d-90b3-ee3cc7990412  role    nextjs-reader
--   a0a30904-4b6f-48ed-9e71-5e82da4ddddb  policy  CMS base
--   586ae88a-b88c-462a-a436-496fb6784102  policy  CMS editor
--   40dadbab-35a6-4de0-946b-12591398a625  policy  CMS reviewer
--   3c0f2269-1938-48e0-afe0-656262f798c8  policy  CMS publisher
--   829aced6-5422-402f-bbe1-18bb3212967f  role    CMS member

-- Permission filter: the department reached through `path` (e.g. '{department}'
-- or '{page,department}') is one where $CURRENT_USER holds an active
-- membership whose role is covered by generated column `col`.
CREATE FUNCTION pg_temp.member_of(path text[], col text) RETURNS json
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  filter jsonb := jsonb_build_object('_in', '$CURRENT_USER.cms_memberships.' || col);
  i int;
BEGIN
  FOR i IN REVERSE array_length(path, 1)..1 LOOP
    filter := jsonb_build_object(path[i], filter);
  END LOOP;
  RETURN filter::json;
END $$;

-- 1. Membership lookup for permission filters ----------------------------------
ALTER TABLE cms_department_memberships
  ADD COLUMN editor_department uuid GENERATED ALWAYS AS
    (CASE WHEN is_active IS TRUE AND membership_role = 'editor' THEN department END) STORED,
  ADD COLUMN reviewer_department uuid GENERATED ALWAYS AS
    (CASE WHEN is_active IS TRUE AND membership_role IN ('reviewer', 'publisher') THEN department END) STORED,
  ADD COLUMN publisher_department uuid GENERATED ALWAYS AS
    (CASE WHEN is_active IS TRUE AND membership_role = 'publisher' THEN department END) STORED;

INSERT INTO directus_fields (collection, field, special, interface, readonly, hidden, note) VALUES
  ('cms_department_memberships', 'editor_department',    NULL, 'input', true, true,
   'Generated: department when the role is editor and the membership is active (004)'),
  ('cms_department_memberships', 'reviewer_department',  NULL, 'input', true, true,
   'Generated: department when the role is reviewer or publisher and the membership is active (004)'),
  ('cms_department_memberships', 'publisher_department', NULL, 'input', true, true,
   'Generated: department when the role is publisher and the membership is active (004)'),
  ('directus_users', 'cms_memberships', 'o2m', 'list-o2m', true, true,
   'CMS department memberships; used by access-policy filters (004)');

UPDATE directus_relations
   SET one_field = 'cms_memberships'
 WHERE many_collection = 'cms_department_memberships'
   AND many_field = 'user'
   AND one_collection = 'directus_users';

-- 2. nextjs-reader ----------------------------------------------------------------
INSERT INTO directus_policies (id, name, icon, description, admin_access, app_access)
VALUES ('5660b60e-05e8-4dfa-befe-6be6d3fb0efd', 'nextjs-reader', 'menu_book',
        'DIRECTUS_READ_TOKEN: public reads by Next.js Server Components. Read-only, minimum fields.',
        false, false);

INSERT INTO directus_roles (id, name, icon, description)
VALUES ('687cac00-5468-472d-90b3-ee3cc7990412', 'nextjs-reader', 'menu_book',
        'Service user for DIRECTUS_READ_TOKEN. Never a human.');

INSERT INTO directus_access (id, role, "user", policy, sort)
VALUES (gen_random_uuid(), '687cac00-5468-472d-90b3-ee3cc7990412', NULL,
        '5660b60e-05e8-4dfa-befe-6be6d3fb0efd', 1);

INSERT INTO directus_permissions (collection, action, permissions, fields, policy) VALUES
  -- Revisions: no row filter — previews read unpublished revisions by id.
  -- Next.js only ever asks for a published_revision or a valid grant's revision.
  ('cms_page_revisions', 'read', NULL,
   'id,page,revision_number,title,blocks,blocks_schema_version,excerpt,featured_image,seo_title,seo_description,date_created',
   '5660b60e-05e8-4dfa-befe-6be6d3fb0efd'),
  -- Page identity only, to resolve (department, proker, year) → published_revision.
  -- `blocks` (the working copy) is deliberately excluded: C4 / Q9.
  ('cms_pages', 'read', '{"published_revision":{"_nnull":true}}',
   'id,department,proker,edition_year,slug,page_type,published_revision,published_at,canonical_url',
   '5660b60e-05e8-4dfa-befe-6be6d3fb0efd'),
  ('cms_prokers', 'read', '{"is_active":{"_eq":true}}',
   'id,department,title,slug,description,is_active',
   '5660b60e-05e8-4dfa-befe-6be6d3fb0efd'),
  ('cms_departments', 'read', '{"is_active":{"_eq":true}}',
   'id,name,slug,description,is_active',
   '5660b60e-05e8-4dfa-befe-6be6d3fb0efd'),
  ('cms_page_redirects', 'read', '{"is_active":{"_eq":true}}',
   'id,source_path,destination_path,http_status,is_active',
   '5660b60e-05e8-4dfa-befe-6be6d3fb0efd'),
  ('cms_site_settings', 'read', NULL,
   'id,site_name,logo,favicon,default_seo_title,default_seo_description,theme_tokens,footer_content',
   '5660b60e-05e8-4dfa-befe-6be6d3fb0efd'),
  -- Only live grants. Next.js re-checks expiry and revocation itself.
  ('cms_preview_grants', 'read',
   '{"_and":[{"revoked_at":{"_null":true}},{"expires_at":{"_gt":"$NOW"}}]}',
   'id,page,revision,token_hash,expires_at,revoked_at',
   '5660b60e-05e8-4dfa-befe-6be6d3fb0efd');

-- 3. CMS member role and its policies ------------------------------------------------
-- app_access = false: Directus Studio is not the page editor; editors use
-- /dashboard/cms, which talks to the Directus API with their token.
INSERT INTO directus_policies (id, name, icon, description, admin_access, app_access) VALUES
  ('a0a30904-4b6f-48ed-9e71-5e82da4ddddb', 'CMS base', 'badge',
   'Lookups every CMS member needs: own profile and memberships, departments, prokers, templates.',
   false, false),
  ('586ae88a-b88c-462a-a436-496fb6784102', 'CMS editor', 'edit',
   'Membership role editor: drafts, submit, restore, previews. Scoped to the member''s departments.',
   false, false),
  ('40dadbab-35a6-4de0-946b-12591398a625', 'CMS reviewer', 'rate_review',
   'Membership role reviewer or publisher: request changes, previews. Scoped to the member''s departments.',
   false, false),
  ('3c0f2269-1938-48e0-afe0-656262f798c8', 'CMS publisher', 'publish',
   'Membership role publisher: publish, unpublish, archive. Self-approval is enforced by Next.js.',
   false, false);

INSERT INTO directus_roles (id, name, icon, description)
VALUES ('829aced6-5422-402f-bbe1-18bb3212967f', 'CMS member', 'groups',
        'Every CMS user. What they may do comes from cms_department_memberships.');

INSERT INTO directus_access (id, role, "user", policy, sort) VALUES
  (gen_random_uuid(), '829aced6-5422-402f-bbe1-18bb3212967f', NULL, 'a0a30904-4b6f-48ed-9e71-5e82da4ddddb', 1),
  (gen_random_uuid(), '829aced6-5422-402f-bbe1-18bb3212967f', NULL, '586ae88a-b88c-462a-a436-496fb6784102', 2),
  (gen_random_uuid(), '829aced6-5422-402f-bbe1-18bb3212967f', NULL, '40dadbab-35a6-4de0-946b-12591398a625', 3),
  (gen_random_uuid(), '829aced6-5422-402f-bbe1-18bb3212967f', NULL, '3c0f2269-1938-48e0-afe0-656262f798c8', 4);

-- 3a. CMS base
INSERT INTO directus_permissions (collection, action, permissions, fields, policy) VALUES
  ('directus_users', 'read', '{"id":{"_eq":"$CURRENT_USER"}}',
   'id,first_name,last_name,email,role,cms_memberships',
   'a0a30904-4b6f-48ed-9e71-5e82da4ddddb'),
  ('cms_department_memberships', 'read',
   '{"_and":[{"user":{"_eq":"$CURRENT_USER"}},{"is_active":{"_eq":true}}]}',
   'id,department,user,membership_role,is_active,editor_department,reviewer_department,publisher_department',
   'a0a30904-4b6f-48ed-9e71-5e82da4ddddb'),
  ('cms_departments', 'read', NULL,
   'id,name,slug,description,is_active',
   'a0a30904-4b6f-48ed-9e71-5e82da4ddddb'),
  ('cms_prokers', 'read', NULL,
   'id,department,title,slug,description,is_active',
   'a0a30904-4b6f-48ed-9e71-5e82da4ddddb'),
  ('cms_templates', 'read', '{"status":{"_eq":"published"}}',
   'id,name,slug,description,category,blocks,department,status,is_global',
   'a0a30904-4b6f-48ed-9e71-5e82da4ddddb');

-- 3b. CMS editor (membership role: editor)
INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy) VALUES
  ('cms_pages', 'read', pg_temp.member_of('{department}', 'editor_department'), NULL, NULL,
   '*', '586ae88a-b88c-462a-a436-496fb6784102'),
  -- Department of a new page cannot be checked here (payload-only validation);
  -- Next.js checks it before forwarding.
  ('cms_pages', 'create', NULL, '{"status":{"_eq":"draft"}}', '{"status":"draft"}',
   'title,slug,page_type,department,proker,edition_year,parent_page,blocks,excerpt,featured_image,template,seo_title,seo_description,canonical_url,status',
   '586ae88a-b88c-462a-a436-496fb6784102'),
  -- In review the working copy is locked (R7).
  ('cms_pages', 'update',
   json_build_object('_and', json_build_array(
     pg_temp.member_of('{department}', 'editor_department'),
     '{"status":{"_in":["draft","changes_requested","published","archived"]}}'::json)),
   NULL, NULL,
   'title,slug,blocks,excerpt,featured_image,template,seo_title,seo_description,canonical_url,parent_page,status,current_revision',
   '586ae88a-b88c-462a-a436-496fb6784102'),
  ('cms_page_revisions', 'read', pg_temp.member_of('{page,department}', 'editor_department'), NULL, NULL,
   '*', '586ae88a-b88c-462a-a436-496fb6784102'),
  ('cms_page_revisions', 'create', NULL, NULL, NULL,
   'page,revision_number,title,blocks,blocks_schema_version,excerpt,featured_image,seo_title,seo_description,change_note',
   '586ae88a-b88c-462a-a436-496fb6784102'),
  ('cms_preview_grants', 'read', pg_temp.member_of('{page,department}', 'editor_department'), NULL, NULL,
   'id,page,revision,created_by,date_created,expires_at,revoked_at,revoked_by',
   '586ae88a-b88c-462a-a436-496fb6784102'),
  ('cms_preview_grants', 'create', NULL, NULL, NULL,
   'page,revision,token_hash,expires_at',
   '586ae88a-b88c-462a-a436-496fb6784102'),
  ('cms_preview_grants', 'update', pg_temp.member_of('{page,department}', 'editor_department'), NULL, NULL,
   'revoked_at,revoked_by',
   '586ae88a-b88c-462a-a436-496fb6784102'),
  ('cms_review_events', 'read', pg_temp.member_of('{page,department}', 'editor_department'), NULL, NULL,
   '*', '586ae88a-b88c-462a-a436-496fb6784102'),
  ('cms_review_events', 'create', NULL, NULL, NULL,
   'page,action,from_status,to_status,comment',
   '586ae88a-b88c-462a-a436-496fb6784102');

-- 3c. CMS reviewer (membership role: reviewer or publisher)
INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy) VALUES
  ('cms_pages', 'read', pg_temp.member_of('{department}', 'reviewer_department'), NULL, NULL,
   '*', '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_pages', 'update',
   json_build_object('_and', json_build_array(
     pg_temp.member_of('{department}', 'reviewer_department'),
     '{"status":{"_eq":"in_review"}}'::json)),
   NULL, NULL,
   'status',
   '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_page_revisions', 'read', pg_temp.member_of('{page,department}', 'reviewer_department'), NULL, NULL,
   '*', '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_page_revisions', 'create', NULL, NULL, NULL,
   'page,revision_number,title,blocks,blocks_schema_version,excerpt,featured_image,seo_title,seo_description,change_note',
   '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_preview_grants', 'read', pg_temp.member_of('{page,department}', 'reviewer_department'), NULL, NULL,
   'id,page,revision,created_by,date_created,expires_at,revoked_at,revoked_by',
   '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_preview_grants', 'create', NULL, NULL, NULL,
   'page,revision,token_hash,expires_at',
   '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_preview_grants', 'update', pg_temp.member_of('{page,department}', 'reviewer_department'), NULL, NULL,
   'revoked_at,revoked_by',
   '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_review_events', 'read', pg_temp.member_of('{page,department}', 'reviewer_department'), NULL, NULL,
   '*', '40dadbab-35a6-4de0-946b-12591398a625'),
  ('cms_review_events', 'create', NULL, NULL, NULL,
   'page,action,from_status,to_status,comment',
   '40dadbab-35a6-4de0-946b-12591398a625');

-- 3d. CMS publisher (membership role: publisher)
INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy) VALUES
  ('cms_pages', 'update', pg_temp.member_of('{department}', 'publisher_department'),
   NULL, NULL,
   'status,published_revision,current_revision,published_at,published_by',
   '3c0f2269-1938-48e0-afe0-656262f798c8'),
  ('cms_review_events', 'create', NULL, NULL, NULL,
   'page,action,from_status,to_status,comment',
   '3c0f2269-1938-48e0-afe0-656262f798c8');

COMMIT;
