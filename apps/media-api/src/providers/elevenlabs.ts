import { writeFile } from 'node:fs/promises';
import type { ProviderHealth } from '@autodubflow/media-shared';
import { env } from '../config/env.js';
import { ProviderError } from '../lib/errors.js';
import { fileSize } from '../lib/fs.js';
import { convertAudio } from '../media/operations.js';
import { voicesForLanguage } from './voiceCatalog.js';
import type { SynthesisRequest, SynthesisResult, TextToSpeechProvider, VoiceDescriptor } from './types.js';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  labels?: { gender?: string; accent?: string; description?: string; use_case?: string };
}

interface ElevenLabsVoiceList {
  voices?: ElevenLabsVoice[];
}

const API_BASE = 'https://api.elevenlabs.io/v1';

/** Real ElevenLabs text-to-speech provider (multilingual voice library). */
export class ElevenLabsTextToSpeechProvider implements TextToSpeechProvider {
  readonly name = 'elevenlabs';
  readonly mode = 'live' as const;

  constructor(private readonly model = env.ELEVENLABS_MODEL) {}

  private headers() {
    if (!env.aiConfigured.elevenlabs) {
      throw new ProviderError('elevenlabs', 'ELEVENLABS_API_KEY is required when TTS_PROVIDER=elevenlabs.');
    }
    return { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' };
  }

  async listVoices(language?: string | null): Promise<VoiceDescriptor[]> {
    const presets = voicesForLanguage(language);
    if (!env.aiConfigured.elevenlabs) {
      return presets.map((preset) => ({
        id: preset.id,
        name: preset.name,
        language: preset.language,
        gender: preset.gender,
        accent: preset.accent,
        style: preset.style,
        provider: this.name,
        providerVoiceId: preset.elevenLabsVoice ?? null,
        tags: preset.tags,
      }));
    }

    const response = await fetch(`${API_BASE}/voices`, { headers: this.headers() });
    if (!response.ok) {
      throw new ProviderError('elevenlabs', `unable to list voices: ${response.status}`);
    }
    const data = (await response.json()) as ElevenLabsVoiceList;
    return (data.voices ?? []).map((voice) => ({
      id: voice.voice_id,
      name: voice.name,
      language: language ?? 'en',
      gender: voice.labels?.gender ?? 'neutral',
      accent: voice.labels?.accent ?? null,
      style: voice.labels?.use_case ?? null,
      provider: this.name,
      providerVoiceId: voice.voice_id,
      tags: [],
    }));
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    const preset = voicesForLanguage(request.language).find((candidate) => candidate.id === request.voice.id);
    const voiceId = request.voice.providerVoiceId ?? preset?.elevenLabsVoice;
    if (!voiceId) {
      throw new ProviderError('elevenlabs', `no ElevenLabs voice mapped for ${request.voice.id}`);
    }

    const response = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        text: request.text,
        model_id: this.model,
        voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true },
      }),
    });

    if (!response.ok) {
      throw new ProviderError('elevenlabs', `${response.status} ${response.statusText}: ${(await response.text()).slice(0, 400)}`);
    }

    const tempMp3 = `${request.outputPath}.mp3`;
    await writeFile(tempMp3, Buffer.from(await response.arrayBuffer()));
    await convertAudio(tempMp3, request.outputPath, { sampleRate: request.sampleRate ?? 24000, channels: 1 });

    return {
      outputPath: request.outputPath,
      provider: this.name,
      model: this.model,
      voiceId: request.voice.id,
      bytes: await fileSize(request.outputPath),
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'text-to-speech',
      mode: 'live',
      configured: env.aiConfigured.elevenlabs,
      detail: `model ${this.model}`,
    };
  }
}
