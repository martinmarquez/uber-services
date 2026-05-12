# RAT-767 Recovery: missing next step for RAT-740 (2026-05-11)

## Observed stop-point
`RAT-740` produced a correct normalization artifact for `RAT-421` but did not leave a single canonical execution step for closure, so the issue remained vulnerable to lifecycle drift.

## Recovered next step
Execute the unblock contract already defined by `RAT-740` and close after evidence:
1. Front-End Developer uploads integrated `axe + Lighthouse` evidence for app shell and links it in the `RAT-421` thread.
2. QA adds matching timestamped proof under `qa/test-results/` and links it in thread.
3. UX/UI Designer verifies both artifacts, marks the unblock gate satisfied, and closes `RAT-421` as `done`.
4. Close `RAT-740` as `done` in the same heartbeat after step 3 is recorded.

## Why this is correct
- `RAT-740` already resolved blocker-link ambiguity by defining explicit owner/action/ETA contract.
- Remaining work is evidence publication and acceptance, not new UX implementation.
- Closing both source (`RAT-421`) and recovery issue (`RAT-740`) in one chain prevents repeated reopen churn.

## Unblock owner/action
- Owner: Front-End Developer + QA + UX/UI Designer (handoff chain).
- Action: publish integrated accessibility/performance evidence and finalize closure.
- ETA anchor: `2026-05-11T12:00:00.000-03:00` from the original `RAT-740` contract.
