-- 005 — directus_files create for the CMS editor policy (UP)
-- NOT applied to production yet (DevOps applies per AGENTS.md §13).
--
-- Target:  Directus 11.1.2, directus_postgres (PostgreSQL 16)
-- Database: directusdb   User: directuspg
--
-- What it does
--   Grants the "CMS editor" policy `directus_files.create`, constrained to the
--   "Public Assets" folder, so `POST /api/cms/assets` (task B10) can forward
--   editor uploads with the acting user's token. 004 deliberately granted no
--   directus_files access; without this grant Directus rejects the upload with
--   403 regardless of what the Next.js layer checks.
--
-- Why the folder filter matters: without it the policy would allow writes to
-- any folder, and the CMS only owns "Public Assets". The folder id is fixed by
-- directus/seed/10-reference-data.sql and matches production.
--
-- Fields are `*` because the multipart `file` field is not a row field and an
-- explicit column list would block the upload payload.
--
-- `directus_files.read` (same folder) is also granted: the upload route
-- resolves the created record with GET /files after the 204 No Content
-- response, and the C5 media browser will need the same read for editors.
--
-- Users are not created or changed here.
--
-- ⚠️  Before:  docker exec directus_postgres pg_dump -U directuspg -d directusdb > pre-005.sql
-- ⚠️  After:   docker restart directus   (Directus caches its schema — N8)
--
-- Rollback: 005-access-policies-files.down.sql

SET lock_timeout = '5s';

BEGIN;

INSERT INTO directus_permissions (collection, action, permissions, validation, presets, fields, policy) VALUES
  ('directus_files', 'create',
   '{"folder":{"_eq":"3141e283-12e9-478b-a262-bd74fde9012b"}}',
   NULL,
   '{"folder":"3141e283-12e9-478b-a262-bd74fde9012b"}',
   '*',
   '586ae88a-b88c-462a-a436-496fb6784102'),
  ('directus_files', 'read',
   '{"folder":{"_eq":"3141e283-12e9-478b-a262-bd74fde9012b"}}',
   NULL,
   NULL,
   'id,title,type,width,height,filesize,folder,uploaded_on',
   '586ae88a-b88c-462a-a436-496fb6784102');

COMMIT;