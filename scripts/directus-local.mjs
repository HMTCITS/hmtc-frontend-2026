#!/usr/bin/env node
// Local Directus for CMS development (compose.directus.yml).
//
//   node scripts/directus-local.mjs setup   start + schema + migrations + seed
//   node scripts/directus-local.mjs down    stop, keep data
//   node scripts/directus-local.mjs reset   stop and delete local data
//
// Cross-platform: needs only Docker (with Compose v2) and Node.
// Every step is idempotent, so `setup` can be re-run after pulling new
// migrations or seed files.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const compose = ['compose', '-f', path.join(root, 'compose.directus.yml')];
const PSQL = [
  'exec',
  '-T',
  'directus_postgres',
  'psql',
  '-U',
  'directuspg',
  '-d',
  'directusdb',
  '-v',
  'ON_ERROR_STOP=1',
  '-q',
];
// Production baseline is 002 (captured by directus/snapshot.json +
// directus/post-snapshot.sql). Only later migrations are applied locally.
const FIRST_LOCAL_MIGRATION = 3;

function docker(args, { input, capture = false } = {}) {
  const res = spawnSync('docker', [...compose, ...args], {
    cwd: root,
    input,
    encoding: 'utf8',
    stdio: [
      input === undefined ? 'inherit' : 'pipe',
      capture ? 'pipe' : 'inherit',
      'inherit',
    ],
  });
  if (res.error) {
    console.error(`Could not run docker: ${res.error.message}`);
    process.exit(1);
  }
  if (res.status !== 0) {
    console.error(`docker ${args.join(' ')} failed (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
  return res.stdout ?? '';
}

const step = (msg) => console.log(`\n▸ ${msg}`);
const sql = (file) => docker(PSQL, { input: fs.readFileSync(file, 'utf8') });
const sqlValue = (query) =>
  docker([...PSQL, '-At', '-c', query], { capture: true }).trim();

function applyMigrations() {
  sqlValue(
    'CREATE TABLE IF NOT EXISTS hmtc_local_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  const applied = new Set(
    sqlValue('SELECT name FROM hmtc_local_migrations')
      .split('\n')
      .filter(Boolean),
  );
  const dir = path.join(root, 'scripts', 'directus-schema');
  const pending = fs
    .readdirSync(dir)
    .filter((f) => /^\d{3}-.+\.up\.sql$/.test(f))
    .filter((f) => Number(f.slice(0, 3)) >= FIRST_LOCAL_MIGRATION)
    .sort()
    .filter((f) => !applied.has(f));
  if (pending.length === 0) console.log('  no pending migrations');
  for (const file of pending) {
    console.log(`  applying ${file}`);
    sql(path.join(dir, file));
    sqlValue(`INSERT INTO hmtc_local_migrations (name) VALUES ('${file}')`);
  }
}

function setup() {
  step('Starting Directus and Postgres');
  docker(['up', '-d', '--wait']);

  step('Applying the production schema snapshot');
  docker([
    'exec',
    '-T',
    'directus',
    'node',
    '/directus/cli.js',
    'schema',
    'apply',
    '--yes',
    '/directus/hmtc/snapshot.json',
  ]);

  step('Applying constraints the snapshot cannot carry');
  sql(path.join(root, 'directus', 'post-snapshot.sql'));

  step('Applying migrations 003+');
  applyMigrations();

  step('Seeding local data');
  const seedDir = path.join(root, 'directus', 'seed');
  for (const file of fs
    .readdirSync(seedDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    console.log(`  ${file}`);
    sql(path.join(seedDir, file));
  }

  // Directus caches its introspected schema; DDL done outside it stays
  // invisible until restart (decision log, N8).
  step('Restarting Directus');
  docker(['restart', 'directus']);
  docker(['up', '-d', '--wait']);

  console.log(`
Directus is ready: http://localhost:8055
  admin: admin@example.com / admin-local
  guide: docs/local-development.md`);
}

const cmd = process.argv[2];
if (cmd === 'setup') setup();
else if (cmd === 'down') docker(['down']);
else if (cmd === 'reset') docker(['down', '-v']);
else {
  console.log('Usage: node scripts/directus-local.mjs <setup|down|reset>');
  process.exit(cmd ? 1 : 0);
}
