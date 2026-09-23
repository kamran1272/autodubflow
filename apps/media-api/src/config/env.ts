import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const here = dirname(fileURLToPath(import.meta.url));

/** Load the monorepo root `.env` no matter which package directory we run from. */
function loadEnvironment() {
  const candidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../../.env'),
    resolve(here, '../../../../.env'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return candidate;
    }
  }
  return null;
}

export const envFileLoaded = loadEnvironment();

const booleanish = z
  .union([z.boolean(), z.string()])
  .transform((value) => (typeof value === 'boolean' ? value : ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())))
  .default(false);

const numberish = (fallback: number) =>
  z
    .union([z.number(), z.string()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value), { message: 'Expected a number' })
    .default(fallback);

const envSchema = z.object({
  APP_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: numberish(4100),
  HOST: z.string().default('0.0.0.0'),
  WEB_ORIGIN: z.string().default('http://localhost:5173'),
  API_PUBLIC_URL: z.string().default('http://localhost:4100'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

  DATABASE_URL: z.string().default(''),

  QUEUE_DRIVER: z.enum(['auto', 'in-process', 'bullmq']).default('auto'),
  REDIS_URL: z.string().default(''),
  WORKER_ENABLED: booleanish.default(true),
  WORKER_CONCURRENCY: numberish(2),
  WORKER_POLL_INTERVAL_MS: numberish(750),

  JWT_SECRET: z.string().min(16).default('development-only-secret-change-me'),
  SESSION_COOKIE_NAME: z.string().default('dubflow_session'),
  SESSION_TTL_HOURS: numberish(168),
  COOKIE_SECURE: booleanish,
  RATE_LIMIT_MAX: numberish(300),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  AUTH_RATE_LIMIT_MAX: numberish(10),
  AUTH_RATE_LIMIT_WINDOW: z.string().default('1 minute'),

  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  STORAGE_ROOT: z.string().default('storage'),
  STORAGE_PUBLIC_URL: z.string().default(''),
  S3_ENDPOINT: z.string().default(''),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('dubflow'),
  S3_ACCESS_KEY_ID: z.string().default(''),
  S3_SECRET_ACCESS_KEY: z.string().default(''),
  S3_FORCE_PATH_STYLE: booleanish.default(true),

  AI_MODE: z.enum(['mock', 'live']).default('mock'),
  STT_PROVIDER: z.string().default('mock'),
  TRANSLATION_PROVIDER: z.string().default('mock'),
  TTS_PROVIDER: z.string().default('mock'),
  DIARIZATION_PROVIDER: z.string().default('mock'),
  OPENAI_API_KEY: z.string().default(''),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  OPENAI_STT_MODEL: z.string().default('whisper-1'),
  OPENAI_TRANSLATION_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_TTS_MODEL: z.string().default('tts-1'),
  OPENAI_TTS_VOICE: z.string().default('alloy'),
  DEEPL_API_KEY: z.string().default(''),
  DEEPL_API_URL: z.string().default('https://api-free.deepl.com/v2'),
  ELEVENLABS_API_KEY: z.string().default(''),
  ELEVENLABS_MODEL: z.string().default('eleven_multilingual_v2'),
  ASSEMBLYAI_API_KEY: z.string().default(''),
  ASSEMBLYAI_API_URL: z.string().default('https://api.assemblyai.com/v2'),

  FFMPEG_PATH: z.string().default(''),
  FFPROBE_PATH: z.string().default(''),
  MAX_UPLOAD_MB: numberish(2048),
  TEMP_WORK_DIR: z.string().default('.work'),

  SEED_DEMO_DATA: booleanish.default(true),
  DEMO_USER_EMAIL: z.string().default('demo@dubflow.app'),
  DEMO_USER_PASSWORD: z.string().default('DemoPass123'),
});

export type RawEnv = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  throw new Error(`Invalid environment configuration -> ${issues}`);
}

const raw = parsed.data;

if (raw.APP_ENV === 'production') {
  const missing = (['DATABASE_URL', 'JWT_SECRET'] as const).filter(
    (key) => !raw[key] || raw[key].startsWith('development-only'),
  );
  if (missing.length > 0) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }
}

const absolute = (value: string) => (value ? resolve(process.cwd(), value) : '');

export const env = {
  ...raw,
  isProduction: raw.APP_ENV === 'production',
  isTest: raw.APP_ENV === 'test',
  storageRoot: absolute(raw.STORAGE_ROOT),
  workDir: absolute(raw.TEMP_WORK_DIR),
  maxUploadBytes: raw.MAX_UPLOAD_MB * 1024 * 1024,
  sessionTtlMs: raw.SESSION_TTL_HOURS * 60 * 60 * 1000,
  allowedOrigins: raw.WEB_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  aiConfigured: {
    openai: Boolean(raw.OPENAI_API_KEY),
    deepl: Boolean(raw.DEEPL_API_KEY),
    elevenlabs: Boolean(raw.ELEVENLABS_API_KEY),
    assemblyai: Boolean(raw.ASSEMBLYAI_API_KEY),
  },
} as const;

export type Env = typeof env;
