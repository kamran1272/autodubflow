import { createLogger } from '@autodubflow/logger';
import { createBrowserSession } from './browser';

const logger = createLogger('browser-agent');

export const startBrowserAgent = async () => {
  const session = await createBrowserSession();
  logger.info('browser-agent-started', { session });
  return session;
};

void startBrowserAgent();
