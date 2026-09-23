# AutoDubFlow

AutoDubFlow is a production-oriented media automation platform for multilingual video localization. The system follows a layered architecture designed to keep user-facing workflows responsive while expensive tasks run asynchronously in dedicated worker and browser services.

## Architecture principles

- Frontend apps are UI-only and do not perform long-running media work.
- The API layer authorizes requests and schedules jobs.
- Workers execute deterministic and time-intensive operations.
- Browser automation runs in an isolated service with a narrow responsibility.
- Shared contracts live in the shared package rather than in application code.
- AI decides intent and generates actions; workers, providers, and video engine perform the actual execution.

## Target monorepo layout (Step 1)

```text
autodubflow/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── browser-agent/
├── packages/
│   ├── database/
│   ├── shared/
│   ├── queue/
│   ├── config/
│   └── logger/
├── tests/
├── docs/
│
├── .env.example
├── .gitignore
├── .dockerignore
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
└── README.md
```

## Request flow

```text
USER
 ↓
WEB
 ↓
API
 ↓
DATABASE + QUEUE
 ↓
AI ORCHESTRATOR
 ↓
SPECIALIZED WORKERS
 ↓
PROVIDERS / VIDEO ENGINE / BROWSER
 ↓
DATABASE
 ↓
WEB REALTIME UPDATE
```

This is intentionally different from a frontend-driven AI automation flow, which is fragile because the UI becomes responsible for orchestration, browser execution, and long-running infrastructure work.

## App responsibilities

### apps/dubflow-web

The DubFlow media studio for video upload, projects, transcripts, translations, subtitles, voices, and dubbing exports. It runs at `http://localhost:5173` and uses the media API at `http://localhost:4100`.

### apps/web

The main AutoDubFlow control plane. It handles the authenticated dashboard, automation setup, workspaces, browser views, queues, scheduling, notifications, voice UI, agent chat, and analytics. It runs at `http://localhost:3000` and does not run FFmpeg or other long-lived processing tasks.

### apps/api

Control and API layer. Handles authentication, users, automations, channels, settings, agent commands, API endpoints, webhooks, OAuth callbacks, and database orchestration. It enqueues work and coordinates requests rather than performing expensive work in-process.

### apps/worker

Background execution for source monitoring, media ingestion, validation, dubbing, analysis, editing, captioning, rendering, quality control, metadata, publishing, cleanup, and notifications.

### apps/browser-agent

Autonomous Chromium/Playwright service. It handles browser sessions, navigation, clicks, typing, uploads/downloads, screenshots, browser state, and third-party website interaction. It is not the place for product business logic.

## Package responsibilities

- packages/database: Prisma schema, migrations, repositories, database client.
- packages/shared: TypeScript types, Zod schemas, enums, API contracts, queue states, constants.
- packages/queue: BullMQ and Redis abstractions for operational jobs.
- packages/config: environment variables, flags, runtime config.
- packages/logger: structured logs and observability helpers.

## Development notes

- Use pnpm workspaces for the monorepo.
- Keep provider SDKs behind provider interfaces.
- Keep business logic outside of browser-agent and web apps.
- Use the queue and database layers as the coordination backbone.
- Treat AI as a coordinator, not a replacement for deterministic workers.

## Next steps

1. Scaffold Next.js web app.
2. Scaffold API service.
3. Configure worker runtime and queue clients.
4. Add Prisma schema and migrations.
5. Implement provider interfaces and queue contracts.
6. Add browser-agent service with Playwright isolation.
7. Add end-to-end integration tests for the pipeline.
