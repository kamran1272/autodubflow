import { createLogger } from '@autodubflow/logger';
import { createQueueClient } from '@autodubflow/queue';
import { getConfig } from '@autodubflow/config';

const logger = createLogger('worker');
const config = getConfig();

export const startWorker = async () => {
  const client = createQueueClient(config.REDIS_URL, 'default');

  logger.info('worker-started', {
    redisUrl: config.REDIS_URL,
    queue: 'default',
  });

  return client;
};

export default startWorker;
