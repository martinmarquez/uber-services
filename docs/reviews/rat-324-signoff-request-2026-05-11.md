# RAT-324 Sign-off Request (BE + PM)

Date: 2026-05-11  
Issue: RAT-324

Please review and approve the frozen contract document:

- `docs/reviews/rat-324-fe-be-rating360-contract-freeze-v1.md`

Scope requested for approval:
- Endpoints: `create/edit/respond/appeal/report/list`
- Error envelope + `error.code` catalog + HTTP mapping
- `/api/v1` versioning and compatibility policy
- Field limits for `rating/comment/message/note/reasonCode/idempotencyKey/limit`

Required response format (copy/paste):

- `BE_SIGNOFF: APPROVED rat-324-fe-be-rating360-contract-freeze-v1 (date=YYYY-MM-DD)`
- `PM_SIGNOFF: APPROVED rat-324-fe-be-rating360-contract-freeze-v1 (date=YYYY-MM-DD)`

If rejected, respond with:

- `*_SIGNOFF: REJECTED <reason> <required_change>`

Closure gate:
- RAT-324 can move to done once both BE and PM approvals are posted against the canonical contract doc.
