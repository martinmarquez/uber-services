# RAT-321 FE/BE Contract - Review Lifecycle v1

## Versioning
- Base path: `/api/v1`
- Contract version: `v1` (non-breaking additions only)

## Endpoints
- `POST /api/v1/reviews/:reviewId/reports`
  - Request:
    - `reasonCode` string, required, length `3..64`
    - `description` string, optional
    - `idempotencyKey` string, required
  - Success:
    - `202` with `{ ok: true, report: { id, status } }`
  - Errors:
    - `400` `VALIDATION_ERROR` (`reason_code_required`, `idempotency_key_required`)
    - `401` `AUTHORIZATION_ERROR` (`unauthenticated`)
    - `404` `NOT_FOUND`
    - `409` `CONFLICT` (`idempotency_key_conflict`)

- `POST /api/v1/reviews/:reviewId/response`
  - Request:
    - `message` string, required, length `1..500`
    - `idempotencyKey` string, optional but recommended
  - Success:
    - `200` with `{ ok: true, response: { id, status, updatedAt } }`
  - Errors:
    - `400` `VALIDATION_ERROR` (`invalid_response_message`)
    - `403` `AUTHORIZATION_ERROR` (`not_review_target`, `review_not_respondable`)
    - `404` `NOT_FOUND`

- `POST /api/v1/reviews/:reviewId/appeals`
  - Request:
    - `note` string, required, min length `10`
    - `idempotencyKey` string, required
  - Success:
    - `202` with `{ ok: true, appeal: { id, status } }`
  - Errors:
    - `400` `VALIDATION_ERROR` (`appeal_note_required`, `idempotency_key_required`)
    - `401` `AUTHORIZATION_ERROR` (`unauthenticated`)
    - `403` `AUTHORIZATION_ERROR` (`forbidden_actor`)
    - `404` `NOT_FOUND`

## Error Envelope (stable)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request payload is invalid",
    "details": { "code": "reason_code_required" }
  }
}
```
