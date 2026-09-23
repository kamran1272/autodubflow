import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, join } from 'node:path';
import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { ProcessingError } from '../lib/errors.js';
import { fileSize } from '../lib/fs.js';
import type { MediaAnalysis } from '@autodubflow/media-shared';

const require = createRequire(import.meta.url);

let cachedFfmpeg: string | null | undefined;
let cachedFfprobe: string | null | undefined;
let cachedFilters: string | null = null;

/**
 * Resolution order for the ffmpeg binary: explicit FFMPEG_PATH, the bundled
 * ffmpeg-static binary, then whatever is on the PATH.
 */
export function resolveFfmpegPath(): string | null {
  if (cachedFfmpeg !== undefined) return cachedFfmpeg;

  const candidates: Array<string | null> = [];
  if (env.FFMPEG_PATH) candidates.push(env.FFMPEG_PATH);
  try {
    const bundled = require('ffmpeg-static') as string | null;
    if (bundled) candidates.push(bundled);
  } catch {
    /* ffmpeg-static is optional when a system binary is present */
  }

  cachedFfmpeg = candidates.find((candidate) => candidate && existsSync(candidate)) ?? null;
  return cachedFfmpeg;
}

export function resolveFfprobePath(): string | null {
  if (cachedFfprobe !== undefined) return cachedFfprobe;
  if (env.FFPROBE_PATH && existsSync(env.FFPROBE_PATH)) {
    cachedFfprobe = env.FFPROBE_PATH;
    return cachedFfprobe;
  }
  const ffmpeg = resolveFfmpegPath();
  if (ffmpeg) {
    const sibling = join(ffmpeg.replace(/ffmpeg(\.exe)?$/, (match) => match.replace('ffmpeg', 'ffprobe')), '');
    if (existsSync(sibling)) {
      cachedFfprobe = sibling;
      return cachedFfprobe;
    }
  }
  cachedFfprobe = null;
  return cachedFfprobe;
}

export function requireFfmpeg(): string {
  const path = resolveFfmpegPath();
  if (!path) {
    throw new ProcessingError(
      'FFmpeg was not found. Install ffmpeg or provide FFMPEG_PATH so media processing can run.',
    );
  }
  return path;
}

export interface ProcessResult {
  stdout: string;
  stderr: string;
  code: number;
}

export interface RunOptions {
  cwd?: string;
  timeoutMs?: number;
  label?: string;
}

export function runBinary(binary: string, args: string[], options: RunOptions = {}): Promise<ProcessResult> {
  const timeoutMs = options.timeoutMs ?? 15 * 60 * 1000;
  const label = options.label ?? basename(binary);

  return new Promise<ProcessResult>((resolve, reject) => {
    const child = spawn(binary, args, {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    const started = Date.now();

    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new ProcessingError(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
      if (stdout.length > 4_000_000) stdout = stdout.slice(-1_000_000);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 4_000_000) stderr = stderr.slice(-1_000_000);
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(new ProcessingError(`${label} could not be started: ${error.message}`));
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - started;
      if (code === 0) {
        resolve({ stdout, stderr, code: code ?? 0 });
      } else {
        logger.error({ label, code, durationMs, args: args.slice(0, 40), stderr: stderr.slice(-4000) }, 'media command failed');
        reject(new ProcessingError(`${label} exited with code ${code}`, { stderr: stderr.slice(-2000) }));
      }
    });
  });
}

/** Runs ffmpeg with -y so outputs are always overwritten. */
export async function runFfmpeg(args: string[], options: RunOptions = {}): Promise<ProcessResult> {
  const binary = requireFfmpeg();
  return runBinary(binary, ['-hide_banner', '-nostdin', '-y', ...args], { label: 'ffmpeg', ...options });
}

/**
 * Runs ffmpeg without failing on a non-zero exit code. Used for the
 * `ffmpeg -i file` probe which intentionally exits with code 1 while still
 * printing the media metadata on stderr.
 */
export async function runFfmpegTolerant(args: string[], options: RunOptions = {}): Promise<ProcessResult> {
  const binary = requireFfmpeg();
  try {
    return await runBinary(binary, ['-hide_banner', '-nostdin', ...args], { label: 'ffmpeg', ...options });
  } catch (error) {
    if (error instanceof ProcessingError) {
      const details = error.details as { stderr?: string } | undefined;
      return { stdout: '', stderr: details?.stderr ?? '', code: 1 };
    }
    throw error;
  }
}

/**
 * Runs ffmpeg and returns raw stdout as a Buffer. Required for the binary
 * output formats (raw PCM) used by waveform extraction.
 */
export async function runFfmpegToBuffer(args: string[], options: RunOptions = {}): Promise<Buffer> {
  const binary = requireFfmpeg();
  const timeoutMs = options.timeoutMs ?? 15 * 60 * 1000;

  return new Promise<Buffer>((resolve, reject) => {
    const child = spawn(binary, ['-hide_banner', '-nostdin', '-y', ...args], {
      cwd: options.cwd,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const chunks: Buffer[] = [];
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new ProcessingError(`ffmpeg timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
      if (stderr.length > 200_000) stderr = stderr.slice(-50_000);
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(new ProcessingError(`ffmpeg could not be started: ${error.message}`));
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(Buffer.concat(chunks));
      else reject(new ProcessingError(`ffmpeg exited with code ${code}`, { stderr: stderr.slice(-2000) }));
    });
  });
}

export async function availableFilters(): Promise<string> {
  if (cachedFilters !== null) return cachedFilters;
  try {
    const result = await runFfmpeg(['-filters'], { timeoutMs: 60_000 });
    cachedFilters = result.stdout;
  } catch {
    cachedFilters = '';
  }
  return cachedFilters ?? '';
}

export async function hasFilter(name: string): Promise<boolean> {
  const filters = await availableFilters();
  return new RegExp(`\\b${name}\\b`).test(filters);
}
