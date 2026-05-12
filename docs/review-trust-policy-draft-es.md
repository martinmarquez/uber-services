# Política de Reseñas Confiables y Anti-manipulación (Borrador público)

Estado: borrador interno sujeto a revisión CMO y validación inter-áreas.

## 1) Propósito

Queremos que cada reseña ayude a tomar decisiones reales y seguras. Esta política define qué contenido se permite, qué prácticas están prohibidas y cómo comunicamos el estado de confianza de una reseña.

## 2) Alcance

Aplica a reseñas, calificaciones, comentarios, réplicas y cualquier incentivo asociado a publicar o editar una reseña dentro de la plataforma.

## 3) Qué está permitido

- Compartir experiencias reales y de primera mano sobre un servicio efectivamente contratado.
- Incluir detalles concretos y verificables de la experiencia (puntualidad, calidad, trato, cumplimiento).
- Publicar crítica positiva o negativa, siempre que no viole esta política.
- Actualizar una reseña si hay nueva información relevante (por ejemplo, resolución de un reclamo).

## 4) Qué está prohibido

- Reseñas falsas, inventadas o publicadas por personas sin experiencia real del servicio.
- Intercambio de reseñas, compra/venta de reseñas o uso de terceros para inflar reputación.
- Presión, amenazas o extorsión para modificar calificaciones.
- Incentivos sesgados para forzar reseñas positivas (dinero, descuentos, regalos o beneficios condicionados a la nota).
- Contenido con datos personales sensibles, discurso de odio, violencia, acoso, difamación o spam.
- Múltiples cuentas o coordinación entre cuentas para manipular puntajes.

## 5) Incentivos: regla de neutralidad

Se pueden usar incentivos generales para aumentar participación (por ejemplo, sorteo entre quienes dejen reseña), solo si:

- No dependen de una calificación positiva.
- Se comunican de forma transparente y previa.
- Se aplican por igual a reseñas favorables y desfavorables.

Si un incentivo condiciona el resultado de la reseña, la reseña puede ser limitada o removida.

## 6) Estados de confianza y comunicación al usuario

### 6.1 Reseña verificada

Definición: reseña vinculada a una transacción/servicio confirmado en plataforma.

### 6.2 En revisión

Definición: reseña con señales de riesgo (patrones atípicos, reportes, conflicto de identidad, posible incentivo sesgado).
Comportamiento visible: puede mantenerse visible con impacto limitado mientras se valida el caso. No contribuye al score público hasta cierre.

### 6.3 No recomendada

Definición: reseña detectada como de baja confiabilidad o en violación de política.
Comportamiento visible: puede mantenerse visible con distribución limitada, pero no contribuye al score público de reputación.

### 6.4 Removida por política

Definición: reseña retirada de visualización pública por violaciones graves (fraude coordinado, extorsión, suplantación, contenido ilegal o reincidencia crítica).
Comportamiento visible: no se muestra públicamente; el autor recibe notificación con motivo y vía de apelación.

## 7) Enforcement y consecuencias

Según severidad y reincidencia, podemos aplicar:

- Reducción de visibilidad o peso de una reseña.
- Etiqueta de advertencia o estado no recomendado.
- Remoción de contenido.
- Restricción temporal para publicar reseñas.
- Suspensión de cuenta en casos graves o coordinados.

### 7.1 Matriz mínima de severidad (obligatoria)

- Riesgo bajo: inconsistencias leves sin evidencia de manipulación -> etiqueta temporal `En revisión`, solicitud de contexto y exclusión temporal del score público.
- Riesgo medio: señales múltiples de manipulación o incentivo sesgado -> `No recomendada`, reducción fuerte de distribución y revisión manual prioritaria.
- Riesgo alto: fraude coordinado, coacción, suplantación o reincidencia -> `Removida por política` y restricción/suspensión de cuenta.

### 7.2 Evidencia y trazabilidad de decisiones

- Cada decisión de enforcement debe registrar: motivo, señal detectada, fuente del reporte, nivel de severidad, timestamp y actor (sistema/equipo).
- Las decisiones automatizadas de alto impacto (remoción/suspensión) requieren revisión humana antes de quedar firmes, salvo abuso evidente con riesgo inmediato.
- Se debe conservar evidencia de moderación y apelación por un período mínimo definido por Compliance/Legal.

### 7.3 Protección anti-represalia

- Está prohibido amenazar, penalizar o discriminar a usuarios por dejar reseñas negativas legítimas.
- Reportes de represalia se escalan a revisión prioritaria y pueden derivar en suspensión inmediata.

## 8) Apelaciones

Usuarios y prestadores pueden apelar decisiones de moderación mediante canal de soporte. La revisión considera evidencia de transacción, historial de actividad y contexto de la denuncia.

SLA recomendado para consistencia operativa:

- Acuse de recibo: dentro de 24 horas.
- Resolución estándar: dentro de 7 días corridos.
- Casos complejos/fraude coordinado: hasta 15 días corridos con notificación de estado.

Requisitos mínimos de apelación:

- Identificador de reseña y transacción relacionada (si aplica).
- Evidencia concreta (capturas, comprobantes, contexto verificable).
- Declaración de potencial conflicto de interés, cuando corresponda.

Una apelación no restaura automáticamente visibilidad o peso de una reseña hasta concluir revisión.

Texto sugerido para primer contacto de soporte:

- `Recibimos tu apelación. Te confirmamos recepción en menos de 24 horas y te compartimos resolución en hasta 7 días corridos (15 días si el caso es complejo).`

## 9) Guía rápida para escribir reseñas útiles

- Describe hechos y contexto, no ataques personales.
- Explica qué salió bien/mal y por qué.
- Evita incluir datos privados (teléfonos, direcciones, DNI, etc.).

---

## Microcopy de producto (canónico v1)

### A) Sello “Reseña verificada”

- Badge: `Reseña verificada`
- Supporting: `Este usuario contrató el servicio en la app.`

### B) Estado “En revisión”

- Badge: `En revisión`
- Supporting: `Estamos validando esta reseña para proteger la confianza en la plataforma.`

### C) Estado “No recomendada”

- Badge: `No recomendada`
- Supporting: `Esta reseña no cumple nuestros criterios de confiabilidad.`

### D) Estado “Removida por política”

- Autor (aviso): `Removimos esta reseña por incumplimiento de la política de reseñas.`

### E) Mensaje para prestadores sobre incentivos

- `Podés incentivar reseñas, pero nunca condicionar la calificación.`

### F) Mensaje de apelación

- `Si creés que hubo un error, podés apelar desde Soporte con evidencia de la transacción.`

---

## Redlines Seguridad - Ronda 1 (enforcement consistency)

- `[ADD]` Separar `No recomendada` de `Removida por política` para distinguir limitación de distribución vs. baja definitiva.
- `[ADD]` Exigir matriz de severidad mínima (bajo/medio/alto) con acciones consistentes y no discrecionales.
- `[ADD]` Exigir trazabilidad de decisiones (motivo, señal, actor, timestamp) para auditoría y disputas.
- `[ADD]` Bloquear decisiones automatizadas de alto impacto sin revisión humana, salvo abuso crítico.
- `[ADD]` Definir SLA explícito de apelaciones para previsibilidad de usuarios/prestadores.
- `[ADD]` Incluir control anti-represalia para proteger reseñas negativas legítimas.

## Notas de alcance v1 (alineación PM)

- Esta versión no agrega nuevos estados de moderación fuera de: `Reseña verificada`, `En revisión`, `No recomendada`, `Removida por política`.
- Esta versión no publica umbrales antifraude internos ni parámetros de detección.
- Esta versión prioriza consistencia de mensajes policy/API/UI para implementación y QA.
