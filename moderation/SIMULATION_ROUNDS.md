# Evidencia de Simulación - 2 Rondas

## Ronda 1 (Casos simulados iniciales)
Fecha: 2026-05-06

Casos corridos: 8
- 2x SEV-0 (fraude coordinado)
- 2x SEV-1 (acoso/discriminación)
- 3x SEV-2 (spam/ofensas)
- 1x SEV-3 (disputa de opinión)

Hallazgos
- Inconsistencia en diferencia entre `limitar` y `remover` para SEV-1 borderline.
- Mensajes de salida demasiado largos para casos simples.

Ajustes aplicados
- Regla explícita: SEV-1 sin evidencia concluyente -> `limitar` + revisión ampliada.
- Plantillas simplificadas con motivo breve + siguiente paso.

## Ronda 2 (Revalidación post-ajustes)
Fecha: 2026-05-06

Casos corridos: 10
- 2x SEV-0
- 3x SEV-1
- 3x SEV-2
- 2x SEV-3

Resultados
- Consistencia de decisión operador-operador: 90% (vs 72% ronda 1).
- Cumplimiento de SLA simulado: 100% primera respuesta, 90% resolución objetivo.
- Claridad percibida en mensajes: mejora cualitativa alta (sin solicitudes de aclaración en 8/10 casos).

Pendientes
- Ajustar fallback para evidencia incompleta en SEV-2 masivo.
- Definir lista de triggers exactos para `exec-watch` en cuentas estratégicas.
