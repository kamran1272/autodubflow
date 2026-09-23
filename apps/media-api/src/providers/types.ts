import type { Readable } from 'node:stream';
import type { ProviderHealth } from '@autodubflow/media-shared';

export type ProviderMode = 'mock' | 'live';

export interface ProviderInfo {
  readonly name: string;
  readonly mode: ProviderMode;
}

/** ---------- Speech to text ---------- */

export interface TranscriptionRequest {
  audioPath: string;
  language?: string | null;
  durationSeconds?: number;
  /** Optional script/hint used by mock providers for deterministic output. */
  hint?: string | null;
}

export interface TranscriptionSegment {
  index: number;
  start: number;
  end: number;
  text: string;
  speakerId?: string | null;
  speakerName?: string | null;
  confidence: number;
}

export interface TranscriptionResult {
  language: string;
  provider: string;
  model: string | null;
  text: string;
  wordCount: number;
  confidence: number;
  segments: TranscriptionSegment[];
}

export interface SpeechToTextProvider extends ProviderInfo {
  transcribe(request: TranscriptionRequest): Promise<TranscriptionResult>;
  healthCheck(): Promise<ProviderHealth>;
}

/** ---------- Translation ---------- */

export interface TranslationInputSegment {
  index: number;
  start: number;
  end: number;
  text: string;
  speakerId?: string | null;
  speakerName?: string | null;
}

export interface TranslationRequest {
  segments: TranslationInputSegment[];
  sourceLanguage: string;
  targetLanguage: string;
  glossary?: Record<string, string>;
}

export interface TranslationOutputSegment extends TranslationInputSegment {
  originalText: string;
  text: string;
  confidence: number;
}

export interface TranslationResult {
  provider: string;
  model: string | null;
  targetLanguage: string;
  segments: TranslationOutputSegment[];
}

export interface TranslationProvider extends ProviderInfo {
  translate(request: TranslationRequest): Promise<TranslationResult>;
  healthCheck(): Promise<ProviderHealth>;
}

/** ---------- Speaker diarization ---------- */

export interface DiarizationRequest {
  audioPath: string;
  segments: Array<{ index: number; start: number; end: number; text: string }>;
  expectedSpeakers?: number;
}

export interface DiarizationSpeaker {
  speakerId: string;
  speakerName: string;
  segmentCount: number;
  totalDuration: number;
  firstStart: number;
  lastEnd: number;
}

export interface DiarizationResult {
  provider: string;
  speakers: DiarizationSpeaker[];
  assignments: Array<{ index: number; speakerId: string; speakerName: string }>;
}

export interface SpeakerDiarizationProvider extends ProviderInfo {
  diarize(request: DiarizationRequest): Promise<DiarizationResult>;
  healthCheck(): Promise<ProviderHealth>;
}

/** ---------- Text to speech ---------- */

export interface VoiceDescriptor {
  id: string;
  name: string;
  language: string;
  gender: string;
  accent?: string | null;
  style?: string | null;
  provider: string;
  providerVoiceId?: string | null;
  tags?: string[];
}

export interface SynthesisRequest {
  text: string;
  outputPath: string;
  voice: VoiceDescriptor;
  language: string;
  sampleRate?: number;
  /** Target duration used by mock providers to match the original timing. */
  targetDurationSeconds?: number;
}

export interface SynthesisResult {
  outputPath: string;
  provider: string;
  model: string | null;
  voiceId: string;
  bytes: number;
}

export interface TextToSpeechProvider extends ProviderInfo {
  listVoices(language?: string | null): Promise<VoiceDescriptor[]>;
  synthesize(request: SynthesisRequest): Promise<SynthesisResult>;
  healthCheck(): Promise<ProviderHealth>;
}

/** ---------- Storage ---------- */

export interface StoredObject {
  key: string;
  size: number;
  url: string;
}

export interface StorageProvider extends ProviderInfo {
  put(key: string, data: Buffer, options?: { contentType?: string }): Promise<StoredObject>;
  putFile(key: string, localPath: string, options?: { contentType?: string }): Promise<StoredObject>;
  getStream(key: string): Promise<Readable>;
  readFile(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  size(key: string): Promise<number>;
  url(key: string): string;
  /** Absolute filesystem path when the provider stores objects locally. */
  localPath(key: string): string | null;
}

export interface ProviderRegistry {
  speechToText: SpeechToTextProvider;
  translation: TranslationProvider;
  textToSpeech: TextToSpeechProvider;
  diarization: SpeakerDiarizationProvider;
  storage: StorageProvider;
}
