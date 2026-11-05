-- Local Directus only — reference data.
--
-- Departments and the "Public Assets" folder use the production IDs so local
-- data, permission filters and asset references line up with production.
-- Prokers are development samples for the proker routes in src/lib/config.ts;
-- production has no proker rows yet.
-- Idempotent: safe to run more than once.

BEGIN;

INSERT INTO cms_departments (id, name, slug, description, is_active) VALUES
  ('9e0fa530-9731-47ac-9774-98a87fd9c2d4', 'Student Talent Interest',      'student-talent-interest',      'STI',                true),
  ('795d8315-fc52-434f-8ed0-c085758a3471', 'External Affairs',             'external-affairs',             'Hubungan Luar',      true),
  ('bbaafea7-0257-4f1b-9323-3c86501aaeb8', 'Student Social Development',   'student-social-development',   NULL,                 true),
  ('bcee2c03-67a3-4978-a684-c388f9a6541c', 'Internal Affairs',             'internal-affairs',             NULL,                 true),
  ('f150652d-e3c7-46ed-af02-cffba92dcb0f', 'Creative Media Information',   'creative-media-information',   '#CMISELALUDIDEPAN',  true),
  ('ccbbc8b8-f2da-41c0-8ddf-e0591f968dca', 'Student Welfare',              'student-welfare',              NULL,                 true),
  ('1cdc11bc-bec0-492e-a858-148a9d27c40a', 'Student Resource Development', 'student-resource-development', NULL,                 true),
  ('7870e406-aaef-430e-8df8-1c7f8d2b3682', 'Research Technology',          'research-and-technology',      NULL,                 true),
  ('66e216d8-1c48-406e-9b80-0b1c176068f3', 'Enterpreneurship Development', 'entrepreneurship-development', NULL,                 true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_prokers (id, department, title, slug, description, is_active) VALUES
  ('04ecbd3c-a83d-4732-a83e-6747d1f8a279', 'bcee2c03-67a3-4978-a684-c388f9a6541c', 'Syukuran Wisudawan', 'syukuran-wisudawan', 'Sample proker (local dev)', true),
  ('9b588eaa-27e2-4a53-92b5-b5bb3c27fbb6', 'ccbbc8b8-f2da-41c0-8ddf-e0591f968dca', 'Academic Resources', 'academic-resources', 'Sample proker (local dev)', true),
  ('65242631-5141-44f6-b0d3-5022b7028c0c', '7870e406-aaef-430e-8df8-1c7f8d2b3682', 'Seminar Dosen',      'seminar-dosen',      'Sample proker (local dev)', true),
  ('a237c086-5c33-4925-9063-eac3b707804b', '7870e406-aaef-430e-8df8-1c7f8d2b3682', 'Seminar Dosen 2',    'seminar-dosen-2',    'Sample proker (local dev)', true),
  ('874a9ec9-f917-43ad-bd3e-ee6287fa8a31', '7870e406-aaef-430e-8df8-1c7f8d2b3682', 'Seminar Dosen 3',    'seminar-dosen-3',    'Sample proker (local dev)', true),
  ('faf07ffb-76be-4a4f-b897-4e970dc99e00', '7870e406-aaef-430e-8df8-1c7f8d2b3682', 'Bluecamp',           'bluecamp',           'Sample proker (local dev)', true),
  ('14d6cf90-88f0-439d-ad49-39b36ce18a08', 'bbaafea7-0257-4f1b-9323-3c86501aaeb8', 'TC Run',             'tc-run',             'Sample proker (local dev)', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_site_settings (id, site_name) VALUES (1, 'HMTC ITS')
ON CONFLICT (id) DO NOTHING;

INSERT INTO directus_folders (id, name, parent) VALUES
  ('3141e283-12e9-478b-a262-bd74fde9012b', 'Public Assets', NULL)
ON CONFLICT (id) DO NOTHING;

COMMIT;
