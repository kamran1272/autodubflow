#!/usr/bin/env node
/**
 * Derives the SQLite variant of `prisma/schema.prisma`.
 *
 * Prisma does not allow the datasource provider to come from an environment
 * variable, so local development and the automated test suite run against a
 * generated SQLite schema while production uses PostgreSQL. The canonical
 * schema deliberately avoids provider-specific features (no enums, no scalar
 * lists, no `@db.*` attributes) which keeps the generated Prisma Client types
 * identical for both providers.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(root, 'prisma/schema.prisma');
const targetPath = resolve(root, 'prisma/schema.sqlite.prisma');

const source = readFileSync(sourcePath, 'utf8');
const datasourcePattern = /datasource\s+db\s*\{[^}]*\}/m;
const datasource = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;

if (!datasourcePattern.test(source)) {
  console.error('Unable to locate the datasource block in prisma/schema.prisma');
  process.exit(1);
}

const derived = source
  .replace(datasourcePattern, datasource)
  .replace(
    /^\/\/ DubFlow database schema\./m,
    '// GENERATED FILE - do not edit.\n// SQLite variant of prisma/schema.prisma for local development and tests.\n// Regenerate with: pnpm db:sqlite',
  )
  .replace(/\s*@db\.[A-Za-z0-9]+(\([^)]*\))?/g, '');

mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, derived, 'utf8');
console.log(`Wrote ${targetPath} (sqlite provider)`);
