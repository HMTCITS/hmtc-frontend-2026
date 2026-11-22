/**
 * HMTC CMS — `POST /api/cms/assets` (task B10).
 *
 * Uploads an image into the Directus "Public Assets" folder on behalf of the
 * acting editor. The browser never talks to Directus (D4): the multipart body
 * is re-wrapped here and forwarded with the user's access token, so Directus
 * policies (005) are the second layer.
 *
 * Editors only (contract summary): an upload is a content-authoring action,
 * and 004 grants content writes to the editor role alone. Admins bypass.
 *
 * Access rules: 004 grants content writes to the editor role alone, so "editors
 * only" is enforced as `role === 'editor'` (admins bypass).
 */
import type { SessionUser } from '@/lib/cms/dto';
import { assetDtoSchema } from '@/lib/cms/dto';
import { CmsError } from '@/lib/cms/errors';
import { directusAsUser } from '@/lib/directus/client';
import { logError } from '@/lib/directus/logger';
import { defineCmsRoute } from '@/lib/directus/route-handler';
import { requireSession } from '@/lib/directus/session';

import { checkImageUpload } from './_lib/image-check';

/** Fixed by `directus/seed/10-reference-data.sql`; identical in production. */
const PUBLIC_ASSETS_FOLDER_ID = '3141e283-12e9-478b-a262-bd74fde9012b';

function hasEditorRole(user: SessionUser): boolean {
  return user.memberships.some((membership) => membership.role === 'editor');
}

type DirectusFileRecord = {
  id?: unknown;
  title?: unknown;
  type?: unknown;
  width?: unknown;
  height?: unknown;
  filesize?: unknown;
};

export const POST = defineCmsRoute('uploadAsset', async ({ formData }) => {
  const { user, accessToken } = await requireSession();

  if (!user.isAdmin && !hasEditorRole(user)) {
    throw new CmsError('forbidden', 'Hanya editor yang dapat mengunggah aset.');
  }

  const file = formData?.get('file');
  if (!(file instanceof File)) {
    throw new CmsError('validation_failed', 'File gambar wajib diisi.');
  }

  const check = await checkImageUpload(file);
  if (!check.ok) throw new CmsError('validation_failed', check.message);

  const rawTitle = formData?.get('title');
  const title =
    typeof rawTitle === 'string' && rawTitle.trim() !== ''
      ? rawTitle.trim()
      : file.name;

  // Re-wrap dengan tipe hasil sniff. Menyambung `file` mentah akan meneruskan
  // content-type dari client, dan Directus menyimpan/menyajikan aset dengan
  // tipe itu — file berheader PNG yang dikirim sebagai text/html akan
  // tersaji sebagai HTML di domain Directus (stored XSS).
  const typedFile = new File([file], file.name, { type: check.mime });
  const upload = new FormData();
  upload.set('file', typedFile, file.name);
  upload.set('folder', PUBLIC_ASSETS_FOLDER_ID);
  upload.set('title', title);

  // `fields` memaksa Directus mengembalikan record di respons POST. Tanpa itu
  // Directus 11.1.2 menjawab 204 No Content, dan resolve lewat "file terbaru
  // di folder" akan salah saat dua editor upload hampir bersamaan — id milik
  // editor lain bisa sampai ke respons ini.
  const uploadResponse = await directusAsUser<{
    data?: DirectusFileRecord;
  }>(accessToken, '/files?fields=id,title,type,width,height,filesize', {
    method: 'POST',
    body: upload,
  });

  const record = uploadResponse?.data;
  if (!record || typeof record.id !== 'string') {
    logError('uploadAsset', 'Directus did not return the created file record');
    throw new CmsError('internal', 'Upload gagal diproses.');
  }

  // Directus detects width/height/filesize asynchronously for some formats, so
  // every metadata field degrades to a safe value and the contract schema is
  // the guarantee — the raw record never reaches the client.
  const candidate = {
    id: record.id,
    title: typeof record.title === 'string' ? record.title : title,
    // check.mime (hasil sniff) adalah sumber kebenaran tipe; Directus bisa
    // mengembalikan tipe lain dan itu tidak boleh dipercaya untuk penyajian.
    type: check.mime,
    width: typeof record.width === 'number' ? record.width : null,
    height: typeof record.height === 'number' ? record.height : null,
    filesize: typeof record.filesize === 'number' ? record.filesize : file.size,
  };

  const parsed = assetDtoSchema.safeParse(candidate);
  if (!parsed.success) {
    logError('uploadAsset', 'Directus file record does not match AssetDto', {
      issues: parsed.error.issues,
    });
    throw new CmsError('internal', 'Upload gagal diproses.');
  }

  return { asset: parsed.data };
});
