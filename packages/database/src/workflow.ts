import { prisma } from './index';
import type {
  Prisma,
  StageExecutionStatus,
  WorkflowEventType,
  WorkflowStage,
} from '../generated/client';

export type AppendWorkflowEventInput = {
  sourceVideoId: string;
  type: WorkflowEventType;
  stage?: WorkflowStage;
  idempotencyKey: string;
  correlationId?: string;
  payload: Prisma.InputJsonValue;
  occurredAt?: Date;
};

export type CreateStageExecutionInput = {
  sourceVideoId: string;
  stage: WorkflowStage;
  idempotencyKey: string;
  attempt?: number;
  input?: Prisma.InputJsonValue;
};

export const workflowRepository = {
  appendEvent: (input: AppendWorkflowEventInput) =>
    prisma.workflowEvent.upsert({
      where: { idempotencyKey: input.idempotencyKey },
      create: {
        sourceVideoId: input.sourceVideoId,
        type: input.type,
        stage: input.stage,
        idempotencyKey: input.idempotencyKey,
        correlationId: input.correlationId,
        payload: input.payload,
        occurredAt: input.occurredAt ?? new Date(),
      },
      update: {},
    }),

  createStageExecution: (input: CreateStageExecutionInput) =>
    prisma.stageExecution.upsert({
      where: { idempotencyKey: input.idempotencyKey },
      create: {
        sourceVideoId: input.sourceVideoId,
        stage: input.stage,
        idempotencyKey: input.idempotencyKey,
        attempt: input.attempt ?? 0,
        input: input.input,
      },
      update: {},
    }),

  claimStageExecution: async (id: string, workerId: string, leaseMs: number) => {
    const now = new Date();
    const leaseExpiresAt = new Date(now.getTime() + leaseMs);
    const claimed = await prisma.stageExecution.updateMany({
      where: {
        id,
        status: { in: ['PENDING', 'RETRYABLE_FAILURE'] },
        OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lt: now } }],
      },
      data: {
        status: 'RUNNING',
        workerId,
        leaseExpiresAt,
        heartbeatAt: now,
        startedAt: now,
      },
    });

    return claimed.count === 1;
  },

  heartbeat: (id: string, workerId: string, leaseMs: number) => {
    const now = new Date();
    return prisma.stageExecution.updateMany({
      where: { id, workerId, status: 'RUNNING' },
      data: {
        heartbeatAt: now,
        leaseExpiresAt: new Date(now.getTime() + leaseMs),
      },
    });
  },

  completeStage: (id: string, workerId: string, output: Prisma.InputJsonValue) =>
    prisma.stageExecution.updateMany({
      where: { id, workerId, status: 'RUNNING' },
      data: {
        status: 'SUCCEEDED',
        output,
        completedAt: new Date(),
        leaseExpiresAt: null,
      },
    }),

  failStage: (
    id: string,
    workerId: string,
    status: Extract<StageExecutionStatus, 'RETRYABLE_FAILURE' | 'TERMINAL_FAILURE'>,
    errorCode: string,
    errorMessage: string,
    nextAttemptAt?: Date,
  ) =>
    prisma.stageExecution.updateMany({
      where: { id, workerId, status: 'RUNNING' },
      data: {
        status,
        errorCode,
        errorMessage,
        nextAttemptAt,
        leaseExpiresAt: null,
      },
    }),
};
