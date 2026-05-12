# KNOWLEDGE_BASE.md

## FAQ: estados de reseñas

### Que significa "En revision"?
Tu reseña fue recibida y esta en validacion de confianza. Puede seguir visible con impacto limitado hasta cerrar la revision.

### Que significa "No recomendada"?
La reseña puede no cumplir politicas de confianza o calidad. Puede seguir visible, pero no contribuye al score de reputacion. Podes iniciar apelacion.

### Como apelar una decision?
Desde detalle de reseña -> "Iniciar apelacion". Recibis numero de caso y estado trazable.
SLA operativo: acuse en <24h, resolucion estandar en <=7 dias corridos y hasta 15 dias corridos en casos complejos.

## Macros de soporte (MVP)

### Macro: reseña en revision
- Explica estado y SLA objetivo.
- Incluye link directo a apelacion.
- Evita lenguaje punitivo.
- Mensaje recomendado: "Recibimos tu apelacion. Te confirmamos recepcion en menos de 24 horas y te compartimos resolucion en hasta 7 dias corridos (15 dias si el caso es complejo)."

### Macro: apelacion resuelta
- Informa decision (aceptada/rechazada).
- Incluye motivo de alto nivel.
- Incluye proximo paso si corresponde.

### Macro: evidencia minima para apelacion
- Solicitar en primer contacto: ID de reseña, comprobante del servicio y breve contexto del posible error.
- Objetivo: reducir reprocesos y acelerar resolucion.

## Tags operativos para triage

- `review-status-confusion`
- `review-appeal-followup`
- `exec-watch`

## Decision log PM (RAT-40, lectura dia 2)

- Se prioriza ajuste de copy + macro soporte en 24h por sobre cambios de logica.
- Se mantiene scope acotado: sin nuevos estados ni cambios de moderacion.
- Secuencia aprobada: UX writing -> frontend copy -> macro CS -> QA smoke.

## Decision log PM (RAT-38 / RAT-10, QA follow-up)

- Se prioriza cierre de gaps criticos de testabilidad del spec de ranking robusto antes de cualquier implementacion backend.
- Contratos cerrados para QA: recency normalizada (rango exacto 0.85..1.00), severidad de incidentes deterministica (sum + decay + cap), low-N con frontera/rounding unificados FE/BE.
- Guardrails anti-gaming pasan a parametros versionados (`ranking_guardrails.v1`) con overrides por categoria/mercado.
- Baseline de simulacion formalizado como `baseline_naive_avg_v1` con snapshot + seed oficial (`20260506`) para reproducibilidad.

## 2026-05-07 - RAT-61 PM alignment (trust policy + microcopy)
- Scope v1 frozen to four visible moderation states (`verificada`, `en_revision`, `no_recomendada`, `removida`).
- Canonical ES-AR microcopy approved for Round 1 alignment artifact in `docs/reviews/rat-61-pm-alignment-trust-policy-microcopy-round1.md`.
- Anti-scope-creep decision: no new states, no threshold tuning, no multi-language expansion inside RAT-61.
- Next execution sequence prioritized FE -> BE -> QA -> PM/Comms for shipping consistency.

## 2026-05-07 - RAT-65 CS review (claridad/usabilidad de copy)
- Se publico Round 1 en `docs/reviews/rat-65-cs-review-claridad-usabilidad-copy-round1.md` con 5 hallazgos priorizados (2 alta, 2 media, 1 baja).
- Foco de mitigacion: alinear copy de confirmacion post-envio y feedback de `report/respond` para reducir confusion de estado y recontacto.
- Siguiente secuencia recomendada: FE copy-only patch -> QA smoke mobile -> monitoreo CS de confusion/recontacto por 7 dias.

## 2026-05-07 - RAT-66 UX Iteracion 2
- Se corrige semantica de filtros en `MobileReviewFlow`: de `tablist/tab` a grupo de botones excluyentes con `aria-pressed`.
- Se estandariza foco visible con `:focus-visible` (outline 3px con `--focus-ring`) para todos los controles interactivos.
- Handoff FE listo para integrar API/eventos manteniendo contratos de accesibilidad.
- Riesgo abierto: definir comportamiento completo de foco/escape en dialogos dentro del shell de app.

## 2026-05-07 - RAT-63 PM review (validacion de objetivos de negocio)
- Artifact Round 1 created: `docs/reviews/rat-63-pm-review-validacion-objetivos-negocio-round1.md`.
- Decision: maintain RAT-6 priority for trust + conversion, with explicit no-scope-creep guardrails.
- Business gates locked for rollout: trust, UX friction, and support clarity metrics with go/no-go criteria.
- Escalation rule reaffirmed: any incentive mechanics that condition rating must be escalated to CEO before sprint commitment.

## 2026-05-10 - RAT-136 operacion de cola de moderacion y apelaciones (MVP)

### FAQ operativa nueva (soporte L1)
- `Por que mi reseña no impacta el score todavia?`
  - Porque puede estar en `en_revision` o `no_recomendada`; en esos estados la reseña puede verse pero no impacta el score hasta cerrar moderacion.
- `Cuanto tarda una apelacion?`
  - SLA visible para cliente: acuse <24h, resolucion estandar <=7 dias corridos, hasta 15 dias corridos en complejos.
- `Como sigo mi caso?`
  - Siempre compartir numero de caso y ultimo estado (`recibida`, `en_revision`, `resuelta`).

### Triage minimo obligatorio por ticket de apelacion
- Confirmar y registrar: `review_id`, `appeal_id` (si existe), `estado_visible_actual`, `riesgo_churn` (si/no), `deadline_sla`.
- Aplicar tags: `review-appeal-followup`; agregar `exec-watch` si hay amenaza de abandono, cuenta estrategica o conflicto de policy.
- Si falta evidencia minima, responder con macro de evidencia en primer contacto (sin cerrar ticket hasta completar).

### Macros nuevas (texto corto de referencia)
- `Macro: seguimiento cola de moderacion`
  - "Tu reseña esta en revision de confianza. Te avisamos avance con numero de caso y proximo checkpoint."
- `Macro: SLA en riesgo`
  - "Tu caso sigue activo. Priorizamos revision y te confirmamos proximo update antes de {hora/fecha}."

### Casos resueltos de referencia (MVP)

#### Caso A - Apelacion aceptada (`revertida` -> `verificada`)
- Contexto: reseña marcada `no_recomendada`; cliente aporta comprobante valido y evidencia incremental.
- Tiempos: acuse a las 3h; resolucion en 36h.
- Resultado: apelacion aceptada, estado final `verificada`.
- Mensaje al cliente: confirmar correccion, impacto restaurado y agradecer evidencia precisa.

#### Caso B - Apelacion rechazada (`confirmada` -> mantiene `removida`)
- Contexto: reseña removida por conflicto de policy; apelacion sin evidencia nueva material.
- Tiempos: acuse a las 5h; resolucion en 4 dias.
- Resultado: apelacion rechazada, estado final `removida`.
- Mensaje al cliente: explicar motivo de alto nivel, referenciar policy aplicable y aclarar condicion para futura reapertura (nueva evidencia).

#### Caso C - Apelacion modificada (`modificada` -> `en_revision`)
- Contexto: decision inicial `removida`; nuevo contexto sugiere revisar severidad.
- Tiempos: acuse a las 2h; decision parcial en 18h.
- Resultado: estado ajustado a `en_revision` mientras se completa validacion de fondo.
- Mensaje al cliente: informar cambio de estado, plazo esperado y proximo checkpoint fechado.

## 2026-05-11 Security Audit Memory — RAT-358
- Added `fraudHeuristics.thresholdVersion` to review-domain event payloads (default `anti_gaming_v1_2026-05-10`, configurable in `ReviewService`).
- Added `fraudHeuristics.s6Telemetry` completeness fields (`sourcesExpected`, `sourcesPresent`, `completenessRatio`, `status`) for cross-surface auditability.
- Verified with targeted suite: `node --test server/tests/reviewService.test.js` => 25/25 pass.
- Residual risk: S6 completeness currently based on local context, pending upstream multi-source availability wiring.

## 2026-05-11 PM Memory — RAT-355 status drift triage
- Prioritization decision: classify RAT-355 as platform reliability P1 inside trust/execution hygiene lane; no net-new product feature scope approved.
- Board feedback incorporated: RAT-35 lifecycle reopened without scope delta is treated as state-integrity defect, not roadmap work.
- Shipping gate locked: terminal issues (`done`/`cancelled`) must not reopen without explicit `resume: true` plus auditable actor/reason.
- Execution sequence approved: backend transition gate -> automation wake dedupe + checkout safety -> audit provenance fields -> QA replay fixture -> PM board-WIP stability signoff.
- Escalation rule reaffirmed: any lifecycle model semantic expansion beyond resume gating must be escalated to CEO before sprint commit.

## 2026-05-11 PM Memory Addendum — RAT-355 resumed-drift evidence
- New evidence at `2026-05-11T04:05:33Z`: RAT-355 moved from `blocked` back to `in_progress` without new human comments (wake payload `0/0`), confirming lifecycle mutation extends beyond terminal `done` state.
- Product decision: expand guardrail acceptance to include `blocked` state integrity (no auto-resume without blocker delta or explicit human resume intent).
- Escalation upgrade: classify as cross-workflow state-machine defect requiring CTO + CEO visibility due to board reliability impact.
- Revalidated route-layer auth/body controls in this heartbeat: `node --test server/tests/reviewService.test.js server/tests/routes.test.js` => 32/32 pass.

## 2026-05-11 PM Memory — RAT-364 auto-reopen guardrails
- Prioritization: approved as reliability hardening only; rejected any net-new workflow features.
- Roadmap alignment: mapped to M4 operational reliability/churn-risk reduction, not growth scope.
- Spec decision: terminal issues stay terminal unless explicit `resume: true` with auditable actor/reason.
- Sequencing decision: backend transition gate first, then automation/checkout dedupe, then QA replay proof.
- Escalation rule: any request to alter lifecycle semantics beyond this guardrail must be escalated to CEO pre-commit.

## 2026-05-11 PM Memory — RAT-387 MVP lifecycle dedupe
- Canonical RAT-69 backend child confirmed as `RAT-133` (`done`); `RAT-129` and `RAT-131` remain duplicate non-canonical lanes.
- Temporary artifact `RAT-132` remains non-canonical and should be closed as `cancelled` with rationale.
- Ownership constraint surfaced: cross-assignee/comment writes on RAT-69 portfolio are blocked by checkout policy; PM lane cannot directly post/update those issues.
- RAT-387 moved to `blocked` with explicit unblock owners/actions and first-class blockers set to `RAT-129`, `RAT-131`, `RAT-132`.

## 2026-05-11 Security Audit Memory — RAT-424 reopen loop on RAT-358
- Confirmed replay evidence in `analysis/rat-351-reprocessed-by-day.tsv`: `RAT-358` transitioned `done -> to_todo` on 2026-05-11.
- Detected systemic churn pattern in same ledger slice: multiple issues also flipped `done -> to_todo`, indicating platform lifecycle mutation risk rather than single-issue behavior.
- Security classification: high-severity state-integrity defect (terminal state trust broken; compliance/audit drift risk).
- Durable artifact created: `docs/analysis/rat-424-reopen-loop-investigation-2026-05-11.md`.
- Unblock owner/action recorded: control-plane lifecycle maintainer must enforce terminal resume gating (`resume:true` + provenance), checkout non-reopen guarantee, and no-delta wake dedupe with API-level regression evidence.

## 2026-05-11 Security Memory — RAT-423 auto-reopen investigation
- Wake payload for `RAT-423` arrived as `issue_assigned` with `pending comments 0/0`, consistent with non-comment lifecycle churn.
- Direct thread evidence on `RAT-59`: repeated close actions followed by fresh wake `issue_status_changed` without new human comments (`2026-05-11T03:55:54Z` and `2026-05-11T04:05:32Z` closure notes).
- Corroborating platform evidence already logged for `RAT-355`: `blocked -> in_progress` drift at `2026-05-11T04:05:33Z` with wake payload `0/0`, showing state mutation is cross-status (`done` and `blocked`) rather than scope-driven reopen.
- Security/compliance interpretation: this is a state-integrity defect in lifecycle automation/audit provenance, not legitimate workflow progression.
- Required control gate remains: no non-human reopen/resume unless explicit `resume: true` plus actor+reason provenance and blocker-delta validation for `blocked` issues.

## 2026-05-11 PM Memory Addendum 2 — RAT-355 repeated drift
- Third observed drift event at `2026-05-11T04:13:04Z`: issue flipped from `blocked` to `in_progress` again without new human comments.
- Prioritization update: RAT-355 raised from `medium` to `high` due to repeated board-state integrity failures in the same day.
- Escalation trigger activated: if one more non-human flip occurs before child guardrail tickets start execution, escalate to CEO as sprint-priority override with temporary automation kill-switch request.

## 2026-05-11 PM Memory Addendum 3 — CEO escalation threshold triggered
- New flip observed at `2026-05-11T04:24:35Z` (`in_progress` without human delta) after high-priority mitigation ticket creation.
- Escalation threshold crossed: immediate CEO confirmation requested for sprint override and emergency kill-switch activation path (`RAT-450`).

- Security audit memory (`2026-05-11T04:59Z`): Run `4e73f53d-eb46-4e08-8539-af7b8b99084a` (RAT-127 lineage) is stale-running with only startup events and no output after `2026-05-11T03:56:10.580Z`; assignee cancel attempt returned `{"error":"Board access required"}` so unblock owner is board/CTO run-control authority.
- Security audit memory (`2026-05-11T07:53Z`): RAT-493 accepted via formal-justification path after stale-run proof; `RAT-493` closed `done` and board/CTO remains required owner for cancel permissions on run `4e73f53d-eb46-4e08-8539-af7b8b99084a`.

## 2026-05-11 Security Audit Memory — RAT-615 consolidation shard
- Wake scope: consolidate duplicate lane(s) from `RAT-591` onto canonical `RAT-568`.
- Executed: moved `RAT-424` from `in_progress` to `done` as duplicate merged into `RAT-568`.
- Security finding: no net-new auth/encryption/OWASP code defect; this heartbeat was lifecycle-governance duplicate cleanup.
- Constraint: cross-assignee permission prevented posting required ledger directly to `RAT-591` (`Agent cannot mutate another agent's issue`).
- Unblock owner/action: `RAT-591` assignee or CTO must post/copy RAT-615 ledger into RAT-591 (or reassign/grant permission) to complete acceptance artifact.

## 2026-05-11 Security Audit Memory — RAT-615 unblock contract triage
- Processed dependency-blocked human comment requiring explicit ETA/next-action contract on `RAT-615`.
- Verified blocker still active: `RAT-591` thread does not yet include RAT-615 ledger line for `RAT-424` consolidation.
- Posted dated ETA on `RAT-615`: resolve by 2026-05-12 12:00 UTC via ledger verification/coordination and close same heartbeat once ledger appears.
