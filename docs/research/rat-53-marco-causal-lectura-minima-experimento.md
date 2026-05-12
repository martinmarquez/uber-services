# RAT-53: Marco causal y lectura minima para decision de experimento

Fecha: 2026-05-06
Owner: Research
Relacionado: RAT-50 (decision de experimento)

## Criterios de aceptacion del entregable
- Existe una plantilla corta reutilizable para lectura de experimento.
- Se define metrica primaria, guardrails y reglas stop/go (`ESCALAR | ITERAR | FRENAR | NO-READ`).
- Se recomienda muestra minima explicita por variante para primera lectura.
- Se listan riesgos de interpretacion y mitigaciones operativas.

## Decision que habilita este documento
Definir una lectura minima y un marco causal comun para decidir si un experimento de solicitacion de resenas debe escalar, iterar o frenarse.

## Pregunta causal
Cual es el efecto causal de la variante sobre la conversion de resena verificada, sin deteriorar calidad de experiencia ni riesgo operativo.

## DAG operativo (version minima)
`Variante` -> `Exposicion al prompt` -> `Inicio de resena` -> `Resena enviada`

Variables de confusion/control:
- Mix de trafico por canal/device/geo/cohorte.
- Calidad de servicio base (completa/no completa, incidentes).
- Intencion historica de reserva/resena (propension pre).

Mediadores:
- Friccion del formulario.
- Timing del prompt.

Guardrails (efectos no deseados):
- Quejas por spam/opt-out.
- Refund/claim rate.
- Error rate/latencia de eventos.

## Supuestos causales minimos para leer resultados
1. Consistencia de asignacion: usuarios en control/tratamiento no cambian de variante en la misma ventana.
2. Positividad: cada estrato clave (ciudad x categoria x plataforma) tiene muestra en ambas variantes.
3. No interferencia relevante: un usuario no afecta la exposicion de otro de forma sistematica.
4. Integridad de medicion: eventos clave completos e idempotentes.

## Lectura minima obligatoria antes de decidir

### 1) Calidad de experimento (filtro de validez)
- SRM: no significativo con umbral de invalidez `p < 0.001`.
- Split de trafico dentro de tolerancia operativa (+/-5 pp).
- Trazabilidad de eventos clave: `exposure`, `review_start`, `review_submit`, `booking_complete`, `refund_claim`.

Si falla este bloque: decision `NO-READ` (no interpretar uplift), corregir instrumentacion y rerun.

### 2) Impacto primario (lectura de negocio)
- KPI primario: uplift en tasa de resena verificada.
- Reportar: effect size, IC95, p-value ajustado (Holm-Bonferroni si multiples primarias).
- Usar ajuste CUPED cuando aplique para reducir varianza.

### 3) Guardrails (lectura de riesgo)
- Conversion/completion no debe caer en umbral rojo del runbook.
- Refund/claim rate sin deterioro material.
- Sin alertas rojas de tracking o degradacion tecnica.

### 4) Heterogeneidad minima
- Cortes obligatorios: nuevos vs recurrentes, mobile vs desktop, paid vs organic.
- Si hay dano en un segmento critico: decision `ITERAR` antes de escalar.

## Regla de decision sugerida (RAT-50)
- `ESCALAR`: validez OK + impacto positivo en KPI primario + guardrails sanos.
- `ITERAR`: validez OK + impacto inconcluso o heterogeneo sin dano severo.
- `FRENAR`: dano severo en guardrails o impacto negativo material sostenido.
- `NO-READ`: falla de SRM/instrumentacion; repetir corrida.

## Recomendacion de tamano minimo de muestra (primera lectura)
Para primera lectura de decision, usar una regla operativa unica:

- Minimo por variante: `n >= 2,500` usuarios/sesiones expuestas por brazo.
- Minimo total: `n >= 5,000`.
- Ventana temporal: al menos `14 dias` corridos.

Justificacion:
- Esta regla es coherente con la metodologia de RAT-20 (potencia 80%, alpha familia 0.05, MDE pequeno en conversion).
- Evita lecturas con alta varianza y reduce falsos positivos por ruido semanal.

Si no se cumple la muestra minima:
- No etiquetar ganador/perdedor.
- Mantener estado `ITERAR` o `NO-READ` segun calidad de instrumentacion.

## Riesgos de interpretacion (y mitigacion)
- Falso ganador por lectura temprana: respetar ventana minima y politica secuencial.
- Uplift aparente por drift de trafico: controlar estratos y revisar mezcla diaria.
- Mejora local con dano oculto: nunca decidir sin tabla de guardrails.

## Checklist operativo de 10 minutos para comite de decision
- [ ] SRM y split de trafico OK.
- [ ] Muestra minima y ventana temporal cumplidas.
- [ ] Uplift + IC95 + p-ajustado disponibles.
- [ ] Guardrails sin dano rojo.
- [ ] Segmentacion minima revisada.
- [ ] Decision etiquetada: ESCALAR / ITERAR / FRENAR / NO-READ.
- [ ] Siguiente experimento o fix definido con owner y fecha.

## Plantilla corta de lectura (copiar y completar)
```md
Experimento:
Fecha de lectura:
Owner:

Hipotesis:
Metrica primaria:
Guardrails:

Muestra control / tratamiento:
Ventana:
SRM:
Calidad de tracking:

Resultado metrica primaria (delta, IC95, p-ajustado):
Resultado guardrails:
Resultado por segmentos criticos:

Decision: ESCALAR | ITERAR | FRENAR | NO-READ
Justificacion de 3 lineas:
Siguiente accion (owner + fecha):
```

## Entradas fuente requeridas
- `docs/rat-29-runbook-diario-monitoreo-alertas-experimento.md`
- `qa/test-plans/rat-20-metodologia-estadistica.md`
- `docs/rat-13-priorizacion-hipotesis.md`
- `qa/test-plans/rat-28-ab-instrumentation-sample-quality-qa.md`

## Recomendacion de Research
Usar este marco como puerta unica de lectura para RAT-50: primero validez de experimento, luego impacto, luego riesgo. Evita decisiones por uplift aislado y reduce probabilidad de escalar variantes fragiles.
