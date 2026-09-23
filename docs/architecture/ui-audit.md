# UI Audit

Audit date: 2026-09-24. This document describes the current implementation, not the target architecture.

## Current surfaces

- Next.js `apps/web` is the AutoDubFlow control-plane shell with auth, dashboard, automation center, agent workspace, queue, pipeline, ready buffer, scheduler, publishing, and account settings routes.
- Vite `apps/dubflow-web` is the relocated manual media studio with project, transcript, translation, voice, subtitle, video, and export-oriented pages.

## Keep

- Protected route and auth provider structure.
- App shell, sidebar, top bar, breadcrumbs, status badges, progress bars, loading/error/empty primitives.
- Responsive CSS and dark/light theme foundation.
- Manual studio as a supporting inspection/editing surface.

## Conflicts

- Legacy studio still contains `VideoForge AI` branding and local/demo account terminology.
- Main control-plane screens contain static sample metrics, jobs, activities, and statuses.
- Several visible buttons have no action or API integration, including creation/command controls.
- Sidebar has disabled routes for source/destination channels, templates, notifications, and analytics.
- UI terminology alternates between project studio, dashboard, automation, and video workflow without a shared glossary.
- The control plane does not yet expose rights confirmation, provider authorization, real schedule rules, or publishing verification.
- The manual studio's API client targets routes that the active `apps/media-api` server does not register; its fallback simulation can turn an API failure into an apparent success.

## Dead links and route risks

- Every enabled link must have a real Next route and a protected authorization boundary.
- Disabled links should say explicitly unavailable/coming soon rather than imply operational functionality.
- External/media studio routes must not be mixed into the autonomous sidebar.
- Search/command palette entries must be kept in sync with route definitions.

## Missing UX states

- Source monitor disconnected/reconnect flow.
- OAuth consent and revoked-credential state.
- Rights confirmation and authorization history.
- Stage retry, blocked, cancelled, and terminal failure states.
- Ready-buffer reservation conflict.
- Scheduler timezone and capacity conflict.
- YouTube upload progress, verification failure, and rollback/retry state.
- Empty state for a first automation with a clear configuration path.
- Agent command confirmation for destructive or publishing actions.

## Required UI direction

The primary product path is:

`Automation Center → Agent Workspace → Processing Pipeline → Ready Buffer → Scheduler → Publishing`.

Manual upload should be available inside the studio as an intentional override/inspection workflow, not as the homepage or primary narrative. All visible controls must either call a real API or render an explicit unavailable state. Demo values must be marked mock/demo and never presented as production telemetry.

## Disposition

KEEP the Next.js shell, auth UX, route layout, responsive primitives, and selected studio editor components. REFACTOR all fixture-backed pages into API-backed loading/error/empty/success states and connect commands to authenticated API mutations. REPLACE local studio auth, simulated rendering, and fake persistence. REMOVE legacy branding and dead enabled controls after migration.
