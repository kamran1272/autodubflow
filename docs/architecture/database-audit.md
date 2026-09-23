# Database Audit

## Current state

The active Prisma schema is PostgreSQL-oriented and contains Better Auth models plus autonomous entities: users, source/destination channels, schedules, templates, processing configs, automations, source videos, media, dubbing, analysis, editing, captions, render, QC, publish, and `ReadyBufferItem`.

A separate relocated DubFlow schema exists under `packages/database/prisma/dubflow/` and represents a manual media-studio domain. It must remain a migration/reference source until a deliberate canonical model decision is made.

## Reusable structure

- Better Auth tables and user relations are a valid starting point.
- Automation-to-source-channel/destination-channel relations match the product.
- One-to-one stage records provide a useful first separation from a giant job record.
- `ReadyBufferItem` and the `READY` state establish the correct processing-before-scheduling direction.
- Indexes exist on user, automation, and status lookups.

## Risks and conflicts

1. No Prisma migrations are committed; `db push` is currently the development initialization path. Production requires reviewed migrations.
2. Stage statuses are mostly free-form strings, so invalid state combinations are possible.
3. There is no durable workflow event or decision log for idempotency, replay, and recovery.
4. There is no stage attempt table with lease, heartbeat, retry count, error class, and worker ownership.
5. Source videos have `externalUrl` but no provider-specific immutable external ID/unique constraint for deduplication.
6. Source channel authorization and destination OAuth ownership are not modeled securely.
7. Access tokens and refresh-token fields exist in `Account` without a documented encryption/key-rotation boundary.
8. Schedule stores cron and timezone but lacks explicit per-day windows, capacity limits, and computed execution records.
9. Publish lacks provider job identity, upload verification, scheduled platform ID, and retry metadata.
10. Audit logs, usage records, notifications, and agent decisions are not represented in the active schema.
11. Nullable relations are broad; business invariants need service-level validation and selective database constraints.
12. Media stage output references are too generic for multiple formats, variants, and platform presets.

## Target durable additions

- `WorkflowEvent`: event ID, idempotency key, aggregate/source video, type, payload, actor, correlation ID, occurred time, applied time.
- `StageExecution`: stage, status, attempt, lease, worker, input/output references, error category, timestamps.
- `SourceVideoExternalIdentity`: provider and immutable external ID with a unique constraint.
- `AutomationRightsGrant`: user, provider, source/destination identity, consent version, confirmed time, revocation time.
- `ReadyBufferItem`: variant, QC result, availability, scheduled execution relation, and publish reservation.
- `ScheduleRule` and `ScheduledPublication`: IANA timezone rule separated from UTC execution record.
- `ProviderCredentialRef`: encrypted secret reference, provider, owner, scope, expiry, revocation state.
- `AgentDecision`, `AuditLog`, `UsageRecord`, `Notification`, and `VoiceCommand`.

## Index and constraint priorities

- Unique `(provider, externalId)` for source videos.
- Unique idempotency key per event/job scope.
- Index stage status and next-attempt time.
- Index ready-buffer status and scheduled time.
- Index automation ownership and active status.
- Unique destination provider/channel ID per authorized connection.
- Foreign keys with explicit cascade/set-null policy reviewed per data retention requirement.

## Migration policy

Do not reset or overwrite production-style data. Introduce a migration directory, review generated SQL, take backups, and roll out additive tables/columns first. The separate DubFlow schema must be mapped intentionally; do not merge same-named `User`, `Project`, or `Voice` models mechanically.
