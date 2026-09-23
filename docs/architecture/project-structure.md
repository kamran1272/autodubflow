# Project Structure

The repository root is the only active workspace. It is managed by pnpm and Turbo.

## Active boundaries

- `apps/web`: Next.js user interface
- `apps/api`: HTTP API and authorization
- `apps/worker`: background jobs
- `apps/browser-agent`: isolated browser automation
- `packages/database`: Prisma schema and database client
- `packages/shared`: shared contracts and validation
- `packages/queue`: BullMQ and Redis integration
- `packages/config`: runtime configuration
- `packages/logger`: structured logging
- `tests`: cross-package tests
- `infrastructure`: container and deployment definitions

## Migration source

`dubflow/` is retained temporarily because it contains unique media processing, provider, and workflow implementations that are not yet present in the active workspace. It is not part of the root pnpm workspace and must not be used as a second application entry point.

Future migration work should move tested capabilities from `dubflow/` into the matching root app or package, then remove the migrated source and its nested project metadata. Do not copy generated output, dependency folders, environment files, or runtime media during that migration.

The former `DUBBING APP/` prototype was removed as an obsolete duplicate.
