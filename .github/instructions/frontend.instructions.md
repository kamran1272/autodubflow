---
name: AutoDubFlow Frontend Engineering
description: Permanent frontend rules for the AutoDubFlow web application
applyTo: "apps/web/**/*"
---

# AutoDubFlow Frontend Contract

You are working on the frontend of AutoDubFlow.

AutoDubFlow is a professional autonomous AI video automation platform with a full AI Video Studio.

## PRIMARY FRONTEND GOAL

The frontend must feel like a premium professional SaaS application.

It must be:

- modern
- fast
- responsive
- accessible
- polished
- consistent
- agentic
- real
- functional

It must never feel like:

- a static template
- a prototype
- a fake AI demo
- a collection of unrelated pages

## CORE PRODUCT AREAS

The frontend must eventually provide:

Dashboard, Automations, Agent Workspace, Agent Browser, Agent Activity, Queue, Videos, Schedule, Ready Buffer, Source Channels, Destination Channels, Projects, Video Studio, AI Tools, Templates, Notifications, Usage, Analytics, and Settings.

## AUTONOMOUS AGENT UX

The UI must make these facts obvious:

- what the agent is doing
- what it did
- why it did it
- what happens next
- whether the system is healthy
- whether the automation is running
- which video is currently processing
- when the next publication is scheduled

## DO NOT FAKE STATE

Never show fake progress, success, completion, browser activity, job activity, upload status, or AI results. All status shown by the UI must come from real backend state. During local development, clearly identify mock/demo mode.

## NO DEAD BUTTONS

Every visible interactive control must perform a real action, navigate to a real route, open a functional dialog or drawer, modify real state, or be explicitly disabled with an explanation.

## SERVER STATE

Prefer TanStack Query or the project's existing server-state solution for API data. Do not duplicate all backend state into global client state.

## EDITOR STATE

Use a dedicated editor state architecture for playhead, selected segment, selected track, timeline zoom, selected tool, temporary edits, and undo/redo. Do not put large media binaries into React state.

## UI COMPONENTS

Prefer reusable, feature-oriented components. Avoid giant components.

## DESIGN SYSTEM

Use spacing, typography, radius, shadow, motion, color, and z-index tokens. Never scatter arbitrary values when a design token is appropriate.

## ACCESSIBILITY

Use semantic HTML, keyboard navigation, focus management, ARIA where necessary, accessible dialogs and menus, screen-reader labels, and reduced-motion support.

## RESPONSIVE

Support mobile, tablet, desktop, and large desktop. Video Studio may prioritize desktop, but all other product areas must remain responsive.

## REALTIME

Use WebSocket/SSE or existing realtime infrastructure for job progress, agent events, notifications, and browser state. Use polling as a fallback where appropriate.

## LOADING AND ERROR HANDLING

Every asynchronous operation needs loading, success, error, and applicable empty states, plus retry or cancel where appropriate. Never expose stack traces. Show useful user-friendly errors and include an event or job identifier when useful for support.

## FORMS AND CONFIRMATIONS

Forms must validate input, show field errors, disable impossible submissions, show submission state, handle API failure, and preserve useful input. Destructive operations require confirmation.

## AGENT ACTIONS

AI-generated actions must be displayed as actual structured operations, including the target, requested change, and result.

## BROWSER WORKSPACE

The browser panel must represent a real remote browser session when enabled. Never show fake browser screenshots as live state.

## API CONTRACT

Use typed API clients and contracts. Do not hard-code undocumented endpoints or silently fake missing endpoints. Implement the contract when frontend and backend are developed together, or clearly identify the dependency.

## PERFORMANCE

Avoid unnecessary rerenders, N+1 requests, large initial JavaScript, large media blobs in React state, unnecessary polling, and duplicate API requests. Lazy-load heavy Studio/editor functionality.

## VISUAL QUALITY

Use consistent cards, panels, headers, tabs, badges, dropdowns, dialogs, empty states, skeletons, toasts, tables, and toolbars.

## TESTING

Use Playwright for important user workflows, including navigation, forms, buttons, dialogs, settings, automation, agent, Studio, and export flows.

## IMPORTANT

Only implement the requested phase. Do not silently implement future features. Inspect existing code before modifying it, preserve good components, and avoid unrelated rewrites.

After each phase, run relevant tests, typecheck, lint, and build when practical; fix discovered errors; report changed files, tests run, and unresolved issues. Never claim a feature is complete when it is mocked or broken.
