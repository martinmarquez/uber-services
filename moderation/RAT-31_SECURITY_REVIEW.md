# RAT-31 Security Review (Security Engineering)

Date: 2026-05-11
Owner: Security Engineering

## Scope
Assessment of:
- `moderation/MODERATION_SOP.md`
- `moderation/APPEALS_WORKFLOW.md`

Focus:
- Abuse risk in the moderation playbook.
- Coordinated fraud handling.
- `SEV-0/1` escalation and containment.
- Controls to prevent internal misuse and unsafe reversals.

## Findings
### High (resolved in this revision)
1. **Privileged moderation actions lacked explicit strong-auth requirements.**
   - Risk: account/session compromise could execute irreversible enforcement.
   - Added: SSO+MFA requirement and action signing fields (`actor_id`, `session_id`, `request_id`) for `SEV-0/1`.

2. **Containment renewal governance was incomplete.**
   - Risk: prolonged restrictions without independent review.
   - Added: independent second Security approval for renewals beyond 24h.

3. **No explicit emergency brake for automated enforcement failures.**
   - Risk: detector drift or abuse can trigger mass false positives.
   - Added: manual `kill-switch` requirement to pause automation.

### Medium (resolved in this revision)
1. **Appeal reversals on active containment lacked rollback discipline.**
   - Added: mandatory blast-radius validation + `rollback_plan` before reversal.

2. **Evidence handling lacked explicit privacy minimization controls.**
   - Added: PII masking and export/download restrictions for sensitive evidence.

## Decision
`Approved with required security changes incorporated`

Current playbook text now includes baseline controls for coordinated abuse and SEV-0/1 governance. No additional blocking gaps remain at design level for RAT-31.

## Required Follow-through (implementation phase, non-blocking for this doc review)
1. Enforce SSO+MFA and signed action metadata in moderation tooling.
2. Implement immutable audit log pipeline for critical decisions.
3. Implement JIT evidence access with expiry + justification.
4. Wire automated `SEV-0/1` triggers and manual kill-switch runbook in operations UI.
