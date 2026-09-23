# DubFlow

DubFlow is a production-oriented AI dubbing platform that turns uploaded videos into Spanish-dubbed outputs through transcription, translation, voice generation, audio synchronization, and final rendering.

## Product overview

DubFlow helps content creators and teams localize video content with a workflow that includes:

- video upload and validation
- source audio extraction
- speech-to-text transcription
- translation to Spanish
- natural voice generation
- audio synchronization
- final Spanish video rendering
- progress tracking and project persistence

## Architecture

The monorepo is structured as a frontend app, backend API, shared package, and database configuration for future expansion.

## Requirements

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- FFmpeg installed on the system or inside containers
- pnpm or npm workspace support

## Installation

```bash
npm install
```

## Environment variables

Copy the sample environment file and adjust values:

```bash
cp .env.example .env
```

Key variables include:

- APP_ENV
- AI_MODE
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- STORAGE_PROVIDER
- VITE_API_BASE_URL

## Database setup

```bash
npm run db:migrate
npm run db:seed
```

## Redis setup

Start Redis locally:

```bash
docker compose up -d redis
```

## FFmpeg setup

Install FFmpeg and confirm it is available:

```bash
ffmpeg -version
```

## AI provider setup

Set provider values in `.env`:

- AI_PROVIDER
- STT_PROVIDER
- TRANSLATION_PROVIDER
- TTS_PROVIDER

When `AI_MODE=mock` or `APP_ENV=development`, mock providers are used for local demo runs.

## Running locally

```bash
npm run dev
```

This starts the API and frontend in development mode.

## Running tests

```bash
npm test
```

## Docker deployment

```bash
docker compose up --build
```

## Production deployment

Use the built API and web apps with environment variables configured for Postgres, Redis, and object storage.

## Troubleshooting

- If the frontend cannot reach the API, confirm `VITE_API_BASE_URL`.
- If Redis is unavailable, the queue cannot progress.
- If FFmpeg is missing, render jobs will fail.
- If the database is not migrated, Prisma operations will not work.

## Security considerations

- never commit secrets
- validate uploads in the backend
- restrict access by project ownership
- use signed URLs for downloads
- enable rate limiting on sensitive routes

## API documentation

The API exposes OpenAPI-compatible route metadata and Swagger UI via the Fastify integration.

## Project structure

```text
dubflow/
├── apps/
│   ├── api
│   └── web
├── packages/
├── prisma/
├── .env.example
├── README.md
├── package.json
├── pnpm-workspace.yaml
└── docker-compose.yml
```

## Future roadmap

Planned additions include multi-language support, speaker diarization, higher-fidelity voice options, batch processing, and cloud storage abstraction.
