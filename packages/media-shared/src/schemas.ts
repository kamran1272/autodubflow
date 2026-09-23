import { z } from 'zod';
import {
  ALLOWED_VIDEO_EXTENSIONS,
  EXPORT_FORMATS,
  JOB_TYPES,
  LIMITS,
  PROJECT_STATUSES,
  SUBTITLE_FORMATS,
  VOICE_GENDERS,
  WORKSPACE_ROLES,
} from './constants.js';
import { LANGUAGE_CODES } from './languages.js';

export const languageSchema = z
  .string()
  .trim()
  .min(2)
  .max(10)
  .refine((value) => LANGUAGE_CODES.includes(value.toLowerCase()), { message: 'Unsupported language code' })
  .transform((value) => value.toLowerCase());

export const emailSchema = z.string().trim().toLowerCase().email().max(200);
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(200)
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  password: passwordSchema,
  workspaceName: z.string().trim().min(2).max(80).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  avatarUrl: z.string().trim().url().max(500).nullable().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifyOnComplete: z.boolean().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

export const workspaceCreateSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const workspaceMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(WORKSPACE_ROLES).default('editor'),
});

export const dubbingSettingsSchema = z.object({
  voiceId: z.string().trim().max(64).nullable().optional(),
  speakerVoiceMap: z.record(z.string().max(120), z.string().max(64)).optional(),
  keepOriginalAudio: z.boolean().optional(),
  originalAudioVolume: z.number().min(0).max(2).optional(),
  dubbedAudioVolume: z.number().min(0).max(2).optional(),
  duckOriginal: z.boolean().optional(),
  generateSubtitles: z.boolean().optional(),
  burnSubtitles: z.boolean().optional(),
  normalizeAudio: z.boolean().optional(),
  speedAdjustmentEnabled: z.boolean().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(LIMITS.maxProjectNameLength),
  description: z.string().trim().max(1000).optional(),
  sourceLanguage: languageSchema.default('en'),
  targetLanguage: languageSchema.default('es'),
  voiceId: z.string().trim().max(64).optional(),
  templateId: z.string().trim().max(64).optional(),
  settings: dubbingSettingsSchema.optional(),
});

export const transcriptSegmentUpdateSchema = z.object({
  text: z.string().trim().max(LIMITS.maxSegmentCharacters).optional(),
  start: z.number().min(0).max(60 * 60 * 12).optional(),
  end: z.number().min(0).max(60 * 60 * 12).optional(),
  speakerName: z.string().trim().max(120).nullable().optional(),
});

export const translationSegmentUpdateSchema = z.object({
  text: z.string().trim().max(LIMITS.maxSegmentCharacters),
});

export const speakerVoiceMapSchema = z.object({
  speakerVoiceMap: z.record(z.string().max(120), z.string().max(64)),
});

export const dubbingRequestSchema = z.object({
  voiceId: z.string().trim().max(64).optional(),
  targetLanguage: languageSchema.optional(),
  settings: dubbingSettingsSchema.optional(),
  regenerateFrom: z.enum(['start', 'translation', 'tts', 'render']).default('start'),
});

export const subtitleRequestSchema = z.object({
  language: languageSchema.optional(),
  format: z.enum(SUBTITLE_FORMATS).default('srt'),
  burnIn: z.boolean().default(false),
});

export const subtitleContentSchema = z.object({
  content: z.string().max(LIMITS.maxTranscriptTextLength),
});

export const exportRequestSchema = z.object({
  format: z.enum(EXPORT_FORMATS).default('mp4'),
  preset: z.enum(['source', '1080p', '720p', '480p', 'audio-only', 'subtitles-only']).default('source'),
  burnSubtitles: z.boolean().default(false),
  subtitleLanguage: languageSchema.optional(),
  keepOriginalAudio: z.boolean().optional(),
});

export const voiceQuerySchema = z.object({
  language: z.string().trim().max(10).optional(),
  gender: z.enum(VOICE_GENDERS).optional(),
  search: z.string().trim().max(120).optional(),
  provider: z.string().trim().max(40).optional(),
});

export const customVoiceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  language: languageSchema,
  gender: z.enum(VOICE_GENDERS).default('neutral'),
  style: z.string().trim().max(80).optional(),
  accent: z.string().trim().max(80).optional(),
  description: z.string().trim().max(400).optional(),
  provider: z.string().trim().max(40).default('mock'),
  providerVoiceId: z.string().trim().max(120).optional(),
  tags: z.array(z.string().trim().max(40)).max(12).optional(),
});

export const toolRunSchema = z.object({
  toolSlug: z.string().trim().min(2).max(60),
  projectId: z.string().trim().max(64).optional(),
  options: z.record(z.string(), z.unknown()).optional(),
});

export const jobListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(LIMITS.maxPageSize).default(LIMITS.defaultPageSize),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  type: z.enum(JOB_TYPES).optional(),
  projectId: z.string().trim().max(64).optional(),
});

export const usageQuerySchema = z.object({
  from: z.string().trim().max(40).optional(),
  to: z.string().trim().max(40).optional(),
  projectId: z.string().trim().max(64).optional(),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  company: z.string().trim().max(120).optional(),
  topic: z.enum(['sales', 'support', 'partnership', 'other']).default('support'),
  message: z.string().trim().min(10).max(4000),
});

export const videoExtensions = ALLOWED_VIDEO_EXTENSIONS;


export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(LIMITS.maxProjectNameLength).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  sourceLanguage: languageSchema.optional(),
  targetLanguage: languageSchema.optional(),
  voiceId: z.string().trim().max(64).nullable().optional(),
  settings: dubbingSettingsSchema.optional(),
});

export const projectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(LIMITS.maxPageSize).default(LIMITS.defaultPageSize),
  search: z.string().trim().max(120).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'name', 'durationSeconds']).default('updatedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});
