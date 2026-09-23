import express from 'express';
import cors from 'cors';
import { createHealthPayload } from '@autodubflow/shared';
import { createLogger } from '@autodubflow/logger';
import { getConfig } from '@autodubflow/config';
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
