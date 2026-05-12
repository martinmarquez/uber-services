# RAT-322 FE/BE Contract Freeze v1 (Rating 360)

Date: 2026-05-11
Issue: RAT-322
Scope owners: FE + BE + PM
Status: Proposed for signoff

## 1) Versioning and compatibility policy
- Canonical base path: `/api/v1`.
- FE must target only canonical v1 endpoints.
- Legacy alias compatibility is backend-only and temporary:
  - `POST /api/reviews` (maps to canonical create review flow)
- Backward-compatibility rule for FE migration window:
  - FE can accept legacy client keys `serviceId` and `providerId` locally, but must normalize to canonical request fields before sending.

## 2) Canonical endpoints frozen
- `GET /api/v1/providers/{providerId}/reviews` (list)
- `POST /api/v1/service-requests/{serviceRequestId}/reviews` (create)
- `PATCH /api/v1/reviews/{reviewId}` (edit)
- `POST /api/v1/reviews/{reviewId}/response` (respond)
- `POST /api/v1/reviews/{reviewId}/appeals` (appeal)
- `POST /api/v1/reviews/{reviewId}/reports` (report)

## 3) Payload contract (request)
### Create review
Endpoint: `POST /api/v1/service-requests/{serviceRequestId}/reviews`
Required:
- `idempotencyKey: string`
- `providerUserId: string`
- `rating: integer (1..5)`
- Optional:
- `comment: string` (`<= 2000` chars)
- `tags: string[]` (`max 4` items; values from FE quick-tag registry)
- `serviceCompletedAt: string (ISO-8601)`
- `now: string (ISO-8601)`
- `correlationId: string`

### Edit review
Endpoint: `PATCH /api/v1/reviews/{reviewId}`
Optional patch fields:
- `rating: integer (1..5)`
- `comment: string` (`<= 2000` chars)
- `now: string (ISO-8601)`
- `correlationId: string`

### Respond to review
Endpoint: `POST /api/v1/reviews/{reviewId}/response`
Required:
- `message: string` (`1..500` chars)
Optional:
- `idempotencyKey: string`
- `now: string (ISO-8601)`
- `correlationId: string`

### Appeal review
Endpoint: `POST /api/v1/reviews/{reviewId}/appeals`
Required:
- `note: string` (`min 10` chars)
- `resume` optional boolean for reopen flow (`true/false`) — accepted by BE when continuing moderated workflow
Optional:
- `idempotencyKey: string`
- `now: string (ISO-8601)`
- `correlationId: string`

### Report review
Endpoint: `POST /api/v1/reviews/{reviewId}/reports`
Required:
- `reasonCode: string` (`min 3` chars)
Optional:
- `description: string`
- `idempotencyKey: string`
- `now: string (ISO-8601)`
- `correlationId: string`

### List reviews
Endpoint: `GET /api/v1/providers/{providerId}/reviews`
Query:
- `limit` (optional, max 50)
- `cursor` (optional; future extension)

Notes:
- Backend currently includes verified reviews only for public list responses.

## 4) Response/error catalog frozen for FE
### Success status map
- `GET list`: `200`
- `POST create`: `201`
- `PATCH edit`: `200`
- `POST response`: `202`
- `POST appeal`: `202`
- `POST report`: `202`

### Error envelope
- Shape: `error.code` + `error.details.code`

### Error status map (canonical)
- `400` -> `VALIDATION_ERROR`
  - canonical `details.code` values observed in FE-visible paths: `idempotency_key_required`, `rating_out_of_range`, `comment_too_long`, `invalid_review_id`, `invalid_review_id_type`, `invalid_review_id_format`, `reason_code_required`, `appeal_note_too_short`, `invalid_resume_flag`, `invalid_actor_id`, `service_request_id_required`
- `401` -> `AUTHENTICATION_ERROR`
- `403` -> `AUTHORIZATION_ERROR`
- `404` -> `NOT_FOUND` or `BUSINESS_RULE_VIOLATION` with `details.code=not_found`
- `409` -> `BUSINESS_RULE_VIOLATION`
- `429` -> `BUSINESS_RULE_VIOLATION` with `details.code=rate_limited`

### FE handling requirement
- UI logic must branch on `error.code` + `error.details.code` only.
- FE must not branch on localized message strings.

## 5) Moderation enum and low-confidence freeze
Canonical moderation states:
- `verificada`
- `en_revision`
- `no_recomendada`
- `removida`

Risk-score thresholds:
- `0..39` => `verificada`
- `40..69` => `verificada` (reduced ranking weight)
- `70..84` => `no_recomendada`
- `85..100` => `en_revision`

Reference: `docs/reviews/rat-42-api-ui-moderation-contract-v1.md`.

## 6) FE implementation evidence
- `src/api/reviewsApi.js`
- `src/api/reviewsApi.test.js`
- `src/components/MobileReviewFlow.jsx`
- `src/components/MobileReviewFlow.test.jsx`

## 7) Signoff block
- FE: READY (implemented)
- BE: PENDING SIGNOFF
- PM: PENDING SIGNOFF
