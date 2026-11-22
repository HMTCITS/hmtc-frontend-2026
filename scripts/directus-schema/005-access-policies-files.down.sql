-- 005 — directus_files create for the CMS editor policy (DOWN)
--
-- Removes the upload grant added by the UP migration. Uploads through
-- /api/cms/assets will be rejected by Directus (403) afterwards.
--
-- ⚠️  After:  docker restart directus   (Directus caches its schema — N8)

SET lock_timeout = '5s';

BEGIN;

DELETE FROM directus_permissions
 WHERE collection = 'directus_files'
   AND action = 'create'
   AND policy = '586ae88a-b88c-462a-a436-496fb6784102';

COMMIT;