import fs from 'node:fs';
import path from 'node:path';

import {
  type CmsEndpointName,
  cmsEndpoints,
  cmsPath,
} from '@/lib/cms/api-contract';
import { cmsTags } from '@/lib/cms/cache-tags';
import { pageDetailSchema } from '@/lib/cms/dto';
import {
  CMS_ERROR_STATUS,
  cmsError,
  cmsErrorBodySchema,
} from '@/lib/cms/errors';

const names = Object.keys(cmsEndpoints) as CmsEndpointName[];

describe('endpoint registry', () => {
  it('has no duplicate method + path', () => {
    const keys = names.map(
      (n) => `${cmsEndpoints[n].method} ${cmsEndpoints[n].path}`,
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('declares params exactly when the path has placeholders', () => {
    for (const name of names) {
      const endpoint = cmsEndpoints[name];
      const hasPlaceholder = /:[A-Za-z]+/.test(endpoint.path);
      expect([name, 'params' in endpoint]).toEqual([name, hasPlaceholder]);
    }
  });

  it('uses 204 exactly for endpoints without a response body', () => {
    for (const name of names) {
      const endpoint = cmsEndpoints[name];
      expect([name, endpoint.response === null]).toEqual([
        name,
        endpoint.status === 204,
      ]);
    }
  });

  it('never exposes a catch-all proxy (D2)', () => {
    for (const name of names) {
      expect(cmsEndpoints[name].path).not.toMatch(/\*|\.\.\.|\[\.\.\./);
    }
  });

  it('only the webhook skips session auth, only login is anonymous', () => {
    const auth = Object.fromEntries(
      names.map((n) => [n, cmsEndpoints[n].auth]),
    );
    expect(names.filter((n) => auth[n] !== 'session').sort()).toEqual([
      'login',
      'revalidate',
    ]);
    expect(auth.revalidate).toBe('hmac');
  });
});

describe('cmsPath', () => {
  it('fills and encodes params', () => {
    expect(cmsPath('restoreRevision', { id: 'a b', revisionId: 'c/d' })).toBe(
      '/api/cms/pages/a%20b/revisions/c%2Fd/restore',
    );
  });

  it('throws on a missing param', () => {
    expect(() => cmsPath('getPage')).toThrow('missing path param "id"');
  });
});

describe('request bodies', () => {
  it('applies the 72 h preview default', () => {
    const body = cmsEndpoints.createPreviewGrant.body.parse({});
    expect(body.ttlHours).toBe(72);
    expect(() =>
      cmsEndpoints.createPreviewGrant.body.parse({ ttlHours: 73 }),
    ).toThrow();
  });

  it('requires optimistic concurrency on every working-copy mutation', () => {
    for (const name of [
      'savePage',
      'submitPage',
      'requestChanges',
      'publishPage',
      'unpublishPage',
      'archivePage',
      'restoreRevision',
    ] as const) {
      const result = cmsEndpoints[name].body.safeParse({ comment: 'x' });
      expect([name, result.success]).toEqual([name, false]);
    }
  });

  it('rejects unknown page types', () => {
    const base = {
      prokerId: 'faf07ffb-76be-4a4f-b897-4e970dc99e00',
      editionYear: 2026,
      title: 'Bluecamp 2026',
    };
    expect(
      cmsEndpoints.createPage.body.safeParse({ ...base, pageType: 'event' })
        .success,
    ).toBe(true);
    expect(
      cmsEndpoints.createPage.body.safeParse({ ...base, pageType: 'blog' })
        .success,
    ).toBe(false);
  });
});

describe('DTOs', () => {
  it('parses a page detail', () => {
    const page = {
      id: '9056588b-124e-46c4-93f5-18cf78aa02a9',
      title: 'Bluecamp 2026',
      slug: 'bluecamp',
      pageType: 'event',
      status: 'draft',
      departmentId: '7870e406-aaef-430e-8df8-1c7f8d2b3682',
      prokerId: 'faf07ffb-76be-4a4f-b897-4e970dc99e00',
      editionYear: 2026,
      isLive: false,
      publishedAt: null,
      updatedAt: '2026-11-03T15:00:00.000Z',
      path: '/research-and-technology/bluecamp/2026',
      blocks: [],
      invalidBlocks: [],
      excerpt: null,
      featuredImageId: null,
      seoTitle: null,
      seoDescription: null,
      templateId: null,
      publishedRevisionId: null,
      currentRevisionId: null,
      lastSubmission: null,
      history: [],
      allowedActions: ['edit', 'submit', 'create_preview'],
    };
    expect(pageDetailSchema.parse(page).allowedActions).toHaveLength(3);
  });
});

describe('errors and cache tags', () => {
  it('maps codes to the spec status model', () => {
    expect(CMS_ERROR_STATUS.unauthenticated).toBe(401);
    expect(CMS_ERROR_STATUS.self_approval).toBe(403);
    expect(CMS_ERROR_STATUS.not_found).toBe(404);
    expect(CMS_ERROR_STATUS.stale_write).toBe(409);
    expect(CMS_ERROR_STATUS.invalid_blocks).toBe(422);
    expect(
      cmsErrorBodySchema.parse(cmsError('stale_write', 'Halaman sudah diubah')),
    ).toBeTruthy();
  });

  it('builds route tags', () => {
    expect(cmsTags.page('research-and-technology', 'bluecamp', 2026)).toBe(
      'cms:page:research-and-technology/bluecamp/2026',
    );
  });
});

describe('docs/hmtc-cms-api-contract.md', () => {
  const doc = fs.readFileSync(
    path.join(process.cwd(), 'docs/hmtc-cms-api-contract.md'),
    'utf8',
  );

  it('lists every endpoint', () => {
    for (const name of names) {
      const { method, path: route } = cmsEndpoints[name];
      expect([
        name,
        doc.includes(`\`${method}\``) && doc.includes(`\`${route}\``),
      ]).toEqual([name, true]);
      expect(doc).toContain(`\`${name}\``);
    }
  });
});
