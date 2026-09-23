import { createLogger } from '@autodubflow/logger';
import { createQueueClient } from '@autodubflow/queue';
import { getConfig } from '@autodubflow/config';
import { prisma } from '@autodubflow/database';
import { Worker } from 'bullmq';
import IORedis from 'ioredis';

const logger = createLogger('worker');
const config = getConfig();

export const startWorker = async () => {
  const client = createQueueClient(config.REDIS_URL, 'default');
  const connection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
  const worker = new Worker('media-ingestion', async (job) => {
    const { projectId, sourceVideoId } = job.data as { projectId: string; sourceVideoId: string };
    await prisma.sourceVideo.update({ where: { id: sourceVideoId }, data: { status: 'INGESTED' } });
    await prisma.media.update({ where: { sourceVideoId }, data: { status: 'ingested' } });
    await prisma.project.update({ where: { id: projectId }, data: { status: 'REVIEW' } });
    logger.info('video-ingested', { projectId, sourceVideoId });
  }, { connection });

  worker.on('failed', (job, error) => {
    logger.error('video-ingestion-failed', { jobId: job?.id, error: error.message });
  });

  logger.info('worker-started', {
    redisUrl: config.REDIS_URL,
    queue: 'default',
  });

  return { client, worker };
};

export default startWorker;
