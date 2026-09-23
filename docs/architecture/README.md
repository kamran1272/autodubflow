# Architecture overview

This repository is being aligned to the audited AutoDubFlow target architecture: a UI-first, queue-driven media automation system with isolated service boundaries. The audit baseline documents which boundaries are implemented and which remain scaffolds.

## Core flow

```text
USER -> WEB -> API -> DATABASE + QUEUE -> AI ORCHESTRATOR -> WORKERS -> PROVIDERS / VIDEO ENGINE / BROWSER -> DATABASE -> WEB REALTIME UPDATE
```

## Responsibilities

### Web app

Only responsible for the user interface and real-time status surfaces. It may display queue state, automation states, live browser previews, and analytics but must not execute long-running media operations.

### API app

Owns user and automation orchestration, authorization, API contracts, webhooks, and job creation. It coordinates the system and persists state.

### Worker app

Executes long-running jobs like ingestion, dubbing, rendering, QC, publishing, cleanup, and notifications.

### Browser agent

Runs isolated Chromium automation and interacts with third-party websites with narrow browser-state responsibilities.

## Package boundaries

- shared: common contracts and schemas
- database: persistence and Prisma
- queue: BullMQ and Redis wrappers
- providers: third-party SDK wrappers behind interfaces
- video-engine: deterministic media processing
- ai: orchestration and command interpretation
- config: runtime configuration
- logger: structured logging

## Governance rule

AI may decide what to do, but the platform must not let the frontend or orchestration layer directly own expensive execution. Deterministic work belongs to workers, provider adapters, and the video engine.

For the verified current state and migration classifications, see [repository-audit.md](repository-audit.md). The target design is in [target-architecture.md](target-architecture.md), and implementation claims must follow [implementation-status.md](implementation-status.md).

The canonical cross-phase checklist is [../implementation-status.md](../implementation-status.md). The architecture-local status file is retained as an audit snapshot for the original architecture-document set.
