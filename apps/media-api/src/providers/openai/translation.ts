import type { ProviderHealth } from '@autodubflow/media-shared';
import { getLanguageName } from '@autodubflow/media-shared';
import { env } from '../../config/env.js';
import { ProviderError } from '../../lib/errors.js';
import { logger } from '../../lib/logger.js';
import type { TranslationProvider, TranslationRequest, TranslationResult, TranslationOutputSegment } from '../types.js';
import { openAiRequest } from './client.js';

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

const BATCH_SIZE = 40;

export function buildTranslationPrompt(request: TranslationRequest): string {
  const target = getLanguageName(request.targetLanguage);
  const glossary = request.glossary && Object.keys(request.glossary).length > 0
    ? `\nAlways use these glossary translations: ${JSON.stringify(request.glossary)}.`
    : '';
  return [
    `You are a professional dubbing translator. Translate every subtitle line from ${getLanguageName(
      request.sourceLanguage,
    )} to ${target}.`,
    'Rules:',
    '- Translate meaning, tone and intent; keep it natural when spoken aloud.',
    '- Keep each line short enough to be spoken in the same amount of time as the original.',
    '- Never merge or split lines. Return exactly one translation per input line index.',
    '- Preserve names, numbers and on-screen text meaning.',
    `- Respond with JSON only, in the shape {"translations":[{"index":0,"text":"..."}]}.${glossary}`,
  ].join('\n');
}

/** Real OpenAI chat based translation with strict JSON output per segment. */
export class OpenAiTranslationProvider implements TranslationProvider {
  readonly name = 'openai';
  readonly mode = 'live' as const;

  constructor(private readonly model = env.OPENAI_TRANSLATION_MODEL) {}

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const outputs: TranslationOutputSegment[] = [];

    for (let start = 0; start < request.segments.length; start += BATCH_SIZE) {
      const batch = request.segments.slice(start, start + BATCH_SIZE);
      const payload = batch.map((segment) => ({ index: segment.index, text: segment.text }));

      const response = await openAiRequest<ChatCompletionResponse>('/chat/completions', {
        body: {
          model: this.model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: buildTranslationPrompt(request) },
            { role: 'user', content: JSON.stringify({ lines: payload }) },
          ],
        },
        timeoutMs: 180_000,
      });

      const content = response.choices?.[0]?.message?.content ?? '{}';
      let parsed: { translations?: Array<{ index: number; text: string }> };
      try {
        parsed = JSON.parse(content) as typeof parsed;
      } catch {
        throw new ProviderError('openai', 'translation response was not valid JSON');
      }

      const map = new Map((parsed.translations ?? []).map((item) => [Number(item.index), String(item.text ?? '')]));
      for (const segment of batch) {
        const translated = map.get(segment.index);
        if (translated === undefined) {
          logger.warn({ index: segment.index }, 'translation missing for segment, keeping source text');
        }
        outputs.push({
          ...segment,
          originalText: segment.text,
          text: translated && translated.trim().length > 0 ? translated.trim() : segment.text,
          confidence: translated ? 0.94 : 0.4,
        });
      }
    }

    return { provider: this.name, model: this.model, targetLanguage: request.targetLanguage, segments: outputs };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'translation',
      mode: 'live',
      configured: env.aiConfigured.openai,
      detail: `model ${this.model}`,
    };
  }
}
