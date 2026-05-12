# RAT-37: Instrumentacion y tablero CS (5 metricas)

Fecha: 2026-05-06  
Owner: Data + Customer Success  
Dependencia: RAT-19 (gate CS) -> RAT-37 (observabilidad operativa) -> RAT-39 (instrumentacion)

## Objetivo y gate de OKR

Detectar friccion temprana y riesgo de churn en la primera semana post-release de RAT-13 para ejecutar mitigaciones antes de dano acumulado.

Gate de objetivo trimestral (alineacion obligatoria):
- OKR Growth: sostener/elevar conversion del flujo de reseñas sin dano de experiencia.
- OKR Trust: reducir confusion en estados y re-aperturas de apelaciones.
- OKR Revenue Retention: escalar riesgo de churn de cuentas estrategicas antes de impacto en MRR/GMV.

## Definicion de metricas obligatorias (5)

1. `review_submit_completion_rate`
- Formula: `users_submitted / users_started`.
- Eventos: `review_flow_started`, `review_submitted`.
- Granularidad: diaria + acumulado dia 2 y dia 7.
- Guardrail: no caer vs baseline pre-release.

2. `review_flow_dropoff_after_star_select`
- Formula: `1 - (users_submitted_after_star / users_star_selected)`.
- Eventos: `review_star_selected`, `review_submitted`.
- Granularidad: diaria + acumulado semanal.
- Guardrail: tendencia descendente semana 1.

3. `support_tickets_review_status_confusion`
- Formula: `tickets_tag_review_status_confusion / total_review_tickets`.
- Fuente: soporte con tag obligatorio `review-status-confusion`.
- Granularidad: diaria.
- Guardrail: <= 15% al cierre de semana 2.

4. `appeal_reopen_rate`
- Formula: `appeals_reopened / appeals_closed`.
- Fuente: sistema de apelaciones y soporte.
- Granularidad: diaria + semanal.
- Guardrail: tendencia descendente en 2 ciclos.

5. `exec_watch_incidents`
- Formula: conteo diario de incidentes `exec-watch` + `% escalado en SLA`.
- Fuente: soporte + T&S + CS.
- Granularidad: tiempo real + corte diario.
- SLA critico: 100% escalados a CEO en < 4 horas.

## Especificacion minima de eventos

Campos comunes requeridos:
- `event_name`
- `event_ts_utc`
- `user_id`
- `review_id` (si aplica)
- `order_id`
- `user_type` (`cliente`/`prestador`)
- `platform` (`app`/`web`)
- `cohort_age_days`
- `rating_value` (si aplica)

Reglas de calidad:
- deduplicacion por (`event_name`, `user_id`, `review_id`, `event_ts_utc` redondeado a segundo).
- timezone de visualizacion default: America/Argentina/Buenos_Aires.
- data latency target: < 15 min para vista operativa; < 24 h para cierre diario.

## SQL de referencia (warehouse)

```sql
-- completion rate diario
with started as (
  select date(event_ts_utc) as d, user_id
  from events
  where event_name = 'review_flow_started'
  group by 1,2
),
submitted as (
  select date(event_ts_utc) as d, user_id
  from events
  where event_name = 'review_submitted'
  group by 1,2
)
select
  s.d,
  count(distinct sb.user_id) * 1.0 / nullif(count(distinct s.user_id), 0) as review_submit_completion_rate
from started s
left join submitted sb on s.d = sb.d and s.user_id = sb.user_id
group by 1
order by 1 desc;
```

```sql
-- drop-off post seleccion de estrellas
with star as (
  select date(event_ts_utc) as d, user_id
  from events
  where event_name = 'review_star_selected'
  group by 1,2
),
submitted as (
  select date(event_ts_utc) as d, user_id
  from events
  where event_name = 'review_submitted'
  group by 1,2
)
select
  st.d,
  1 - (count(distinct sb.user_id) * 1.0 / nullif(count(distinct st.user_id), 0)) as review_flow_dropoff_after_star_select
from star st
left join submitted sb on st.d = sb.d and st.user_id = sb.user_id
group by 1
order by 1 desc;
```

## Segmentacion minima del tablero

- Tipo de usuario: cliente vs prestador.
- Cohorte: nuevos (<= 30 dias) vs recurrentes.
- Canal: app vs web.
- Rating bucket: bajas (1-3) vs altas (4-5).

## Reglas de alerta y escalamiento

Alerta roja (riesgo de revenue/churn):
- caida de `review_submit_completion_rate` >= 10% relativo vs baseline por 2 dias, o
- `exec_watch_incidents` con incumplimiento de SLA, o
- `support_tickets_review_status_confusion` > 20% en corte diario.

Accion roja:
- escalar CEO inmediato.
- abrir issue de contencion (PM + Eng + CS) en < 2 horas.
- si se proyecta impacto en retencion/MRR del trimestre: escalar Board con resumen ejecutivo y plan de mitigacion.

Alerta amarilla:
- aumento sostenido de drop-off o confusion de estados por 2 cortes diarios.
- `appeal_reopen_rate` sin mejora por 2 semanas.

Accion amarilla:
- ajuste de onboarding microcopy + macros soporte en 24 h.
- seguimiento dia siguiente con lectura de impacto.

Alerta verde:
- metricas estables/mejorando y sin breach de SLA.
- mantener monitoreo y documentar aprendizajes.

## Cadencia operativa

- Dia 2 post-release:
  - lectura temprana de dano/friccion.
  - propuesta de ajustes inmediatos.
- Dia 7 post-release:
  - lectura consolidada.
  - decision continuar/ajustar/escalar.

## Entregables week 1

- Tablero activo con 5 metricas, filtros y semaforo de alertas.
- Log de lectura dia 2 y dia 7.
- SQL pack de metricas: `analysis/sql/rat-39-cs-dashboard-metrics.sql`.
- Vista operativa unificada (dashboard-ready): `analysis/sql/rat-39-cs-dashboard-operational-view.sql`.
- Plantilla de lectura D+2/D+7: `docs/rat-39-dashboard-readout-dia2-dia7.md`.
- Registro de acciones ejecutadas en:
  - `ONBOARDING.md`
  - `KNOWLEDGE_BASE.md`
  - `CHURN_TRACKING.md`
