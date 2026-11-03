-- Local Directus only — the public (unauthenticated) policy, mirroring production.
--
-- The public policy ID is fixed by Directus (same in every installation).
-- Production state as of 2026-11-03:
--   - directus_files: read, only files in the "Public Assets" folder
--   - cms_pages:      read, published rows only
--   - cms_forms:      read
-- Change this file together with the production policy, never separately.
-- Idempotent: existing public permissions are replaced.

BEGIN;

DELETE FROM directus_permissions
 WHERE policy = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

INSERT INTO directus_permissions (collection, action, permissions, fields, policy) VALUES
  ('directus_files', 'read',
   '{"_and":[{"folder":{"_eq":"3141e283-12e9-478b-a262-bd74fde9012b"}}]}',
   NULL, 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'),
  ('cms_pages', 'read',
   '{"_and":[{"status":{"_contains":"published"}}]}',
   NULL, 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'),
  ('cms_forms', 'read',
   NULL,
   '*', 'abf8a154-5b1c-4a46-ac9c-7300570f4f17');

COMMIT;
