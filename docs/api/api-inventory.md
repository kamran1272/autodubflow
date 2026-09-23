# API Inventory

Baseline: 2026-09-24. Only routes verified in active server code are listed.

| Method | Route | Auth | Request/response | Validation/errors | Rate limit | Tests |
|---|---|---|---|---|---|---|
| ALL | `/api/auth` | Better Auth | Better Auth handler contract | Better Auth validation | In-memory auth limiter | Auth middleware tests |
| ALL | `/api/auth/*` | Better Auth | Better Auth handler contract | Better Auth validation | In-memory auth limiter | Auth middleware tests |
| GET | `/session` | Required session | `{ authenticated, user }` | Auth middleware | None | Middleware tests |
| GET | `/health` | Public | Service health payload | None | None | None |
| GET | `/` | Public | Service/environment payload | None | None | None |
| GET | media-api `/health` | Public | Database/provider health payload | Dependency check | Fastify policy | None |

Not currently exposed: automation CRUD, source/destination channels, rights confirmation, webhooks, source monitoring, projects, uploads, jobs, stage commands, scheduling, ready buffer, publishing, browser sessions, notifications, usage, and agent commands.

The legacy studio client references `/api/uploads/videos`, `/api/voices`, `/api/projects`, and `/api/projects/:id/process`; these are not active routes in the current media-api server.
