# Worker app

Background execution for long-running production jobs.

## Responsibilities

- Source monitoring
- Media ingestion
- Media validation
- Dubbing
- Video analysis
- Editing
- Caption generation
- Rendering
- Quality control
- Metadata generation
- Publishing
- Cleanup
- Notifications

## Constraints

- Operates asynchronously from user sessions
- Runs independently from browser state and web UI
- Uses queue-based coordination and durable database state
