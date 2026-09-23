/**
 * Voice catalogue shared by the database seed, the offline TTS provider and the
 * studio voice picker. Each preset maps onto the concrete voice id used by the
 * live providers so switching AI_MODE=mock -> live requires no code changes.
 */
export interface VoicePreset {
  id: string;
  name: string;
  language: string;
  gender: 'female' | 'male' | 'neutral';
  accent: string;
  style: string;
  description: string;
  /** Base pitch used by the offline synthesizer, in Hz. */
  pitchHz: number;
  openAiVoice?: string;
  elevenLabsVoice?: string;
  tags: string[];
  isDefault?: boolean;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'es-latam-neutral',
    name: 'Sofia - Latin American Neutral',
    language: 'es',
    gender: 'neutral',
    accent: 'Latin American',
    style: 'Professional',
    description: 'Balanced narrator voice for corporate and product videos. Default Spanish voice.',
    pitchHz: 168,
    openAiVoice: 'alloy',
    elevenLabsVoice: 'EXAVITQu4vr4xnSDxMaL',
    tags: ['narration', 'corporate', 'default'],
    isDefault: true,
  },
  {
    id: 'es-latam-female-warm',
    name: 'Valentina - Warm',
    language: 'es',
    gender: 'female',
    accent: 'Latin American',
    style: 'Warm',
    description: 'Conversational female voice that works well for explainers and training content.',
    pitchHz: 196,
    openAiVoice: 'nova',
    elevenLabsVoice: 'EXAVITQu4vr4xnSDxMaL',
    tags: ['explainer', 'conversational'],
  },
  {
    id: 'es-latam-male-deep',
    name: 'Mateo - Deep',
    language: 'es',
    gender: 'male',
    accent: 'Latin American',
    style: 'Confident',
    description: 'Deep male voice suited to trailers, promos and brand films.',
    pitchHz: 112,
    openAiVoice: 'onyx',
    elevenLabsVoice: 'pNInz6obpgDQGcFmaJgB',
    tags: ['promo', 'trailer'],
  },
  {
    id: 'es-castilian-female',
    name: 'Lucia - Castilian',
    language: 'es',
    gender: 'female',
    accent: 'Spain',
    style: 'Formal',
    description: 'European Spanish female voice for formal presentations.',
    pitchHz: 205,
    openAiVoice: 'shimmer',
    elevenLabsVoice: '21m00Tcm4TlvDq8ikWAM',
    tags: ['formal', 'europe'],
  },
  {
    id: 'es-castilian-male',
    name: 'Javier - Castilian',
    language: 'es',
    gender: 'male',
    accent: 'Spain',
    style: 'Newsreader',
    description: 'European Spanish male voice with a documentary delivery.',
    pitchHz: 120,
    openAiVoice: 'echo',
    elevenLabsVoice: 'ErXwobaYiN019PkySvjV',
    tags: ['documentary', 'europe'],
  },
  {
    id: 'es-latam-female-bright',
    name: 'Camila - Bright',
    language: 'es',
    gender: 'female',
    accent: 'Colombian',
    style: 'Energetic',
    description: 'Upbeat voice for social cuts and short-form video.',
    pitchHz: 214,
    openAiVoice: 'fable',
    elevenLabsVoice: 'AZnzlk1XvdvUeBnXmlld',
    tags: ['social', 'energetic'],
  },
  {
    id: 'en-us-neutral',
    name: 'Avery - US Neutral',
    language: 'en',
    gender: 'neutral',
    accent: 'US',
    style: 'Professional',
    description: 'General purpose English narrator used for English previews.',
    pitchHz: 160,
    openAiVoice: 'alloy',
    tags: ['narration', 'preview'],
  },
  {
    id: 'en-us-male',
    name: 'Noah - US Male',
    language: 'en',
    gender: 'male',
    accent: 'US',
    style: 'Conversational',
    description: 'Friendly male voice for product walkthroughs.',
    pitchHz: 118,
    openAiVoice: 'echo',
    tags: ['walkthrough'],
  },
  {
    id: 'en-us-female',
    name: 'Riley - US Female',
    language: 'en',
    gender: 'female',
    accent: 'US',
    style: 'Clear',
    description: 'Crisp female voice for tutorials and e-learning.',
    pitchHz: 198,
    openAiVoice: 'nova',
    tags: ['tutorial'],
  },
  {
    id: 'fr-fr-neutral',
    name: 'Elodie - French Neutral',
    language: 'fr',
    gender: 'neutral',
    accent: 'France',
    style: 'Professional',
    description: 'Neutral French narrator for corporate content.',
    pitchHz: 172,
    openAiVoice: 'alloy',
    tags: ['corporate'],
  },
  {
    id: 'fr-fr-male',
    name: 'Mathis - French Male',
    language: 'fr',
    gender: 'male',
    accent: 'France',
    style: 'Calm',
    description: 'Calm French male voice for documentaries.',
    pitchHz: 116,
    openAiVoice: 'onyx',
    tags: ['documentary'],
  },
  {
    id: 'de-de-neutral',
    name: 'Lena - German Neutral',
    language: 'de',
    gender: 'neutral',
    accent: 'Germany',
    style: 'Professional',
    description: 'Neutral German narrator for training material.',
    pitchHz: 166,
    openAiVoice: 'alloy',
    tags: ['training'],
  },
  {
    id: 'de-de-male',
    name: 'Jonas - German Male',
    language: 'de',
    gender: 'male',
    accent: 'Germany',
    style: 'Precise',
    description: 'Precise German male voice for technical explainers.',
    pitchHz: 114,
    openAiVoice: 'echo',
    tags: ['technical'],
  },
  {
    id: 'pt-br-neutral',
    name: 'Beatriz - Brazilian Neutral',
    language: 'pt',
    gender: 'neutral',
    accent: 'Brazil',
    style: 'Warm',
    description: 'Warm Brazilian Portuguese narrator.',
    pitchHz: 178,
    openAiVoice: 'shimmer',
    tags: ['warm'],
  },
  {
    id: 'pt-br-male',
    name: 'Rafael - Brazilian Male',
    language: 'pt',
    gender: 'male',
    accent: 'Brazil',
    style: 'Confident',
    description: 'Confident Brazilian Portuguese male voice.',
    pitchHz: 122,
    openAiVoice: 'onyx',
    tags: ['promo'],
  },
  {
    id: 'it-it-neutral',
    name: 'Giulia - Italian Neutral',
    language: 'it',
    gender: 'neutral',
    accent: 'Italy',
    style: 'Professional',
    description: 'Professional Italian narrator.',
    pitchHz: 174,
    openAiVoice: 'alloy',
    tags: ['corporate'],
  },
  {
    id: 'it-it-male',
    name: 'Marco - Italian Male',
    language: 'it',
    gender: 'male',
    accent: 'Italy',
    style: 'Warm',
    description: 'Warm Italian male voice for storytelling.',
    pitchHz: 120,
    openAiVoice: 'echo',
    tags: ['storytelling'],
  },
  {
    id: 'hi-in-female',
    name: 'Ananya - Hindi',
    language: 'hi',
    gender: 'female',
    accent: 'India',
    style: 'Friendly',
    description: 'Friendly Hindi voice for regional rollouts.',
    pitchHz: 202,
    openAiVoice: 'nova',
    tags: ['regional'],
  },
  {
    id: 'ja-jp-neutral',
    name: 'Haruka - Japanese',
    language: 'ja',
    gender: 'neutral',
    accent: 'Japan',
    style: 'Professional',
    description: 'Neutral Japanese narrator for product launches.',
    pitchHz: 190,
    openAiVoice: 'shimmer',
    tags: ['product'],
  },
];

export function voicesForLanguage(language?: string | null): VoicePreset[] {
  if (!language) return VOICE_PRESETS;
  const normalized = language.toLowerCase().slice(0, 2);
  const matches = VOICE_PRESETS.filter((preset) => preset.language === normalized);
  return matches.length > 0 ? matches : VOICE_PRESETS;
}

export function defaultVoiceForLanguage(language: string): VoicePreset {
  const candidates = voicesForLanguage(language);
  return candidates.find((preset) => preset.isDefault) ?? candidates[0];
}

export function findVoicePreset(id: string): VoicePreset | undefined {
  return VOICE_PRESETS.find((preset) => preset.id === id);
}

