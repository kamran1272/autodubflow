import { existsSync } from 'node:fs';
import { mkdir, rm, stat, readdir } from 'node:fs/promises';
import { basename, extname, join, normalize, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';

export async function ensureDir(path: string): Promise<string> {
  await mkdir(path, { recursive: true });
  return path;
}

export async function removeDir(path: string): Promise<void> {
  await rm(path, { recursive: true, force: true });
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export function fileExistsSync(path: string): boolean {
  return existsSync(path);
}

export async function fileSize(path: string): Promise<number> {
  try {
    const info = await stat(path);
    return info.size;
  } catch {
    return 0;
  }
}

/**
 * Joins a user supplied key onto a root directory while guaranteeing that the
 * result stays inside the root. Prevents path traversal from storage keys or
 * uploaded filenames.
 */
export function safeJoin(root: string, key: string): string {
  const cleanKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
  const target = resolve(root, normalize(cleanKey));
  const rootResolved = resolve(root);
  if (target !== rootResolved && !target.startsWith(rootResolved + sep)) {
    throw new Error(`Refusing to resolve path outside of storage root: ${key}`);
  }
  return target;
}

/** Removes directories and characters that are unsafe for filenames. */
export function sanitizeFilename(name: string, fallback = 'file'): string {
  const base = basename(name).replace(/[^\w\s.-]/g, '_').replace(/\s+/g, '_').slice(0, 120);
  return base.length > 0 ? base : fallback;
}

export function fileExtension(name: string, fallback = ''): string {
  const extension = extname(name).toLowerCase();
  return extension || fallback;
}

export function buildStorageKey(namespace: string, extension: string, prefix?: string): string {
  const id = randomUUID();
  const folder = prefix ? `${prefix.replace(/[^\w-]/g, '')}/` : '';
  return `${namespace}/${folder}${id}${extension.startsWith('.') || extension === '' ? extension : `.${extension}`}`;
}

/** Temporary working directory used by media jobs, always cleaned up by callers. */
export async function createWorkDir(root: string, label: string): Promise<string> {
  const dir = join(root, `${label.replace(/[^\w-]/g, '')}-${randomUUID()}`);
  await ensureDir(dir);
  return dir;
}

export async function listFiles(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}
