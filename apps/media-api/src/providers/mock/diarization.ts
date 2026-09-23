import type { ProviderHealth } from '@autodubflow/media-shared';
import { detectSilences } from '../../media/operations.js';
import type { DiarizationRequest, DiarizationResult, DiarizationSpeaker, SpeakerDiarizationProvider } from '../types.js';

/**
 * Offline speaker diarization provider.
 *
 * Speaker turns are inferred from the REAL audio: pauses detected with FFmpeg's
 * silencedetect plus simple conversational heuristics (short questions and
 * interjections start a new turn). This gives the studio a realistic speaker
 * mapping to edit, and is always reported as `provider: "mock"`.
 */

const MAX_SPEAKERS = 3;
const TURN_PAUSE_SECONDS = 0.75;

function isQuestion(text: string): boolean {
  return text.trim().endsWith('?');
}

function isShortInterjection(text: string, duration: number): boolean {
  return duration < 2.2 && text.trim().split(/\s+/).length <= 5;
}

export class MockSpeakerDiarizationProvider implements SpeakerDiarizationProvider {
  readonly name = 'mock';
  readonly mode = 'mock' as const;

  async diarize(request: DiarizationRequest): Promise<DiarizationResult> {
    const pauses: Array<{ start: number; end: number }> = [];
    try {
      pauses.push(...(await detectSilences(request.audioPath, { noiseDb: -30, minSilenceSeconds: TURN_PAUSE_SECONDS })));
    } catch {
      /* the turn heuristics below still work without silence data */
    }

    const assignments: DiarizationResult['assignments'] = [];
    let currentSpeaker = 1;
    let previousEnd = 0;

    request.segments.forEach((segment, position) => {
      const duration = Math.max(0, segment.end - segment.start);
      const gap = segment.start - previousEnd;
      const pauseCrossed = pauses.some((pause) => pause.end > previousEnd && pause.start >= segment.start - gap - 0.2);

      if (position > 0) {
        const turnChange = gap > TURN_PAUSE_SECONDS || pauseCrossed;
        if (turnChange && currentSpeaker < MAX_SPEAKERS) {
          currentSpeaker = currentSpeaker === 1 ? 2 : currentSpeaker === 2 ? 1 : 3;
        }
        if (isQuestion(segment.text) && currentSpeaker === 1 && position > 1) currentSpeaker = 2;
        if (isShortInterjection(segment.text, duration) && gap > 0.2 && currentSpeaker !== 2) currentSpeaker = 2;
      }

      assignments.push({ index: segment.index, speakerId: `speaker-${currentSpeaker}`, speakerName: `Speaker ${currentSpeaker}` });
      previousEnd = segment.end;
    });

    const speakers: DiarizationSpeaker[] = [];
    for (const assignment of assignments) {
      const segment = request.segments.find((candidate) => candidate.index === assignment.index);
      const existing = speakers.find((speaker) => speaker.speakerId === assignment.speakerId);
      const duration = segment ? Math.max(0, segment.end - segment.start) : 0;
      if (existing) {
        existing.segmentCount += 1;
        existing.totalDuration = Math.round((existing.totalDuration + duration) * 1000) / 1000;
        existing.firstStart = Math.min(existing.firstStart, segment?.start ?? existing.firstStart);
        existing.lastEnd = Math.max(existing.lastEnd, segment?.end ?? existing.lastEnd);
      } else {
        speakers.push({
          speakerId: assignment.speakerId,
          speakerName: assignment.speakerName,
          segmentCount: 1,
          totalDuration: Math.round(duration * 1000) / 1000,
          firstStart: segment?.start ?? 0,
          lastEnd: segment?.end ?? 0,
        });
      }
    }

    return { provider: this.name, speakers: speakers.sort((a, b) => a.firstStart - b.firstStart), assignments };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'diarization',
      mode: 'mock',
      configured: true,
      detail: 'Offline diarization from FFmpeg silence analysis and turn heuristics',
    };
  }
}
