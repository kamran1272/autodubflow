# System Diagrams

## Final product visualization

The following is the product-level target. It is intentionally more concrete than the service diagram below: an automation is configured once, source events start durable processing, rendered videos wait in a ready buffer, and the scheduler controls publication independently of processing.

```text
         +---------------------+
         |        USER         |
         +----------+----------+
            |
         Configure Once
            |
            v
        +---------------------------+
        |        AUTOMATION         |
        | Source Channel            |
        | Destination Channel       |
        | Language                  |
        | Videos / Day              |
        | Schedule                  |
        | Editing Template          |
        | Caption Template          |
        | Notifications             |
        +-------------+-------------+
              |
              v
           +--------------------+
           |   SOURCE MONITOR   |
           +----------+---------+
              |
         New Video Event
              |
              v
           +--------------------+
           | AGENT ORCHESTRATOR |
           +----------+---------+
              |
        +-----------------+-----------------+
        v                 v                 v
      Media Worker     Dubbing Worker    Analysis Worker
        |           ElevenLabs             |
        +-----------------+-----------------+
              v
           +--------------------+
           |  EDITING PIPELINE  |
           | Smart Reframe      |
           | Crop                |
           | Blur Background     |
           | Detect Captions     |
           | Mask Existing Text  |
           | Transitions         |
           | New Captions        |
           +----------+---------+
              v
            +-----------+
            |  RENDER   |
            +-----+-----+
              v
            +-----------+
            |    QC     |
            +-----+-----+
              v
           +------------------+
           |   READY BUFFER   |
           | Video A          |
           | Video B          |
           | Video C          |
           +--------+---------+
                           v
                     +-------------+
                     |  SCHEDULER  |
                     +------+------+
                          |
                  09:00 / 15:00 / 21:00
                          v
                   +-----------------+
                   | YOUTUBE PUBLISH |
                   +--------+--------+
                         v
                     +-----------+
                     | PUBLISHED |
                     +-----------+
```

## Independent visible browser surface

The browser agent is visible to the user when inspected, but it is not the execution dependency for the autonomous pipeline. Server-side workers and official provider APIs continue operating when the dashboard, browser tab, or user's computer is closed.

```text
      +---------------------+
      |    AGENT BROWSER    |
      +----------+----------+
             |
        Remote Chromium
             |
         Playwright
             |
      +--------------+--------------+
      v              v              v
     ElevenLabs       Editor UI      Other UI
```

Browser sessions are isolated by user and automation. Debugging ports remain private to the browser-agent service, and browser automation is an additional authorized adapter rather than the primary publishing mechanism.

## 1. System architecture

```mermaid
flowchart TD
  User --> Web[AutoDubFlow Web]
  Web --> API[Authenticated API]
  API --> DB[(PostgreSQL)]
  API --> Queue[(Redis/BullMQ)]
  API --> Agent[Agent Orchestrator]
  Agent --> Queue
  Queue --> Workers[Specialized Workers]
  Workers --> Providers[YouTube / ElevenLabs / STT / Translation]
  Workers --> Engine[Deterministic Video Engine]
  Workers --> Browser[Browser Agent]
  Workers --> DB
  DB --> Scheduler[Ready Buffer Scheduler]
  Scheduler --> Publish[Authorized YouTube Publisher]
  Publish --> DB
```

## 2. Source-video workflow

```mermaid
flowchart LR
  Event[SOURCE_EVENT] --> Eligible[ELIGIBILITY_CHECK]
  Eligible --> Ingest[MEDIA_INGESTION]
  Ingest --> Validate[MEDIA_VALIDATION]
  Validate --> Dub[DUBBING]
  Dub --> Analyze[VIDEO_ANALYSIS]
  Analyze --> Reframe[SMART_REFRAME]
  Reframe --> Burned[EXISTING_CAPTION_DETECTION]
  Burned --> Mask[CAPTION_MASK]
  Mask --> Transition[TRANSITIONS]
  Transition --> Caption[TARGET_CAPTION_GENERATION]
  Caption --> Render[RENDER]
  Render --> QC[QUALITY_CONTROL]
  QC --> Metadata[METADATA]
  Metadata --> Ready[READY_BUFFER]
  Ready --> Schedule[SCHEDULING]
  Schedule --> Publish[PUBLISH]
  Publish --> Verify[VERIFY]
  Verify --> Complete[COMPLETE]
```

## 3. Agent loop

```mermaid
flowchart TD
  Observe[Observe durable event/result] --> Interpret[Interpret policy and configuration]
  Interpret --> Decide[Choose next typed operation]
  Decide --> Invoke[Invoke API/queue/provider tool]
  Invoke --> Result[Inspect deterministic result]
  Result --> Record[Record decision and audit event]
  Record --> Recover{Retryable?}
  Recover -- Yes --> Invoke
  Recover -- No --> Observe
```

## 4. Queue and worker architecture

```mermaid
flowchart LR
  API --> Intake[Source Intake Queue]
  API --> Stage[Stage Queues]
  API --> PublishQ[Publish Queue]
  Intake --> Monitor[Monitor Worker]
  Stage --> Media[Media Worker]
  Stage --> Dubbing[Dubbing Worker]
  Stage --> Editing[Editing Worker]
  Stage --> Caption[Caption Worker]
  Stage --> Render[Render Worker]
  Stage --> QC[QC Worker]
  PublishQ --> Publisher[Publish Worker]
  Monitor --> DB[(Database)]
  Media --> DB
  Dubbing --> DB
  Editing --> DB
  Caption --> DB
  Render --> DB
  QC --> DB
  Publisher --> DB
```

## 5. Database relationships

```mermaid
erDiagram
  USER ||--o{ AUTOMATION : owns
  AUTOMATION }o--|| SOURCE_CHANNEL : watches
  AUTOMATION }o--|| DESTINATION_CHANNEL : publishes_to
  AUTOMATION }o--|| SCHEDULE_RULE : uses
  AUTOMATION ||--o{ SOURCE_VIDEO : creates
  SOURCE_VIDEO ||--o| MEDIA_JOB : has
  SOURCE_VIDEO ||--o| DUBBING_JOB : has
  SOURCE_VIDEO ||--o| ANALYSIS_JOB : has
  SOURCE_VIDEO ||--o| EDITING_JOB : has
  SOURCE_VIDEO ||--o| CAPTION_JOB : has
  SOURCE_VIDEO ||--o| RENDER_JOB : has
  SOURCE_VIDEO ||--o| QUALITY_CONTROL_JOB : has
  SOURCE_VIDEO ||--o| READY_BUFFER_ITEM : enters
  READY_BUFFER_ITEM ||--o| PUBLISHED_VIDEO : becomes
  SOURCE_VIDEO ||--o{ WORKFLOW_EVENT : emits
```

## 6. Browser-agent architecture

```mermaid
flowchart TD
  API --> Session[Authorized Browser Session Request]
  Session --> Agent[Browser Agent Service]
  Agent --> Chromium[One managed Chromium process]
  Chromium --> ContextA[Isolated Context: user/automation A]
  Chromium --> ContextB[Isolated Context: user/automation B]
  ContextA --> PlaywrightA[Playwright task adapter]
  ContextB --> PlaywrightB[Playwright task adapter]
  Agent --> Live[Secure live view/events]
  Agent --> Audit[(Audit log)]
```

## 7. Publishing pipeline

```mermaid
flowchart LR
  Ready[READY_BUFFER] --> Reserve[Reserve schedule slot]
  Reserve --> OAuth[Authorized YouTube credential]
  OAuth --> Upload[YouTube API upload/schedule]
  Upload --> Verify[Fetch and verify destination state]
  Verify --> Complete[Complete + notify]
  Verify --> Retry[Retry or manual review]
```

## 8. Ready-buffer scheduler

```mermaid
flowchart TD
  Rendered[Rendered asset] --> QC{QC passed?}
  QC -- No --> Review[Failure/review queue]
  QC -- Yes --> Buffer[(Ready buffer)]
  Buffer --> Rules[Timezone-aware schedule rules]
  Rules --> Slot{Capacity slot available?}
  Slot -- No --> Wait[Remain buffered]
  Slot -- Yes --> Reserve[Create UTC publication reservation]
  Reserve --> Publish[Publish worker]
```
