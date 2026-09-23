import type { ProviderHealth } from '@autodubflow/media-shared';
import { env } from '../config/env.js';
import { ProviderError } from '../lib/errors.js';
import type { TranslationProvider, TranslationRequest, TranslationResult, TranslationOutputSegment } from './types.js';

interface DeepLResponse {
  translations?: Array<{ detected_source_language?: string; text: string }>;
}

const BATCH_LIMIT = 50;

/** Real DeepL translation provider. */
export class DeepLTranslationProvider implements TranslationProvider {
  readonly name = 'deepl';
  readonly mode = 'live' as const;

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    if (!env.aiConfigured.deepl) {
      throw new ProviderError('deepl', 'DEEPL_API_KEY is required when TRANSLATION_PROVIDER=deepl.');
    }

    const outputs: TranslationOutputSegment[] = [];
    for (let start = 0; start < request.segments.length; start += BATCH_LIMIT) {
      const batch = request.segments.slice(start, start + BATCH_LIMIT);
      const response = await fetch(`${env.DEEPL_API_URL.replace(/\/$/, '')}/translate`, {
        method: 'POST',
        headers: {
          Authorization: `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: batch.map((segment) => segment.text),
          target_lang: request.targetLanguage.toUpperCase(),
          source_lang: request.sourceLanguage ? request.sourceLanguage.toUpperCase() : undefined,
          preserve_formatting: true,
        }),
      });

      if (!response.ok) {
        throw new ProviderError('deepl', `${response.status} ${response.statusText}: ${(await response.text()).slice(0, 400)}`);
      }

      const data = (await response.json()) as DeepLResponse;
      const translations = data.translations ?? [];
      batch.forEach((segment, index) => {
        const translated = translations[index]?.text?.trim();
        outputs.push({
          ...segment,
          originalText: segment.text,
          text: translated && translated.length > 0 ? translated : segment.text,
          confidence: translated ? 0.95 : 0.4,
        });
      });
    }

    return { provider: this.name, model: 'deepl-v2', targetLanguage: request.targetLanguage, segments: outputs };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'translation',
      mode: 'live',
      configured: env.aiConfigured.deepl,
      detail: env.DEEPL_API_URL,
    };
  }
}
