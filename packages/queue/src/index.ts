import IORedis from 'ioredis';
import { Queue } from 'bullmq';

export type QueueClient = Queue;

export const queueNames = [
  'source-monitor',
  'media-ingestion',
  'media-validation',
  'transcription',
  'translation',
  'dubbing',
  'analysis',
  'editing',
  'captioning',
  'rendering',
  'quality-control',
  'metadata',
  'publishing',
  'notifications',
  'cleanup',
  'browser-actions',
] as const;

export type QueueName = (typeof queueNames)[number];

export const createQueueClient = (redisUrl: string, queueName: QueueName | 'default' = 'default') => {
  const connection = new IORedis(redisUrl);

  return new Queue(queueName, { connection });
};

export const queueStatus = 'queue-ready';

console.log('AutoDubFlow queue package booted');