import { PrismaClient } from '../generated/client';

export const prisma = new PrismaClient();

export const databaseStatus = 'database-ready';

export { workflowRepository } from './workflow';
export type {
	AppendWorkflowEventInput,
	CreateStageExecutionInput,
} from './workflow';
