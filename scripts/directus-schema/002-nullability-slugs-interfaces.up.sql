-- 002 — nullability, slug canonicalisation, Studio interfaces, singleton (UP)
--
-- Target:  Directus 11.1.2, directus_postgres (PostgreSQL 16)
-- Database: directusdb   User: directuspg
--
-- ⚠️  RESTART DIRECTUS AFTERWARDS:  docker restart directus
--     Directus caches its introspected schema; is_unique/is_nullable and any
--     directus_fields change stay stale until the cache rebuilds.
--
-- Rollback: 002-nullability-slugs-interfaces.down.sql
-- Before running: docker exec directus_postgres pg_dump -U directuspg -d directusdb > pre-002.sql
--
-- Safe when: cms_pages, cms_prokers, cms_site_settings and cms_form_answers
-- are all empty (verified immediately before applying).

BEGIN;

SET lock_timeout = '5s';

-- M1 — column name typo -------------------------------------------------------
-- The misspelling is in the physical column AND its directus_fields metadata
-- row. Both must move together or the metadata orphans.
ALTER TABLE cms_form_answers
  RENAME COLUMN field_type_snapshow TO field_type_snapshot;

UPDATE directus_fields
   SET field = 'field_type_snapshot'
 WHERE collection = 'cms_form_answers'
   AND field = 'field_type_snapshow';

-- M3 — nullability alignment on cms_pages -------------------------------------
-- These four are marked `required` in Directus metadata but were nullable in
-- Postgres. A DB that permits rows the application calls invalid cannot be
-- typed safely.
ALTER TABLE cms_pages ALTER COLUMN slug       SET NOT NULL;
ALTER TABLE cms_pages ALTER COLUMN department SET NOT NULL;
ALTER TABLE cms_pages ALTER COLUMN proker     SET NOT NULL;
ALTER TABLE cms_pages ALTER COLUMN status     SET NOT NULL;

-- M5 — a proker must belong to a department -----------------------------------
-- Otherwise /{department}/{proker}/{year} cannot be constructed at all.
ALTER TABLE cms_prokers ALTER COLUMN department SET NOT NULL;

-- M7 — department slug canonicalisation --------------------------------------
-- Slugs are the route segment. These two did not resolve to a real route.
UPDATE cms_departments
   SET slug = 'research-and-technology'
 WHERE slug = 'research-technology';

UPDATE cms_departments
   SET slug = 'entrepreneurship-development'
 WHERE slug = 'enterpreneurship-development';

-- M8 — Studio interfaces for the known status vocabularies --------------------
-- Metadata only. Directus previously rendered all six as free text, even
-- though the allowed values were written in each field's note.
UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Draft","value":"draft"},
         {"text":"In review","value":"in_review"},
         {"text":"Changes requested","value":"changes_requested"},
         {"text":"Published","value":"published"},
         {"text":"Archived","value":"archived"}]}$json$::json
 WHERE collection = 'cms_pages' AND field = 'status';

UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Draft","value":"draft"},
         {"text":"Published","value":"published"},
         {"text":"Closed","value":"closed"},
         {"text":"Archived","value":"archived"}]}$json$::json
 WHERE collection = 'cms_forms' AND field = 'status';

UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Draft","value":"draft"},
         {"text":"Published","value":"published"},
         {"text":"Retired","value":"retired"}]}$json$::json
 WHERE collection = 'cms_form_versions' AND field = 'status';

UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Draft","value":"draft"},
         {"text":"Published","value":"published"},
         {"text":"Archived","value":"archived"}]}$json$::json
 WHERE collection = 'cms_templates' AND field = 'status';

UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Submitted","value":"submitted"},
         {"text":"In review","value":"in_review"},
         {"text":"Accepted","value":"accepted"},
         {"text":"Rejected","value":"rejected"},
         {"text":"Spam","value":"spam"},
         {"text":"Withdrawn","value":"withdrawn"}]}$json$::json
 WHERE collection = 'cms_form_submissions' AND field = 'status';

UPDATE directus_fields
   SET interface = 'select-dropdown',
       options   = $json${"choices":[
         {"text":"Submitted","value":"submitted"},
         {"text":"Approved","value":"approved"},
         {"text":"Changes requested","value":"changes_requested"},
         {"text":"Unpublished","value":"unpublished"},
         {"text":"Archived","value":"archived"}]}$json$::json
 WHERE collection = 'cms_review_events' AND field = 'action';

-- M10 — site settings singleton ----------------------------------------------
-- The row MUST exist before singleton mode is enabled: with the collection
-- marked singleton and no row, Directus creates on demand via the id sequence
-- (nextval -> 2), which the CHECK then rejects. Pre-inserting id = 1 avoids
-- that dead end.
ALTER TABLE cms_site_settings
  ADD CONSTRAINT cms_site_settings_singleton CHECK (id = 1);

INSERT INTO cms_site_settings (id, site_name) VALUES (1, 'HMTC ITS');

UPDATE directus_collections
   SET singleton = true
 WHERE collection = 'cms_site_settings';

COMMIT;
