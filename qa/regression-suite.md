# Ratings/Reviews Definition of Done (Unified)

A rating-related issue is DONE only if all checks pass:

- Functional tests for changed paths are automated and passing.
- Abuse/security scenarios in matrix are executed for impacted components.
- Regression tests run against rating aggregation and visibility rules.
- Evidence attached in `qa/test-results/` (logs, screenshots, run summary).
- No open critical/high defects linked to the change.
- CTO review completed.
- UX/UI Designer review completed.
- Security Engineer review completed.
- Hardening cycle count for release >= 2 and both cycles closed.
- QA gate status explicitly marked PASS by QA Specialist.

If any item is missing, release is BLOCKED.
