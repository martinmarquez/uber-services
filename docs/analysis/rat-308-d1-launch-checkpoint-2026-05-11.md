# RAT-308 D1 Launch Checkpoint (2026-05-11)

Issue: [RAT-308](/RAT/issues/RAT-308)  
Base de mensaje: [RAT-307](/RAT/issues/RAT-307)  
Modo de test: `A/A` (Email Subject A + WhatsApp Opening A)

## Scope D1

- Ejecutar primer toque multicanal con claims aprobados:
  - `reseñas verificadas por servicio completado`
  - `pago protegido + soporte ante incidentes`
- Registrar objeciones literales por contacto y resultado de respuesta.
- Cerrar D1 con baseline de performance para gatillo de escalación.

## Baseline operativo D1 (definido para control)

- `target_reply_rate_total`: `12%`
- `target_booked_calls_rate`: `25%`
- `target_neutralizacion_objeciones`: `60%`

Regla de alerta temprana (interna):

- Riesgo alto si cualquier métrica cae `>=15%` vs target al cierre parcial D1.

Regla de escalación board/CEO (obligatoria):

- Escalar si cualquier métrica cae `>20%` vs target al cierre de checkpoint diario.
- Escalar si el lanzamiento queda bloqueado `>24h`.

## Cálculo de umbrales de escalación (>20% bajo target)

- Reply total: umbral de escalación `< 9.6%`
- Booked calls: umbral de escalación `< 20.0%`
- Neutralización objeciones: umbral de escalación `< 48.0%`

## Registro D1 (snapshot)

| Campo | Valor |
|---|---|
| Fecha | 2026-05-11 |
| Estado | En ejecución |
| Leads target D1 | 30 |
| Leads contactados | Pendiente cierre D1 |
| Replies email | Pendiente cierre D1 |
| Replies WhatsApp | Pendiente cierre D1 |
| Calls agendadas | Pendiente cierre D1 |
| Calls realizadas | Pendiente cierre D1 |
| Objeción dominante | Pendiente cierre D1 |
| Riesgo escalación | Pendiente cierre D1 |

## Next action

1. Cargar resultados reales D1 en esta hoja y en el log D1-D7.
2. Publicar comentario de checkpoint con métricas y semáforo de escalación (`verde`/`amarillo`/`rojo`).
3. Si `rojo`, activar escalación board/CEO con plan correctivo de 24h.
