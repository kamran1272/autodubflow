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
| 10 | Video analysis | Transcript, language, duration, scene/aspect and burned-caption signals |
| 11 | Smart reframe/crop/background | 9:16 and long-form presets with deterministic engine tests |
| 12 | Existing-caption detection/masking | Detection confidence, mask regions, review fallback |
| 13 | Transitions | Configurable deterministic transitions and template rules |
| 14 | Target-language captions | Generation, edit model, styles, alignment, export formats |
| 15 | Rendering | Variant outputs, progress, cancellation, resumability |
| 16 | Quality control | Media checks, audio/video checks, caption checks, gate policy |
| 17 | YouTube destination/publishing | OAuth, upload/schedule, verify, retry, audit |
| 18 | Scheduler/ready buffer | IANA rules, UTC reservations, capacity, multiple videos/day |
| 19 | Remote browser | Isolated contexts, secure sessions, live view, task protocol |
| 20 | AI agent | Observe/decide/tool/result/recover loop with bounded tools |
| 21 | Voice control | Microphone, STT, intent, confirmation, audit |
| 22 | Notifications | User preferences, job/publish alerts, failure escalation |
| 23 | End-to-end integration | Source event to verified destination in test environment |
| 24 | Security audit | Secret scan, authz, path safety, SSRF, token encryption, threat review |
| 25 | Performance audit | Queue throughput, media capacity, backpressure, cost/usage limits |
| 26 | Production deployment | Migrations, healthchecks, secrets, observability, rollback, runbooks |

## Immediate next slice

Implement one vertical slice only:

`authorized source event → source-video dedupe → durable workflow event → media-ingestion queue → worker transition → persisted ready/test fixture`.

Do not begin ElevenLabs, browser live view, or broad UI work until this slice has real persistence, retry, idempotency, and integration tests.
