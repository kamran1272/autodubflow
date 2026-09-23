import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_NAME: z.string().default('autodubflow'),
  DATABASE_URL: z.string().url().default('postgresql://autodubflow:autodubflow@localhost:5432/autodubflow'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  API_URL: z.string().url().default('http://localhost:4000'),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  WORKER_URL: z.string().url().default('http://localhost:4001'),
});

export type AppConfig = z.infer<typeof envSchema>;

export const getConfig = (): AppConfig => envSchema.parse(process.env);

export const configStatus = 'config-ready';
