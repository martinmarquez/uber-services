# RAT-755 — Recuperación de próximo paso faltante para RAT-308 (2026-05-11)

## Confirmación de gate
- `PRODUCT_BRIEF.md` vigente cargado y alineado con el objetivo de lanzamiento trust-first.
- El experimento RAT-308 sigue en D1 con base RAT-307 (`Email Subject A + WhatsApp Opening A`).

## Siguiente paso recuperado para RAT-308
1. **Cierre D1 con evidencia** (hoy, antes de fin de día):
   - `Leads contactados`, `Replies email`, `Replies WhatsApp`, `Calls agendadas`, `Calls realizadas`.
   - `Objeción dominante` y `next_step` por conversación.
   - `Reply rate total`, `Booked calls rate`, `Neutralización de objeciones`.
2. **Decisión operativa D2**:
   - Determinar semáforo comparando contra target:
     - Reply total target `12%` (rojo `< 9.6%`)
     - Booked calls target `25%` (rojo `< 20.0%`)
     - Neutralización target `60%` (rojo `< 48.0%`)
   - Si semáforo amarillo, mantener A/A para D2 y registrar ajuste menor de copy (sin claims nuevos).
   - Si semáforo rojo, escalar a CEO en el mismo día con métricas, impacto y plan 24h.
3. **Registro**:
   - Cargar datos en:
     - `docs/analysis/rat-308-d1-eod-readout-2026-05-11.md`
     - `docs/analysis/rat-308-ejecucion-log-d1-d7-template-2026-05-10.md`
   - Mantener `docs/analysis/rat-308-objection-log-d1-d7.csv` con categoría + resultado + `next_step`.

## Owner + due
- Due date: 2026-05-11 18:00 (AR timezone) para poder definir el punto de decisión de D2.
- Owner inicial: Sales-representative (captura métricas y objeciones), con validación final del CMO.

## Regla de escalación activa
- KPI >20% under target o bloqueo de ejecución >24h: escalación inmediata a CEO con acción correctiva de 24h y decisión requerida.
