# RAT-129 FE/BE API Contract v1

Date: 2026-05-07
Owner: Back-End Developer
Versioning: `/api/v1`

## Envelope Contract

Success:
```json
{
  "ok": true,
  "version": "v1"
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR|AUTHORIZATION_ERROR",
    "message": "...",
    "details": {
      "code": "..."
    }
  }
}
```

## Discovery

### `GET /api/v1/providers/discovery`
Query params:
- `category` (required): `cleaning|plumbing|electrician|moving|mechanic`
- `city` (required): string min length 2
- `limit` (optional): int `1..50` (default 20)
- `sort` (optional): `rating_desc|distance_asc|price_asc` (default `rating_desc`)

Validation errors (`400`):
- `invalid_category`
- `invalid_city`
- `invalid_limit`
- `invalid_sort`

## Booking Request

### `POST /api/v1/service-requests`
Auth requirement:
- Actor role must include `customer`.

Body:
```json
{
  "idempotencyKey": "book-idem-1",
  "providerUserId": "prov-1",
  "category": "cleaning",
  "city": "Buenos Aires",
  "notes": "Need deep clean for 2-bedroom apartment",
  "scheduledAt": "2026-05-10T15:00:00.000Z"
}
```

Validation errors (`400`):
- `idempotency_key_required`
- `provider_user_id_required`
- `invalid_category`
- `invalid_city`
- `invalid_scheduled_at`
- `invalid_notes`
- `notes_too_long`

Authorization errors (`403`):
- `forbidden_actor` (non-`customer` role)

Domain errors (`409`/`429`, service layer):
- `provider_not_available`
- `rate_limited`

## Booking Status

### `GET /api/v1/service-requests/:serviceRequestId`
Access policy:
- Allowed actors: booking `customer`, assigned `provider`, or `moderator`.

Route validation errors (`400`):
- `invalid_service_request_id`

Not found (`404`):
- `not_found`

## Reviews (existing v1 scope)
- `POST /api/v1/service-requests/:serviceRequestId/reviews`
- `PATCH /api/v1/reviews/:reviewId`
- `POST /api/v1/reviews/:reviewId/reports`
- `POST /api/v1/reviews/:reviewId/appeals`

Notes:
- Canonical moderation statuses remain: `verificada|en_revision|no_recomendada|removida`.
- Non-canonical route params are rejected with deterministic `VALIDATION_ERROR`.
