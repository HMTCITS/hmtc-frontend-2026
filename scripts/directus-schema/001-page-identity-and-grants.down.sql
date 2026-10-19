-- 001 — page identity and membership grants (DOWN)
--
-- Reverts 001-page-identity-and-grants.up.sql.
--
-- ⚠️  Restore is only safe while cms_pages has no duplicate slugs. Adding back
--     UNIQUE (slug) fails if two editions share a slug — which is exactly what
--     this migration exists to allow. Empty the table first, or accept the loss
--     of cross-edition slug reuse.
--
-- ⚠️  RESTART DIRECTUS AFTERWARDS:  docker restart directus
--     (schema is cached in memory — see the .up.sql header)

BEGIN;

SET lock_timeout = '5s';

DROP INDEX IF EXISTS cms_pages_department_proker_year_unique;
DROP INDEX IF EXISTS cms_department_memberships_user_department_unique;

ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_slug_unique UNIQUE (slug);

-- Restore the original SET NULL semantics.
ALTER TABLE cms_pages DROP CONSTRAINT cms_pages_proker_foreign;
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_proker_foreign
  FOREIGN KEY (proker) REFERENCES cms_prokers(id) ON DELETE SET NULL;

ALTER TABLE cms_pages DROP CONSTRAINT cms_pages_department_foreign;
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_department_foreign
  FOREIGN KEY (department) REFERENCES cms_departments(id) ON DELETE SET NULL;

COMMIT;
