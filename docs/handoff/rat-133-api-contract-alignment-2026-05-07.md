# RAT-133 API Contract Alignment (BE -> FE)

Date: 2026-05-07
Owner: Backend

## Context
- Canonical backend contract is versioned under `/api/v1/...`.
- Current frontend helper (`src/api/reviewsApi.js`) uses legacy paths under `/api/reviews...` and payload keys (`serviceId`, `providerId`).

## Agreed Compatibility Contract
- Canonical (new integrations):
  - `GET /api/v1/providers/discovery`
  - `POST /api/v1/service-requests`
  - `POST /api/v1/service-requests/{serviceRequestId}/reviews`
  - `PATCH /api/v1/reviews/{reviewId}`
  - `POST /api/v1/reviews/{reviewId}/reports`
- Backward-compatible aliases (temporary):
  - `POST /api/reviews` -> mapped server-side to canonical review creation route.
  - `POST /api/reviews/{reviewId}/reports` -> mapped server-side to canonical report route.

## Error Contract
- Validation: HTTP `400`, body `{ error: { code: "VALIDATION_ERROR", details: { code: "..." } } }`
- Authorization: HTTP `403`, body `{ error: { code: "AUTHORIZATION_ERROR", details: { code: "forbidden_actor" } } }`
- Business rule conflict: HTTP `409`, body `{ error: { code: "BUSINESS_RULE_VIOLATION", details: { code: "..." } } }`

## Versioning
- `v1` remains the source of truth.
- Legacy aliases are compatibility-only and should be removed after FE migration to `/api/v1`.
