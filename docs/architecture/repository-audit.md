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
# Repository Audit

Audit date: 2026-09-24
Branch: `architecture-rebuild` (worktree clean at audit start)
Product target: AutoDubFlow, an autonomous AI video automation platform with a supporting manual video studio.

## Executive finding

This is a pnpm/Turbo TypeScript monorepo with useful foundations, but it is not yet an autonomous production platform. Authentication, health endpoints, a Prisma domain model, media primitives, and a workflow reducer exist. Source monitoring, durable stage execution, publishing, scheduling, browser sessions, and most operational UI behavior are not implemented.

## 1. Current architecture

- `apps/web`: Next.js control-plane UI with auth, dashboard, automation, queue, pipeline, ready-buffer, scheduling, publishing, and agent routes.
- `apps/api`: Express API with Better Auth, CORS/origin checks, session, and health routes.
- `apps/worker`: startup-only Redis/BullMQ client; it does not create a BullMQ `Worker` consumer.
- `apps/browser-agent`: service boundary with a static placeholder response; no managed Chromium runtime.
- `apps/dubflow-web`: Vite/React manual media studio and the main source of reusable editor UI/media code.
- `apps/media-api`: Fastify health service plus media/provider code, but no active media workflow routes.
- `packages/database`: Prisma 6 client and the canonical PostgreSQL-oriented autonomous schema.
- `packages/workflow`: deterministic in-memory reducer prototype.
- `packages/ai`: deterministic agent-runtime contract with bounded observe/plan/tool/validate/persist cycles; it has no provider or database integration yet.
- `packages/queue`: basic BullMQ queue factory.
- `packages/media-shared`: media DTOs, validation, subtitle types, and provider contracts.
- `packages/config`, `logger`, and `shared`: configuration, structured logging, and small shared contracts.
- `infrastructure`: Compose dependencies and development-oriented Dockerfiles.

## 2. Current framework

TypeScript is used throughout. The control plane is Next.js 15/React 19; the manual studio is Vite/React 18. The main API is Express; the media boundary is Fastify. Prisma targets PostgreSQL. BullMQ and ioredis provide the intended queue foundation. FFmpeg and Playwright are present at the media/browser boundaries. Better Auth uses the Prisma adapter.

## 3. Current package manager

The repository uses pnpm 9.12.0 with a workspace covering `apps/*` and `packages/*`, and Turbo for task orchestration. `docs/dubflow` contains an additional historical package manifest and lockfiles and is not part of the root workspace globs.

## 4. Current applications

The canonical applications are `web`, `api`, `worker`, and `browser-agent`. `dubflow-web` and `media-api` are existing supporting/legacy surfaces that need an explicit boundary. Root Compose currently starts API, worker, and browser-agent, but not web or media-api.

## 5. Current database

The active schema is `packages/database/prisma/schema.prisma`, using PostgreSQL and Better Auth models plus source channels, destination channels, automations, schedules, processing configuration, source videos, one-to-one stage records, ready-buffer records, and publishing records. No Prisma migration directory is committed. The package exposes `db:push`, not a production migration deployment workflow.

## 6. Current integrations

Redis/BullMQ, PostgreSQL/Prisma, MinIO direction, Better Auth, FFmpeg, and mock/live media provider contracts are present. ElevenLabs, translation, STT, and TTS adapters exist under `apps/media-api`, but they are not connected to an autonomous worker pipeline. There is no implemented YouTube source push receiver, official destination publisher, or production browser task protocol.

## 7. Reusable components

Keep the pnpm/Turbo workspace, Next.js shell, Better Auth configuration/middleware/ownership helpers, Prisma boundary, queue choice, structured logger, config validation, workflow reducer tests, media probing/timeline/subtitle utilities, provider interfaces, mock providers, filesystem safety helpers, and PostgreSQL/Redis/MinIO direction. The manual studio is reusable as an inspection/editing surface after its authentication and persistence are replaced.

## 8. Broken components

The API has no domain endpoints beyond auth/session/health. The worker has no consumers or stage handlers. The browser agent is a static placeholder. The media API exposes health only even though the studio calls upload, voice, project, and process routes. The UI cannot currently configure or operate a real automation end to end.

## 9. Duplicate components

There are two UI products (`apps/web` and `apps/dubflow-web`), two backend styles (Express and Fastify), two media/database boundaries, and a second DubFlow Prisma schema at `packages/database/prisma/dubflow/`. The nested `docs/dubflow` metadata is historical. These must be assigned ownership rather than mechanically merged.

## 10. Conflicting architecture

The target documents describe an event-driven autonomous pipeline, while runtime code still centers on health/startup boundaries. The target package list includes storage, video-engine, providers, ai, and auth, but those are not root packages. The reducer is in-memory while the product requires durable events, retries, leases, and crash recovery. The media studio is manual/project-oriented while the product definition is channel automation-first.

### Legacy specification versus correct product

| Area | Legacy/manual-studio emphasis | Correct AutoDubFlow architecture | Disposition |
|---|---|---|---|
| Product | VideoForge AI | AutoDubFlow autonomous video automation | Rebrand production UI; preserve compatibility only during migration |
| Core object | Manual project | Automation plus source video, output variants, jobs, and durable events | Refactor domain model |
| Trigger | User uploads a file | Authorized new source-video event, with polling fallback | Replace as primary workflow trigger |
| Workflow owner | User starts individual AI tools | Server-side agent observes, decides, and advances typed stages | Refactor orchestration |
| Dubbing | Manual project action | Restartable DubbingJob with configurable provider/language | Keep provider code; refactor execution |
| Editing | Video Studio interaction | Deterministic video engine with optional browser editor adapter | Separate studio from workers |
| Publishing | Secondary or absent | Authorized destination channel, ready buffer, scheduler, upload, verify | Add core workflow |
| Scheduling | Not central | IANA timezone rules, UTC execution records, multiple videos/day | Add durable scheduler |
| Source channel | Missing | Required owned/authorized YouTube source configuration | Add rights-aware model and UI |
| Destination channel | Missing | Required authorized YouTube publishing connection | Add provider credential boundary |
| Browser agent | Not central | Dedicated isolated Chromium/Playwright service | Replace placeholder boundary |
| Notifications | Generic status messaging | User preferences plus internal agent events and audit records | Split concerns |
| Voice commands | Missing | Microphone, STT, intent, confirmation, structured action, audit | Add after core commands |
| Crash recovery | Limited | Durable attempts, leases, retries, idempotency, replayable events | Mandatory refactor |
| Long-running autonomy | Not central | Server continues while browser and user computer are offline | Core acceptance criterion |
| Output formats | Limited project outputs | Long-form, 9:16, Shorts/TikTok/Instagram-style presets | Add variant model and render policy |

The legacy studio operations such as upload, analysis, translation, dubbing, subtitles, and render remain useful as manual inspection/editing capabilities. They are not a substitute for source monitoring, durable stage jobs, ready-buffer scheduling, or authorized publishing. The current studio client references `/api/uploads/videos`, `/api/voices`, `/api/projects`, and `/api/projects/:id/process`; the active media API currently registers only `/health`.

## 11. Dead code

Generated output (`apps/web/.next`, `apps/dubflow-web/dist`, generated Prisma/media artifacts) is not source and can obscure clean-build behavior. Historical nested manifests and lockfiles are not active runtime code. Disabled navigation and unconnected studio API calls are dead paths until their owning service exists.

## 12. Placeholder/fake implementations

The browser session response explicitly says automation is not implemented. The worker only logs startup. Main UI pages contain fixture metrics, jobs, delivery statuses, and connector health. The manual studio stores demo credentials locally and simulates processing after API failure. These states must be visibly marked mock/unavailable or removed before production claims.

## 13. Incorrect dependencies

The active workspace previously declared Prisma 5.11 directly in `apps/media-api` while the canonical database package uses Prisma 6.0. Phase 1 removed those unused media-api declarations; the root lockfile now has one active Prisma version. React 18/19 separation is valid only if each app remains isolated. The historical `docs/dubflow` lockfile still contains Prisma 5 and is not part of the root workspace.

## 14. Missing dependencies

The target requires explicit storage, video-engine, providers, and auth package boundaries, plus YouTube API/PubSub support, scheduler execution, durable event/attempt persistence, notification delivery, usage metering, and browser session infrastructure. `packages/ai` now provides the control-loop contract, but still needs integration with durable state and real tools. Add each remaining boundary only with a vertical slice and tests; do not scaffold empty packages for appearance.

## 15. Security issues

Development fallback secrets and database/object-store credentials exist in configuration. Auth reset URLs are logged. Studio passwords are stored in `localStorage`. OAuth access/refresh token fields have no documented encryption or rotation boundary. Rate limiting is process-local and unbounded. CORS/origin policy is duplicated. Future ingestion and FFmpeg paths must retain argument/path validation, SSRF controls, bounded workspaces, and redacted logs. No secret values are reproduced in this audit.

## 16. Database conflicts

The active schema has broad nullable relations, string stage statuses, no migration history, no durable workflow event or stage-attempt model, no provider-immutable source identity constraint, no rights grant, no encrypted credential reference, no execution record for schedules, and incomplete publish verification/retry state. The DubFlow schemas represent a separate manual-studio domain and must be mapped deliberately.

## 17. UI conflicts

The control-plane routes are mostly fixture-backed and include dead or disabled controls. The studio retains `VideoForge AI` branding, local/demo authentication, local React state, object URLs, simulated rendering, and fake persistence. Missing states include rights confirmation, revoked OAuth, stage retry/failure, ready-buffer reservation conflicts, schedule capacity conflicts, upload verification, and agent confirmation.

## 18. Routing conflicts

The UI calls domain surfaces that the API does not expose. The studio calls `/api/uploads/videos`, `/api/voices`, `/api/projects`, and `/api/projects/:id/process`, while the active Fastify service registers only `/health`. The two UI applications also have separate auth/routing models. The canonical product route should be `apps/web`; studio routes should be explicitly subordinate.

## 19. Naming conflicts

The final name is AutoDubFlow. Active legacy strings include `VideoForge AI`, `videoforge-account`, and `videoforge-session` in `apps/dubflow-web`, plus historical DubFlow naming in docs and schemas. First migrate product-visible text and auth ownership deliberately; do not rename files or database tables blindly.

## 20. Provider conflicts

Provider contracts live in media code, but there is no canonical `packages/providers` boundary or provider credential ownership model. ElevenLabs is an intended primary dubbing adapter, not the workflow itself. YouTube publishing should use authorized official APIs first; browser automation is an additional adapter, not the primary publisher.

## 21. Workflow conflicts

The required stages are distinct and optional by configuration, but the current model is one source video with one-to-one stage records and an in-memory reducer. There are no durable stage jobs, attempts, leases, idempotency constraints, event records, or transactional outbox. The next slice must prove `SOURCE_EVENT` through persisted ingestion and a worker transition before expanding providers.

## 22. Deployment conflicts

Compose hardcodes development credentials and omits web/media-api. Dockerfiles run `dev` commands, do not build production artifacts, do not run migrations/generate Prisma in a deployment policy, lack readiness checks, and do not define browser dependencies or persistent media work storage. `infrastructure/docker/docker-compose.dubflow.yml` is a second inconsistent Compose definition.

## Product-name migration plan

1. Treat `apps/web` and root docs as the canonical AutoDubFlow surface.
2. Inventory and replace user-visible `VideoForge AI` text in `apps/dubflow-web`; preserve file names only where migration compatibility requires them.
3. Move studio auth and persistence behind the canonical API before removing local storage keys.
4. Retain old schema/table identifiers only with an explicit migration map and deprecation record.
5. Remove historical branding and nested metadata after the supporting studio capabilities are migrated and tested.

## Classification

### KEEP

Monorepo/tooling direction, control-plane shell, Better Auth foundation, Prisma technology, BullMQ/Redis, media primitives, provider contracts, mock mode, logger/config, filesystem safety, focused tests, and the bounded `packages/ai` runtime contract.

### REFACTOR

API domain routes, durable database state, queue contracts, worker consumers, media service boundary, UI data/commands/states, rights and credentials, package boundaries, naming migration, and production deployment.

### REPLACE

Static browser-agent response, startup-only worker, fake UI telemetry, local/demo auth, simulated success paths, and browser-click-first publishing assumptions.

### REMOVE AFTER MIGRATION

Unbacked fixture claims, dead enabled controls, legacy branding, duplicate nested metadata, stale generated artifacts from source distribution, and the unused Prisma 5 dependency.

## Validation baseline

Read-only inspection found no database reset or destructive operation. Verified during this audit: canonical Prisma validation passes; the four focused workflow tests pass; API typecheck passes; media-api typecheck passes; and `docker compose config` renders successfully. The Next.js web typecheck fails with eight React 18/19 `ReactNode` incompatibilities involving `apps/web` sources and `.next` generated types. Workspace-wide Turbo typecheck did not produce a reliable final result because overlapping Windows terminal state force-killed tasks. Lint, full tests, and full build remain unverified; the repository is not claimed to build cleanly.

## Audit conclusion

Do not delete the repository or reset its database. Keep the foundations, make workflow state durable and event-driven, and treat the manual studio as a supporting inspection surface. The exact next implementation is the smallest end-to-end slice: authorized source event, dedupe, persisted source video, named ingestion queue, real worker transition, durable event, and ready/test fixture with integration coverage.
