# Target Architecture

## Product boundary

AutoDubFlow is an autonomous AI video automation platform. A user configures an automation once; server-side services continue operating when the browser and user's computer are offline. The full video studio remains available for inspection, correction, and manual override.

## System flow

```text
USER
  ↓
WEB APP
  ↓
API
  ↓
DATABASE + QUEUE
  ↓
AGENT ORCHESTRATOR
  ↓
SPECIALIZED WORKERS
  ↓
PROVIDERS / VIDEO ENGINE / BROWSER AGENT
  ↓
DATABASE
  ↓
SCHEDULER + READY BUFFER
  ↓
AUTHORIZED YOUTUBE PUBLISHING
  ↓
VERIFY / NOTIFY / AUDIT
```

## Applications

- `apps/web`: AutoDubFlow control plane: automation center, agent workspace, pipeline, ready buffer, scheduler, publishing, settings, notifications, and studio entry points.
- `apps/api`: authenticated API, automation configuration, webhooks, source events, job creation, authorization, and read models.
- `apps/worker`: durable stage consumers for media, dubbing, analysis, editing, captions, rendering, QC, metadata, and publishing.
- `apps/browser-agent`: isolated remote Chromium/Playwright sessions for approved browser tasks and live observation.
- `apps/dubflow-web`: supporting manual studio; it must not redefine the product or own autonomous orchestration.

## Packages

- `database`: Prisma schema, migrations, repositories, encrypted secret references, and durable workflow state.
- `shared`: autonomous event contracts, API DTOs, status enums, validation, idempotency keys, and audit types.
- `queue`: named BullMQ queues, typed jobs, retry/backoff policy, deduplication, and queue observability.
- `storage`: local/S3-compatible object storage abstraction and signed URLs.
- `video-engine`: deterministic FFmpeg editing, reframe, crop, background, mask, transitions, render, and probe operations.
- `providers`: YouTube, ElevenLabs, STT, translation, caption, and metadata adapters.
- `ai`: agent decision policy, intent parsing, tool schemas, recovery policy, and model gateway. The agent never runs FFmpeg directly.
- `auth`: Better Auth configuration, OAuth ownership, session policy, and authorization helpers.
- `config`: validated environment and feature flags.
- `logger`: structured, redacted logs and correlation IDs.

## Durable workflow

```text
SOURCE_EVENT
→ ELIGIBILITY_CHECK
→ MEDIA_INGESTION
→ MEDIA_VALIDATION
→ DUBBING
→ VIDEO_ANALYSIS
→ SMART_REFRAME
→ EXISTING_CAPTION_DETECTION
→ CAPTION_MASK
→ TRANSITIONS
→ TARGET_CAPTION_GENERATION
→ RENDER
→ QUALITY_CONTROL
→ METADATA
→ READY_BUFFER
→ SCHEDULING
→ PUBLISH
→ VERIFY
→ COMPLETE
```

Each stage is optional according to automation configuration, independently restartable, persisted, idempotent, and observable. A stage emits an event and creates the next stage job only after its durable result is committed.

## Authorization and rights

Every source automation must record an explicit ownership/authorization confirmation and the source provider identity. Media ingestion may use only authorized APIs or user-authorized media access. No DRM bypass, private-content bypass, credential theft, or access-control circumvention is permitted.

## Agent responsibilities

The agent observes events and tool results, interprets policy, selects the next valid operation, invokes typed tools, records decisions, and recovers from retryable failures. Deterministic workers perform media processing; workflow state lives in the database; progress is never invented in prompts.

## Runtime guarantees

- Browser closure does not stop server-side work.
- Every job has an idempotency key and durable attempt record.
- Retryable and terminal failures are distinct.
- OAuth tokens and browser session secrets are encrypted and never logged.
- Ready videos are processed before their publication window; the scheduler only controls release.
- All publish operations verify the destination result and write an audit event.
