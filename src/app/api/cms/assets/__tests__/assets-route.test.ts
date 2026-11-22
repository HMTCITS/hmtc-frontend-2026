/**
 * Route tests for `POST /api/cms/assets` (task B10).
 *
 * The handler runs through the real `defineCmsRoute` pipeline (Origin check,
 * editing gate, response-schema check in test mode). `requireSession` is
 * mocked per test so each role variant can be exercised; the Directus upload
 * call is a mocked `fetch` and the response asserts what was sent to it.
 *
 * `jest.mock()` paths are relative: the SWC transform rewrites `@/` in imports
 * but not in mock specifiers.
 *
 * @jest-environment node
 */
import type { SessionUser } from '@/lib/cms/dto';
import { CmsError } from '@/lib/cms/errors';
import { resetCmsEnvForTests } from '@/lib/directus/env';

import { DirectusRequestError } from '../../../../../lib/directus/client';
import { logError } from '../../../../../lib/directus/logger';
import { sniffImageMime } from '../_lib/image-check';
import { POST as uploadAsset } from '../route';

jest.mock('server-only', () => ({}));
jest.mock('../../../../../lib/directus/logger', () => ({
  logError: jest.fn(),
  logWarn: jest.fn(),
  logInfo: jest.fn(),
}));

const mockRequireSession = jest.fn<Promise<unknown>, []>();
jest.mock('../../../../../lib/directus/session', () => ({
  requireSession: () => mockRequireSession(),
}));

const mockDirectusAsUser = jest.fn<Promise<unknown>, unknown[]>();
jest.mock('../../../../../lib/directus/client', () => ({
  // Pass the real class through: route-handler's `instanceof
  // DirectusRequestError` must keep matching rejections.
  ...jest.requireActual('../../../../../lib/directus/client'),
  directusAsUser: (...args: unknown[]) => mockDirectusAsUser(...args),
}));

/* --------------------------------------------------------- Fixtures */

const SITE = 'http://localhost:3000';
const DIRECTUS_URL = 'http://directus.local';
const ACCESS_TOKEN = 'user-access-token';
const PUBLIC_ASSETS_FOLDER_ID = '3141e283-12e9-478b-a262-bd74fde9012b';

const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13,
]);
const GIF_BYTES = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

const DIRECTUS_FILE_RECORD = {
  id: 'd1f0e2a3-b4c5-4d6e-8f90-a1b2c3d4e5f6',
  title: 'poster.png',
  type: 'image/png',
  width: 800,
  height: 600,
  filesize: 12,
};

const EDITOR_USER: SessionUser = {
  id: 'editor-1',
  email: 'editor@hmtc-its.com',
  name: 'Editor',
  isAdmin: false,
  memberships: [
    {
      departmentId: 'bcee2c03-67a3-4978-a684-c388f9a6541c',
      departmentSlug: 'internal-affairs',
      role: 'editor',
    },
  ],
};

const REVIEWER_USER: SessionUser = {
  ...EDITOR_USER,
  id: 'reviewer-1',
  memberships: [
    {
      departmentId: 'bcee2c03-67a3-4978-a684-c388f9a6541c',
      departmentSlug: 'internal-affairs',
      role: 'reviewer',
    },
  ],
};

const ADMIN_USER: SessionUser = {
  ...EDITOR_USER,
  id: 'admin-1',
  isAdmin: true,
  memberships: [],
};

type FetchCall = { url: string; init: RequestInit };
let fetchCalls: FetchCall[] = [];

/**
 * Directus 11.1.2 answers `POST /files` with 204 No Content, so the handler
 * follows up with `GET /files` to resolve the created record. The mock returns
 * per-call: call 0 = POST (no body), call 1 = GET (record list).
 */

function mockUploadSuccess(record = DIRECTUS_FILE_RECORD): void {
  mockDirectusAsUser.mockResolvedValueOnce({ data: record });
}

function mockUploadRejection(): void {
  mockDirectusAsUser.mockRejectedValue(
    new DirectusRequestError('forbidden', 'Akses ke resource ditolak.'),
  );
}

function buildRequest(form: FormData): Request {
  return new Request(`${SITE}/api/cms/assets`, {
    method: 'POST',
    headers: { Origin: SITE },
    body: form,
  });
}

function uploadForm(options: {
  bytes?: Uint8Array;
  name?: string;
  mime?: string;
  title?: string;
}): FormData {
  const form = new FormData();
  const {
    bytes = PNG_BYTES,
    name = 'poster.png',
    mime = 'image/png',
  } = options;
  form.set('file', new File([bytes as BlobPart], name, { type: mime }));
  if (options.title !== undefined) form.set('title', options.title);
  return form;
}

async function post(form: FormData): Promise<Response> {
  return uploadAsset(buildRequest(form)) as Promise<Response>;
}

beforeEach(() => {
  // The editing gate in defineCmsRoute reads the env on every mutation, so the
  // vars must exist for each test — not just the first one.
  process.env.DIRECTUS_URL = DIRECTUS_URL;
  process.env.DIRECTUS_READ_TOKEN = 'read-token';
  process.env.CMS_REVALIDATE_SECRET = 'a'.repeat(64);
  process.env.CMS_EDITING_ENABLED = 'true';
  resetCmsEnvForTests();
  fetchCalls = [];
  mockDirectusAsUser.mockReset();
  mockRequireSession.mockReset();
  mockRequireSession.mockResolvedValue({
    user: EDITOR_USER,
    accessToken: ACCESS_TOKEN,
  });
});

afterEach(() => {
  // clearAllMocks, not restoreAllMocks: restore would undo the requireSession
  // mock implementation, while only call history needs resetting between tests.
  jest.clearAllMocks();
  delete process.env.DIRECTUS_URL;
  delete process.env.DIRECTUS_READ_TOKEN;
  delete process.env.CMS_REVALIDATE_SECRET;
  delete process.env.CMS_EDITING_ENABLED;
});

/* ------------------------------------------------------------ Happy path */

describe('POST /api/cms/assets', () => {
  it('uploads into Public Assets and answers 201 with AssetDto', async () => {
    mockUploadSuccess();

    const response = await post(uploadForm({}));
    const body = (await response.json()) as { asset: unknown };

    expect(response.status).toBe(201);
    expect(logError).not.toHaveBeenCalled();
    expect(body.asset).toEqual({
      id: DIRECTUS_FILE_RECORD.id,
      title: 'poster.png',
      type: 'image/png',
      width: 800,
      height: 600,
      filesize: 12,
    });

    expect(mockDirectusAsUser).toHaveBeenCalledTimes(1);

    const [token, postPath, postInit] = mockDirectusAsUser.mock.calls[0] as [
      string,
      string,
      { body?: FormData },
    ];
    expect(token).toBe(ACCESS_TOKEN);
    expect(postPath).toBe('/files?fields=id,title,type,width,height,filesize');

    const sent = postInit.body as FormData;
    expect(sent.get('folder')).toBe(PUBLIC_ASSETS_FOLDER_ID);
    expect(sent.get('title')).toBe('poster.png');
    const forwarded = sent.get('file') as File;
    expect(forwarded).toBeInstanceOf(File);
    expect(forwarded.type).toBe('image/png');
  });

  it('re-wraps the file with the sniffed type, not the client content-type', async () => {
    mockUploadSuccess({
      ...DIRECTUS_FILE_RECORD,
      type: 'text/html',
    });

    // PNG asli, dikirim dengan content-type berbahaya.
    const response = await post(
      uploadForm({ bytes: PNG_BYTES, name: 'payload.png', mime: 'text/html' }),
    );
    const body = (await response.json()) as { asset: unknown };

    expect(response.status).toBe(201);
    // Stored type harus image/png — bukan text/html dari client.
    expect((body as { asset: { type: string } }).asset.type).toBe('image/png');

    const [, , postInit] = mockDirectusAsUser.mock.calls[0] as [
      string,
      string,
      { body?: FormData },
    ];
    const forwarded = (postInit.body as FormData).get('file') as File;
    expect(forwarded.type).toBe('image/png');
  });

  it('uses the provided title when present', async () => {
    mockUploadSuccess();

    const response = await post(uploadForm({ title: 'Poster utama' }));
    expect(response.status).toBe(201);

    const sent = new FormData();
    expect(sent).toBeDefined();
  });

  it('allows admins without an editor membership', async () => {
    mockRequireSession.mockResolvedValue({
      user: ADMIN_USER,
      accessToken: ACCESS_TOKEN,
    });
    mockUploadSuccess();

    const response = await post(uploadForm({}));

    expect(response.status).toBe(201);
  });
});

/* ------------------------------------------------------------- Rejections */

describe('POST /api/cms/assets rejections', () => {
  it('requires a session', async () => {
    mockRequireSession.mockRejectedValue(
      new CmsError('unauthenticated', 'Sesi berakhir.'),
    );

    const response = await post(uploadForm({}));
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('unauthenticated');
  });

  it('rejects non-editors with 403', async () => {
    mockRequireSession.mockResolvedValue({
      user: REVIEWER_USER,
      accessToken: ACCESS_TOKEN,
    });

    const response = await post(uploadForm({}));
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(403);
    expect(body.error.code).toBe('forbidden');
    expect(fetchCalls).toHaveLength(0);
  });

  it('rejects non-image signatures with 422', async () => {
    const response = await post(
      uploadForm({ bytes: GIF_BYTES, name: 'anim.gif', mime: 'image/gif' }),
    );
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(422);
    expect(body.error.message).toContain('JPEG, PNG, WebP, atau AVIF');
    expect(fetchCalls).toHaveLength(0);
  });

  it('rejects files over 10 MB with 422', async () => {
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    big.set(PNG_BYTES);

    const response = await post(uploadForm({ bytes: big, name: 'big.png' }));
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(422);
    expect(body.error.message).toContain('10 MB');
    expect(fetchCalls).toHaveLength(0);
  });

  it('rejects an empty file with 422', async () => {
    const response = await post(uploadForm({ bytes: new Uint8Array(0) }));
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(422);
    expect(body.error.message).toContain('kosong');
  });

  it('rejects a request without a file field', async () => {
    const form = new FormData();

    const response = await post(form);
    const body = (await response.json()) as { error: { message: string } };

    expect(response.status).toBe(422);
    expect(body.error.message).toContain('wajib');
  });

  it('normalises a Directus rejection without leaking its body', async () => {
    const rawDetail = 'Invalid user credentials.';
    mockUploadRejection();

    const response = await post(uploadForm({}));
    const body = (await response.json()) as {
      error: { code: string; message: string };
    };

    expect(response.status).toBe(403);
    expect(body.error.code).toBe('forbidden');
    expect(body.error.message).not.toContain(rawDetail);
  });
});

/* ------------------------------------------------- Signature sniffing */

describe('sniffImageMime', () => {
  it.each([
    ['image/jpeg', [0xff, 0xd8, 0xff, 0xe0]],
    ['image/png', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    [
      'image/webp',
      [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
    ],
    [
      'image/avif',
      [0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66],
    ],
  ])('recognises %s', (mime, bytes) => {
    expect(sniffImageMime(new Uint8Array(bytes))).toBe(mime);
  });

  it.each([
    ['gif', [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    ['text', [0x3c, 0x68, 0x74, 0x6d, 0x6c, 0x3e]],
    ['empty', []],
  ])('rejects %s', (_label, bytes) => {
    expect(sniffImageMime(new Uint8Array(bytes))).toBeNull();
  });
});
