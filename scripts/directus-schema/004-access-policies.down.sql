-- 004 — access policies (DOWN)
--
-- Removes the nextjs-reader and CMS member roles, their policies and
-- permissions, the generated membership columns and the
-- directus_users.cms_memberships alias. Users that held those roles are kept
-- but left without a role (no access).
--
-- ⚠️  After:   docker restart directus   (Directus caches its schema — N8)

SET lock_timeout = '5s';

BEGIN;

UPDATE directus_users
   SET role = NULL
 WHERE role IN ('687cac00-5468-472d-90b3-ee3cc7990412',
                '829aced6-5422-402f-bbe1-18bb3212967f');

DELETE FROM directus_permissions
 WHERE policy IN ('5660b60e-05e8-4dfa-befe-6be6d3fb0efd',
                  'a0a30904-4b6f-48ed-9e71-5e82da4ddddb',
                  '586ae88a-b88c-462a-a436-496fb6784102',
                  '40dadbab-35a6-4de0-946b-12591398a625',
                  '3c0f2269-1938-48e0-afe0-656262f798c8');

DELETE FROM directus_access
 WHERE policy IN ('5660b60e-05e8-4dfa-befe-6be6d3fb0efd',
                  'a0a30904-4b6f-48ed-9e71-5e82da4ddddb',
                  '586ae88a-b88c-462a-a436-496fb6784102',
                  '40dadbab-35a6-4de0-946b-12591398a625',
                  '3c0f2269-1938-48e0-afe0-656262f798c8');

DELETE FROM directus_policies
 WHERE id IN ('5660b60e-05e8-4dfa-befe-6be6d3fb0efd',
              'a0a30904-4b6f-48ed-9e71-5e82da4ddddb',
              '586ae88a-b88c-462a-a436-496fb6784102',
              '40dadbab-35a6-4de0-946b-12591398a625',
              '3c0f2269-1938-48e0-afe0-656262f798c8');

DELETE FROM directus_roles
 WHERE id IN ('687cac00-5468-472d-90b3-ee3cc7990412',
              '829aced6-5422-402f-bbe1-18bb3212967f');

UPDATE directus_relations
   SET one_field = NULL
 WHERE many_collection = 'cms_department_memberships'
   AND many_field = 'user'
   AND one_collection = 'directus_users';

DELETE FROM directus_fields
 WHERE (collection = 'directus_users' AND field = 'cms_memberships')
    OR (collection = 'cms_department_memberships'
        AND field IN ('editor_department', 'reviewer_department', 'publisher_department'));

ALTER TABLE cms_department_memberships
  DROP COLUMN editor_department,
  DROP COLUMN reviewer_department,
  DROP COLUMN publisher_department;

COMMIT;
