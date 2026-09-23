#!/usr/bin/env node
/**
 * Verifies that the media tooling required by DubFlow is available and reports
 * the encoders/filters the dubbing pipeline depends on.
 *
 * Usage: node scripts/check-media-tools.mjs [--json]
 */
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);

function resolveBinary(envPath) {
  if (envPath && existsSync(envPath)) return envPath;
  try {
    const bundled = require('ffmpeg-static');
    if (bundled && existsSync(bundled)) return bundled;
  } catch {
    /* ffmpeg-static not installed */
  }
  return null;
}

const ffmpegPath = resolveBinary(process.env.FFMPEG_PATH);
let systemFfmpeg = null;
try {
  execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  systemFfmpeg = 'ffmpeg';
} catch {
  systemFfmpeg = null;
}

const binary = ffmpegPath ?? systemFfmpeg;

const run = (args) => {
  try {
    const output = execFileSync(binary, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return output;
  } catch (error) {
    return `${error?.stdout ?? ''}${error?.stderr ?? ''}`;
  }
};

const report = {
  ffmpegPath: binary,
  bundledBinary: ffmpegPath,
  systemFfmpeg,
  version: binary ? run(['-version']).split('\n')[0] : null,
  encoders: {},
  filters: {},
  ready: false,
};

if (binary) {
  const encoders = run(['-hide_banner', '-encoders']);
  for (const name of ['libx264', 'libmp3lame', 'aac', 'mpeg4', 'libopus', 'pcm_s16le']) {
    report.encoders[name] = new RegExp(`\\b${name}\\b`).test(encoders);
  }
  const filters = run(['-hide_banner', '-filters']);
  for (const name of ['subtitles', 'amix', 'adelay', 'apad', 'atrim', 'loudnorm', 'dynaudnorm', 'volume', 'afade', 'atempo', 'flite']) {
    report.filters[name] = new RegExp(`\\b${name}\\b`).test(filters);
  }
  report.ready = report.encoders.libx264 && report.encoders.aac && report.filters.amix && report.filters.adelay;
}

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log(`ffmpeg        : ${report.ffmpegPath ?? 'NOT FOUND'}`);
  console.log(`version       : ${report.version ?? 'n/a'}`);
  console.log(`encoders      : ${Object.entries(report.encoders).map(([k, v]) => `${k}=${v ? 'yes' : 'no'}`).join(' ')}`);
  console.log(`filters       : ${Object.entries(report.filters).map(([k, v]) => `${k}=${v ? 'yes' : 'no'}`).join(' ')}`);
  console.log(`pipeline ready: ${report.ready ? 'yes' : 'no'}`);
}

process.exit(report.ready ? 0 : 1);
