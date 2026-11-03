-- 003 — revisions, preview grants, vocabularies, public read (DOWN)
--
-- Destroys every revision and preview grant. Take a pg_dump first.
-- ⚠️  After: docker restart directus

SET lock_timeout = '5s';

BEGIN;

-- 6. Directus metadata
DELETE FROM directus_relations
 WHERE many_collection IN ('cms_page_revisions', 'cms_preview_grants')
    OR (many_collection = 'cms_pages' AND many_field IN ('published_revision', 'current_revision'));

DELETE FROM directus_fields
 WHERE collection IN ('cms_page_revisions', 'cms_preview_grants')
    OR (collection = 'cms_pages' AND field IN ('published_revision', 'current_revision'));

DELETE FROM directus_permissions
 WHERE collection IN ('cms_page_revisions', 'cms_preview_grants');

DELETE FROM directus_collections
 WHERE collection IN ('cms_page_revisions', 'cms_preview_grants');

-- 5. Restore the public read on cms_pages as it was before 003
INSERT INTO directus_permissions (collection, action, permissions, fields, policy)
VALUES ('cms_pages', 'read', '{"_and":[{"status":{"_contains":"published"}}]}', NULL,
        'abf8a154-5b1c-4a46-ac9c-7300570f4f17');

-- 4. Vocabularies
UPDATE directus_fields
   SET interface = NULL, options = NULL, required = false
 WHERE collection = 'cms_department_memberships' AND field = 'membership_role';

UPDATE directus_fields
   SET interface = NULL, options = NULL, note = NULL
 WHERE collection = 'cms_pages' AND field = 'page_type';

ALTER TABLE cms_department_memberships
  DROP CONSTRAINT cms_department_memberships_role_check,
  ALTER COLUMN department DROP NOT NULL,
  ALTER COLUMN "user" DROP NOT NULL,
  ALTER COLUMN membership_role DROP NOT NULL;

ALTER TABLE cms_templates DROP CONSTRAINT cms_templates_status_check;
ALTER TABLE cms_review_events DROP CONSTRAINT cms_review_events_action_check;
ALTER TABLE cms_pages
  DROP CONSTRAINT cms_pages_page_type_check,
  DROP CONSTRAINT cms_pages_status_check;

-- 3. Page → revision pointers
ALTER TABLE cms_pages
  DROP CONSTRAINT cms_pages_archived_not_public,
  DROP COLUMN current_revision,
  DROP COLUMN published_revision;

-- 2. Preview grants
DROP TABLE cms_preview_grants;

-- 1. Revisions
DROP TABLE cms_page_revisions;
DROP FUNCTION cms_page_revisions_immutable();

COMMIT;
