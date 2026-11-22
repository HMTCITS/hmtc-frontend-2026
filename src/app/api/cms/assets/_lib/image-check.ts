/**
 * Upload validation for `POST /api/cms/assets`.
 *
 * The declared `content-type` of a multipart part is client-controlled, so the
 * accepted type is decided by sniffing the file signature (magic bytes) — the
 * only reliable signal. A declared type that disagrees with the bytes is
 * irrelevant: Directus re-detects the type on its side anyway.
 *
 * Server-only module in spirit, but pure functions: no Directus, no env.
 */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_IMAGE_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export type AcceptedImageMime = (typeof ACCEPTED_IMAGE_MIME)[number];

/**
 * Detect the image type from the first bytes of a file. Returns `null` for
 * anything that is not one of the four accepted image formats.
 */
export function sniffImageMime(bytes: Uint8Array): AcceptedImageMime | null {
  if (bytes.length < 3) return null;

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (isJpeg) return 'image/jpeg';

  if (bytes.length < 8) return null;

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  if (isPng) return 'image/png';

  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  if (isWebp) return 'image/webp';

  const isAvif =
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70 &&
    bytes[8] === 0x61 &&
    bytes[9] === 0x76 &&
    bytes[10] === 0x69 &&
    bytes[11] === 0x66;
  if (isAvif) return 'image/avif';

  return null;
}

export type UploadCheckResult =
  | { ok: true; mime: AcceptedImageMime }
  | { ok: false; message: string };

/** Size + signature check for one uploaded file. */
export async function checkImageUpload(file: File): Promise<UploadCheckResult> {
  if (file.size === 0) {
    return { ok: false, message: 'File kosong.' };
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: 'Ukuran file melebihi batas 10 MB.' };
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const mime = sniffImageMime(head);

  if (!mime) {
    return {
      ok: false,
      message: 'Tipe file harus image JPEG, PNG, WebP, atau AVIF.',
    };
  }

  return { ok: true, mime };
}
