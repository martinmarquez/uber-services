# RAT-350 Implementation Audit (2026-05-11)

Issue: [RAT-350](/RAT/issues/RAT-350)

## Scope
- Reviewed all issues in project Onboarding (266 total) from control-plane API.
- Cross-checked each issue identifier against repository evidence in src/, server/, moderation/, docs/, plans/, and analysis/.
- Classified review-only tickets (productivity/silent-run/board housekeeping) separately from build-implementation tickets.

## Summary
- Total issues: 266
- Implementation issues: 125
- Ops/review-only issues: 141
- Implementation issues with at least one repo reference: 100 / 125
- Active implementation issues (in_progress/blocked) with zero repo references: 13
- Done implementation issues with zero repo references: 12 (mostly coordination/review artifacts done in thread; still needs closure-note hygiene)

## Highest-Priority Gaps (Active + Zero/Low Evidence)
| Issue | Status | Repo refs | Title |
|---|---:|---:|---|
| [RAT-346](/RAT/issues/RAT-346) | in_progress | 0 | Implement local postgres as a database for the system |
| [RAT-347](/RAT/issues/RAT-347) | in_progress | 0 | Review all issues that need access to the DB and setup DATABASE_URL=postgresql://postgres:postgres@localhost:5432/uber-services |
| [RAT-348](/RAT/issues/RAT-348) | in_progress | 0 | Escribi un README más concreto, sobretodo explica las formas de desplegar esto en los diferentes ambientes de manera detallada |
| [RAT-341](/RAT/issues/RAT-341) | in_progress | 0 | Veo un error en localhost:5178 que dice No pudimos cargar descubrimiento en vivo. Reintentá en unos segundos. |
| [RAT-338](/RAT/issues/RAT-338) | in_progress | 0 | The localhost server is not showing anything |
| [RAT-334](/RAT/issues/RAT-334) | in_progress | 0 | No veo nada en http://localhost:5173/ que pasa? |
| [RAT-323](/RAT/issues/RAT-323) | in_progress | 0 | RAT-26 Impl: migraciones y lifecycle backend reviews v1 |
| [RAT-322](/RAT/issues/RAT-322) | in_progress | 0 | RAT-26 Impl: freeze contrato API rating 360 FE/BE |
| [RAT-122](/RAT/issues/RAT-122) | blocked | 0 | RAT-84 unblock: publish day-7 KPI snapshots from warehouse |
| [RAT-123](/RAT/issues/RAT-123) | blocked | 0 | RAT-82.1 Ejecutar extract KPI dia 7 (confusion/dropoff) y publicar deltas |

## Gate Decision
- RAT-350 cannot close yet: active implementation tickets still exist with no durable code/doc evidence in-repo.
- Priority execution order should be: runtime/app availability blockers (RAT-346, RAT-347, RAT-341, RAT-338, RAT-334), then deployment docs (RAT-348), then analytics warehouse dependencies (RAT-122, RAT-123).

## Next Action
- Re-run this audit after each dependency cluster lands; close [RAT-350](/RAT/issues/RAT-350) only when every active implementation issue has either:
  1. linked code/doc evidence in repo, or
  2. explicit blocked state with unblock owner + action in thread.
