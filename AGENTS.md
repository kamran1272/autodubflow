# AGENTS.md

## Operating principles
- Work in phases, not giant rewrites.
- Read before editing.
- Preserve the architecture already present in the repo.
- Validate using the smallest relevant command set.
- Stop and report if required tooling is missing.

## Required repo conventions
- Use pnpm workspaces and Turbo where applicable.
- Keep package boundaries clear.
- Use Prisma for DB schema and durable state.
- Use Redis and BullMQ for async jobs.
- Use secure server-side auth and ownership checks.
- Keep secrets in environment variables, never in source control.

## Phase discipline
Do not move to the next phase until the current phase passes validation.
