# Design System - RAT-6 Mobile Reviews

## Product Goal
Enable riders to leave a useful review in under 20 seconds with one hand on mobile devices.

## UX Principles
- One-screen commitment: primary rating action visible without scrolling.
- Progressive disclosure: details appear only after star rating.
- Thumb-first controls: touch targets at least 44x44 px.
- Zero-friction submit: one primary CTA with clear completion state.

## Visual Direction
A warm editorial look focused on trust and clarity.

## Design Tokens
```css
:root {
  --bg-canvas: #f4efe7;
  --bg-card: #fffaf2;
  --ink-strong: #1e1a16;
  --ink-muted: #5a524a;
  --accent: #cb5a2e;
  --accent-strong: #a5441f;
  --success: #1f7a45;
  --focus-ring: #175cd3;
  --border-soft: #d8cfc3;
  --warn: #9c5b00;
  --danger: #932d25;
  --radius-l: 22px;
  --radius-m: 14px;
  --space-1: 8px;
  --space-2: 12px;
  --space-3: 16px;
  --space-4: 24px;
}
```

## Typography
- Display: `Fraunces`, serif, for confidence and warmth.
- Body/UI: `Manrope`, sans-serif, for high readability.

## Components
- Review Sheet: fixed bottom sheet on mobile with summary + form.
- Star Rating Row: 5 large toggle buttons with text fallback.
- Quick Tags: chips for fast sentiment context.
- Comment Field: optional, appears after a rating is selected with live character counter.
- Submit CTA: full-width sticky action.
- Review Filter Chips: exclusive toggle group (`aria-pressed`), not tabs.
- Review Card: provider info, rating summary, moderation badge, and provider response.
- Report / Respond Modals: dialog pattern with clear labels and destructive-safe action ordering.

## Interaction Standards
- Stars:
  - Click selects/deselects (same star clears).
  - Keyboard arrows adjust rating; key `0` clears.
- Tags:
  - Multi-select chips with `aria-pressed`.
  - Tag list resets when rating sentiment bucket changes.
- Filters:
  - One active filter at a time using button toggles.
- Submit:
  - Enabled only when rating > 0.
  - Pending state blocks repeated submit.
  - Success feedback is time-boxed to 4500ms before idle reset.
- Report/Respond dialogs:
  - Initial focus lands on first field.
  - `Escape` closes dialog.
  - Focus stays trapped while dialog is open and returns to invoker on close.

## Content Standards
- Prefer plain language over platform jargon ("se publica o se revisa" instead of "impacto en reputación").
- Keep helper text in one short sentence whenever possible.
- Use consistent terminology and orthography in Spanish (`contratación`, `reseña`, `recibió`, `ID`).
- Instructional copy must be explicit for touch and keyboard users.

## Accessibility Standard (WCAG AA minimum)
- Minimum contrast ratio 4.5:1 for normal text.
- Keyboard support for star selection, chips, filters, textarea, select, and submit.
- Rating group semantics use `role="radiogroup"` and each star exposes `role="radio"` + `aria-checked`.
- Focus visible via 3px ring using `--focus-ring` on all actionable controls.
- Status message announced with `aria-live="polite"`.
- All actionable elements provide accessible name.
- Modal dialogs must expose `role="dialog"` + `aria-modal="true"`; integrated runtime must validate initial focus, return focus, and `Escape` closure.

## Component Status (2026-05-11, RAT-699 restart)
- `MobileReviewFlow`: copy clarity pass applied for CS audience (baja alfabetización digital/senior); ready for FE integration (API/events pending).
- Accessibility smoke (component-level): pass for keyboard/focus/status semantics.
- Keyboard refinement shipped: rating now supports `Home` (1 star) and `End` (5 stars) in addition to arrows and `0` clear.
- Motion safety shipped: `prefers-reduced-motion` style override added for animation/transition minimization.
- Accessibility integrated validation (`axe`/Lighthouse in app shell): pending.
- UX final spec verdict (rev 3): approved for implementation handoff; integrated a11y evidence remains required for release closure.

## UX Run Reliability Standard
- Heartbeat output cadence: publish a progress update at least every 20 minutes during active implementation to avoid silent-run ambiguity.
- Durable artifact on each heartbeat: update at least one persistent file (`design-system.md`, review artifact under `docs/reviews/`, or memory log) with what changed and next action owner.
- Accessibility gate before handoff:
  - Validate keyboard-only flow for all new interactive states.
  - Validate focus visibility and focus return behavior for overlays/dialogs.
  - Record WCAG AA contrast checks for any new color token usage.
- Front-end handoff contract:
  - Include component status (`ready`, `blocked`, `pending validation`).
  - Include required props/events and any API dependency still open.
  - Include exact test scope FE must rerun after integration (`axe` + targeted user-flow smoke).
- Escalation rule: if no product/design delta is available for the heartbeat issue, log lifecycle reconciliation with explicit `next action owner` instead of waiting silently.

## RAT-740 Singleton Unblock Normalization (2026-05-11)
- Canonical UX unblock surface added: `UxUnblockStatusCard` (`src/components/UxUnblockStatusCard.jsx`).
- Purpose: expose one shared, visible gate-state contract for RAT-421 handoff so FE/QA/PM stop reconciling status across multiple comments.
- Gate model (single source of truth):
  - Done: dialog accessibility contract.
  - Done: success feedback timing budget (4500ms).
  - Pending: integrated app-shell accessibility evidence (`axe` + Lighthouse).
- Accessibility contract for this status surface:
  - Checklist is announced as a named list (`aria-label="Checklist de desbloqueo UX"`).
  - Each item exposes explicit state text (`Completado` / `Pendiente`) in addition to color.
  - Typography and colors preserve AA contrast on light background.
