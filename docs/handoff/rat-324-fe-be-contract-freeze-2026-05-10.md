# RAT-324 FE/BE Contract Freeze - Rating 360

Date: 2026-05-10  
Owner: Front-End

## Scope
Freeze frontend integration on canonical backend `v1` routes for reviews/rating flow.

Canonical signed-contract candidate:
- `docs/reviews/rat-324-fe-be-rating360-contract-freeze-v1.md`

## Canonical endpoints used by FE
- `GET /api/v1/providers/{providerId}/reviews`
- `POST /api/v1/service-requests/{serviceRequestId}/reviews`
- `POST /api/v1/reviews/{reviewId}/reports`
- `POST /api/v1/reviews/{reviewId}/response`

## Payload mapping frozen in FE
- Create review request body:
  - `providerUserId`
  - `rating`
  - `comment`
  - `idempotencyKey`
  - optional passthroughs: `serviceCompletedAt`, `now`, `correlationId`
- FE accepts legacy input keys (`serviceId`, `providerId`) and maps them to canonical values before sending.

## Compatibility decisions
- FE no longer targets legacy alias `POST /api/reviews` directly.
- Review list is requested by `providerId` (not by `serviceId`) to match canonical backend list route.

## Verification evidence
- `src/api/reviewsApi.test.js` (contract-path tests)
- `src/components/MobileReviewFlow.test.jsx` (integration behavior with provider-scoped fetch)
