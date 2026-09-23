import { prisma } from '@autodubflow/database';
import { env } from './env.js';
import { logger } from '../lib/logger.js';

let client = prisma;

/**
 * Single Prisma client per process. The same code path serves the SQLite
 * development database and the PostgreSQL production database because the
 * schema is provider agnostic.
 */
export function getDatabase() {
  return client;
}

export async function disconnectDatabase() {
  await client.$disconnect();
}

export async function databaseHealthy(): Promise<boolean> {
  try {
    await getDatabase().$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({ error }, 'database health check failed');
    return false;
  }
}

export function databaseProvider(): string {
  return env.DATABASE_URL.startsWith('file:') ? 'sqlite' : 'postgresql';
}
