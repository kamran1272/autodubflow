import { PrismaClient } from '../generated/client';

export const prisma = new PrismaClient();

export const databaseStatus = 'database-ready';
