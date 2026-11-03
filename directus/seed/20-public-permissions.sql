-- Local Directus only — the public (unauthenticated) policy, mirroring production.
--
-- The public policy ID is fixed by Directus (same in every installation).
-- State after migration 003:
--   - directus_files: read, only files in the "Public Assets" folder
--   - cms_forms:      read
--   - cms_pages:      no public read (removed by 003, Q9 revised) — Next.js reads
--                     published revisions with DIRECTUS_READ_TOKEN instead
-- Change this file together with the production policy, never separately.
-- Idempotent: existing public permissions are replaced.

BEGIN;

DELETE FROM directus_permissions
 WHERE policy = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';

INSERT INTO directus_permissions (collection, action, permissions, fields, policy) VALUES
  ('directus_files', 'read',
   '{"_and":[{"folder":{"_eq":"3141e283-12e9-478b-a262-bd74fde9012b"}}]}',
   NULL, 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'),
  ('cms_forms', 'read',
   NULL,
   '*', 'abf8a154-5b1c-4a46-ac9c-7300570f4f17');

COMMIT;
