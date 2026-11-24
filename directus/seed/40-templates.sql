-- Starter page templates: `event` and `program`.
--
-- Both are published and global, so every department can create a page from
-- them. Their blocks must pass `publishBlocksSchema`
-- (src/lib/directus/blocks.ts); src/lib/directus/__tests__/template-seed.test.ts
-- reads the JSON between the $json$ markers below and checks that.
--
-- The program gallery points at a placeholder image ("Ganti foto ini") in the
-- "Public Assets" folder. Locally, `pnpm directus:setup` copies
-- directus/seed/assets/template-placeholder.webp into the uploads volume.
-- Production steps: docs/local-development.md, "Starter templates".
--
-- ON CONFLICT DO NOTHING: re-running setup never overwrites a template that
-- was edited in Studio.

BEGIN;

INSERT INTO directus_files
  (id, storage, filename_disk, filename_download, title, type, folder,
   filesize, width, height, description)
VALUES
  ('4fb657b6-1b26-4389-b00e-a1f64be8e5d3', 'local',
   'template-placeholder.webp', 'template-placeholder.webp',
   'Placeholder template (ganti foto ini)', 'image/webp',
   '3141e283-12e9-478b-a262-bd74fde9012b',
   5842, 1280, 720,
   'Used by the starter program template. Replace it on every real page.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_templates
  (name, slug, description, category, blocks, status, is_global)
VALUES
  ('Event', 'event',
   'Halaman acara: hero, detail acara, agenda, dan ajakan.',
   'event',
   $json$[
     {
       "id": "hero",
       "type": "hero",
       "version": 1,
       "props": {
         "eyebrow": "[Nama departemen]",
         "title": "[Judul acara]",
         "description": "[Ringkasan acara dalam satu atau dua kalimat.]",
         "align": "left"
       }
     },
     {
       "id": "event-details",
       "type": "eventDetails",
       "version": 1,
       "props": {
         "heading": "Detail acara",
         "items": [
           { "label": "Tanggal", "value": "[Hari, tanggal bulan tahun]", "icon": "calendar" },
           { "label": "Waktu", "value": "[00.00 – 00.00 WIB]", "icon": "clock" },
           { "label": "Lokasi", "value": "[Tempat atau tautan daring]", "icon": "location" }
         ]
       }
     },
     {
       "id": "agenda",
       "type": "agenda",
       "version": 1,
       "props": {
         "heading": "Agenda",
         "items": [
           { "time": "[00.00]", "title": "[Pembukaan]" },
           { "time": "[00.00]", "title": "[Sesi utama]", "description": "[Pembicara atau keterangan sesi.]" }
         ]
       }
     },
     {
       "id": "cta",
       "type": "cta",
       "version": 1,
       "props": {
         "heading": "[Ajakan untuk mendaftar atau hadir]",
         "action": { "label": "[Daftar sekarang]", "href": "/" },
         "tone": "accent"
       }
     }
   ]$json$::json,
   'published', true),

  ('Program', 'program',
   'Halaman program kerja: hero, deskripsi, dan galeri.',
   'program',
   $json$[
     {
       "id": "hero",
       "type": "hero",
       "version": 1,
       "props": {
         "eyebrow": "[Nama departemen]",
         "title": "[Nama program kerja]",
         "description": "[Ringkasan program dalam satu atau dua kalimat.]",
         "align": "left"
       }
     },
     {
       "id": "intro",
       "type": "richText",
       "version": 1,
       "props": {
         "heading": "Tentang program",
         "paragraphs": [
           "[Jelaskan tujuan, sasaran, dan kegiatan utama program ini.]"
         ]
       }
     },
     {
       "id": "gallery",
       "type": "gallery",
       "version": 1,
       "props": {
         "heading": "Dokumentasi",
         "layout": "grid",
         "images": [
           {
             "asset": "4fb657b6-1b26-4389-b00e-a1f64be8e5d3",
             "alt": "Placeholder: ganti foto ini dengan dokumentasi program"
           }
         ]
       }
     }
   ]$json$::json,
   'published', true)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
