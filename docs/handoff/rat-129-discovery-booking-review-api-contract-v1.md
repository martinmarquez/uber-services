# RAT-129 FE/BE API Contract v1

Date: 2026-05-07
Owner: Back-End Developer
Versioning: `/api/v1`

## Discovery

### `GET /api/v1/providers/discovery`
Query params:
- `category` (required): `cleaning|plumbing|electrician|moving|mechanic`
- `city` (required): string min length 2
- `limit` (optional): int `1..50` (default 20)
- `sort` (optional): `rating_desc|distance_asc|price_asc` (default `rating_desc`)

Success `200`:
```json
{
  "ok": true,
  "version": "v1",
  "providers": [
    {
      "userId": "prov-1",
      "category": "cleaning",
      "city": "Buenos Aires",
      "rating": 4.8,
      "basePriceArs": 20000,
      "distanceKm": 3,
      "isActive": true
    }
  ]
}
```

Validation error `400`:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request query is invalid",
    "details": {
      "code": "invalid_category"
    }
  }
}
```

## Booking Request

### `POST /api/v1/service-requests`
Request body:
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

Auth requirement:
- Actor role must include `customer`.

Success `201`:
```json
{
  "ok": true,
  "version": "v1",
  "serviceRequest": {
    "id": "sr_xxx",
    "customerUserId": "cus-1",
    "providerUserId": "prov-1",
    "category": "cleaning",
    "city": "Buenos Aires",
    "notes": "Need deep clean for 2-bedroom apartment",
    "scheduledAt": "2026-05-10T15:00:00.000Z",
    "status": "requested",
    "createdAt": "2026-05-07T12:00:00.000Z",
    "updatedAt": "2026-05-07T12:00:00.000Z"
  }
}
```

Error shape (deterministic):
```json
{
  "error": {
    "code": "VALIDATION_ERROR|AUTHORIZATION_ERROR",
    "message": "...",
    "details": {
      "code": "invalid_notes|invalid_scheduled_at|idempotency_key_required|forbidden_actor"
    }
  }
}
```

Domain errors (service layer):
- `rate_limited`
- `provider_not_available`

## Reviews (existing v1 scope)
- `POST /api/v1/service-requests/:serviceRequestId/reviews`
- `PATCH /api/v1/reviews/:reviewId`
- `POST /api/v1/reviews/:reviewId/reports`
- `POST /api/v1/reviews/:reviewId/appeals`

Notes:
- Canonical moderation statuses remain: `verificada|en_revision|no_recomendada|removida`.
- Non-canonical route params are rejected with `VALIDATION_ERROR` + `invalid_review_id`.
