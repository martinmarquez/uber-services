# RAT-6 Usability Test Rounds (Mobile-First Reviews)

## Round 1
- Date: 2026-05-06 17:40 ART
- Sample: 5 users (3 frecuentes, 2 mayores de 60)
- Goal: validar completar reseña en <= 20 segundos.
- Findings:
  - 3/5 no entendieron que podían dejar solo estrellas.
  - 2/5 no detectaron opción de reportar en cards.
  - 2/5 pidieron lenguaje más neutral para crítica.
- Iterations applied:
  - Helper text explícito antes de interacción de tags/comentario.
  - Acción `Reportar` subrayada y visible en cada card.
  - Microcopy neutral en prompt post-rating.

## Round 2
- Date: 2026-05-07 00:35 ART
- Sample: 6 users (4 baja alfabetización digital, 2 usuarios senior)
- Goal: validar create/read/respond/report en 3 pasos máximo.
- Findings:
  - 6/6 completaron crear reseña sin ayuda.
  - 5/6 encontraron cómo reportar en menos de 10 segundos.
  - 4/6 pidieron poder contestar respuesta del prestador.
- Iterations applied:
  - Flujo `respond` agregado: botón `Responder` + modal con textarea y confirmación.
  - `aria-live` ampliado para feedback de `report` y `respond`.
  - Mantención de targets táctiles >= 44px y estados de foco visibles.

## Result
- Flujo de prototipo validado para create/read/respond/report en mobile.

## Copy Clarity Pass (UX/UI + CS)
- Date: 2026-05-11
- Scope: `src/components/MobileReviewFlow.jsx`
- Target users: baja alfabetización digital y usuarios senior.
- Changes shipped:
  - Mensajes de estado más directos sobre cuándo una reseña se publica o entra en revisión.
  - Títulos y helper text de descubrimiento/contratación simplificados.
  - Consistencia ortográfica (acentos y términos clave como "contratación", "recibió", "ID").
  - Frases de instrucción más explícitas para teclado en calificación por estrellas.
