# RAT-7 QA Handoff Package (2026-05-11)

Owner: Front-End Developer  
Issue: RAT-7  
Dependency sync: RAT-323 contract-aligned via frozen v1 artifacts (`RAT-322` + `RAT-324`)

## 1) Contract sync checkpoint (RAT-323 gate)

- FE client targets canonical v1 routes only:
  - `GET /api/v1/providers/{providerId}/reviews?limit={1..50}`
  - `POST /api/v1/service-requests/{serviceRequestId}/reviews`
  - `POST /api/v1/reviews/{reviewId}/reports`
  - `POST /api/v1/reviews/{reviewId}/response`
- FE now parses backend error envelope shape (`error.code` + `error.details.code`) for deterministic UI branching.

## 2) Short QA test plan

1. Mobile list states (`390x844`):
   - Loading skeleton visible
   - Empty state copy visible when no items
   - Warning fallback + retry CTA visible on fetch failure
2. Review submission:
   - Submit disabled until rating selected
   - Success message surfaced after successful `createReview`
   - Failed submission path surfaces retry-friendly error copy
3. Filters + accessibility:
   - Filter chips expose `aria-pressed`
   - Stars are keyboard operable (`ArrowLeft/Right/Up/Down`, `0` clears)
4. Report/respond modal:
   - `Escape` closes modal
   - Focus trap works on `Tab/Shift+Tab`
   - Focus restores to trigger button

## 3) Screenshot set

- Mobile (`390x844`): composer + list + filter chips
- Mobile (`360x640`): warning fallback/retry state
- Desktop (`1280x800`): responsive layout and modal centering

Status: pending manual capture by QA operator in integrated shell (real browser run required).

## 4) Known limitations / risks

1. Final real-device screen-reader confirmation (VoiceOver/TalkBack) is still human-dependent and not auto-proven in this heartbeat.
2. RAT-323 lifecycle is `in_progress`; any backend contract supersession must be reflected before final RAT-7 closure.
