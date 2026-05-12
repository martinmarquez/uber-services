# ONBOARDING.md

## Objetivo

Reducir tiempo a valor en flujo de reseñas sin aumentar friccion ni churn.

## Secuencia activa (RAT-13 / RAT-37)

1. Trigger post-servicio solo cuando usuario confirma servicio completado.
2. Paso 1: seleccion de estrellas (CTA bloqueado hasta seleccionar rating).
3. Paso 2: tags sugeridos por contexto (rapido, claro, amable, etc.).
4. Paso 3: comentario opcional con feedback de longitud.
5. Confirmacion de envio con estado visible de reseña.

## Microcopy obligatorio de estados

- `Verificada`: "Tu reseña ya impacta el perfil del servicio."
- `En revision`: "Recibimos tu reseña y la estamos validando. Sigue visible con impacto limitado hasta cerrar la revision."
- `No recomendada`: "Esta reseña puede seguir visible, pero no contribuye al score de reputacion. Si queres, podes apelar."
- `Removida`: "Esta reseña fue removida por politicas de comunidad."

## Confirmacion post-envio (obligatoria)

- "Gracias. Tu reseña fue enviada y puede pasar por validacion antes de impactar el perfil."
- "Si apelas una decision, confirmamos recepcion en menos de 24 horas y resolvemos en hasta 7 dias corridos (15 dias en casos complejos)."

## Ajustes por friccion (playbook rapido)

- Si sube `review_flow_dropoff_after_star_select`:
  - reducir carga cognitiva en paso de comentario.
  - priorizar tags y mantener comentario opcional sin minimo de caracteres.
- Si suben tickets por confusion de estados:
  - simplificar copy de estado.
  - agregar CTA directo a apelacion en primer contacto.

## 2026-05-10 - RAT-136 secuencia onboarding para moderacion/apelaciones (MVP)

1. Post-envio (inmediato): mostrar que la reseña puede pasar por validacion y no impactar score en forma inmediata.
2. Si estado = `en_revision`: mostrar ETA y CTA "Seguir caso" con id de caso visible.
3. Si estado = `no_recomendada` o `removida`: mostrar CTA "Iniciar apelacion" y checklist de evidencia minima.
4. Post-apelacion: confirmar recepcion con numero de caso, SLA y proximo checkpoint en mensaje unificado.
5. Cierre de apelacion: comunicar decision + motivo simple + accion siguiente (si corresponde).

## Instrumentacion minima de onboarding (control CS)

- Evento recomendado: `appeal_intake_started` cuando usuario abre flujo de apelacion.
- Evento recomendado: `appeal_intake_submitted` cuando envia evidencia minima.
- Evento recomendado: `appeal_status_viewed` cuando consulta estado desde onboarding/help.
- KPI de friccion a vigilar: `tickets_review_status_confusion_7d` y `appeal_reopen_rate`.
