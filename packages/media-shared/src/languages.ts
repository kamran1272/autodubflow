/** Languages supported for transcription, translation and dubbing. */
export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  /** Whisper / provider hint. */
  sttCode: string;
  /** Locale used by TTS providers. */
  ttsLocale: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', sttCode: 'en', ttsLocale: 'en-US' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', sttCode: 'es', ttsLocale: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', sttCode: 'fr', ttsLocale: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', sttCode: 'de', ttsLocale: 'de-DE' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', sttCode: 'pt', ttsLocale: 'pt-BR' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', sttCode: 'it', ttsLocale: 'it-IT' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', sttCode: 'hi', ttsLocale: 'hi-IN' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', sttCode: 'ar', ttsLocale: 'ar-SA', rtl: true },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', sttCode: 'ja', ttsLocale: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', sttCode: 'ko', ttsLocale: 'ko-KR' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', sttCode: 'zh', ttsLocale: 'zh-CN' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', sttCode: 'ru', ttsLocale: 'ru-RU' },
] as const;

export const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((language) => language.code);

export function getLanguage(code: string | null | undefined): SupportedLanguage | undefined {
  if (!code) return undefined;
  const normalized = code.toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.find((language) => language.code === normalized);
}

export function getLanguageName(code: string | null | undefined): string {
  return getLanguage(code)?.name ?? (code ? code.toUpperCase() : 'Unknown');
}

export function isSupportedLanguage(code: string | null | undefined): boolean {
  return Boolean(getLanguage(code));
}
