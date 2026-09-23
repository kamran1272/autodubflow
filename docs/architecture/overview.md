# Architecture overview

This repository establishes the Step 1 production-ready monorepo foundation for AutoDubFlow.

## Architectural goals

- Keep the web app focused on UI state and dashboard surfaces.
- Keep the API as the orchestration layer and job scheduler.
- Keep deterministic execution in the worker boundary.
- Keep browser automation isolated in its own service.
- Persist authoritative state in the database and queue.

## Service responsibilities

### Web app

The web app renders the product shell and status surfaces. It does not execute long-running media tasks or browser automation.

### API app

The API app owns request handling, health endpoints, and coordination logic. It responds to health checks and schedules work through the queue and database integration.

### Worker app

The worker app bootstraps the Redis/BullMQ queue client and is ready for future background-job execution.

### Browser agent

The browser-agent app exposes the future Playwright boundary without performing automation yet.

## Runtime foundations

- TypeScript strict configuration is centralized in the root tsconfig.
- pnpm workspaces build the monorepo.
- Prisma establishes the database boundary with a minimal schema.
- Redis and BullMQ are abstracted in the queue package.
- The config package validates server-side environment variables.
- The logger package emits structured logs without leaking secrets.
