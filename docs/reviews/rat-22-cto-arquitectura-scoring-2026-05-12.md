# RAT-22 CTO review - arquitectura de scoring robusto (2026-05-12)

## Veredicto
Aprobacion tecnica condicionada. Arquitectura estadistica solida para lanzamiento controlado.

Bloqueo de seguridad antes de produccion publica:
- Integridad de incidentes (`F_incident`) y anti-abuso del trigger de burst (`F_burst`) deben quedar cerrados con controles verificables.

## Lo que apruebo
- Base bayesiana (`Q_bayes`) + volumen para controlar small-sample inflation.
- Contrato deterministico de recencia e incidentes con half-life y bordes testeables.
- Guardrails versionados y baseline reproducible para simulacion/A-B.
- Regla de display low-N con fronteras exactas y precision unificada FE/BE.

## Riesgos y feedback accionable

### 1) Seguridad/abuso: inyeccion de incidentes y denegacion reputacional
Riesgo:
- Si `I_sev` consume incidentes no validados de punta a punta, un actor puede inducir penalizacion reputacional.

Requisito CTO:
- Solo eventos con `source=trusted`, `state=validated`, `actor_scope=authorized` entran a `I_sev`.
- Trazabilidad obligatoria por incidente (`source_event_id`, `decision_id`, `reviewer_id`, `decision_ts`).
- SLA de recalculo y rollback con auditoria (quien/que/cuando) en log inmutable.

### 2) Seguridad/abuso: trigger de burst explotable por terceros
Riesgo:
- El deboost global (`F_burst=0.85`) puede ser activado por brigading de baja confiabilidad para bajar ranking de un proveedor.

Requisito CTO:
- El trigger debe usar volumen ponderado por confiabilidad (`sum(a_i)`), no conteo bruto.
- Activacion dual: umbral estadistico + minima evidencia confiable.
- Auto-expiracion + holdout de evaluacion para verificar FPR/FNR por categoria/ciudad.

### 3) Estabilidad operacional
Riesgo:
- Multiplicadores encadenados pueden producir caidas abruptas en cambios marginales de riesgo/incidentes.

Requisito CTO:
- Definir guardrail de monotonicidad y maximo delta diario de score publicado por proveedor (excepto incidentes graves validados).
- Exponer contribuciones por factor en API interna para debug y soporte.

### 4) Consistencia de implementacion FE/BE
Riesgo:
- `half away from zero` no es rounding por defecto en JS.

Requisito CTO:
- Implementar util unico compartido FE/BE o computar `displayScore` solo en backend y tratarlo como source of truth.

## Gate de salida a produccion
Se habilita salida cuando existan:
1. Pruebas automatizadas de contrato para `F_incident` y `F_burst` anti-abuso.
2. Evidencia de auditoria de incidentes validados.
3. Dashboard operativo con drift por factor y alertas de volatilidad.
4. Runbook de rollback reputacional y ownership on-call.
