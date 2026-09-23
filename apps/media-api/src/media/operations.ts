import { basename, dirname, join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { ProcessingError } from '../lib/errors.js';
import { runFfmpeg, runFfmpegToBuffer, runFfmpegTolerant, hasFilter } from './ffmpeg.js';
import { probeMedia, parseDurationToSeconds } from './probe.js';

export const AUDIO_SAMPLE_RATE = 24_000;

export async function extractAudio(
  input: string,
  output: string,
  options: { sampleRate?: number; channels?: number } = {},
): Promise<void> {
  const sampleRate = options.sampleRate ?? 16_000;
  const channels = options.channels ?? 1;
  await runFfmpeg([
    '-i',
    input,
    '-vn',
    '-ac',
    String(channels),
    '-ar',
    String(sampleRate),
    '-c:a',
    'pcm_s16le',
    output,
  ]);
}

export async function convertAudio(
  input: string,
  output: string,
  options: { sampleRate?: number; channels?: number; normalize?: boolean } = {},
): Promise<void> {
  const sampleRate = options.sampleRate ?? AUDIO_SAMPLE_RATE;
  const channels = options.channels ?? 1;
  const filters = [`aresample=${sampleRate}`];
  if (options.normalize) filters.push('dynaudnorm=f=200:g=15');
  await runFfmpeg([
    '-i',
    input,
    '-vn',
    '-af',
    filters.join(','),
    '-ac',
    String(channels),
    '-ar',
    String(sampleRate),
    '-c:a',
    'pcm_s16le',
    output,
  ]);
}

export async function createSilence(
  seconds: number,
  output: string,
  options: { sampleRate?: number; channels?: number } = {},
): Promise<void> {
  const duration = Math.max(0.01, seconds);
  const sampleRate = options.sampleRate ?? AUDIO_SAMPLE_RATE;
  const channels = options.channels ?? 1;
  await runFfmpeg([
    '-f',
    'lavfi',
    '-i',
    `anullsrc=channel_layout=${channels === 1 ? 'mono' : 'stereo'}:sample_rate=${sampleRate}`,
    '-t',
    duration.toFixed(3),
    '-c:a',
    'pcm_s16le',
    output,
  ]);
}

export async function extractWaveform(file: string, buckets = 200): Promise<number[]> {
  const sampleRate = 8_000;
  const buffer = await runFfmpegToBuffer([
    '-i',
    file,
    '-vn',
    '-ac',
    '1',
    '-ar',
    String(sampleRate),
    '-f',
    's16le',
    '-acodec',
    'pcm_s16le',
    '-',
  ]);
  const samples = Math.floor(buffer.length / 2);
  if (samples === 0) return [];

  const perBucket = Math.max(1, Math.floor(samples / buckets));
  const peaks: number[] = [];
  for (let bucketIndex = 0; bucketIndex < buckets; bucketIndex += 1) {
    const start = bucketIndex * perBucket;
    if (start >= samples) break;
    const end = Math.min(samples, start + perBucket);
    let peak = 0;
    for (let i = start; i < end; i += 1) {
      const value = Math.abs(buffer.readInt16LE(i * 2)) / 32768;
      if (value > peak) peak = value;
    }
    peaks.push(Math.round(peak * 1000) / 1000);
  }
  return peaks;
}

/** Detects silent regions, used for speaker turn detection and QA checks. */
export async function detectSilences(
  file: string,
  options: { noiseDb?: number; minSilenceSeconds?: number } = {},
): Promise<Array<{ start: number; end: number }>> {
  const noise = options.noiseDb ?? -32;
  const minSilence = options.minSilenceSeconds ?? 0.35;
  const result = await runFfmpegTolerant([
    '-i',
    file,
    '-af',
    `silencedetect=noise=${noise}dB:d=${minSilence}`,
    '-f',
    'null',
    '-',
  ]);

  const silences: Array<{ start: number; end: number }> = [];
  const pattern = /silence_start:\s*([\d.]+)[\s\S]*?silence_end:\s*([\d.]+)/g;
  let match = pattern.exec(result.stderr);
  while (match) {
    silences.push({ start: Number(match[1]), end: Number(match[2]) });
    match = pattern.exec(result.stderr);
  }
  return silences;
}

/** Changes playback speed, chaining atempo filters when the ratio is extreme. */
export async function changeTempo(input: string, output: string, factor: number): Promise<number> {
  const target = Math.min(4, Math.max(0.25, factor));
  const filters: string[] = [];
  let remaining = target;
  while (remaining > 2.0) {
    filters.push('atempo=2.0');
    remaining /= 2.0;
  }
  while (remaining < 0.5) {
    filters.push('atempo=0.5');
    remaining /= 0.5;
  }
  filters.push(`atempo=${remaining.toFixed(4)}`);
  await runFfmpeg(['-i', input, '-af', filters.join(','), '-c:a', 'pcm_s16le', output]);
  return target;
}

/**
 * Concatenates WAV files that share the same codec/rate/channel layout. Used to
 * assemble the dubbed timeline from silence gaps and per-segment voice clips.
 */
export async function concatAudio(files: string[], output: string): Promise<void> {
  if (files.length === 0) throw new ProcessingError('No audio clips were provided for concatenation.');
  if (files.length === 1) {
    await runFfmpeg(['-i', files[0], '-c', 'copy', output]);
    return;
  }

  const workDir = dirname(output);
  const listPath = join(workDir, `${basename(output, '.wav')}-list.txt`);
  const listContent = files
    .map((file) => `file '${join(workDir, basename(file)).replace(/\\/g, '/').replace(/'/g, "'\\''")}'`)
    .join('\n');
  await writeFile(listPath, `${listContent}\n`, 'utf8');

  await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', output]);
}

/**
 * Mixes multiple tracks (dubbed voice + original audio bed) into a single
 * audio file, optionally normalising the result with loudnorm.
 */
export async function mixTracks(
  tracks: Array<{ file: string; volume: number; delaySeconds?: number }>,
  output: string,
  options: { durationSeconds?: number; normalize?: boolean; sampleRate?: number } = {},
): Promise<void> {
  if (tracks.length === 0) throw new ProcessingError('No audio tracks were provided for mixing.');
  const sampleRate = options.sampleRate ?? AUDIO_SAMPLE_RATE;

  if (tracks.length === 1 && !options.normalize) {
    const track = tracks[0];
    const filters = [`volume=${track.volume.toFixed(2)}`, `aresample=${sampleRate}`];
    if (track.delaySeconds) {
      filters.unshift(`adelay=${Math.round(track.delaySeconds * 1000)}|${Math.round(track.delaySeconds * 1000)}`);
    }
    await runFfmpeg(['-i', track.file, '-af', filters.join(','), '-c:a', 'pcm_s16le', output]);
    return;
  }

  const inputs = tracks.flatMap((track) => ['-i', track.file]);
  const filterParts = tracks.map((track, index) => {
    const chain = [`volume=${track.volume.toFixed(2)}`];
    if (track.delaySeconds) {
      chain.unshift(`adelay=${Math.round(track.delaySeconds * 1000)}|${Math.round(track.delaySeconds * 1000)}`);
    }
    return `[${index}:a]${chain.join(',')}[t${index}]`;
  });
  const mixInputs = tracks.map((_, index) => `[t${index}]`).join('');
  const mixChain = `${mixInputs}amix=inputs=${tracks.length}:duration=longest:normalize=0[mixed]`;
  const post = options.normalize
    ? `[mixed]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=${sampleRate}[out]`
    : `[mixed]aresample=${sampleRate}[out]`;

  await runFfmpeg([
    ...inputs,
    '-filter_complex',
    [...filterParts, mixChain, post].join(';'),
    '-map',
    '[out]',
    ...(options.durationSeconds ? ['-t', options.durationSeconds.toFixed(3)] : []),
    '-ac',
    '1',
    '-c:a',
    'pcm_s16le',
    output,
  ]);
}

/** Replaces the audio track of a video without re-encoding the video stream. */
export async function replaceVideoAudio(
  video: string,
  audio: string,
  output: string,
  options: { copyVideo?: boolean; bitrate?: string } = {},
): Promise<void> {
  const copyVideo = options.copyVideo ?? true;
  await runFfmpeg([
    '-i',
    video,
    '-i',
    audio,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-c:v',
    copyVideo ? 'copy' : 'libx264',
    ...(copyVideo ? [] : ['-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p']),
    '-c:a',
    'aac',
    '-b:a',
    options.bitrate ?? '192k',
    '-shortest',
    '-movflags',
    '+faststart',
    output,
  ]);
}

export async function fitClipToSlot(
  input: string,
  output: string,
  slotSeconds: number,
  options: { maxSpeedUp?: number; sampleRate?: number } = {},
): Promise<{ sourceDuration: number; speed: number; overflowed: boolean }> {
  const sampleRate = options.sampleRate ?? AUDIO_SAMPLE_RATE;
  const maxSpeedUp = options.maxSpeedUp ?? 1.6;
  const analysis = await probeMedia(input);
  const sourceDuration = analysis.durationSeconds;
  const slot = Math.max(0.2, slotSeconds);

  const filter: string[] = [];
  let speed = 1;
  let overflowed = false;

  if (sourceDuration > slot && options.maxSpeedUp !== 1) {
    const desired = sourceDuration / slot;
    speed = Math.min(maxSpeedUp, desired);
    if (speed > 1.02) {
      let remaining = speed;
      while (remaining > 2.0) {
        filter.push('atempo=2.0');
        remaining /= 2.0;
      }
      filter.push(`atempo=${remaining.toFixed(4)}`);
    }
    overflowed = desired > maxSpeedUp;
  }

  filter.push(`apad`, `atrim=0:${slot.toFixed(3)}`, `asetpts=N/SR/TB`, `aresample=${sampleRate}`);

  await runFfmpeg([
    '-i',
    input,
    '-af',
    filter.join(','),
    '-t',
    slot.toFixed(3),
    '-ac',
    '1',
    '-ar',
    String(sampleRate),
    '-c:a',
    'pcm_s16le',
    output,
  ]);

  return { sourceDuration, speed, overflowed };
}

/**
 * Renders subtitles into the video. Prefers hard burn-in when the subtitles
 * filter (libass) exists, otherwise muxes a soft subtitle stream - the caller
 * learns which strategy was used through the return value.
 */
export async function renderSubtitles(
  video: string,
  subtitleFile: string,
  output: string,
  options: { burnIn: boolean; audioFile?: string; fontSize?: number; language?: string } = { burnIn: true },
): Promise<'burn' | 'soft'> {
  const canBurn = await hasFilter('subtitles');
  const workDir = dirname(output);
  const subtitleName = basename(subtitleFile);
  const inputs = options.audioFile ? ['-i', video, '-i', options.audioFile] : ['-i', video];

  if (options.burnIn && canBurn) {
    const style = `FontName=Arial,FontSize=${options.fontSize ?? 22},Outline=1,Shadow=0,MarginV=28`;
    await runFfmpeg(
      [
        ...inputs,
        '-vf',
        `subtitles=${subtitleName}:force_style='${style}'`,
        '-map',
        '0:v:0',
        ...(options.audioFile ? ['-map', '1:a:0'] : ['-map', '0:a?']),
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '20',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-shortest',
        '-movflags',
        '+faststart',
        output,
      ],
      { cwd: workDir },
    );
    return 'burn';
  }

  const isMp4 = /\.(mp4|mov|m4v)$/i.test(output);
  await runFfmpeg(
    [
      ...inputs,
      '-i',
      subtitleFile,
      '-map',
      '0:v:0',
      ...(options.audioFile ? ['-map', '1:a:0'] : ['-map', '0:a?']),
      '-map',
      options.audioFile ? '2:0' : '1:0',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-c:s',
      isMp4 ? 'mov_text' : 'srt',
      ...(isMp4 ? ['-metadata:s:s:0', `language=${options.language ?? 'spa'}`] : []),
      '-shortest',
      '-movflags',
      '+faststart',
      output,
    ],
    { cwd: workDir },
  );
  return 'soft';
}

export async function generateThumbnail(video: string, output: string, atSeconds = 1): Promise<void> {
  const analysis = await probeMedia(video);
  const timestamp = analysis.durationSeconds > 2 ? Math.min(atSeconds, analysis.durationSeconds / 2) : 0;
  await runFfmpeg([
    '-ss',
    timestamp.toFixed(2),
    '-i',
    video,
    '-frames:v',
    '1',
    '-vf',
    'scale=640:-2',
    '-q:v',
    '3',
    output,
  ]);
}

