import type {
  ExportFormat,
  JobStatus,
  JobType,
  MediaKind,
  MediaRole,
  ProjectStatus,
  SubtitleFormat,
  UsageKind,
  VoiceGender,
  WorkspaceRole,
} from './constants.js';

/** ---------- Envelopes ---------- */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JobProgress {
  stage: string;
  stageLabel: string;
  progress: number;
  status: JobStatus;
}

/** ---------- Accounts ---------- */

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  plan: string;
  theme: string;
  notifyOnComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  ownerId: string;
  role: WorkspaceRole;
  memberCount?: number;
  projectCount?: number;
  createdAt: string;
}

/** ---------- Media ---------- */

export interface MediaAsset {
  id: string;
  workspaceId: string;
  projectId: string | null;
  kind: MediaKind;
  role: MediaRole | null;
  originalName: string;
  storageKey: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  sampleRate: number | null;
  channels: number | null;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface MediaAnalysis {
  durationSeconds: number;
  width: number | null;
  height: number | null;
  fps: number | null;
  videoCodec: string | null;
  audioCodec: string | null;
  sampleRate: number | null;
  channels: number | null;
  bitrate: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
  formatName: string | null;
  sizeBytes: number;
}

/** ---------- Transcripts & translations ---------- */

export interface TranscriptSegment {
  id: string;
  index: number;
  start: number;
  end: number;
  text: string;
  speakerId: string | null;
  speakerName: string | null;
  confidence: number | null;
}

export interface Transcript {
  id: string;
  projectId: string;
  language: string;
  provider: string;
  model: string | null;
  status: string;
  wordCount: number;
  confidence: number | null;
  segments: TranscriptSegment[];
  createdAt: string;
  updatedAt: string;
}

/** ---------- Jobs ---------- */

export interface ProcessingJob {
  id: string;
  projectId: string | null;
  workspaceId: string;
  userId: string;
  type: JobType | string;
  status: JobStatus;
  stage: string;
  stageLabel: string;
  progress: number;
  attempts: number;
  maxAttempts: number;
  priority: number;
  queueDriver: string;
  errorMessage: string | null;
  result: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  scheduledAt: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessingEventRecord {
  id: string;
  jobId: string | null;
  projectId: string | null;
  stage: string;
  percentage: number;
  message: string;
  level: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface DubbingSettings {
  voiceId?: string | null;
  speakerVoiceMap?: Record<string, string>;
  keepOriginalAudio?: boolean;
  originalAudioVolume?: number;
  dubbedAudioVolume?: number;
  duckOriginal?: boolean;
  generateSubtitles?: boolean;
  burnSubtitles?: boolean;
  normalizeAudio?: boolean;
  speedAdjustmentEnabled?: boolean;
}

export interface DubbingJob {
  id: string;
  projectId: string;
  processingJobId: string | null;
  voiceId: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  status: JobStatus;
  outputMediaId: string | null;
  settings: DubbingSettings;
  metrics: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

/** ---------- Subtitles ---------- */

export interface Subtitle {
  id: string;
  projectId: string;
  language: string;
  format: SubtitleFormat;
  mediaId: string | null;
  url: string | null;
  cueCount: number;
  burnedIn: boolean;
  content: string | null;
  createdAt: string;
}

/** ---------- Exports & versions ---------- */

export interface ExportRecord {
  id: string;
  projectId: string;
  mediaId: string | null;
  url: string | null;
  format: ExportFormat;
  preset: string;
  status: JobStatus;
  progress: number;
  sizeBytes: number | null;
  burnSubtitles: boolean;
  subtitleLanguage: string | null;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  version: number;
  label: string;
  createdByUserId: string | null;
  summary: Record<string, unknown> | null;
  snapshot: Record<string, unknown> | null;
  createdAt: string;
}

/** ---------- Projects ---------- */

export interface Project {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  sourceLanguage: string;
  targetLanguage: string;
  voiceId: string | null;
  durationSeconds: number | null;
  resolution: string | null;
  fps: number | null;
  progress: number;
  currentStage: string;
  currentStageLabel: string;
  errorMessage: string | null;
  thumbnailUrl: string | null;
  sourceVideoUrl: string | null;
  outputVideoUrl: string | null;
  sourceAudioUrl: string | null;
  dubbedAudioUrl: string | null;
  settings: DubbingSettings;
  segmentCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ProjectDetail extends Project {
  media: MediaAsset[];
  transcripts: Transcript[];
  translations: Translation[];
  subtitles: Subtitle[];
  exports: ExportRecord[];
  versions: ProjectVersion[];
  jobs: ProcessingJob[];
  activeJob: ProcessingJob | null;
  speakers: SpeakerSummary[];
  events: ProcessingEventRecord[];
}

/** ---------- Usage, tools & notifications ---------- */

export interface UsageRecord {
  id: string;
  workspaceId: string;
  userId: string;
  projectId: string | null;
  jobId: string | null;
  kind: UsageKind | string;
  provider: string;
  model: string | null;
  quantity: number;
  unit: string;
  costUsd: number;
  durationSeconds: number | null;
  createdAt: string;
}

export interface UsageSummary {
  totalMinutes: number;
  totalCostUsd: number;
  byKind: Array<{ kind: string; quantity: number; unit: string; costUsd: number }>;
  byProvider: Array<{ provider: string; quantity: number; costUsd: number; model?: string }>;
  byDay: Array<{ date: string; minutes: number; costUsd: number }>;
  quotaMinutes: number;
  remainingMinutes: number;
}

export interface AITool {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  enabled: boolean;
  requiresMedia: boolean;
  jobType: JobType | string;
  config: Record<string, unknown> | null;
  order: number;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isPublic: boolean;
  settings: DubbingSettings | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  projectId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface DashboardMetrics {
  projectCount: number;
  completedCount: number;
  activeCount: number;
  failedCount: number;
  totalMinutes: number;
  minutesThisMonth: number;
  quotaMinutes: number;
  remainingMinutes: number;
  totalCostUsd: number;
  exportsCount: number;
  recentProjects: Project[];
  activeJobs: ProcessingJob[];
  usageByDay: Array<{ date: string; minutes: number; costUsd: number }>;
}

export interface ProviderHealth {
  provider: string;
  kind: string;
  mode: 'mock' | 'live';
  configured: boolean;
  detail?: string;
}


export interface TranslationSegment {
  id: string;
  index: number;
  start: number;
  end: number;
  sourceText: string;
  text: string;
  speakerId: string | null;
  speakerName: string | null;
  editedByUser: boolean;
  confidence: number | null;
}

export interface Translation {
  id: string;
  projectId: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider: string;
  model: string | null;
  status: string;
  segments: TranslationSegment[];
  createdAt: string;
  updatedAt: string;
}

export interface SpeakerSummary {
  speakerId: string;
  speakerName: string;
  segmentCount: number;
  totalDuration: number;
  voiceId: string | null;
}

/** ---------- Voices ---------- */

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: VoiceGender | string;
  accent: string | null;
  style: string | null;
  description: string | null;
  provider: string;
  providerVoiceId: string | null;
  previewUrl: string | null;
  isDefault: boolean;
  isCustom: boolean;
  tags: string[];
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  email?: string;
  name?: string | null;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  workspace: Workspace;
  workspaces: Workspace[];
}
