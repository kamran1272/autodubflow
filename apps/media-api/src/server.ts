import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { databaseHealthy, databaseProvider } from './config/db.js';

export function buildServer() {
  const app = Fastify({ logger: false });

  void app.register(cors, { origin: env.allowedOrigins });

  app.get('/health', async () => ({
    status: 'ok',
    database: databaseProvider(),
    databaseHealthy: await databaseHealthy(),
  }));

  return app;
}

const app = buildServer();

try {
  await app.listen({ host: env.HOST, port: env.PORT });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
