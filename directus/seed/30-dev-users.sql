-- Local Directus only — development users (migration 004 must be applied).
--
-- One editor, reviewer and publisher in Research Technology, plus the
-- nextjs-reader service user with a static token. Credentials are documented
-- in docs/local-development.md. NEVER copy these into staging or production.
--
--   editor@example.com     / editor-local     CMS member, editor    in research-and-technology
--   reviewer@example.com   / reviewer-local   CMS member, reviewer  in research-and-technology
--   publisher@example.com  / publisher-local  CMS member, publisher in research-and-technology
--   reader@example.com     (no password)      nextjs-reader, token local-nextjs-reader-token
--
-- Idempotent: safe to run more than once.

BEGIN;

INSERT INTO directus_users (id, first_name, last_name, email, password, status, role, token) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'Local', 'Editor', 'editor@example.com',
   '$argon2id$v=19$m=65536,t=3,p=4$nJxTjsp+slJMVkvFPopTDA$zSWT8NYoh4b5tBUALdz8czEjRJHDZxET9xvgGtAPhF0',
   'active', '829aced6-5422-402f-bbe1-18bb3212967f', NULL),
  ('d0000000-0000-4000-8000-000000000002', 'Local', 'Reviewer', 'reviewer@example.com',
   '$argon2id$v=19$m=65536,t=3,p=4$QS3s4QJWMStDW6jFS37ZBA$jrLK77x9fsrP//ogvOFHipyj9JOntuxUiKkLg+jBI38',
   'active', '829aced6-5422-402f-bbe1-18bb3212967f', NULL),
  ('d0000000-0000-4000-8000-000000000003', 'Local', 'Publisher', 'publisher@example.com',
   '$argon2id$v=19$m=65536,t=3,p=4$kBRRIP0GP1LI1YwWOiowuA$DRJgyrSDME23D/Id7xnTBu4Cg6T0iMIjpAeagy4s9Vg',
   'active', '829aced6-5422-402f-bbe1-18bb3212967f', NULL),
  ('d0000000-0000-4000-8000-000000000004', 'Next.js', 'Reader', 'reader@example.com',
   NULL,
   'active', '687cac00-5468-472d-90b3-ee3cc7990412', 'local-nextjs-reader-token')
ON CONFLICT (id) DO UPDATE
  SET email    = EXCLUDED.email,
      password = EXCLUDED.password,
      status   = EXCLUDED.status,
      role     = EXCLUDED.role,
      token    = EXCLUDED.token;

INSERT INTO cms_department_memberships (id, department, "user", membership_role, is_active) VALUES
  ('d1000000-0000-4000-8000-000000000001', '7870e406-aaef-430e-8df8-1c7f8d2b3682', 'd0000000-0000-4000-8000-000000000001', 'editor',    true),
  ('d1000000-0000-4000-8000-000000000002', '7870e406-aaef-430e-8df8-1c7f8d2b3682', 'd0000000-0000-4000-8000-000000000002', 'reviewer',  true),
  ('d1000000-0000-4000-8000-000000000003', '7870e406-aaef-430e-8df8-1c7f8d2b3682', 'd0000000-0000-4000-8000-000000000003', 'publisher', true)
ON CONFLICT DO NOTHING;

COMMIT;
