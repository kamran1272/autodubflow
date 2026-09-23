import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('AutoDubFlow'),
  DATABASE_URL: z.string().url().default('postgresql://autodubflow:autodubflow@localhost:5432/autodubflow'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  API_URL: z.string().url().default('http://localhost:4000'),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  WORKER_URL: z.string().url().default('http://localhost:4001'),
  BETTER_AUTH_SECRET: z.string().default(''),
});

export type AppConfig = z.infer<typeof envSchema>;

export const getConfig = (): AppConfig => {
  const config = envSchema.parse(process.env);

  if (config.NODE_ENV === 'production' && config.BETTER_AUTH_SECRET.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be at least 32 characters in production.');
  }

  return config;
};

export const configStatus = 'config-ready';
