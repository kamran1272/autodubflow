# Implementation Roadmap

This roadmap follows the requested phases. A phase is not complete until implementation, tests, integration, UI verification, and documentation all pass.

| Phase | Scope | Exit evidence |
|---|---|---|
| 0 | Repository audit | Audit documents and classification committed |
| 1 | Architecture cleanup | Package boundaries, naming, and production/mock modes clarified |
| 2 | Database | Reviewed migrations, durable events, attempts, credentials, audit, usage |
| 3 | Authentication | Auth, ownership, OAuth consent, rights confirmation, security tests |
| 4 | UI/application shell | Route map, states, responsive shell, no dead enabled controls |
| 5 | Automation configuration | Source/destination, languages, rules, templates, rights confirmation |
| 6 | YouTube source monitoring | Push events, authoritative lookup, deduplication, polling fallback |
| 7 | Queue/workers | Named queues, typed jobs, leases, retries, idempotency, consumers |
| 8 | Storage/media ingestion | Authorized ingestion, object storage, validation, checksums |
| 9 | ElevenLabs dubbing | Provider abstraction, language config, webhook/callback, mock mode |
| 10 | Transcript and translation | Provider interfaces, transcript persistence, translation, editing contract |
| 11 | Video analysis | Language, duration, scene/aspect and burned-caption signals |
| 12 | Smart reframe/crop | 9:16, long-form, and platform preset geometry |
| 13 | Background blur | Deterministic blur/background provider and tests |
| 14 | Existing-caption detection | Confidence policy, regions, and review fallback |
| 15 | Existing-caption masking | Conditional mask/blur only after positive detection |
| 16 | Transitions | Configurable deterministic transitions and template rules |
| 17 | Target-language captions | Generation, edit model, styles, alignment, export formats |
| 18 | FFmpeg rendering | Variant outputs, progress, cancellation, resumability |
| 19 | Quality control and repair | Media gates, caption gates, retry/repair policy |
| 20 | Ready buffer | Process-ahead buffering, capacity, reservations |
| 21 | Scheduler | IANA rules, UTC executions, custom times, multiple videos/day |
| 22 | YouTube destination/publishing | OAuth, upload/schedule, verify, retry, audit |
| 23 | Remote browser | Isolated contexts, secure sessions, live view, task protocol |
| 24 | AI agent orchestrator | Observe/decide/tool/result/recover loop with bounded tools |
| 25 | Natural-language commands | Structured intent, confirmation, authorization, audit |
| 26 | Voice commands | Microphone, STT, intent, confirmation, audit |
| 27 | Notifications | User preferences, job/publish alerts, failure escalation |
| 28 | End-to-end automation | Source event to verified destination in test environment |
| 29 | Security audit | Secret scan, authz, path safety, SSRF, token encryption, threat review |
| 30 | Performance audit | Queue throughput, media capacity, backpressure, cost/usage limits |
| 31 | Production deployment | Migrations, healthchecks, secrets, observability, rollback, runbooks |

## Immediate next slice

Implement one vertical slice only:

`authorized source event → source-video dedupe → durable workflow event → media-ingestion queue → worker transition → persisted ready/test fixture`.

Do not begin ElevenLabs, browser live view, or broad UI work until this slice has real persistence, retry, idempotency, and integration tests.
