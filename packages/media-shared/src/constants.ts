/**
 * Domain constants shared by the API, the web client and the test suites.
 *
 * Everything is expressed as `as const` objects/arrays instead of database
 * enums so the exact same schema can run on PostgreSQL (production) and SQLite
 * (local development / tests) without divergence.
 */

export const PROJECT_STATUSES = [
  'draft',
  'uploading',
  'queued',
  'processing',
  'ready',
  'completed',
  'failed',
  'cancelled',
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const JOB_STATUSES = ['queued', 'processing', 'completed', 'failed', 'cancelled'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_TYPES = [
  'dubbing',
  'transcription',
  'translation',
  'tts',
  'subtitle',
  'render',
  'export',
  'media_analysis',
] as const;
export type JobType = (typeof JOB_TYPES)[number];

export const MEDIA_KINDS = ['video', 'audio', 'subtitle', 'image', 'render', 'archive'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const MEDIA_ROLES = [
  'source',
  'source_audio',
  'tts_segment',
  'dubbed_audio',
  'render',
  'subtitle',
  'thumbnail',
  'export',
] as const;
export type MediaRole = (typeof MEDIA_ROLES)[number];

export const EXPORT_FORMATS = ['mp4', 'mov', 'mkv', 'wav', 'mp3', 'srt', 'vtt'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const SUBTITLE_FORMATS = ['srt', 'vtt'] as const;
export type SubtitleFormat = (typeof SUBTITLE_FORMATS)[number];

export const WORKSPACE_ROLES = ['owner', 'admin', 'editor', 'viewer'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const VOICE_GENDERS = ['female', 'male', 'neutral'] as const;
export type VoiceGender = (typeof VOICE_GENDERS)[number];

export const USAGE_KINDS = [
  'transcription',
  'translation',
  'tts',
  'rendering',
  'storage',
  'subtitles',
] as const;
export type UsageKind = (typeof USAGE_KINDS)[number];

export const AI_TOOL_CATEGORIES = ['dubbing', 'captions', 'audio', 'video', 'analysis'] as const;
export type AIToolCategory = (typeof AI_TOOL_CATEGORIES)[number];

export const TEMPLATE_CATEGORIES = ['dubbing', 'captions', 'social', 'education'] as const;

/** Ordered, weighted stages of the dubbing pipeline. */
export interface PipelineStageDefinition {
  id: string;
  label: string;
  /** Share of the overall 0-100 progress bar owned by this stage. */
  weight: number;
}

export const DUBBING_STAGES: readonly PipelineStageDefinition[] = [
  { id: 'queued', label: 'Queued', weight: 0 },
  { id: 'extracting_audio', label: 'Extracting audio', weight: 8 },
  { id: 'transcribing', label: 'Transcribing speech', weight: 22 },
  { id: 'diarizing', label: 'Detecting speakers', weight: 8 },
  { id: 'translating', label: 'Translating dialogue', weight: 18 },
  { id: 'generating_tts', label: 'Generating localized voice', weight: 22 },
  { id: 'aligning', label: 'Aligning timing', weight: 8 },
  { id: 'mixing', label: 'Mixing audio tracks', weight: 6 },
  { id: 'rendering', label: 'Rendering video', weight: 6 },
  { id: 'quality_check', label: 'Quality check', weight: 2 },
  { id: 'completed', label: 'Completed', weight: 0 },
] as const;

export const DUBBING_STAGE_IDS = DUBBING_STAGES.map((stage) => stage.id);

export const STT_STAGES = DUBBING_STAGES.filter((stage) =>
  ['queued', 'extracting_audio', 'transcribing', 'completed'].includes(stage.id),
);

export const LIMITS = {
  maxUploadBytes: 2 * 1024 * 1024 * 1024,
  maxImageBytes: 10 * 1024 * 1024,
  maxProjectsPerWorkspace: 500,
  maxSegmentsPerRequest: 2000,
  maxTranscriptTextLength: 200_000,
  maxProjectNameLength: 120,
  maxSegmentCharacters: 5_000,
  defaultPageSize: 20,
  maxPageSize: 100,
  maxRetries: 3,
} as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/webm',
  'video/x-msvideo',
  'video/mpeg',
  'video/ogg',
] as const;

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
] as const;

export const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.webm', '.avi', '.mpeg', '.mpg', '.ogv'] as const;
export const ALLOWED_AUDIO_EXTENSIONS = ['.mp3', '.m4a', '.wav', '.aac', '.ogg', '.oga', '.flac', '.opus'] as const;

export const DEFAULT_SOURCE_LANGUAGE = 'en';
export const DEFAULT_TARGET_LANGUAGE = 'es';

export const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    price: 0,
    interval: 'month',
    quotaMinutes: 30,
    seats: 1,
    highlight: false,
    features: ['30 dubbed minutes / month', 'Spanish dubbing', 'Auto subtitles', '720p exports', '1 workspace seat'],
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 39,
    interval: 'month',
    quotaMinutes: 300,
    seats: 3,
    highlight: true,
    features: [
      '300 dubbed minutes / month',
      'Priority render queue',
      'Voice library + custom voices',
      'Burned-in or soft subtitles',
      '1080p exports',
      '3 workspace seats',
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 149,
    interval: 'month',
    quotaMinutes: 1500,
    seats: 15,
    highlight: false,
    features: [
      '1,500 dubbed minutes / month',
      'Batch dubbing and API access',
      'Speaker-aware voice mapping',
      'Project versions and audit log',
      '4K source support',
      '15 workspace seats',
    ],
  },
] as const;

export const APP_NAME = 'DubFlow';
export const APP_TAGLINE = 'Turn any video into a natural Spanish-dubbed experience.';
