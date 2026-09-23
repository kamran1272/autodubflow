import pino from 'pino';

const isTest = process.env.APP_ENV === 'test';

export const logger = pino({
  level: isTest ? 'silent' : (process.env.LOG_LEVEL ?? 'info'),
  base: { service: 'dubflow-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'newPassword',
      'currentPassword',
      '*.password',
      '*.passwordHash',
      'apiKey',
      'OPENAI_API_KEY',
      'DEEPL_API_KEY',
      'ELEVENLABS_API_KEY',
      'ASSEMBLYAI_API_KEY',
      'S3_SECRET_ACCESS_KEY',
    ],
    censor: '[redacted]',
  },
  transport: undefined,
});

export type Logger = typeof logger;
