import { join } from 'node:path';
import { ProcessingError } from '../lib/errors.js';
import { concatAudio, createSilence, AUDIO_SAMPLE_RATE } from './operations.js';

export interface TimelineClip {
  file: string;
  start: number;
  duration: number;
}

/**
 * Assembles the dubbed voice track by walking the transcript timeline and
 * placing each generated clip at its original start time, filling the gaps with
 * silence. Every clip is expected to already fit its slot (see
 * `fitClipToSlot`), which keeps the final track aligned with the source video.
 */
export async function buildTimelineAudio(
  clips: TimelineClip[],
  output: string,
  options: { totalDurationSeconds: number; sampleRate?: number; workDir?: string },
): Promise<{ clipCount: number; silenceCount: number; totalDuration: number }> {
  if (clips.length === 0) throw new ProcessingError('Cannot build a dubbed track without any clips.');

  const sampleRate = options.sampleRate ?? AUDIO_SAMPLE_RATE;
  const workDir = options.workDir ?? join(output, '..');
  const ordered = [...clips].sort((a, b) => a.start - b.start);

  const files: string[] = [];
  let cursor = 0;
  let silenceCount = 0;

  for (const [index, clip] of ordered.entries()) {
    const gap = clip.start - cursor;
    if (gap > 0.02) {
      const silenceFile = join(workDir, `gap-${String(index).padStart(4, '0')}.wav`);
      await createSilence(gap, silenceFile, { sampleRate });
      files.push(silenceFile);
      silenceCount += 1;
      cursor += gap;
    }
    files.push(clip.file);
    cursor += clip.duration;
  }

  const trailing = options.totalDurationSeconds - cursor;
  if (trailing > 0.02) {
    const tailFile = join(workDir, 'tail.wav');
    await createSilence(trailing, tailFile, { sampleRate });
    files.push(tailFile);
  }

  await concatAudio(files, output);
  return { clipCount: ordered.length, silenceCount, totalDuration: Math.max(cursor, options.totalDurationSeconds) };
}
