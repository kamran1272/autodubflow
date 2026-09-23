import type { ProviderHealth } from '@autodubflow/media-shared';
import { PHRASES, WORDS } from './dictionary.js';
import type { TranslationProvider, TranslationRequest, TranslationResult, TranslationOutputSegment } from '../types.js';

/**
 * Offline dictionary based translation provider.
 *
 * The bundled dictionaries cover the vocabulary of the demo workflow plus a
 * broad set of common English words, which is enough to exercise the complete
 * dubbing pipeline (alignment, TTS, mixing, rendering, subtitles) without any
 * external API. Languages without a dictionary fall back to a clearly marked
 * pseudo-localisation with a low confidence score. Always reported as
 * `provider: "mock"`.
 */
export function translateSentence(sentence: string, targetLanguage: string): { text: string; confidence: number } {
  const language = targetLanguage.toLowerCase().slice(0, 2);
  const phraseMap = PHRASES[language];
  const wordMap = WORDS[language];

  if (!phraseMap && !wordMap) {
    return { text: `[${language}] ${sentence}`, confidence: 0.25 };
  }

  let working = sentence;
  let matchedPhrases = 0;
  if (phraseMap) {
    for (const [source, target] of Object.entries(phraseMap)) {
      const pattern = new RegExp(`\\b${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (pattern.test(working)) {
        working = working.replace(pattern, target);
        matchedPhrases += 1;
      }
    }
  }

  let matchedWords = 0;
  let totalWords = 0;
  const translated = working
    .split(/(\s+)/)
    .map((token) => {
      if (!/[A-Za-z]/.test(token)) return token;
      totalWords += 1;
      const match = /^([^A-Za-z]*)([A-Za-z'-]+)([^A-Za-z]*)$/.exec(token);
      if (!match) return token;
      const [, prefix, word, suffix] = match;
      const replacement = wordMap?.[word.toLowerCase()];
      if (!replacement) return token;
      matchedWords += 1;
      const cased = /^[A-Z]/.test(word) ? replacement.charAt(0).toUpperCase() + replacement.slice(1) : replacement;
      return `${prefix}${cased}${suffix}`;
    })
    .join('');

  const coverage = totalWords > 0 ? matchedWords / totalWords : 0;
  const confidence = Math.min(0.95, 0.45 + coverage * 0.45 + matchedPhrases * 0.05);
  return { text: translated || sentence, confidence: Math.round(confidence * 100) / 100 };
}

export class MockTranslationProvider implements TranslationProvider {
  readonly name = 'mock';
  readonly mode = 'mock' as const;

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const segments: TranslationOutputSegment[] = request.segments.map((segment) => {
      const glossaryHit = request.glossary?.[segment.text.trim().toLowerCase()];
      if (glossaryHit) {
        return { ...segment, originalText: segment.text, text: glossaryHit, confidence: 1 };
      }
      const { text, confidence } = translateSentence(segment.text, request.targetLanguage);
      return { ...segment, originalText: segment.text, text, confidence };
    });

    return {
      provider: this.name,
      model: 'mock-dictionary-v1',
      targetLanguage: request.targetLanguage,
      segments,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'translation',
      mode: 'mock',
      configured: true,
      detail: 'Offline dictionary translation (Spanish, French, German, Portuguese, Italian)',
    };
  }
}
