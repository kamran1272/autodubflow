---
name: AutoDubFlow
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  margin: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

AutoDubFlow is engineered for high-velocity creators and modern media enterprises scaling automated YouTube localization. The design system projects raw intelligence, operational precision, and seamless automation. 

### Brand Personality & Emotional Response
- **Persona:** Authoritative, cutting-edge, relentless, yet effortlessly streamlined.
- **Emotional Response:** Inspires absolute confidence in complex AI pipelines, invoking a sense of hyper-efficiency, futuristic clarity, and effortless control over automated workflows.

### Design Style
A specialized variant of **Glassmorphism fused with Corporate Modernism**. The interface utilizes deep atmospheric slate foundations paired with high-voltage neon accents, glowing status indicators, translucent glass cards, and crisp, razor-sharp data boundaries that reflect precision engineering.

## Colors

The color architecture is built specifically for data-dense, dark-mode dashboard environments. The background utilizes a deep slate foundation to reduce eye strain during prolonged monitoring sessions, while electric violet and cyan command visual hierarchy for primary actions and real-time processing metrics.

- **Primary (`#8b5cf6`):** Electric violet. Drives primary CTAs, active navigation states, and core brand touchpoints.
- **Secondary (`#06b6d4`):** Cyan. Highlights secondary actions, active data streams, and interactive links.
- **Success (`#10b981`):** Emerald. Denotes successful renders, completed dubbing jobs, and positive system health.
- **Warning (`#f59e0b`):** Amber. Highlights queue delays, rate limits, or pending validations.
- **Error (`#ef4444`):** Rose. Signifies pipeline failures, API disconnects, or critical action requirements.
- **Neutral Backgrounds (`#0f172a`, `#1e293b`, `#334155`):** Deep slate tiers establishing surface-container depth and structural separation.

## Typography

Typography for the design system relies on **Inter**, delivering uncompromising legibility across dense data tables, configuration panels, and high-impact metric readouts. 

### Scale & Hierarchy
- Maintain strict tracking (letter-spacing) adjustments on large display headers to ground their visual weight.
- Utilize tabular number variants (`font-variant-numeric: tabular-nums`) for all timecodes, rendering progress percentages, and analytics counters to prevent layout jitter during live updates.

## Layout & Spacing

The layout architecture employs a **Fluid 12-column Grid** optimized for expansive operational dashboards, split-screen video timeline previews, and multi-channel asset managers.

### Spacing Rhythm
- Built on an 8pt baseline grid system, ensuring predictable vertical and horizontal rhythm across complex control surfaces.
- **Breakpoints:** Mobile (`< 640px`), Tablet (`640px - 1024px`), Desktop (`> 1024px`).
- **Reflow Rules:** On mobile, multi-column pipeline monitors collapse into single-column cards; side navigation transforms into an off-canvas drawer.

## Elevation & Depth

Visual hierarchy is conveyed through **Low-contrast outlines paired with Tonal Surface Layers and Ambient Glows**. 

### Depth Principles
- **Base Surfaces:** Deep slate canvas (`#0f172a`) forms the lowest z-index plane.
- **Containers:** Cards and modals utilize elevated slate tiers (`#1e293b`) paired with ultra-subtle borders (`rgba(255, 255, 255, 0.08)`) to define boundaries without heavy drop shadows.
- **Active Accents:** Interactive elements, running pipelines, and critical notices cast a soft, diffused ambient glow using tinted neon shadows (e.g., electric violet or emerald at 15% opacity) to instantly draw operator focus.

## Shapes

The shape language relies on **Soft** geometry (`0.25rem` base roundedness, scaling up to `0.75rem` for primary containers). 

### Guidelines
- Buttons, input fields, and badges maintain tighter radii (`0.375rem`) for a precise, enterprise-grade feel.
- Large modal panels and floating action containers use slightly more generous rounding (`0.75rem`) to soften high-density data layouts.
- Avoid pill-shaped containers except for status badges and tags, maintaining a sharp, utilitarian aesthetic across primary structural elements.

## Components

Components are engineered for high-throughput operational workflows, prioritizing speed, status clarity, and instant feedback.

### Buttons
- **Primary:** Electric violet fill with crisp white text, slight upward shadow lift on hover, and an active state ring.
- **Secondary / Ghost:** Transparent backgrounds with subtle border outlines (`rgba(255,255,255,0.12)`) that illuminate on hover with cyan text highlights.
- **Danger:** Rose accent borders and text for destructive actions (e.g., deleting localized video tracks).

### Chips & Status Badges
- Utilize glowing dot indicators combined with soft-tinted backgrounds (e.g., emerald background with 15% opacity and solid emerald text) to denote live pipeline states: `Rendering`, `Translating`, `Queued`, and `Failed`.

### Input Fields & Controls
- Dark slate input backgrounds (`#1e293b`) with clean 1px borders. Focus states transition smoothly to electric violet with a subtle 2px outer glow ring.
- Toggle switches and checkboxes feature high-contrast activation states using cyan and emerald fills.

### Cards & Containers
- Frosted glass containers utilizing semi-transparent slate surfaces (`#1e293b` at 80% opacity) with backdrop blur (`blur-md`) and hairline borders.

### Specialized Components
- **Video Timeline Inspector:** Split-pane waveform visualizers with precision timecode markers and speaker diarization tracks.
- **Pipeline Progress Stepper:** Horizontal node-based trackers displaying real-time ingestion, translation, voice cloning, and publishing stages.