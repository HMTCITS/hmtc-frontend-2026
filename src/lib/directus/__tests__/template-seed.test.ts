import fs from 'node:fs';
import path from 'node:path';

import {
  blocksSchema,
  type BlockType,
  publishBlocksSchema,
} from '@/lib/directus/blocks';

const SEED = 'directus/seed/40-templates.sql';
const seed = fs.readFileSync(path.join(process.cwd(), SEED), 'utf8');

/** Each `cms_templates` row: its slug and the JSON between `$json$` markers. */
function seededTemplates(): Map<string, unknown> {
  const rows = new Map<string, unknown>();
  const insert = seed.slice(seed.indexOf('INSERT INTO cms_templates'));
  const row = /\('[^']+',\s*'([a-z-]+)',[\s\S]*?\$json\$([\s\S]*?)\$json\$/g;
  Array.from(insert.matchAll(row)).forEach(([, slug, json]) => {
    rows.set(slug, JSON.parse(json));
  });
  return rows;
}

const templates = seededTemplates();

const EXPECTED: Record<string, BlockType[]> = {
  event: ['hero', 'eventDetails', 'agenda', 'cta'],
  program: ['hero', 'richText', 'gallery'],
};

describe(`starter templates in ${SEED}`, () => {
  it('seeds exactly the event and program templates', () => {
    expect(Array.from(templates.keys()).sort()).toEqual(['event', 'program']);
  });

  it.each(Object.entries(EXPECTED))(
    '%s is a valid draft with the expected blocks',
    (slug, types) => {
      const blocks = blocksSchema.parse(templates.get(slug));
      expect(blocks.map((block) => block.type)).toEqual(types);
    },
  );

  it.each(Object.keys(EXPECTED))(
    '%s cannot be published until its placeholders are replaced',
    (slug) => {
      const result = publishBlocksSchema.safeParse(templates.get(slug));
      expect(result.success).toBe(false);
      const issues = result.error!.issues;
      expect(issues.length).toBeGreaterThan(0);
      for (const issue of issues) {
        expect(issue.message).toMatch(/placeholder template/);
        expect(issue.path[1]).toBe('props');
      }
    },
  );

  it('flags the CTA link and the gallery alt text', () => {
    const paths = publishBlocksSchema
      .safeParse(templates.get('event'))
      .error!.issues.map((issue) => issue.path.join('.'));
    expect(paths).toContain('3.props.action.href');

    const programPaths = publishBlocksSchema
      .safeParse(templates.get('program'))
      .error!.issues.map((issue) => issue.path.join('.'));
    expect(programPaths).toContain('2.props.images.0.alt');
  });

  it('points the gallery at the seeded placeholder file', () => {
    const blocks = blocksSchema.parse(templates.get('program'));
    const gallery = blocks.find((block) => block.type === 'gallery');
    const assets =
      gallery?.type === 'gallery'
        ? gallery.props.images.map((image) => image.asset)
        : [];

    const file =
      /INSERT INTO directus_files[\s\S]*?\('([0-9a-f-]{36})',\s*'local',\s*'([^']+)'/.exec(
        seed,
      );
    expect(file).not.toBeNull();
    const [, fileId, fileName] = file!;

    expect(assets).toEqual([fileId]);
    expect(
      fs.existsSync(path.join(process.cwd(), 'directus/seed/assets', fileName)),
    ).toBe(true);
  });
});
