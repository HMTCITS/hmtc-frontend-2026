-- 001 — page identity and membership grants (UP)
-- Applied to production 2026-10-19.
--
-- Target:  Directus 11.1.2, directus_postgres (PostgreSQL 16)
-- Database: directusdb   User: directuspg
--
-- ⚠️  AFTER RUNNING THIS, RESTART DIRECTUS:
--       docker restart directus
--     Directus caches its introspected schema in memory. DDL executed outside
--     Directus is invisible to it until the cache is rebuilt, so `is_unique`
--     will keep reporting the old value in Studio and the REST API.
--     Directus does NOT store is_unique/is_nullable in `directus_fields`
--     (verified) — it introspects Postgres — but the introspection is cached.
--
-- Rollback: 001-page-identity-and-grants.down.sql
-- Before running: take a snapshot.
--   docker exec directus_postgres pg_dump -U directuspg -d directusdb > pre-001.sql
--
-- Safe when: cms_pages and cms_department_memberships are empty.

BEGIN;

-- Fail fast rather than blocking the live API if a lock can't be taken.
SET lock_timeout = '5s';

-- M2 ------------------------------------------------------------------------
-- Page identity is (department, proker, edition_year), not slug.
-- A global unique on slug prevents the same proker slug existing across
-- editions (e.g. the 2026 and 2027 copies of one activity).
ALTER TABLE cms_pages DROP CONSTRAINT cms_pages_slug_unique;

CREATE UNIQUE INDEX cms_pages_department_proker_year_unique
  ON cms_pages (department, proker, edition_year);

-- cms_pages_slug_index (plain btree on slug) is intentionally KEPT — slug is
-- still the lookup key for redirects and breadcrumbs, it just isn't unique.

-- M6 ------------------------------------------------------------------------
-- One membership grant per (user, department). Without this the same grant can
-- be created repeatedly, making "which departments may this user edit?"
-- ambiguous.
CREATE UNIQUE INDEX cms_department_memberships_user_department_unique
  ON cms_department_memberships ("user", department);

-- M12 — FK delete semantics -------------------------------------------------
-- Was ON DELETE SET NULL. Once department/proker become NOT NULL (M3/M5),
-- SET NULL would make a delete fail with a confusing not-null violation.
-- RESTRICT states the intent directly: a referenced proker or department
-- cannot be deleted.
ALTER TABLE cms_pages DROP CONSTRAINT cms_pages_proker_foreign;
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_proker_foreign
  FOREIGN KEY (proker) REFERENCES cms_prokers(id) ON DELETE RESTRICT;

ALTER TABLE cms_pages DROP CONSTRAINT cms_pages_department_foreign;
ALTER TABLE cms_pages ADD CONSTRAINT cms_pages_department_foreign
  FOREIGN KEY (department) REFERENCES cms_departments(id) ON DELETE RESTRICT;

COMMIT;
