# API app

Application control and API layer.

## Responsibilities

- Authentication
- Users
- Automations
- Channels
- Settings
- Agent commands
- API endpoints
- Webhooks
- OAuth callbacks
- Database orchestration

## Constraints

- Schedule jobs instead of doing expensive work inline
- Keep orchestration logic clear and service-based
- Use shared contracts and queue abstractions
