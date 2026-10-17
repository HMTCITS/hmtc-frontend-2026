#!/usr/bin/env node
/**
 * Guards `public/` against oversized binary assets.
 *
 * Almost all of this repository's weight has historically come from
 * unoptimised imagery — raw camera files and photo PNGs committed straight
 * into `public/`. Next.js `<Image>` re-encodes images at *runtime*, so a large
 * source file never improves page delivery; it only inflates the git history,
 * the Docker image, and every clone.
 *
 * This check keeps that from creeping back in.
 *
 * Usage:
 *   node scripts/check-image-sizes.mjs              # scan all of public/
 *   node scripts/check-image-sizes.mjs --staged     # scan staged file only
 *   node scripts/check-image-sizes.mjs --max=2097152
 *
 * The ceiling defaults to 1 MiB and can be overridden with the
 * IMAGE_MAX_BYTES environment variable.
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

/** Asset types that are worth policing for size. */
const ASSET_EXT = /\.(png|jpe?g|webp|avif|gif|svg|ico|pdf|mp4|webm|mov)$/i;

const DEFAULT_MAX_BYTES = 1024 * 1024;
const maxArg = process.argv.find((a) => a.startsWith('--max='));
const MAX_BYTES = Number(
  maxArg?.slice('--max='.length) ??
    process.env.IMAGE_MAX_BYTES ??
    DEFAULT_MAX_BYTES,
);
const STAGED_ONLY = process.argv.includes('--staged');

if (!Number.isFinite(MAX_BYTES) || MAX_BYTES <= 0) {
  console.error(`check-image-sizes: invalid limit ${MAX_BYTES}`);
  process.exit(2);
}

/** Recursively list asset paths inside `public/`. */
function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (ASSET_EXT.test(entry.name)) acc.push(full);
  }
  return acc;
}

/**
 * Files staged for commit (added, copied, modified, renamed) that live in
 * `public/` and currently exist on disk.
 */
function stagedAssets() {
  let out;
  try {
    out = execFileSync(
      'git',
      [
        'diff',
        '--cached',
        '--name-only',
        // ACMRT: added, copied, modified, renamed, type-changed. Deletions
        // are excluded, so removing an asset never trips the size check.
        '--diff-filter=ACMRT',
        '-z',
        '--',
        'public',
      ],
      {
        cwd: ROOT,
        encoding: 'utf8',
      },
    );
  } catch {
    return [];
  }
  return out
    .split('\0')
    .filter(Boolean)
    .map((rel) => path.join(ROOT, rel))
    .filter((full) => {
      if (!ASSET_EXT.test(full)) return false;
      try {
        // A path can be staged yet absent from disk (renames, partial staging).
        return statSync(full).isFile();
      } catch {
        return false;
      }
    });
}

const candidates = (STAGED_ONLY ? stagedAssets() : walk(PUBLIC_DIR))
  .map((full) => {
    let size = 0;
    try {
      size = statSync(full).size;
    } catch {
      return null;
    }
    return { rel: path.relative(ROOT, full).split(path.sep).join('/'), size };
  })
  .filter(Boolean);

const offenders = candidates
  .filter((f) => f.size > MAX_BYTES)
  .sort((a, b) => b.size - a.size);

const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

if (offenders.length === 0) {
  console.log(
    `check-image-sizes: OK — ${candidates.length} asset(s) checked, none over ${kib(MAX_BYTES)}.`,
  );
  process.exit(0);
}

console.error(
  `\ncheck-image-sizes: ${offenders.length} asset(s) exceed the ${kib(MAX_BYTES)} limit:\n`,
);
for (const f of offenders) {
  console.error(`  ${kib(f.size).padStart(11)}  ${f.rel}`);
}
console.error(`
${STAGED_ONLY ? 'Staged' : 'Found'} asset(s) are too heavy for the repository.

Fix by resizing to the size the page actually renders and re-encoding:

  ffmpeg -i <input> -vf "scale=2560:-2:flags=lanczos" -q:v 4 -pix_fmt yuvj420p <output.jpg>

Notes:
  - <Image>/<NextImage> re-encodes at runtime, so shrinking the source costs
    nothing visually but saves the bytes permanently.
  - Cap width at 2560px (covers the widest \`max-w-[1240px]\` container at 2x DPR).
  - Photo PNGs are the usual culprit; convert them to JPEG or WebP.
  - Raise the ceiling only for a deliberate exception, via --max=<bytes>.
`);

process.exit(1);
