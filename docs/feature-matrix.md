# Feature Matrix

Status is based on verified repository evidence as of 2026-09-24.

| Feature | Backend | Database | Worker | Frontend | Provider | Tests | Status |
|---|---|---|---|---|---|---|---|
| Authentication | Better Auth routes | User/session/account models | N/A | Login/register pages | Better Auth | Focused auth tests | Partial / production hardening needed |
| Automation CRUD | No domain routes | Automation model | No | Fixture page | N/A | None | Not implemented |
| Rights confirmation | No endpoint | Rights grant model added | No | No | N/A | None | In progress |
| Source monitoring | No webhook/polling service | External identity model added | No | No | YouTube not connected | None | Not implemented |
| Media ingestion | Media utilities | Media model | No consumer | Legacy studio calls absent routes | Authorized source provider absent | Primitive tests | Partial |
| Transcript/translation | Media provider adapters | Analysis snapshot only | No consumer | Studio tools | Mock/OpenAI/DeepL adapters | Limited | Partial |
| ElevenLabs dubbing | Adapter boundary | Dubbing snapshot | No consumer | No autonomous UI | ElevenLabs adapter | Limited | Partial |
| Video analysis | Probe/media utilities | Analysis snapshot | No | Pipeline fixture | No autonomous provider | None | Not implemented |
| Reframe/crop/background | FFmpeg/media primitives | Editing snapshot | No | No canonical controls | FFmpeg direction | Primitive coverage | Partial |
| Caption detection/mask | No production detector | No detection model | No | No | OCR provider absent | None | Not implemented |
| Target captions | Subtitle utilities | Captions snapshot | No | Studio subtitle tools | Mock/provider boundary | Limited | Partial |
| Rendering | FFmpeg utilities | Render snapshot | No | Fixture progress | FFmpeg | None end-to-end | Partial |
| Quality control/repair | No gate service | QC snapshot | No | No | N/A | None | Not implemented |
| Ready buffer/scheduler | No executor | ReadyBufferItem and ScheduleSlot models | No | Fixture pages | N/A | None | Partial / not integrated |
| YouTube publishing | No provider | Publish and PublishJob models with uniqueness | No | Fixture page | No OAuth/upload adapter | None | Partial / not integrated |
| Agent runtime | `packages/ai` bounded loop | Repository contract pending integration | No | Agent fixture page | Typed tool boundary | 4 focused tests | Implemented, not integrated |
| Browser workspace | Placeholder only | No session model | No | No live view | Playwright boundary | None | Not implemented |
| Notifications/usage/audit | No services | Models incomplete | No | Disabled routes | N/A | None | Not implemented |
| Manual studio | Vite app and media code | Separate legacy schema | Simulated fallback | Broad route set | Mock/live media adapters | Limited | Supporting legacy surface |
| Output presets | No API | Shared deterministic preset contract | No | No canonical editor integration | FFmpeg direction | 2 focused tests | Implemented contract |
| Named queues | No consumers | N/A | Queue factory and names | No | BullMQ | Typecheck only | Implemented contract |
