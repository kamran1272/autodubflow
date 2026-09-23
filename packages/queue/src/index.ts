import IORedis from 'ioredis';
import { Queue } from 'bullmq';

export type QueueClient = Queue;

export const createQueueClient = (redisUrl: string, queueName = 'default') => {
  const connection = new IORedis(redisUrl);

  return new Queue(queueName, { connection });
};

export const queueStatus = 'queue-ready';

console.log('AutoDubFlow queue package booted');