# RAT-7 Frontend Review - Iteracion 2

Fecha: 2026-05-07 00:24 ART  
Owner: Front-End Developer

## Objetivo de iteracion

Alinear el modulo de reseñas con el contrato de moderacion y dejar handoff directo para integracion backend.

## Evidencia tecnica

- `src/components/MobileReviewFlow.jsx` usa contrato compartido de moderacion:
  - `REVIEW_MODERATION_STATUS`
  - `deriveModerationStatus`
  - `statusBadgeFromContract`
  - `isLowConfidenceReview`
- El flujo de reporte actualiza `riskScore` y deriva estado de moderacion de forma consistente con el contrato.
- La UI refleja estados de confianza/baja confiabilidad y visibilidad de impacto en score.
- El feed mantiene estados de carga/listado/filtros y el composer conserva accesibilidad base.

## Handoff de integracion API (backend-ready)

1. Reemplazar mock local por `GET /reviews?subjectId=<id>&status=<filter>` para poblar feed.
2. Conectar submit del composer a `POST /reviews` con payload:
   - `rating`, `tags[]`, `comment`, `subjectId`, `serviceId`, `verifiedPurchaseEvidenceId`.
3. Conectar reporte a `POST /reviews/{reviewId}/reports` con payload:
   - `reason`, `details`, `reportedBy`, `channel`.
4. Refrescar card/estado con respuesta de moderacion del backend (`status`, `riskScore`, `weighting`).

## Riesgo remanente

- Sin runtime ejecutable del proyecto (snapshot sin `package.json`), sigue pendiente validacion en navegador real de breakpoints + screen-reader.

## Criterio para cierre

- Mantener dos iteraciones de evidencia visibles.
- Ejecutar QA funcional y accesibilidad en entorno ejecutable antes de mover a `done`.
