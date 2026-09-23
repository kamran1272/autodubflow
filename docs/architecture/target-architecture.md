# Target Architecture

Status: target design, not an implementation claim. Audit date: 2026-09-24.

## Product boundary

AutoDubFlow is an autonomous AI video automation platform. A user configures an automation once; server-side services continue operating when the browser and user's computer are offline. The full video studio remains available for inspection, correction, and manual override.

The one-time automation configuration owns the source channel, authorized destination channel, source and dubbing languages, videos-per-day capacity, IANA-timezone schedule, editing and caption templates, output presets, notification policy, quality policy, ready-buffer target, rights confirmation, and autonomous-mode state. Enabling an automation creates durable server-side work; it does not require an open browser session.

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

The user can close the browser and power off their computer after configuration. API commands create durable records and queue jobs; the agent observes durable events and chooses typed operations, while deterministic workers execute media and provider work. No progress is inferred from prompt context.

## Applications

- `apps/web`: AutoDubFlow control plane: automation center, agent workspace, pipeline, ready buffer, scheduler, publishing, settings, notifications, and studio entry points.
- `apps/api`: authenticated API, automation configuration, webhooks, source events, job creation, authorization, and read models.
- `apps/worker`: durable stage consumers for media, dubbing, analysis, editing, captions, rendering, QC, metadata, and publishing.
- `apps/browser-agent`: isolated remote Chromium/Playwright sessions for approved browser tasks and live observation.
- `apps/dubflow-web`: supporting manual studio; it must not redefine the product or own autonomous orchestration.

The canonical web route is `apps/web`. The studio is retained for manual inspection, correction, caption editing, and override workflows after it uses canonical auth, storage, and API contracts.

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

The durable model uses distinct `MediaJob`, `DubbingJob`, `AnalysisJob`, `EditingJob`, `CaptionJob`, `RenderJob`, `QualityControlJob`, and `PublishJob` records or stage-execution records. A generic source-video aggregate may coordinate them, but one giant `ProcessingJob` is not the execution model.

Source monitoring uses YouTube push/webhook events where supported, authoritative metadata lookup, deduplication by provider plus immutable external ID, and polling only as a fallback. Publishing uses an authorized official YouTube API adapter first; browser automation is a separate approved execution surface.

Output presets are data, not hard-coded Shorts behavior. Built-in presets include YouTube Shorts, TikTok Vertical, Instagram Reels, YouTube Long-form, and Custom. A preset defines aspect ratio, resolution, safe zones, caption placement, duration guidance, and encoding profile; one source asset may produce multiple configured variants.

Existing-caption processing is conditional: analyze the video for burned-in text, create a mask/blur only when detection passes the configured confidence policy, skip masking when no existing caption is detected, then generate and style target-language captions before rendering. The system must not apply a fixed bottom-region blur to every video.

Editing is provider-based. `FFmpegEditingProvider` is the deterministic default; `BrowserEditorProvider` is a separate adapter, and a CapCut-specific adapter is added only when an officially supported integration is available. No provider-specific browser selectors define the core workflow.

## Authorization and rights

Every source automation must record an explicit ownership/authorization confirmation and the source provider identity. Media ingestion may use only authorized APIs or user-authorized media access. No DRM bypass, private-content bypass, credential theft, or access-control circumvention is permitted.

Credentials are stored as encrypted provider references with ownership, scope, expiry, revocation, and rotation metadata. Browser sessions are isolated by user and automation; debugging ports are private to the browser-agent network and raw credentials are not ordinary workflow fields.

## Agent responsibilities

The agent observes events and tool results, interprets policy, selects the next valid operation, invokes typed tools, records decisions, and recovers from retryable failures. Deterministic workers perform media processing; workflow state lives in the database; progress is never invented in prompts.

The runtime loop is:

```text
OBSERVE
  -> LOAD AUTOMATION STATE
  -> CHECK RULES
  -> PLAN NEXT SAFE ACTION
  -> CALL TOOL
  -> OBSERVE TOOL RESULT
  -> VALIDATE RESULT
  -> UPDATE DATABASE
  -> SELECT NEXT STEP
```

`packages/ai` contains the current bounded runtime contract and tests. Scheduling, retries, idempotency, job states, file validation, encoding, quota checks, and OAuth state validation remain deterministic services or workers. The agent may choose among valid typed operations, but it cannot bypass those checks or claim success without a validated tool result.

## Runtime guarantees

- Browser closure does not stop server-side work.
- The visible remote browser is an observation and approved-task surface; autonomous processing does not depend on a user watching or controlling Chromium.
- Every job has an idempotency key and durable attempt record.
- Retryable and terminal failures are distinct.
- OAuth tokens and browser session secrets are encrypted and never logged.
- Ready videos are processed before their publication window; the scheduler only controls release.
- All publish operations verify the destination result and write an audit event.
- Mock, production, and not-implemented states are explicit in configuration and UI; a mock result is never presented as a production provider success.
