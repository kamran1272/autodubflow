import express from 'express';
import cors from 'cors';
import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { createHealthPayload } from '@autodubflow/shared';
import { createLogger } from '@autodubflow/logger';
import { getConfig } from '@autodubflow/config';
import { prisma } from '@autodubflow/database';
import { createQueueClient } from '@autodubflow/queue';
import { authHandler } from './auth/config';
import { requireAuth } from './auth/middleware';

const app = express();
const logger = createLogger('api');
const config = getConfig();

const createRateLimiter = (windowMs: number, max: number) => {
  const buckets = new Map<string, { count: number; resetAt: number }>();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = `${req.ip ?? 'unknown'}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= max) {
      res.status(429).json({ error: 'Too many requests. Please retry later.' });
      return;
    }

    bucket.count += 1;
    next();
  };
};

const authLimiter = createRateLimiter(60_000, 20);
const ingestionQueue = createQueueClient(config.REDIS_URL, 'media-ingestion');

app.use(
  cors({
    origin: [config.WEB_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
    const origin = req.headers.origin ?? '';
    const allowedOrigins = [config.WEB_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];

    if (origin && !allowedOrigins.includes(origin)) {
      logger.warn('blocked-origin', { origin, path: req.path });
      _res.status(403).json({ error: 'Origin not allowed.' });
      return;
    }
  }

  next();
});

app.all('/api/auth/*', authLimiter, (req, res) => {
  void authHandler(req, res);
});

app.all('/api/auth', authLimiter, (req, res) => {
  void authHandler(req, res);
});

app.get('/api/projects', async (req, res) => {
  await requireAuth(req as any, res, async () => {
    const userId = (req as any).user.id as string;
    const projects = await prisma.project.findMany({
      where: { userId },
      include: { sourceVideo: { include: { media: true, stageExecutions: { orderBy: { createdAt: 'desc' }, take: 1 } } } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ projects });
  });
});

app.post('/api/projects', express.raw({ type: ['video/*', 'application/octet-stream'], limit: '500mb' }), async (req, res) => {
  await requireAuth(req as any, res, async () => {
    const userId = (req as any).user.id as string;
    const filename = basename(String(req.headers['x-file-name'] ?? 'source-video'));
    const title = String(req.headers['x-project-name'] ?? filename.replace(/\.[^.]+$/, '')).trim() || 'Untitled video';
    const contentType = String(req.headers['content-type'] ?? 'application/octet-stream').split(';')[0];
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from('');

    if (body.length === 0) {
      res.status(400).json({ error: 'A non-empty video file is required.' });
      return;
    }

    const projectId = crypto.randomUUID();
    const storageKey = join('uploads', userId, `${projectId}-${filename}`);
    const storagePath = join(process.cwd(), storageKey);
    await mkdir(join(process.cwd(), 'uploads', userId), { recursive: true });
    await writeFile(storagePath, body);

    const project = await prisma.$transaction(async (transaction) => {
      const workspace = await transaction.workspace.findFirst({ where: { ownerId: userId }, orderBy: { createdAt: 'asc' } })
        ?? await transaction.workspace.create({ data: { ownerId: userId, name: 'Personal workspace' } });
      const sourceVideo = await transaction.sourceVideo.create({
        data: {
          userId,
          title,
          status: 'QUEUED',
          media: { create: { fileKey: storageKey, format: contentType, status: 'queued' } },
        },
      });
      return transaction.project.create({
        data: {
          id: projectId,
          workspaceId: workspace.id,
          userId,
          sourceVideoId: sourceVideo.id,
          name: title,
          status: 'PROCESSING',
          assets: { create: { kind: 'SOURCE', storageKey, mimeType: contentType, sizeBytes: BigInt(body.length), metadata: { filename } } },
        },
        include: { sourceVideo: { include: { media: true } } },
      });
    });

    await ingestionQueue.add('ingest-video', { projectId: project.id, sourceVideoId: project.sourceVideoId });
    res.status(202).json({ project: JSON.parse(JSON.stringify(project, (_key, value) => typeof value === 'bigint' ? value.toString() : value)) });
  });
});

app.get('/session', async (req, res) => {
  await requireAuth(req as any, res, () => {
    res.json({ authenticated: true, user: (req as any).user });
  });
});

app.get('/health', (_req, res) => {
  const payload = createHealthPayload('api', 'ok');
  logger.info('health-check', { payload });
  res.json(payload);
});

app.get('/', (_req, res) => {
  res.json({
    name: config.APP_NAME,
    status: 'ok',
    service: 'api',
    environment: config.NODE_ENV,
  });
});

export const startServer = () => {
  const port = Number(process.env.API_PORT ?? 4000);

  app.listen(port, () => {
    logger.info('api-started', { port, environment: config.NODE_ENV });
  });

  return app;
};

export default app;
