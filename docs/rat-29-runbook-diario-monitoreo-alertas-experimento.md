# RAT-29: Runbook diario de monitoreo y alertas de experimento

## Objetivo
Estandarizar el monitoreo diario de experimentos de growth para detectar dano, validar calidad de datos y acelerar decisiones de continuar, pausar o escalar.

## Alcance
- Experimentos A/B de adquisicion, activacion, conversion y retencion.
- Monitoreo diario operativo (no reemplaza analisis semanal o post-mortem).

## Inputs requeridos (antes de iniciar)
- Dashboard con metricas por variante (control vs treatment).
- Conteo de muestras por variante y total acumulado.
- Segmentacion minima: canal, device, geo y cohorte de fecha.
- Health checks de tracking (eventos clave, latencia, faltantes, duplicados).

## Metricas obligatorias del experimento RAT-18 (seguimiento diario)
- Tasa de resena: `% de usuarios elegibles que dejan resena`.
- NPS: valor diario y promedio movil de 7 dias.
- Retencion D7 temprana: cohorte rolling de usuarios expuestos.
- Volumen bruto: total de resenas recibidas por dia.
- Volumen neto: resenas validas luego de filtros de calidad/fraude.

## Fuentes de datos y responsables (sin dependencias implicitas)
- Fuente unica: dashboard del experimento RAT-18 con corte diario a las 08:30 local.
- Owner de actualizacion de dashboard: Growth Strategist (on-call de growth).
- Owner de calidad de tracking: Data/Analytics on-call.
- SLA de datos diarios: disponible antes de las 09:00 local.
- Si el SLA falla o falta una metrica obligatoria: marcar estado `Warning`, documentar gap y escalar bloqueo al CMO.

Mapeo minimo metrica -> origen:
- Tasa de resena: evento `review_submitted` / usuarios elegibles expuestos.
- NPS: evento `nps_submitted` (ultima respuesta valida por usuario por dia).
- Retencion D7 temprana: cohorte de usuarios expuestos con actividad en dia 7.
- Volumen bruto: conteo diario de `review_submitted`.
- Volumen neto: conteo diario de resenas luego de filtros de fraude/calidad.

## Checklist diario (09:00 local)
1. Validar integridad de datos (eventos de exposicion, conversion y revenue).
2. Confirmar split de trafico esperado (desvio maximo recomendado: +/-5 pp).
3. Revisar muestra acumulada por variante.
4. Revisar KPIs primarios obligatorios (RAT-18):
   - Tasa de resena
   - NPS
   - Retencion D7 temprana
   - Volumen bruto y volumen neto
5. Revisar KPIs secundarios (si aplica):
   - Conversion rate
   - Activation rate
   - Revenue por usuario / margen
6. Revisar guardrails:
   - Error rate tecnico
   - Refund/chargeback/claim rate
   - Tiempo de respuesta o latencia UX clave
7. Revisar performance por segmento critico:
   - Nuevos vs recurrentes
   - Mobile vs desktop
   - Paid vs organic
8. Registrar estado diario y accion sugerida.

## Reglas de decision operativa
- No tomar decision final de ganador/perdedor con menos de 100 muestras totales.
- Si hay dano severo en guardrails, pausar experimento aunque no haya 100 muestras.
- Si no hay dano y la muestra es insuficiente, continuar corriendo.
- Si hay resultado prometedor pero heterogeneo por segmento, abrir analisis segmentado antes de escalar rollout.

## Umbrales de alerta

### Alerta roja (accion inmediata)
- Caida de conversion >= 10% relativo vs control por 2 cortes diarios consecutivos.
- Suba de refund/claim >= 20% relativo vs control.
- Error de tracking critico: perdida > 10% de eventos clave o duplicacion > 10%.

Accion:
1. Pausar experimento.
2. Documentar evidencia (capturas + query + timestamp).
3. Escalar bloqueo a CMO solicitando desbloqueo/decision.

### Alerta amarilla (investigar hoy)
- Caida de conversion entre 5% y 10% relativo vs control.
- Drift de asignacion de trafico > +/-5 pp.
- Diferencia anomala por segmento critico (>12% relativo entre segmentos).

Accion:
1. Mantener experimento activo con vigilancia reforzada.
2. Abrir ticket de analisis de causa raiz.
3. Revaluar en siguiente corte diario.

### Alerta verde (sin riesgo operativo)
- Guardrails estables y sin degradacion relevante.
- Tendencia consistente o neutral en KPI primario.

Accion:
1. Continuar experimento.
2. Mantener seguimiento diario normal.

## Plantilla de log diario
Usar una entrada por dia:

```md
Fecha:
Experimento:
Owner:
Muestra total / por variante:
Estado de tracking: OK | Warning | Critico
Tasa de resena (delta vs control):
NPS (delta vs control):
Retencion D7 temprana (delta vs control):
Volumen bruto / neto (delta vs control):
KPI secundario relevante (opcional):
Guardrails (delta vs control):
Segmentos con desvio:
Semaforo: Verde | Amarillo | Rojo
Decision del dia: Continuar | Pausar | Escalar
Acciones ejecutadas:
Riesgos abiertos:
```

## Formato de reporte diario en thread
Publicar una actualizacion diaria en el thread del issue padre (RAT-18) con esta estructura:

```md
[RAT-18][Monitoreo Diario][YYYY-MM-DD]
- Muestra acumulada: X total (Control: A | Treatment: B)
- Tasa de resena: X% (delta: Y%)
- NPS: X (delta: Y)
- Retencion D7 temprana: X% (delta: Y%)
- Volumen bruto/neto: X / Y (delta neto: Z%)
- Guardrails: OK | Warning | Critico
- Semaforo: Verde | Amarillo | Rojo
- Decision: Continuar | Pausar | Escalar
- Accion siguiente (24h):
```

## Escalaciones y gates de gobierno
- Bloqueo operativo: asignar al CMO con comentario de desbloqueo requerido.
- Iniciativas de growth con gasto estimado > $10,000: requieren aprobacion previa del CMO.
- Si target de growth se incumple por 2 trimestres consecutivos: escalar a board con opciones y recomendacion.

## Cadencia complementaria
- Diario: runbook operativo (este documento).
- Semanal: lectura de tendencias, aprendizaje de segmentos y backlog de hipotesis.
- Cierre de experimento: decision memo con impacto, riesgos, y siguiente iteracion.

## Entregable esperado por experimento
- Historial diario completo.
- Registro de alertas y acciones tomadas.
- Decision final con evidencia y recomendacion de rollout o descarte.
