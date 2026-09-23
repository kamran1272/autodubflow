# AutoDubFlow Implementation Status

Baseline: 2026-09-24
Branch: `autodubflow-production-build`

Legend: `[ ]` not started, `[~]` in progress, `[x]` verified complete, `[!]` blocked.

A phase is complete only when code, database, API, UI, tests, security, and documentation acceptance evidence exists.

| Phase | Status | Current evidence / blocker |
|---|---|---|
| 0 Repository audit | [x] | Audit, target architecture, diagrams, and classifications exist. |
| 1 Architecture cleanup | [x] | Active Prisma conflict removed; production auth fails closed; legacy boundaries documented. |
| 2 Database | [~] | Durable workflow models and repository contract exist; reviewed migration baseline is still required. |
| 2 Database | [~] | Durable workflow, workspace, project, asset, schedule, and publish models plus repository contract exist; reviewed migration baseline is still required. |
| 3 Authentication | [~] | Better Auth and ownership middleware exist; production integration and security coverage remain incomplete. |
| 4 UI shell | [~] | Next shell and route primitives exist; data is fixture-backed and several routes are unavailable. |
| 5 Automation | [ ] | No authenticated automation CRUD or rights-confirmation flow. |
| 6 Source monitoring | [ ] | No YouTube push receiver or polling fallback. |
| 7 Queue/workers | [ ] | Queue factory exists; no durable stage consumers. |
| 8 Storage/media | [~] | Media primitives exist; canonical storage service and ingestion API are incomplete. |
| 9 Transcription/translation | [~] | Mock/live provider adapters exist in media-api; no autonomous jobs. |
| 10 ElevenLabs dubbing | [~] | Adapter boundary exists; webhook and worker integration are incomplete. |
| 11 Video analysis | [ ] | No autonomous analysis worker. |
| 12 Smart reframe/crop/background | [~] | Media primitives and shared platform output presets exist; no production workflow integration. |
| 13 Existing-caption detection | [ ] | No verified detector pipeline. |
| 14 Caption masking | [ ] | Conditional mask workflow is documented only. |
| 15 Transitions | [ ] | No integrated transition stage. |
| 16 Target captions | [~] | Subtitle utilities exist; no durable target-caption job. |
| 17 Rendering | [~] | FFmpeg primitives and output encoding contract exist; no worker-backed render service. |
| 18 QC/repair | [ ] | No publish gate or bounded repair loop. |
| 19 Ready buffer | [~] | ReadyBufferItem and schedule/publish models exist; no scheduler-backed reservations. |
| 20 Scheduler | [ ] | No durable schedule executor. |
| 21 YouTube publishing | [~] | PublishJob and idempotency models exist; no official OAuth/upload/verify provider. |
| 22 Remote browser | [ ] | Browser-agent remains a placeholder. |
| 23 AI orchestrator | [x] | Bounded `packages/ai` runtime is tested, not integrated. |
| 24 Natural language | [ ] | No structured intent service. |
| 25 Voice | [ ] | No microphone/STT command flow. |
| 26 Notifications | [ ] | No durable preferences or delivery service. |
| 27 Studio | [~] | Legacy Vite studio is retained; persistence/auth are not canonical. |
| 28 Templates/exports | [ ] | No canonical template/export APIs. |
| 29 End-to-end | [ ] | No full mocked autonomous pipeline. |
| 30 Security/performance | [~] | Audit findings documented; remediation incomplete. |
| 31 Deployment | [~] | Compose renders; production images, migrations, healthchecks, and secrets policy remain incomplete. |

## Current checkpoint

Core domain additions now distinguish workspace, project, source media assets, transcripts, translations, audio assets, project versions, exports, schedule slots, and publish jobs. Shared output presets and named queues are implemented and tested.

## Next acceptance slice

Create a reviewed migration baseline, then implement:

`authorized source event -> deduplicated SourceVideo -> durable event -> named BullMQ ingestion job -> worker lease/result -> next stage event`
