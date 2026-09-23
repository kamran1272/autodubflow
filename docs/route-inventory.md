# Route Inventory

Baseline: 2026-09-24. Routes below are current `apps/web` routes, not claims of complete backend behavior.

| Route | Purpose | Auth | API dependency | Loading/empty/error | Primary actions | Tests |
|---|---|---|---|---|---|---|
| `/` | Public landing | Public | None | Basic page | Login/register navigation | None |
| `/login` | Sign in | Public | Better Auth | Form error state | Sign in | Auth tests are API-level |
| `/register` | Create account | Public | Better Auth | Form error state | Register | Auth tests are API-level |
| `/forgot-password` | Request reset | Public | Better Auth | Form state | Submit reset request | None |
| `/reset-password` | Set password | Public | Better Auth | Form state | Submit password | None |
| `/dashboard` | Operational overview | Protected | Fixture data | No API-backed states | Navigation | None |
| `/automations` | Automation list | Protected | Fixture data | No API-backed states | New automation button is not wired | None |
| `/agent` | Agent workspace | Protected | Fixture data | No durable activity API | Chat/status controls are not integrated | None |
| `/queue` | Queue view | Protected | Fixture data | No live queue state | Visual controls only | None |
| `/pipeline` | Stage view | Protected | Fixture data | No durable stage API | Visual controls only | None |
| `/ready-buffer` | Ready assets | Protected | Fixture data | No reservation API | Visual controls only | None |
| `/schedule` | Schedule view | Protected | Fixture data | No schedule API | Visual controls only | None |
| `/publishing` | Publishing view | Protected | Fixture data | No publish API | Visual controls only | None |
| `/settings/account` | Account settings | Protected | Session/auth | Partial | Account actions | None |
| `/sources` | Source channels | Disabled navigation | None | Unavailable | Explicitly disabled | None |
| `/destinations` | Destination channels | Disabled navigation | None | Unavailable | Explicitly disabled | None |
| `/templates` | Templates | Disabled navigation | None | Coming soon | Explicitly disabled | None |
| `/notifications` | Notifications | Disabled navigation | None | Coming soon | Explicitly disabled | None |
| `/analytics` | Analytics | Disabled navigation | None | Coming soon | Explicitly disabled | None |

The supporting `apps/dubflow-web` studio has additional project/tool routes, but its API client targets media routes that the active media API does not currently expose. Those routes must be migrated behind canonical auth and persistence before being treated as production functionality.
