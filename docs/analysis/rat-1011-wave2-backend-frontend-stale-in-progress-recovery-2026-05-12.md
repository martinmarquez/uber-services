# RAT-1011 / RAT-791 wave2: Backend/Frontend stale in_progress recovery cluster

Fecha: 2026-05-12
Owner lane: Back-End Developer
Estado: Blocked (wrong runtime surface in this repo)

## Contexto y alcance

Se pidió ejecutar recuperación wave2 para "Backend/Frontend stale in_progress". Según ADR vigente, la política de lifecycle anti auto-reopen y dedupe aplica a eventos de issue lifecycle (`issue_status_changed`, `issue_blockers_resolved`) y a guardrails de wake.

## Evidencia ejecutada en este heartbeat

Comando:

```bash
./tools/guardrails/check-rat-573-stale-inprogress-correction-surface.sh
```

Resultado:

- `RESULT=BLOCKED_WRONG_REPO`
- `DETAIL=No issue lifecycle admin API signatures found in server/*`

Conclusión técnica: este workspace (`uber-services`) contiene API de dominio de reseñas (`/api/v1/reviews`, `/api/v1/service-requests`) pero no contiene la superficie de control-plane `/api/issues` donde vive la corrección de stale `in_progress`.

## Coordinación FE/BE de contrato (propuesta para lane correcto)

Para alinear frontend con backend antes de implementación en el repo de control-plane, el contrato mínimo de corrección debería ser:

1. Endpoint de corrección (versionado): `POST /api/v1/issues/stale-in-progress/recover`
2. Request payload:
   - `issueIds: string[]` (1..N, requerido)
   - `targetStatus: "todo" | "blocked"` (requerido)
   - `reason: string` (requerido)
   - `idempotencyKey: string` (requerido)
   - `dryRun: boolean` (opcional, default `false`)
3. Response `200`:
   - `ok: true`
   - `processed: Array<{ issueId, fromStatus, toStatus, skipped, code }>`
   - `correlationId: string`
4. Errores:
   - `400` `VALIDATION_ERROR` (`invalid_issue_ids`, `invalid_target_status`, `idempotency_key_required`)
   - `409` `BUSINESS_RULE_VIOLATION` (`resume_required_for_terminal_reopen`, `explicit_trigger_required_for_blocked_reopen`)
   - `423` `LOCKED` (`issue_checkout_locked`)
   - `500` `INTERNAL_ERROR`
5. Versioning y compat:
   - Solo `/api/v1`
   - Error envelope consistente: `{ error: { code, message, details } }`

## Unblock owner y acción

- Unblock owner: `@CTO` / maintainer de control-plane lifecycle runtime.
- Acción requerida: mover implementación de RAT-1011 al repo que contiene `/api/issues` lifecycle mutations, o adjuntar ese módulo/runtime a este workspace.
- Condición de reanudación backend en esta lane: disponibilidad local de superficie `/api/issues` y tests asociados.

## Próximo paso inmediato cuando se desbloquee

1. Implementar endpoint versionado de recovery con validación estricta.
2. Agregar tests de contrato (happy path + edge cases de resume/blocked triggers).
3. Ejecutar guardrail de stale in_progress correction y publicar evidencia.
