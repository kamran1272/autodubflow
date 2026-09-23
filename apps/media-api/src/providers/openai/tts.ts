import { writeFile } from 'node:fs/promises';
import type { ProviderHealth } from '@autodubflow/media-shared';
import { env } from '../../config/env.js';
import { ProviderError } from '../../lib/errors.js';
import { fileSize } from '../../lib/fs.js';
import { convertAudio } from '../../media/operations.js';
import { voicesForLanguage, type VoicePreset } from '../voiceCatalog.js';
import type { SynthesisRequest, SynthesisResult, TextToSpeechProvider, VoiceDescriptor } from '../types.js';
import { openAiBinaryRequest } from './client.js';

/** Real OpenAI speech synthesis (tts-1 / gpt-4o-mini-tts). */
export class OpenAiTextToSpeechProvider implements TextToSpeechProvider {
  readonly name = 'openai';
  readonly mode = 'live' as const;

  constructor(
    private readonly model = env.OPENAI_TTS_MODEL,
    private readonly defaultVoice = env.OPENAI_TTS_VOICE,
  ) {}

  async listVoices(language?: string | null): Promise<VoiceDescriptor[]> {
    return voicesForLanguage(language).map((preset: VoicePreset) => ({
      id: preset.id,
      name: preset.name,
      language: preset.language,
      gender: preset.gender,
      accent: preset.accent,
      style: preset.style,
      provider: this.name,
      providerVoiceId: preset.openAiVoice ?? this.defaultVoice,
      tags: preset.tags,
    }));
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    if (!env.aiConfigured.openai) {
      throw new ProviderError('openai', 'OPENAI_API_KEY is required for live speech synthesis.');
    }

    const preset = voicesForLanguage(request.language).find((candidate) => candidate.id === request.voice.id);
    const voice = request.voice.providerVoiceId ?? preset?.openAiVoice ?? this.defaultVoice;

    const { buffer } = await openAiBinaryRequest('/audio/speech', {
      body: {
        model: this.model,
        voice,
        input: request.text.slice(0, 4000),
        response_format: 'wav',
      },
      accept: 'audio/wav',
      timeoutMs: 180_000,
    });

    await writeFile(request.outputPath, buffer);
    let size = await fileSize(request.outputPath);

    if (size < 512) {
      // Fall back to mp3 + local transcode when wav is rejected by the model.
      const fallback = await openAiBinaryRequest('/audio/speech', {
        body: { model: this.model, voice, input: request.text.slice(0, 4000), response_format: 'mp3' },
        accept: 'audio/mpeg',
        timeoutMs: 180_000,
      });
      const tempMp3 = `${request.outputPath}.mp3`;
      await writeFile(tempMp3, fallback.buffer);
      await convertAudio(tempMp3, request.outputPath, {
        sampleRate: request.sampleRate ?? 24000,
        channels: 1,
      });
      size = await fileSize(request.outputPath);
    }

    return {
      outputPath: request.outputPath,
      provider: this.name,
      model: this.model,
      voiceId: request.voice.id,
      bytes: size,
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'text-to-speech',
      mode: 'live',
      configured: env.aiConfigured.openai,
      detail: `model ${this.model}`,
    };
  }
}
