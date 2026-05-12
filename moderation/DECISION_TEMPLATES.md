# Plantillas de Decisión para Operadores

Objetivo: responder con lenguaje claro, concreto y accionable, sin ambigüedades.

## Reglas de redaccion (aplican a todas las plantillas)
- Escribí una sola decisión por mensaje.
- Nombrá la política/categoría exacta.
- Indicá acción, motivo y próximo paso.
- Si aplica, agregá fecha y hora limite (SLA) en formato `AAAA-MM-DD HH:MM ART`.
- Evitá frases vagas: "podria", "aparenta", "en principio".
- Evitá términos absolutos no verificables: "siempre", "nunca", "obvio".
- Si hay acción del receptor, indicá exactamente qué enviar y por dónde.

## Variables obligatorias
- `[ID]`: identificador del reporte.
- `[Nombre]`: persona que recibe la respuesta.
- `[Categoria]`: política o categoría exacta.
- `[Motivo]`: 1-2 líneas con hechos observables.
- `[SLA]`: fecha/hora de proxima actualizacion cuando corresponda.
- `[Canal]`: canal para responder (ejemplo: "esta conversación").

## 1) Confirmacion de remocion
Asunto: Resolucion de reporte #[ID]

Hola [Nombre],
Revisamos el contenido reportado y confirmamos incumplimiento de la política `[Categoria]`.
Decision: `remocion`.
Motivo: [Motivo].
Próximo paso: si querés apelar, respondé por [Canal] dentro de 7 días corridos con:
- enlace o captura del contenido involucrado;
- explicación breve de por qué la decisión debería revertirse;
- evidencia verificable (documento, comprobante o contexto adicional).

## 2) Limitacion temporal
Asunto: Resolucion de reporte #[ID]

Hola [Nombre],
Detectamos riesgo asociado a la política `[Categoria]` y aplicamos `limitación temporal` mientras completamos la revisión ampliada.
Estado actual: `limitacion temporal activa`.
Proxima actualizacion: [SLA].
Próximo paso: si tenés evidencia relevante, enviala por [Canal] antes de [SLA].

## 3) Sin accion
Asunto: Resolucion de reporte #[ID]

Hola [Nombre],
Revisamos el reporte y, con la evidencia disponible, no encontramos incumplimiento de la política `[Categoria]`.
Decision: `sin accion`.
Motivo: [Motivo].
Próximo paso: si aportás evidencia nueva y verificable por [Canal], reabrimos el caso.

## 4) Solicitud de evidencia
Asunto: Necesitamos mas informacion - reporte #[ID]

Hola [Nombre],
Para continuar la revisión necesitamos la siguiente evidencia:
- [Evidencia 1]
- [Evidencia 2]
Fecha limite de envio: [SLA].
Enviá la evidencia por [Canal].
Sin esta información, no podemos validar el incumplimiento ni avanzar con una medida.

## 5) Resultado de apelacion confirmada
Asunto: Resultado de apelacion #[ID]

Hola [Nombre],
Completamos la apelación y mantenemos la decisión original.
Resultado: `confirmada`.
Motivo: [Motivo].
Próximo paso: el caso queda cerrado salvo nueva evidencia verificable por [Canal].

## 6) Resultado de apelacion revertida
Asunto: Resultado de apelacion #[ID]

Hola [Nombre],
Revisamos la nueva evidencia y revertimos la decisión original.
Resultado: `revertida`.
Acción aplicada: [restauracion / retiro de restriccion].
Próximo paso: el cambio impacta de forma inmediata.
Confirmación esperada: si en 2 horas no ves el cambio aplicado, respondé por [Canal] indicando el ID del caso.

## Checklist de consistencia antes de enviar
- ¿La severidad coincide con la matriz de moderacion?
- ¿La accion es proporcional al riesgo?
- ¿El motivo describe hechos concretos y observables?
- ¿El mensaje explica claramente cómo apelar o ampliar evidencia?
- ¿Incluye SLA cuando hay una proxima actualizacion pendiente?
- ¿Incluye [Canal] para evitar dudas de respuesta?
