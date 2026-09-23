# Provider Matrix

Baseline: 2026-09-24. Capability claims are limited to repository evidence.

| Provider/boundary | Purpose | API/SDK in repo | Browser required | Credentials | Webhook | Retry/fallback | Status |
|---|---|---|---|---|---|---|---|
| ElevenLabs | Dubbing/TTS boundary | Adapter source exists | No for intended API path | Server-side API key | Not integrated | Mock provider exists | Partial |
| OpenAI | STT/translation/TTS boundary | Adapter source exists | No | Server-side API key | Not integrated | Mock provider exists | Partial |
| DeepL | Translation boundary | Adapter source exists | No | Server-side API key | No | Mock translation exists | Partial |
| YouTube Data API | Source/destination channel | No production adapter | No for intended API path | OAuth connection not implemented | Push receiver not implemented | Poll fallback not implemented | Not implemented |
| FFmpeg | Deterministic media engine | Media utility source exists | No | Local binary/static package | N/A | Bounded process execution required | Partial |
| Playwright/Chromium | Authorized browser tasks and inspection | Placeholder service only | Server-side browser | Session secret architecture absent | N/A | Session recovery absent | Not implemented |
| PostgreSQL/Prisma | Durable state | Canonical package/schema | No | DATABASE_URL | N/A | Migration baseline missing | Partial |
| Redis/BullMQ | Queue execution | Queue factory exists | No | REDIS_URL | N/A | Named workers/retries absent | Partial |
| MinIO/S3-compatible storage | Large media assets | Compose direction/config fields | No | Server-side credentials | N/A | Storage service absent | Partial |
| Mock providers | Development/test mode | STT/translation/TTS/dubbing mocks | No | None | Simulated local results | Must remain explicit mock mode | Partial |

Production provider success must not be reported until the adapter, credential flow, durable job handling, error policy, and tests exist.
