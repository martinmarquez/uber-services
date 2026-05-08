# RAT-178 Backend Progress (2026-05-07)

## Scope completed
- Closed the security gap where review creation implicitly trusted participant ownership.
- Enforced ownership at HTTP boundary before review creation for:
  - `POST /api/v1/service-requests/{serviceRequestId}/reviews`
  - `POST /api/reviews` (legacy alias)
- Added route-level authz guard: only `customer` actor can create reviews.

## API contract alignment (BE -> FE)
- Legacy compatibility maintained for `POST /api/reviews` with payload mapping:
  - `serviceId -> serviceRequestId`
  - `providerId -> providerUserId`
- New/explicit failure cases:
  - `403 BUSINESS_RULE_VIOLATION` + `details.code: forbidden_actor` when actor is not the booking owner.
  - `409 BUSINESS_RULE_VIOLATION` + `details.code: provider_mismatch` when provider does not match booking.

## Verification
- `node --test tests/routes.test.js tests/httpServer.test.js` -> pass
- `node --test tests/reviewService.test.js` -> pass

## ADR note
- `ADR.md` was not found in repo or resolved `$AGENT_HOME` during this run. Implementation followed existing backend contract artifacts in `docs/handoff/rat-133-api-contract-alignment-2026-05-07.md`.

## Next action
- FE should ensure review create calls include `serviceId` on legacy alias (or migrate to canonical `/api/v1/service-requests/{serviceRequestId}/reviews`) and handle the new `forbidden_actor` / `provider_mismatch` response codes.
