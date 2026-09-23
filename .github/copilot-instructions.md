# AutoDubFlow coding guidance

- Preserve the monorepo boundaries described in `AGENTS.md`.
- Use pnpm workspaces and Turbo for project commands.
- Keep authentication and ownership checks server-side.
- Use Prisma for durable state and Redis/BullMQ for asynchronous jobs.
- Keep long-running media work out of web and API request handlers.
- Validate changes with the smallest relevant command before widening scope.
