import type { ProviderHealth } from '@autodubflow/media-shared';
import { env } from '../../config/env.js';
import { ProviderError } from '../../lib/errors.js';
import type { SpeechToTextProvider, TranscriptionRequest, TranscriptionResult } from '../types.js';
import { appendAudioFile, openAiRequest } from './client.js';

interface WhisperSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
  avg_logprob?: number;
  no_speech_prob?: number;
}

interface WhisperResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: WhisperSegment[];
}

/** Real OpenAI Whisper transcription with segment level timestamps. */
export class OpenAiSpeechToTextProvider implements SpeechToTextProvider {
  readonly name = 'openai';
  readonly mode = 'live' as const;

  constructor(private readonly model = env.OPENAI_STT_MODEL) {}

  async transcribe(request: TranscriptionRequest): Promise<TranscriptionResult> {
    const form = new FormData();
    await appendAudioFile(form, request.audioPath);
    form.append('model', this.model);
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'segment');
    if (request.language) form.append('language', request.language);
    if (request.hint) form.append('prompt', request.hint.slice(0, 800));

    const response = await openAiRequest<WhisperResponse>('/audio/transcriptions', { form, timeoutMs: 15 * 60_000 });
    const segments = (response.segments ?? []).map((segment, index) => ({
      index,
      start: Math.round(segment.start * 1000) / 1000,
      end: Math.round(segment.end * 1000) / 1000,
      text: segment.text.trim(),
      speakerId: 'speaker-1',
      speakerName: 'Speaker 1',
      confidence: Math.round(Math.exp(segment.avg_logprob ?? Math.log(0.9)) * 100) / 100,
    }));

    if (segments.length === 0) {
      const words = response.text.trim().split(/\s+/).filter(Boolean);
      const duration = response.duration ?? Math.max(1, (words.length / 150) * 60);
      const size = duration / Math.max(1, Math.ceil(words.length / 12));
      let cursor = 0;
      const batches: typeof segments = [];
      for (let i = 0; i < words.length; i += 12) {
        const text = words.slice(i, i + 12).join(' ');
        batches.push({
          index: batches.length,
          start: Math.round(cursor * 1000) / 1000,
          end: Math.round((cursor + size) * 1000) / 1000,
          text,
          speakerId: 'speaker-1',
          speakerName: 'Speaker 1',
          confidence: 0.9,
        });
        cursor += size;
      }
      segments.push(...batches);
    }

    const text = response.text ?? segments.map((segment) => segment.text).join(' ');
    const confidence = segments.length
      ? Math.round((segments.reduce((sum, segment) => sum + segment.confidence, 0) / segments.length) * 100) / 100
      : 0.9;

    return {
      language: response.language ?? request.language ?? 'en',
      provider: this.name,
      model: this.model,
      text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      confidence,
      segments,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'speech-to-text',
      mode: 'live',
      configured: env.aiConfigured.openai,
      detail: `model ${this.model}`,
    };
  }
}

export function assertOpenAiConfigured(context: string): void {
  if (!env.aiConfigured.openai) {
    throw new ProviderError('openai', `${context} requires OPENAI_API_KEY.`);
  }
}
