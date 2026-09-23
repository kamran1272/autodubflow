# Repository Audit

Audit date: 2026-09-24
Branch: `architecture-rebuild`
Product target: AutoDubFlow, an autonomous AI video automation platform with a supporting manual video studio.

## Executive finding

The repository is a pnpm/Turbo TypeScript monorepo with useful production foundations, but it is not yet an autonomous platform. The control plane has authentication and health endpoints; the worker, source monitor, workflow executor, publisher, scheduler, and browser agent are mostly boundaries or placeholders. The relocated DubFlow/Videoforge-style studio contains reusable media/provider code but must remain a supporting studio, not the product definition.

## Current architecture

- `apps/web`: Next.js control-plane UI, authentication pages, dashboard, and status-oriented screens.
- `apps/api`: Express API with Better Auth, CORS, origin checks, session endpoint, and health endpoint.
- `apps/worker`: startup-only Redis/BullMQ client; no BullMQ `Worker` consumer.
- `apps/browser-agent`: startup-only placeholder; no Chromium or Playwright session implementation.
- `apps/dubflow-web`: relocated Vite/React manual media studio. It is a separate application surface, not the autonomous control plane.
- `apps/media-api`: relocated media/provider library boundary with a minimal Fastify health server.
- `packages/database`: Prisma client and autonomous schema.
- `packages/shared`: minimal health contract package.
- `packages/media-shared`: media/provider contracts, schemas, constants, and DTOs.
- `packages/workflow`: deterministic in-memory workflow reducer with idempotency tests and `READY` state.
- `packages/queue`: basic BullMQ queue factory only.
- `packages/config`, `logger`: runtime config and structured logging foundations.
- `infrastructure`: Dockerfiles and a Compose stack for Postgres, Redis, MinIO, API, worker, and browser-agent.

## Framework and package manager

- Package manager: pnpm 9 workspace with Turbo.
- Backend: TypeScript, Express for the main API, Fastify for the media API.
- Frontend: Next.js 15/React 19 for the control plane; Vite/React 18 for the media studio.
- Database: Prisma 6 with PostgreSQL.
- Queue: BullMQ 5 and ioredis.
- Media: FFmpeg primitives and provider adapters in the relocated media packages.
- Auth: Better Auth with Prisma adapter.
- Browser: Playwright is declared in the legacy/media project, but the active browser-agent implementation is not built.

## Classification

### KEEP

- Next.js control-plane shell and authentication flow.
- Express API auth middleware, origin policy, ownership helper, and structured logging.
- Prisma/PostgreSQL boundary and autonomous entities.
- BullMQ/Redis choice and queue package boundary.
- FFmpeg process isolation, media probing, timeline, subtitle, and provider abstractions.
- Mock providers for development and tests.
- `packages/workflow` reducer as the beginning of a deterministic state boundary.
- Docker Compose dependency services and MinIO direction.
- Existing auth, ownership, workflow, and media primitive tests.

### REFACTOR

- Split `packages/shared` into complete autonomous contracts and keep media contracts in a deliberate shared boundary.
- Expand queue factory into named queues, typed payloads, retries, deduplication, and job metadata.
- Turn the worker startup into stage-specific BullMQ consumers.
- Make API health include dependency health and make errors structured.
- Convert UI demo data and controls into API-backed states.
- Add explicit source rights/authorization confirmation to automation configuration.
- Add migration history and a database migration policy.
- Add storage, video-engine, providers, ai, auth packages where boundaries are currently implicit.
- Add production Docker commands and readiness checks.

### REPLACE

- Placeholder browser-agent session with isolated Chromium/Playwright contexts and a narrow task protocol.
- Generic one-job mental model with durable stage jobs: Media, Dubbing, Analysis, Editing, Caption, Render, QC, Publish.
- Polling-only source-monitor assumption with YouTube push notifications plus polling fallback.
- Browser-click-first publishing with official authorized YouTube API publishing as the primary adapter.

### REMOVE AFTER MIGRATION

- Duplicate nested project metadata and dependency folders if any are reintroduced.
- VideoForge branding from production AutoDubFlow surfaces after all usages are migrated.
- Fake dashboard metrics, dead buttons, and claims of healthy/ready services that are not backed by runtime state.
- Unused legacy package manifests and lockfiles retained only as historical artifacts.

## Conflict inventory

1. Product conflict: the Vite studio is manual upload/project/export oriented; the target product is autonomous channel automation.
2. Runtime conflict: the API and worker are described as orchestrators/executors but currently expose startup/health behavior only.
3. Workflow conflict: Prisma has a status enum and stage records, but no durable event log or transition enforcement in the database.
4. Queue conflict: a generic queue factory exists without named queues, consumers, retry policy, or idempotency.
5. Database conflict: the autonomous schema and relocated DubFlow schema represent different domains; they must not be mechanically merged.
6. Contract conflict: `packages/shared` is minimal while `packages/media-shared` contains most operational media contracts.
7. Browser conflict: browser-agent is a placeholder and does not isolate user/automation sessions.
8. Publishing conflict: there is no YouTube OAuth/upload/verify adapter.
9. UI conflict: some autonomous routes now exist, but their data and commands are demonstrations rather than API-backed operations.
10. Deployment conflict: Dockerfiles run dev commands, omit healthchecks/migrations, and do not define a production process model.
11. Naming conflict: legacy `VideoForge AI` strings remain in `apps/dubflow-web`; this app must be labeled as legacy/supporting studio or rebranded through a planned migration.
12. Environment conflict: root `.env`, `.env.dubflow.local`, and `packages/database/.env` serve different boundaries; secrets remain local and must never be committed.

## Security findings

- No committed private environment files were found by Git tracking; examples are present and private files are ignored.
- Development secrets and database passwords are weak defaults and must be replaced in deployment.
- Auth logs include reset URLs in development; this must be disabled or redacted in production.
- Browser credentials and OAuth refresh tokens need encrypted secret storage, not ordinary fields or logs.
- FFmpeg and filesystem code require path/argument validation and bounded working directories.
- CORS/origin checks exist for the main API but need centralized configuration and integration tests.
- Rate limiting is in-memory and process-local; production needs a shared limiter or gateway policy.

## Dead, fake, or placeholder implementations

- Browser session creation returns a static ready object.
- Worker logs startup but does not consume jobs.
- Media API exposes health but no production routes/services.
- Dashboard, automation, queue, agent, pipeline, buffer, schedule, and publishing screens contain static sample values.
- Several sidebar items remain disabled or not implemented.
- Existing media studio includes local-storage/demo behavior and fallback simulation paths that must not be presented as production processing.

## Missing dependencies and boundaries

Missing or implicit target packages include storage, video-engine, providers, ai, and auth. The implementation should not add all of them speculatively; create each when a real contract and vertical slice requires it. YouTube Data API, PubSubHubbub/webhook handling, ElevenLabs production adapter, scheduler, durable event log, browser session store, notification delivery, and usage metering are not complete.

## Validation snapshot

- Workflow reducer tests: passing.
- Main web and edited route typechecks: passing at last validation.
- Auth signup was fixed by aligning `User.emailVerified` with Better Auth's boolean contract.
- Prisma schema can be pushed after PostgreSQL is running and `DATABASE_URL` is available.
- Main web typecheck initially encountered mixed React 18/19 declarations from the multi-app workspace; `apps/web/tsconfig.json` now scopes type roots to its own React 19 declarations.
- `apps/api` and `apps/worker` had TypeScript 6-only `ignoreDeprecations` overrides while the workspace uses TypeScript 5.9; both are aligned to the supported `5.0` setting.
- The API also required a typed CORS dependency and explicit Node-header/Web-`Headers` boundary casts; these are compile-safety fixes, not runtime policy changes.
- Full production build remains incomplete; generated Prisma client and Windows file locks have caused build friction.
- Docker dependency startup has worked when Docker Desktop is running; production containers are not yet production-ready.

## Audit conclusion

Do not delete the repository. Keep the foundations, make the autonomous workflow durable and event-driven, and treat the manual media studio as a supporting surface. The next implementation should be one end-to-end source-event-to-ready-buffer slice with real persistence, queue processing, retries, and tests.
