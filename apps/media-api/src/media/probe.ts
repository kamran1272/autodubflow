import type { MediaAnalysis } from '@autodubflow/media-shared';
import { ProcessingError } from '../lib/errors.js';
import { fileSize } from '../lib/fs.js';
import { resolveFfprobePath, runBinary, runFfmpegTolerant } from './ffmpeg.js';

interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  avg_frame_rate?: string;
  sample_rate?: string;
  channels?: number;
  bit_rate?: string;
  duration?: string;
}

interface FfprobeResult {
  streams?: FfprobeStream[];
  format?: {
    duration?: string;
    bit_rate?: string;
    format_name?: string;
    size?: string;
  };
}

function parseFrameRate(value?: string): number | null {
  if (!value) return null;
  const [numerator, denominator] = value.split('/').map((part) => Number(part));
  if (!numerator || !denominator) return null;
  const fps = numerator / denominator;
  return Number.isFinite(fps) ? Math.round(fps * 1000) / 1000 : null;
}

function parseDurationToSeconds(value?: string | null): number | null {
  if (!value) return null;
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value);

  const match = /(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(value);
  if (!match) return null;
  const [, hours, minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

async function probeWithFfprobe(file: string): Promise<MediaAnalysis | null> {
  const ffprobe = resolveFfprobePath();
  if (!ffprobe) return null;

  const result = await runBinary(
    ffprobe,
    ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', file],
    { label: 'ffprobe', timeoutMs: 60_000 },
  );

  const data = JSON.parse(result.stdout || '{}') as FfprobeResult;
  const video = data.streams?.find((stream) => stream.codec_type === 'video');
  const audio = data.streams?.find((stream) => stream.codec_type === 'audio');

  return {
    durationSeconds: parseDurationToSeconds(data.format?.duration) ?? parseDurationToSeconds(video?.duration) ?? 0,
    width: video?.width ?? null,
    height: video?.height ?? null,
    fps: parseFrameRate(video?.avg_frame_rate ?? video?.r_frame_rate),
    videoCodec: video?.codec_name ?? null,
    audioCodec: audio?.codec_name ?? null,
    sampleRate: audio?.sample_rate ? Number(audio.sample_rate) : null,
    channels: audio?.channels ?? null,
    bitrate: data.format?.bit_rate ? Number(data.format.bit_rate) : null,
    hasAudio: Boolean(audio),
    hasVideo: Boolean(video),
    formatName: data.format?.format_name ?? null,
    sizeBytes: Number(data.format?.size ?? (await fileSize(file))),
  };
}

function probeFromFfmpegOutput(stderr: string, size: number): MediaAnalysis {
  const duration = parseDurationToSeconds(/Duration:\s*([\d:.]+)/.exec(stderr)?.[1]);
  const bitrate = Number(/bitrate:\s*(\d+)\s*kb\/s/.exec(stderr)?.[1] ?? 0) || null;

  const videoLine = /Stream #\d+:\d+.*?:\s*Video:\s*([^\n]*)/.exec(stderr)?.[1] ?? null;
  const audioLine = /Stream #\d+:\d+.*?:\s*Audio:\s*([^\n]*)/.exec(stderr)?.[1] ?? null;

  const videoCodec = videoLine ? /^([a-zA-Z0-9_]+)/.exec(videoLine)?.[1] ?? null : null;
  const dimensions = videoLine ? /(\d{2,5})x(\d{2,5})/.exec(videoLine) : null;
  const fps = videoLine ? Number(/(\d+(?:\.\d+)?)\s*fps/.exec(videoLine)?.[1] ?? 0) || null : null;

  const audioCodec = audioLine ? /^([a-zA-Z0-9_]+)/.exec(audioLine)?.[1] ?? null : null;
  const sampleRate = audioLine ? Number(/(\d{4,6})\s*Hz/.exec(audioLine)?.[1] ?? 0) || null : null;
  const channels = audioLine
    ? /mono/.test(audioLine)
      ? 1
      : /stereo/.test(audioLine)
        ? 2
        : Number(/(\d+(?:\.\d+)?)\s*channels/.exec(audioLine)?.[1] ?? 0) || null
    : null;

  return {
    durationSeconds: duration ?? 0,
    width: dimensions ? Number(dimensions[1]) : null,
    height: dimensions ? Number(dimensions[2]) : null,
    fps,
    videoCodec,
    audioCodec,
    sampleRate,
    channels,
    bitrate: bitrate ? bitrate * 1000 : null,
    hasAudio: Boolean(audioLine),
    hasVideo: Boolean(videoLine),
    formatName: /Input #0,\s*([^,]+),/.exec(stderr)?.[1]?.trim() ?? null,
    sizeBytes: size,
  };
}

/**
 * Detects duration, resolution, codecs and stream layout. Prefers ffprobe and
 * transparently falls back to parsing `ffmpeg -i`, so no ffprobe binary is
 * required for the pipeline to work.
 */
export async function probeMedia(file: string): Promise<MediaAnalysis> {
  const size = await fileSize(file);
  if (size <= 0) throw new ProcessingError(`Media file is empty or missing: ${file}`);

  try {
    const viaFfprobe = await probeWithFfprobe(file);
    if (viaFfprobe && viaFfprobe.durationSeconds > 0) return viaFfprobe;
    if (viaFfprobe && (viaFfprobe.hasVideo || viaFfprobe.hasAudio)) return viaFfprobe;
  } catch {
    /* fall through to the ffmpeg probe */
  }

  const result = await runFfmpegTolerant(['-i', file]);
  const analysis = probeFromFfmpegOutput(result.stderr, size);
  if (!analysis.hasVideo && !analysis.hasAudio) {
    throw new ProcessingError('The uploaded file could not be decoded as audio or video.', {
      stderr: result.stderr.slice(-1000),
    });
  }
  return analysis;
}

export async function probeDuration(file: string): Promise<number> {
  const analysis = await probeMedia(file);
  return analysis.durationSeconds;
}

export { parseDurationToSeconds };
