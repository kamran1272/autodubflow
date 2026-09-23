import type { ProviderHealth } from '@autodubflow/media-shared';
import { estimateSpeechSeconds } from '@autodubflow/media-shared';
import { probeMedia } from '../../media/probe.js';
import { detectSilences } from '../../media/operations.js';
import type { SpeechToTextProvider, TranscriptionRequest, TranscriptionResult, TranscriptionSegment } from '../types.js';

/**
 * Deterministic offline speech-to-text provider.
 *
 * It performs REAL audio analysis (silence detection through FFmpeg) to derive
 * speech regions and timings, then fills those regions with a deterministic demo
 * script so the rest of the pipeline (alignment, TTS, mixing, rendering) runs
 * against genuine timings. Clearly reported as `provider: "mock"` everywhere.
 */

const DEMO_SCRIPT = [
  'Welcome to the product launch.',
  'Today we are introducing a faster way to localize your video content.',
  'Our team built an end to end pipeline that runs in minutes instead of weeks.',
  'You upload a single video file and the studio takes care of the rest.',
  'Speech is transcribed, translated, and re-voiced with a natural sounding voice.',
  'Every segment stays editable so you keep full control over the final result.',
  'When the dub is ready you can preview it, adjust the timing, and export.',
  'Let us walk through the workflow one step at a time.',
  'First we analyze the source file and extract the audio track.',
  'Then the transcript is generated with accurate word level timings.',
  'Next the dialogue is translated into the target language.',
  'Finally the localized voice is synchronized with the original video.',
  'That is how your message reaches a global audience without extra effort.',
  'Thanks for watching and enjoy the new studio.',
];

const FILLER = [
  'Here is the next part of the demonstration.',
  'The studio keeps working in the background while you review.',
  'You can fine tune every line before exporting the final cut.',
  'Preview the result and publish it when you are ready.',
];

interface Region {
  start: number;
  end: number;
}

function mergeShortRegions(regions: Region[], minDuration: number): Region[] {
  const merged: Region[] = [];
  for (const region of regions) {
    const previous = merged[merged.length - 1];
    if (previous && region.start - previous.end < 0.45) {
      previous.end = region.end;
    } else {
      merged.push({ ...region });
    }
  }
  return merged
    .map((region) => (region.end - region.start < minDuration ? { ...region, end: region.start + minDuration } : region))
    .filter((region) => region.end - region.start > 0.4);
}

function splitRegion(region: Region, maxDuration = 6): Region[] {
  const duration = region.end - region.start;
  if (duration <= maxDuration) return [region];
  const parts = Math.ceil(duration / maxDuration);
  const size = duration / parts;
  return Array.from({ length: parts }, (_, index) => ({
    start: region.start + index * size,
    end: region.start + (index + 1) * size - 0.05,
  }));
}

export function buildMockSegments(regions: Region[], durationSeconds: number): TranscriptionSegment[] {
  const segments: TranscriptionSegment[] = [];
  let working = regions.map((region) => ({ ...region }));
  if (working.length === 0) {
    const fallbackCount = Math.max(1, Math.min(12, Math.round(durationSeconds / 4) || 1));
    const size = Math.max(1.2, (durationSeconds || 3) / fallbackCount);
    working = Array.from({ length: fallbackCount }, (_, index) => ({
      start: index * size,
      end: Math.min(durationSeconds || size, (index + 1) * size),
    }));
  }

  const expanded = working.flatMap((region) => splitRegion(region)).filter((region) => region.end > region.start);
  expanded.forEach((region, index) => {
    const script = index < DEMO_SCRIPT.length ? DEMO_SCRIPT[index] : FILLER[index % FILLER.length];
    const available = region.end - region.start;
    const needed = estimateSpeechSeconds(script);
    const text = needed > available * 3 ? `${script.split('. ')[0]}.` : script;
    segments.push({
      index,
      start: Math.round(region.start * 1000) / 1000,
      end: Math.round(Math.max(region.end, region.start + 0.6) * 1000) / 1000,
      text,
      speakerId: 'speaker-1',
      speakerName: 'Speaker 1',
      confidence: 0.93,
    });
  });

  return segments;
}

export class MockSpeechToTextProvider implements SpeechToTextProvider {
  readonly name = 'mock';
  readonly mode = 'mock' as const;

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    const analysis = await probeMedia(request.audioPath);
    const durationSeconds = analysis.durationSeconds;

    let regions: Region[] = [];
    try {
      const silences = await detectSilences(request.audioPath, { noiseDb: -30, minSilenceSeconds: 0.4 });
      regions = [];
      let cursor = 0;
      for (const silence of silences) {
        if (silence.start - cursor > 0.4) regions.push({ start: cursor, end: silence.start });
        cursor = Math.max(cursor, silence.end);
      }
      if (durationSeconds - cursor > 0.4) regions.push({ start: cursor, end: durationSeconds });
      regions = mergeShortRegions(regions, 1.2);
    } catch {
      regions = [];
    }

    const segments = buildMockSegments(regions, durationSeconds);
    const text = segments.map((segment) => segment.text).join(' ');

    return {
      language: request.language ?? 'en',
      provider: this.name,
      model: 'mock-transcriber-v1',
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      confidence: 0.93,
      segments,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return { provider: this.name, kind: 'speech-to-text', mode: 'mock', configured: true, detail: 'Offline deterministic transcriber' };
  }
}
