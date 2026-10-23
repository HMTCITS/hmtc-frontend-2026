-- 002 — nullability, slug canonicalisation, Studio interfaces, singleton (DOWN)
--
-- Reverts 002-nullability-slugs-interfaces.up.sql.
--
-- ⚠️  RESTART DIRECTUS AFTERWARDS:  docker restart directus
--
-- ⚠️  DROP NOT NULL is always safe. Reverting the slug values and the id=1
--     CHECK is not free once content exists: pages/prokers reference
--     departments by id, so re-pointing a slug to a route that does not exist
--     silently breaks links rather than failing.

BEGIN;

SET lock_timeout = '5s';

-- M10 ------------------------------------------------------------------------
UPDATE directus_collections
   SET singleton = false
 WHERE collection = 'cms_site_settings';

DELETE FROM cms_site_settings WHERE id = 1;

ALTER TABLE cms_site_settings
  DROP CONSTRAINT IF EXISTS cms_site_settings_singleton;

-- M8 -------------------------------------------------------------------------
UPDATE directus_fields
   SET interface = NULL, options = NULL
 WHERE (collection = 'cms_pages'           AND field = 'status')
    OR (collection = 'cms_forms'           AND field = 'status')
    OR (collection = 'cms_form_versions'   AND field = 'status')
    OR (collection = 'cms_templates'       AND field = 'status')
    OR (collection = 'cms_form_submissions' AND field = 'status')
    OR (collection = 'cms_review_events'   AND field = 'action');

-- M7 -------------------------------------------------------------------------
UPDATE cms_departments
   SET slug = 'research-technology'
 WHERE slug = 'research-and-technology';

UPDATE cms_departments
   SET slug = 'enterpreneurship-development'
 WHERE slug = 'entrepreneurship-development';

-- M5 -------------------------------------------------------------------------
ALTER TABLE cms_prokers ALTER COLUMN department DROP NOT NULL;

-- M3 -------------------------------------------------------------------------
ALTER TABLE cms_pages ALTER COLUMN slug       DROP NOT NULL;
ALTER TABLE cms_pages ALTER COLUMN department DROP NOT NULL;
ALTER TABLE cms_pages ALTER COLUMN proker     DROP NOT NULL;
ALTER TABLE cms_pages ALTER COLUMN status     DROP NOT NULL;

-- M1 -------------------------------------------------------------------------
ALTER TABLE cms_form_answers
  RENAME COLUMN field_type_snapshot TO field_type_snapshow;

UPDATE directus_fields
   SET field = 'field_type_snapshow'
 WHERE collection = 'cms_form_answers'
   AND field = 'field_type_snapshot';

COMMIT;
