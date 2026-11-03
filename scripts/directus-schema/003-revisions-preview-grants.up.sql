-- 003 — revisions, preview grants, vocabularies, public read (UP)
-- Applied to production 2026-11-03.
--
-- Target:  Directus 11.1.2, directus_postgres (PostgreSQL 16)
-- Database: directusdb   User: directuspg
--
-- What it does
--   1. cms_page_revisions  immutable snapshots; public pages read the published one
--   2. cms_preview_grants  bearer preview links (only the SHA-256 hash is stored)
--   3. cms_pages.published_revision / current_revision
--   4. CHECK constraints for every status/vocabulary column (M9; N3 and N7 decided)
--   5. Removes the public role's read on cms_pages (Q9 revised): `blocks` is the
--      working copy, so a published-then-edited page would leak its draft.
--   6. Directus metadata so Studio and the API see the new tables and relations
--
-- ⚠️  Before:  docker exec directus_postgres pg_dump -U directuspg -d directusdb > pre-003.sql
-- ⚠️  After:   docker restart directus   (Directus caches its schema — N8)
--
-- Rollback: 003-revisions-preview-grants.down.sql
-- Safe when: cms_pages, cms_department_memberships and cms_review_events are
-- empty (true on 2026-11-03), otherwise check existing values against the CHECKs.

SET lock_timeout = '5s';

BEGIN;

-- 1. Revisions -----------------------------------------------------------------
CREATE TABLE cms_page_revisions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page                  uuid NOT NULL REFERENCES cms_pages (id) ON DELETE RESTRICT,
  revision_number       integer NOT NULL CHECK (revision_number > 0),
  title                 varchar(255) NOT NULL,
  blocks                json NOT NULL,
  blocks_schema_version integer NOT NULL CHECK (blocks_schema_version > 0),
  excerpt               text,
  featured_image        uuid REFERENCES directus_files (id) ON DELETE SET NULL,
  seo_title             varchar(255),
  seo_description       text,
  change_note           text,
  author                uuid REFERENCES directus_users (id) ON DELETE SET NULL,
  date_created          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT cms_page_revisions_page_number_unique UNIQUE (page, revision_number)
);

CREATE INDEX cms_page_revisions_page_index ON cms_page_revisions (page);

-- Snapshots are immutable. Deletion stays possible for retention cleanup (N4);
-- the live published revision is protected by the RESTRICT FK below.
CREATE FUNCTION cms_page_revisions_immutable() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'cms_page_revisions rows are immutable';
END $$;

CREATE TRIGGER cms_page_revisions_no_update
  BEFORE UPDATE ON cms_page_revisions
  FOR EACH ROW EXECUTE FUNCTION cms_page_revisions_immutable();

-- 2. Preview grants --------------------------------------------------------------
CREATE TABLE cms_preview_grants (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page         uuid NOT NULL REFERENCES cms_pages (id) ON DELETE RESTRICT,
  revision     uuid NOT NULL REFERENCES cms_page_revisions (id) ON DELETE CASCADE,
  token_hash   char(64) NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  created_by   uuid REFERENCES directus_users (id) ON DELETE SET NULL,
  date_created timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  revoked_at   timestamptz,
  revoked_by   uuid REFERENCES directus_users (id) ON DELETE SET NULL,
  CONSTRAINT cms_preview_grants_expiry_after_creation CHECK (expires_at > date_created),
  CONSTRAINT cms_preview_grants_revoked_pair CHECK ((revoked_at IS NULL) = (revoked_by IS NULL))
);

CREATE INDEX cms_preview_grants_page_index ON cms_preview_grants (page);

-- 3. Page → revision pointers ------------------------------------------------------
ALTER TABLE cms_pages
  ADD COLUMN published_revision uuid REFERENCES cms_page_revisions (id) ON DELETE RESTRICT,
  ADD COLUMN current_revision   uuid REFERENCES cms_page_revisions (id) ON DELETE SET NULL;

-- A published page may be edited and re-reviewed while its last published
-- revision stays live (C4), so published_revision is independent of status —
-- except that an archived page is never public.
ALTER TABLE cms_pages
  ADD CONSTRAINT cms_pages_archived_not_public
  CHECK (status <> 'archived' OR published_revision IS NULL);

-- 4. Vocabularies (M9) — must match src/lib/cms/vocab.ts --------------------------
ALTER TABLE cms_pages
  ADD CONSTRAINT cms_pages_status_check
    CHECK (status IN ('draft', 'in_review', 'changes_requested', 'published', 'archived')),
  ADD CONSTRAINT cms_pages_page_type_check
    CHECK (page_type IN ('event', 'program'));

ALTER TABLE cms_review_events
  ADD CONSTRAINT cms_review_events_action_check
    CHECK (action IN ('submitted', 'approved', 'changes_requested', 'unpublished', 'archived'));

ALTER TABLE cms_templates
  ADD CONSTRAINT cms_templates_status_check
    CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE cms_department_memberships
  ALTER COLUMN membership_role SET NOT NULL,
  ALTER COLUMN "user" SET NOT NULL,
  ALTER COLUMN department SET NOT NULL,
  ADD CONSTRAINT cms_department_memberships_role_check
    CHECK (membership_role IN ('editor', 'reviewer', 'publisher', 'template_maintainer'));

UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Event","value":"event"},
         {"text":"Program","value":"program"}]}$json$::json,
       note      = 'event: dated activity (registration, schedule, venue). program: ongoing programme or service without a single date.'
 WHERE collection = 'cms_pages' AND field = 'page_type';

UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Editor","value":"editor"},
         {"text":"Reviewer","value":"reviewer"},
         {"text":"Publisher","value":"publisher"},
         {"text":"Template maintainer","value":"template_maintainer"}]}$json$::json,
       required  = true
 WHERE collection = 'cms_department_memberships' AND field = 'membership_role';

-- 5. Public read on cms_pages removed (Q9 revised) ----------------------------------
DELETE FROM directus_permissions
 WHERE policy = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'
   AND collection = 'cms_pages';

-- 6. Directus metadata ---------------------------------------------------------------
INSERT INTO directus_collections (collection, icon, note, hidden, singleton, accountability, sort_field)
VALUES
  ('cms_page_revisions', 'history', 'Immutable page snapshots. Written by Next.js only.', false, false, 'all', NULL),
  ('cms_preview_grants', 'link',    'Bearer preview links. Only the SHA-256 hash of the token is stored.', false, false, 'all', NULL);

INSERT INTO directus_fields (collection, field, special, interface, readonly, hidden, required, note)
VALUES
  ('cms_page_revisions', 'id',                    'uuid',        'input',               true,  true,  false, NULL),
  ('cms_page_revisions', 'page',                  NULL,          'select-dropdown-m2o', true,  false, true,  NULL),
  ('cms_page_revisions', 'revision_number',       NULL,          'input',               true,  false, true,  NULL),
  ('cms_page_revisions', 'title',                 NULL,          'input',               true,  false, true,  NULL),
  ('cms_page_revisions', 'blocks',                'cast-json',   'input-code',          true,  false, true,  'Validated by src/lib/directus/blocks.ts'),
  ('cms_page_revisions', 'blocks_schema_version', NULL,          'input',               true,  false, true,  NULL),
  ('cms_page_revisions', 'excerpt',               NULL,          'input-multiline',     true,  false, false, NULL),
  ('cms_page_revisions', 'featured_image',        'file',        'file-image',          true,  false, false, NULL),
  ('cms_page_revisions', 'seo_title',             NULL,          'input',               true,  false, false, NULL),
  ('cms_page_revisions', 'seo_description',       NULL,          'input-multiline',     true,  false, false, NULL),
  ('cms_page_revisions', 'change_note',           NULL,          'input-multiline',     true,  false, false, NULL),
  ('cms_page_revisions', 'author',                'user-created','select-dropdown-m2o', true,  false, false, NULL),
  ('cms_page_revisions', 'date_created',          'date-created','datetime',            true,  false, false, NULL),
  ('cms_preview_grants', 'id',                    'uuid',        'input',               true,  true,  false, NULL),
  ('cms_preview_grants', 'page',                  NULL,          'select-dropdown-m2o', true,  false, true,  NULL),
  ('cms_preview_grants', 'revision',              NULL,          'select-dropdown-m2o', true,  false, true,  NULL),
  ('cms_preview_grants', 'token_hash',            NULL,          'input',               true,  true,  true,  'SHA-256 hex of the bearer token; the token itself is never stored'),
  ('cms_preview_grants', 'created_by',            'user-created','select-dropdown-m2o', true,  false, false, NULL),
  ('cms_preview_grants', 'date_created',          'date-created','datetime',            true,  false, false, NULL),
  ('cms_preview_grants', 'expires_at',            NULL,          'datetime',            true,  false, true,  NULL),
  ('cms_preview_grants', 'revoked_at',            NULL,          'datetime',            true,  false, false, NULL),
  ('cms_preview_grants', 'revoked_by',            NULL,          'select-dropdown-m2o', true,  false, false, NULL),
  ('cms_pages',          'published_revision',    NULL,          'select-dropdown-m2o', true,  false, false, 'Set by the publish route only'),
  ('cms_pages',          'current_revision',      NULL,          'select-dropdown-m2o', true,  false, false, NULL);

INSERT INTO directus_relations (many_collection, many_field, one_collection, one_deselect_action)
VALUES
  ('cms_page_revisions', 'page',               'cms_pages',          'nullify'),
  ('cms_page_revisions', 'featured_image',     'directus_files',     'nullify'),
  ('cms_page_revisions', 'author',             'directus_users',     'nullify'),
  ('cms_preview_grants', 'page',               'cms_pages',          'nullify'),
  ('cms_preview_grants', 'revision',           'cms_page_revisions', 'nullify'),
  ('cms_preview_grants', 'created_by',         'directus_users',     'nullify'),
  ('cms_preview_grants', 'revoked_by',         'directus_users',     'nullify'),
  ('cms_pages',          'published_revision', 'cms_page_revisions', 'nullify'),
  ('cms_pages',          'current_revision',   'cms_page_revisions', 'nullify');

COMMIT;
