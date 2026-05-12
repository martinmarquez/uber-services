# RAT-419 — Investigación y corrección propuesta de auto reopen/status-drift en RAT-11 (2026-05-11)

## Contexto
Issue asignado: `RAT-419`  
Objetivo: investigar por qué `RAT-11` vuelve a estados activos automáticamente (reopen/status drift) y dejar corrección accionable.

## Evidencia revisada
- `analysis/rat-351-reprocessed-by-day.tsv` registra para `RAT-11` en `2026-05-11` la transición automática `done -> to_todo`.
- `docs/reviews/rat-198-ceo-productivity-review-rat-3.md` y `docs/reviews/rat-282-ceo-productivity-review-rat-3.md` mantienen `RAT-11` como entregable `done` dentro del bundle histórico.
- Hallazgos previos convergentes del mismo defecto de plataforma:
  - `docs/analysis/rat-355-status-drift-investigation-2026-05-11.md`
  - `docs/analysis/rat-364-auto-reopen-rule-spec-2026-05-11.md`
  - `docs/analysis/rat-404-lifecycle-status-drift-reopen-blocker-2026-05-11.md`
  - `docs/analysis/rat-406-runtime-lifecycle-anti-reopen-guardrail-blocker-2026-05-11.md`

## Diagnóstico
`RAT-11` no muestra evidencia de nuevo alcance funcional que justifique reopen. El patrón observado coincide con deriva automática del lifecycle del control plane:

1. Reprocesamiento o wake de automatización reescribe estado terminal (`done`) a estado activo (`todo`/`in_progress`) sin `resume:true` explícito.
2. No existe deduplicación estricta para eventos `issue_status_changed` sin delta real (sin comentario nuevo, sin blocker nuevo, sin cambio de scope/assignee).
3. Checkout o transiciones auxiliares todavía tienen al menos un vector de reapertura implícita para issues terminales.

## Corrección requerida (owner runtime)
Aplicar guardrails en el runtime dueño del issue lifecycle (fuera de este repo de dominio):

1. **Terminal-state gate obligatorio**: `done/cancelled` no puede reabrirse salvo `resume:true` auditable.
2. **Checkout no mutante** para terminales sin intención de resume.
3. **No-delta wake dedupe**: suprimir `issue_status_changed` que no trae delta material.
4. **Pruebas de replay**:
   - terminal + automation/no-resume => `reopen_count=0`
   - terminal + `resume:true` => reopen permitido con metadata de auditoría
   - n wakes consecutivos sin delta => sin churn de estado

## Estado en este heartbeat
- Investigación específica de `RAT-11` completada.
- Artefacto de diagnóstico y ruta de corrección documentados.
- Esta workspace no contiene el runtime de control-plane para aplicar patch directo; requiere ejecución por owner de lifecycle.

## Unblock owner/action
- **Owner**: `@board` / CTO (runtime control-plane lifecycle owner).
- **Action**: priorizar y desplegar guardrails de reopen en la línea `RAT-390/RAT-406`, luego adjuntar evidencia de replay con caso `RAT-11`.

## Addendum — Reopen recurrence after block (2026-05-11T04:22:31Z)
- Tras haber dejado `RAT-419` en `blocked` con owner/action explícito, el issue volvió a `in_progress` por wake `issue_status_changed` sin comentarios pendientes (`0/0`).
- Este evento agrega evidencia de que la deriva de estado sigue activa en el lifecycle runtime y puede sobreescribir estados operativos aun con bloqueo administrativo previo.
- Decisión operativa en este heartbeat: re-normalizar `RAT-419` a `blocked` y sostener la misma ruta de desbloqueo (board/CTO runtime owner + guardrails `RAT-390/RAT-406` + replay de `RAT-11`).

## Addendum — Wake recurrence validation (2026-05-11T18:31:00-03:00)
- Wake procesado: `issue_status_changed` con `0/0` comentarios pendientes.
- Verificación ejecutada en esta heartbeat:
  - `bash tools/guardrails/check-rat-404-done-in-progress-reopen-surface.sh`
  - Resultado: `RESULT=BLOCKED_WRONG_REPO`.
  - Detalle: `No control-plane issue lifecycle runtime signatures found in server/*`.
- Conclusión operativa: la reapertura espuria de `RAT-11` sigue siendo un defecto de lifecycle runtime fuera de este repo de dominio; no existe patch local autoritativo en `uber-services`.
- Decisión de ejecución para RAT-419:
  - Mantener `blocked` hasta que owner de control-plane adjunte patch + replay donde `RAT-11` permanezca terminal ante wakes sin delta.
  - No abrir una lane paralela en este repo para evitar drift arquitectónico.
- Unblock owner/action (sin cambios):
  - Owner: `@board` / CTO runtime lifecycle owner.
  - Action: desplegar guardrails runtime (`RAT-390/RAT-406`) y adjuntar replay de `RAT-11` sin reopen espurio.
