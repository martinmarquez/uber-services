# RAT-28 / RAT-18.1 QA: Instrumentacion A/B y Calidad de Muestra

## Objetivo
Validar que los experimentos A/B tengan trazabilidad completa, calidad minima de muestra y criterio de decision reproducible antes de cualquier lectura de resultado.

## Alcance
- Funnel end-to-end: `visit -> signup_start -> signup_complete -> activation`
- Eventos de exposicion y conversion por variante (`control`, `treatment`)
- Segmentos minimos: canal de adquisicion, plataforma, geo, cohort semanal

## Criterios de salida (Pass/Fail)
- PASS solo si todos los checks criticos estan en verde.
- FAIL inmediato si falta cualquier evento obligatorio o si no se alcanza `n >= 100` por variante para la metrica primaria.
- HOLD (sin decision) si hay muestra suficiente pero problemas de calidad de datos (atribucion incompleta, identidad inestable, SRM).

## Gate 1: Instrumentacion minima obligatoria
Checklist critico:
- `experiment_assigned` emitido una sola vez por usuario/sesion elegible.
- Payload requerido: `experiment_id`, `variant`, `user_id|anon_id`, `session_id`, `timestamp`, `platform`, `acquisition_channel`.
- Eventos de conversion incluyen `experiment_id` y `variant` (directo o por join deterministicamente verificable).
- IDs consistentes entre cliente/servidor (sin colisiones ni null rate > 1%).
- Timestamps monotonicos razonables (sin skew masivo por zona horaria).

Pruebas:
- Muestreo de 50 eventos raw por variante.
- Reconciliacion cliente vs servidor para 1 dia completo.
- Validacion de esquema (campos requeridos no nulos).

## Gate 2: Calidad de muestra y asignacion
Checklist critico:
- Minimo `100` muestras por variante para metrica primaria (decision gate).
- Split esperado (ej. 50/50) dentro de tolerancia operacional ±5 puntos porcentuales.
- Sin Sample Ratio Mismatch (SRM) evidente en monitoreo diario.
- Sin contaminacion entre variantes (usuario expuesto a >1 variante en el mismo experimento).

Pruebas:
- Conteo diario por variante y segmento clave.
- Deteccion de duplicados por `user_id + experiment_id`.
- Tasa de exposicion multiple por usuario (<0.5% objetivo).

## Gate 3: Integridad del funnel
Checklist critico:
- Drop-off por etapa calculable para cada variante.
- Sin saltos imposibles en flujo (conversion sin exposicion).
- Definicion de metrica primaria congelada antes de lectura de lift.

Pruebas:
- Tabla de funnel por variante y segmento.
- Query de anomalas: conversiones huerfanas, eventos fuera de orden.

## Gate 4: Reglas de decision y governance
- No declarar ganador con `<100` muestras por variante.
- Toda iniciativa con gasto proyectado `> $10k` requiere aprobacion CMO antes de escalar.
- Si se incumple target de growth por 2 trimestres consecutivos: escalar a board.

## Template de evidencia para cierre QA
- Experimento:
- Ventana de analisis:
- Metrica primaria:
- N control / N treatment:
- Resultado split:
- Estado SRM:
- % eventos con payload completo:
- Incidentes detectados:
- Decision QA: PASS / FAIL / HOLD
- Siguiente accion y owner:

## Bloqueadores tipicos (escalar a CMO)
- Falta de ownership de eventos entre producto e ingenieria.
- ETL sin SLA para disponibilidad diaria de datos.
- No hay acuerdo de metrica primaria previo al lanzamiento.
- Presupuesto de adquisicion excede gate sin aprobacion.
