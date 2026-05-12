# RAT-324 FE/BE Contract Freeze v1 (Rating 360)

Date: 2026-05-11  
Status: Frozen for MVP implementation  
Scope: `create/edit/respond/appeal/report/list` review APIs

## 1) Versioning and compatibility

- Canonical API version: `/api/v1`
- FE integrations MUST use canonical routes only.
- Temporary compatibility aliases (backend-supported, non-canonical):
  - `POST /api/reviews` (legacy create alias)
  - `POST /api/reviews/{reviewId}/reports` (legacy report alias)
- Compatibility aliases are migration-only and can be removed after FE migration is complete.

## 2) Canonical endpoints (frozen)

1. `POST /api/v1/service-requests/{serviceRequestId}/reviews` (create)
2. `PATCH /api/v1/reviews/{reviewId}` (edit)
3. `POST /api/v1/reviews/{reviewId}/response` (respond)
4. `POST /api/v1/reviews/{reviewId}/appeals` (appeal)
5. `POST /api/v1/reviews/{reviewId}/reports` (report)
6. `GET /api/v1/providers/{providerId}/reviews?limit={1..50}` (list)

## 3) Request payload contract (frozen)

### 3.1 Create review
`POST /api/v1/service-requests/{serviceRequestId}/reviews`

```json
{
  "providerUserId": "prov-1",
  "rating": 5,
  "comment": "Excelente servicio",
  "idempotencyKey": "review-20260511-001",
  "serviceCompletedAt": "2026-05-10T18:45:00Z",
  "now": "2026-05-11T10:00:00Z",
  "correlationId": "corr_abc123"
}
```

Rules:
- `serviceRequestId` comes from route param.
- `idempotencyKey`: required, string.
- `rating`: required integer `1..5`.
- `comment`: optional, max `2000` chars.
- `tags`: not part of backend v1 create payload (closed out of scope for this freeze).

### 3.2 Edit review
`PATCH /api/v1/reviews/{reviewId}`

```json
{
  "rating": 4,
  "comment": "Actualizo la reseña",
  "now": "2026-05-11T10:10:00Z",
  "correlationId": "corr_edit_001"
}
```

Rules:
- At least one editable field should be present in FE flow (`rating` and/or `comment`).
- `rating` when present: integer `1..5`.
- `comment` when present: max `2000` chars.

### 3.3 Respond to review
`POST /api/v1/reviews/{reviewId}/response`

```json
{
  "message": "Gracias por tu comentario.",
  "idempotencyKey": "response-20260511-001",
  "now": "2026-05-11T10:20:00Z",
  "correlationId": "corr_resp_001"
}
```

Rules:
- `message`: required, trimmed length `1..500`.
- `idempotencyKey`: required.

### 3.4 Open appeal
`POST /api/v1/reviews/{reviewId}/appeals`

```json
{
  "note": "Solicito revisión adicional porque hay contexto faltante.",
  "resume": true,
  "idempotencyKey": "appeal-20260511-001",
  "now": "2026-05-11T10:30:00Z",
  "correlationId": "corr_apl_001"
}
```

Rules:
- `note`: required, trimmed length `>= 10`.
- `resume`: optional boolean.
- `idempotencyKey`: required.

### 3.5 Report review
`POST /api/v1/reviews/{reviewId}/reports`

```json
{
  "reasonCode": "fraud_signal",
  "description": "Detalle del reporte",
  "idempotencyKey": "report-20260511-001",
  "now": "2026-05-11T10:40:00Z",
  "correlationId": "corr_rep_001"
}
```

Rules:
- `reasonCode`: required string, min length `3`.
- `idempotencyKey`: required.
- `description`: optional free text.

### 3.6 List reviews
`GET /api/v1/providers/{providerId}/reviews?limit=20`

Rules:
- `providerId`: required route param.
- `limit`: optional; default `20`; max `50`.

## 4) Error envelope and HTTP mapping (frozen)

Standard envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request payload is invalid",
    "details": {
      "code": "rating_out_of_range"
    }
  }
}
```

Top-level `error.code` catalog:
- `VALIDATION_ERROR`
- `AUTHORIZATION_ERROR`
- `AUTHENTICATION_ERROR`
- `BUSINESS_RULE_VIOLATION`
- `NOT_FOUND`
- `INTERNAL_ERROR`

HTTP mapping:
- `400`: validation failures (`VALIDATION_ERROR`)
- `401`: unauthenticated/auth signature failures (`AUTHENTICATION_ERROR` or auth detail `unauthenticated`)
- `403`: forbidden actor (`AUTHORIZATION_ERROR`)
- `404`: not found resources/routes
- `409`: business rule conflicts (`BUSINESS_RULE_VIOLATION`)
- `429`: rate-limited service request creation (outside review endpoints but part of shared contract surface)

`details.code` values frozen for review endpoints:
- Validation:
  - `invalid_payload`
  - `invalid_review_id`
  - `invalid_service_request_id`
  - `idempotency_key_required`
  - `service_request_id_required`
  - `rating_out_of_range`
  - `comment_too_long`
  - `reason_code_required`
  - `invalid_response_message`
  - `appeal_note_too_short`
  - `invalid_resume_flag`
- Auth:
  - `forbidden_actor`
  - `unauthenticated`
  - `actor_signature_required`
  - `invalid_actor_timestamp`
  - `invalid_actor_signature`
- Business rule examples:
  - `service_not_completed`
  - `provider_mismatch`
  - `not_found`
  - `rate_limited`
  - `appeal_already_open`
  - `appeal_resume_required`
  - `appeal_cooldown_active`
  - `edit_window_expired`

## 5) FE mapping constraints (frozen)

- FE request adapter maps legacy UI keys to canonical payload:
  - `serviceId` -> route `serviceRequestId`
  - `providerId` -> `providerUserId`
- FE must not send `tags` in create payload until backend contract adds explicit support.
- FE should keep idempotency key generation client-side and always send one for create/report/respond/appeal.

## 6) Sign-off block

- FE: Approved (2026-05-11)
- BE: Pending explicit sign-off comment
- PM: Pending explicit sign-off comment

When BE and PM approvals are posted, this document becomes the single signed contract artifact for RAT-324 closure.

### Required sign-off response format

Each approver must post one explicit approval line:

- `BE_SIGNOFF: APPROVED rat-324-fe-be-rating360-contract-freeze-v1 (date=YYYY-MM-DD)`
- `PM_SIGNOFF: APPROVED rat-324-fe-be-rating360-contract-freeze-v1 (date=YYYY-MM-DD)`

If rejecting, include:

- `*_SIGNOFF: REJECTED <reason> <required_change>`
