import type { ProviderHealth } from '@autodubflow/media-shared';
import { estimateSpeechSeconds } from '@autodubflow/media-shared';
import { fileSize } from '../../lib/fs.js';
import { runFfmpeg } from '../../media/ffmpeg.js';
import { AUDIO_SAMPLE_RATE } from '../../media/operations.js';
import { voicesForLanguage, type VoicePreset } from '../voiceCatalog.js';
import type { SynthesisRequest, SynthesisResult, TextToSpeechProvider, VoiceDescriptor } from '../types.js';

/**
 * Offline text-to-speech provider.
 *
 * Instead of returning a silent placeholder it synthesises REAL, audible audio
 * with FFmpeg: a formant-rich carrier whose pitch follows the selected voice and
 * whose syllable envelope follows the text length. The generated WAV files are
 * then aligned, mixed and muxed back into the video by the normal pipeline, so
 * `AI_MODE=mock` still exercises every media processing step. Results are always
 * labelled with `provider: "mock"`.
 */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function toDescriptor(preset: VoicePreset): VoiceDescriptor {
  return {
    id: preset.id,
    name: preset.name,
    language: preset.language,
    gender: preset.gender,
    accent: preset.accent,
    style: preset.style,
    provider: 'mock',
    providerVoiceId: preset.id,
    tags: preset.tags,
  };
}

function voicePitch(voice: VoiceDescriptor, preset?: VoicePreset): number {
  const base = preset?.pitchHz ?? (voice.gender === 'male' ? 115 : voice.gender === 'female' ? 200 : 160);
  // Small deterministic offset per voice id keeps voices distinguishable.
  let hash = 0;
  for (const char of voice.id) hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  const offset = ((hash % 11) - 5) / 100;
  return Math.round(base * (1 + offset));
}

export class MockTextToSpeechProvider implements TextToSpeechProvider {
  readonly name = 'mock';
  readonly mode = 'mock' as const;

  async listVoices(language?: string | null): Promise<VoiceDescriptor[]> {
    return voicesForLanguage(language).map(toDescriptor);
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    const preset = voicesForLanguage(request.language).find((candidate) => candidate.id === request.voice.id);
    const pitch = voicePitch(request.voice, preset);
    const sampleRate = request.sampleRate ?? AUDIO_SAMPLE_RATE;

    const spokenSeconds = estimateSpeechSeconds(request.text, 155);
    const duration = clamp(request.targetDurationSeconds ?? spokenSeconds * 0.95, 0.35, 90);

    const syllablesPerSecond = clamp(request.text.trim().split(/\s+/).length / Math.max(duration, 0.5), 1.5, 6.5);
    const expression =
      `(0.40*sin(2*PI*${pitch}*t)+0.18*sin(2*PI*${(pitch * 2.02).toFixed(2)}*t)` +
      `+0.08*sin(2*PI*${(pitch * 3.01).toFixed(2)}*t))*(0.30+0.70*abs(sin(2*PI*${syllablesPerSecond.toFixed(3)}*t)))`;

    const fadeOutStart = Math.max(0, duration - 0.05);
    await runFfmpeg([
      '-f',
      'lavfi',
      '-i',
      `aevalsrc=${expression}:s=${sampleRate}:d=${duration.toFixed(3)}`,
      '-af',
      [
        'highpass=f=75',
        'lowpass=f=4200',
        'acompressor=threshold=-20dB:ratio=4:attack=5:release=80',
        'afade=t=in:st=0:d=0.02',
        `afade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.05`,
        'volume=0.9',
      ].join(','),
      '-t',
      duration.toFixed(3),
      '-ac',
      '1',
      '-ar',
      String(sampleRate),
      '-c:a',
      'pcm_s16le',
      request.outputPath,
    ]);

    return {
      outputPath: request.outputPath,
      provider: this.name,
      model: 'mock-formant-v1',
      voiceId: request.voice.id,
      bytes: await fileSize(request.outputPath),
    };
  }

  async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      kind: 'text-to-speech',
      mode: 'mock',
      configured: true,
      detail: 'Offline FFmpeg formant synthesiser (audible placeholder audio)',
    };
  }
}
