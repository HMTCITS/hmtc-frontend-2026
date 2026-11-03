-- Local Directus only — constraints that a Directus schema snapshot cannot carry.
--
-- `directus/snapshot.json` is the production schema after migrations 001 and 002.
-- A snapshot stores per-field metadata only, so everything below (composite
-- unique indexes and CHECK constraints) is re-created here by hand.
--
-- Keep this file in sync with scripts/directus-schema/001 and 002. Migrations
-- 003 and later are applied on top of this baseline by `pnpm directus:setup`.
-- Idempotent: safe to run more than once.

SET client_min_messages = warning;

BEGIN;

-- 001 / M2 — page identity is (department, proker, edition_year), not slug.
CREATE UNIQUE INDEX IF NOT EXISTS cms_pages_department_proker_year_unique
  ON cms_pages (department, proker, edition_year);

-- 001 / M6 — one membership grant per (user, department).
CREATE UNIQUE INDEX IF NOT EXISTS cms_department_memberships_user_department_unique
  ON cms_department_memberships ("user", department);

-- 002 / M10 — cms_site_settings is a singleton.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cms_site_settings_singleton'
  ) THEN
    ALTER TABLE cms_site_settings
      ADD CONSTRAINT cms_site_settings_singleton CHECK (id = 1);
  END IF;
END $$;

UPDATE directus_collections
   SET singleton = true
 WHERE collection = 'cms_site_settings';

COMMIT;
