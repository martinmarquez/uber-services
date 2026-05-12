# RAT-10: Ranking Science - score robusto

Version de spec: `ranking_robust_v1.1`  
Fecha efectiva: `2026-05-10`

## Objetivo
Disenar un score reputacional robusto que minimice:
- sobrevaloracion por muestra chica
- manipulacion por fraude o brigading
- inestabilidad temporal por eventos aislados

## Formula propuesta

Score final en escala 0..100:

`S = 100 * Q_bayes * F_volume * F_recency * F_reliability * F_incident`

Con clipping final: `S = min(100, max(0, S))`

### 1) Calidad bayesiana (Q_bayes)

`Q_bayes = ((v/(v+m))*R + (m/(v+m))*C) / 5`

- `R`: promedio observado (1..5)
- `v`: numero de reseñas efectivas (ponderadas por confiabilidad)
- `C`: media global del marketplace (1..5), inicial 4.2
- `m`: prior strength, inicial 25

Notas:
- Para `v << m`, el score converge a `C` (protege cold-start y gaming).
- Para `v >> m`, domina la evidencia del proveedor.

### 2) Factor por volumen (F_volume)

`F_volume = 0.7 + 0.3 * (1 - exp(-v/k))`

- Suaviza subida temprana de score visible.
- Evita que 2-3 reseñas extremas empujen ranking arriba.

### 3) Factor de recencia (F_recency)

Promedio exponencial de rating por edad:

`w_t = exp(-lambda * age_days)`
`R_rec = sum(r_i * w_ti)/sum(w_ti)`  (escala 1..5)
`R_rec_norm = (R_rec - 1) / 4`  (escala 0..1)

Convertido a multiplicador:

`F_recency = 0.85 + 0.15 * R_rec_norm`

- `lambda = ln(2)/120` (half-life 120 dias)
- Banda exacta y testeable: 0.85 (si `R_rec=1`) .. 1.00 (si `R_rec=5`).

Ejemplos de borde reproducibles:
- Caso minimo: `R_rec=1` -> `R_rec_norm=(1-1)/4=0` -> `F_recency=0.85+0.15*0=0.85`
- Caso maximo: `R_rec=5` -> `R_rec_norm=(5-1)/4=1` -> `F_recency=0.85+0.15*1=1.00`
- Caso intermedio: `R_rec=4.2` -> `R_rec_norm=0.8` -> `F_recency=0.85+0.15*0.8=0.97`

### 4) Confiabilidad de reseñas (F_reliability)

Cada reseña i tiene peso `a_i` en [0,1] usando senales anti-fraude:
- cuenta verificada/edad de cuenta
- pago confirmado y servicio completado
- distancia temporal entre reseñas (burst detector)
- similitud textual (deteccion de plantillas)
- relacion grafo usuario-proveedor

Definiciones:
- `v = sum(a_i)`
- `R = sum(a_i * r_i)/sum(a_i)`

Penalizacion global por riesgo agregado:

`risk = weighted_mean(risk_signals)` en [0,1]
`F_reliability = 1 - 0.25*risk`

Rango: 0.75..1.00

### 5) Severidad de incidentes (F_incident)

`F_incident = exp(-gamma * I_sev)`

- `I_sev`: severidad agregada deterministica (rolling 180 dias) definida como:
  - para cada incidente j: `sev_j` segun mapa de severidad y `age_j` en dias
  - `d_j = exp(-ln(2) * age_j / 90)` (half-life 90 dias para impacto de incidente)
  - `I_raw = sum(sev_j * d_j)` para incidentes con `age_j <= 180`
  - `I_sev = min(3.0, I_raw)` (cap global)
- Multiples incidentes siempre se agregan por suma decaida y luego cap.
- `gamma = 0.35`

Mapa sugerido de severidad por incidente:
- leve (lateness menor): 0.2
- medio (cancelacion tardia, queja validada): 0.6
- grave (safety/compliance): 1.5

Ejemplos de borde reproducibles:
- Caso sin incidentes (o todos fuera de 180d): `I_raw=0` -> `I_sev=0` -> `F_incident=exp(-0.35*0)=1.0000`
- Caso multi-incidente sin cap: incidentes en ventana  
  - `sev_1=1.5`, `age_1=30` -> `d_1=exp(-ln(2)*30/90)=0.7937`, contribucion `1.1906`  
  - `sev_2=0.6`, `age_2=120` -> `d_2=exp(-ln(2)*120/90)=0.3969`, contribucion `0.2381`  
  - `I_raw=1.4287`, `I_sev=1.4287`, `F_incident=exp(-0.35*1.4287)=0.6066`
- Caso con cap global: 3 incidentes graves recientes (`sev=1.5`, `age=0` cada uno)  
  - `I_raw=4.5` -> `I_sev=min(3.0,4.5)=3.0`  
  - `F_incident=exp(-0.35*3.0)=0.3499`

## Reglas de display para N bajo

Definir `v_eff = sum(a_i)`:

- `v_eff < 5`: no mostrar score numerico; mostrar "Nuevo proveedor" + banda de confianza baja.
- `5 <= v_eff < 15`: mostrar score con badge `Baja confianza`.
- `15 <= v_eff < 40`: mostrar score con badge `Confianza media`.
- `v_eff >= 40`: mostrar score completo `Alta confianza`.

Contrato de frontera y formato (backend + API + UI):
- Evaluar fronteras con `v_eff` sin redondeo (float real calculado).
- Regla de segmentos exacta: `[0,5)`, `[5,15)`, `[15,40)`, `[40,+inf)`.
- Publicacion de score: solo si `v_eff >= 5`.
- Precision publica: 1 decimal fijo.
- Regla de redondeo: half away from zero (ej. 84.25 -> 84.3, 84.24 -> 84.2).
- Campo API sugerido: `displayScore` (string con 1 decimal) y `confidenceBadge` (`low|medium|high`) para evitar divergencia FE/BE.

UI:
- mostrar `n reseñas efectivas` separado de reseñas totales
- tooltip con explicacion corta de estimacion bayesiana

## Guardrails anti-gaming

Version inicial de parametros (config `ranking_guardrails.v1`):
- cap de contribucion por usuario en ventana de 30 dias: `max_effective_reviews_per_user_30d = 2.0`
- deboost automatico por burst: si `reviews_24h_zscore >= 3.5` o `reviews_24h >= p99_historico_categoria_ciudad`, aplicar multiplicador adicional `F_burst = 0.85` por 72h
- shadow-eval: reseñas con `risk >= 0.8` quedan fuera de score publico (`a_i_public = 0`) hasta verificacion; si se validan, reingresan con `a_i` original
- rollback rapido de score: ante incidente grave (`sev >= 1.5`) recalculo forzado en <= 1h via job prioritario
- Overrides permitidos por categoria/mercado en `ranking_guardrails_overrides.v1`; sin override rige global.

## Simulacion offline (aceptacion)

### Datasets sinteticos
1. Baseline honesto: distribucion log-normal de volumen y ratings realistas.
2. Small-sample inflation: proveedores con 3-8 reseñas muy altas.
3. Fraud burst: 20 reseñas 5* en 24h con baja confiabilidad.
4. Incident shock: proveedor top con evento grave reciente.

### Metricas de evaluacion
- Kendall tau con ranking "verdad" sintetica
- NDCG@10/@20
- estabilidad inter-semana (delta percentil)
- sensibilidad a fraude (caida de score ante burst)
- regret de top-k (servicios fallidos en top posiciones)

### Criterios de exito
- reducir small-sample over-ranking >= 40% vs baseline naive average
- reducir impacto de burst fraud >= 60%
- mantener NDCG@10 dentro de -3% o mejor vs baseline en trafico limpio
- limitar volatilidad semanal p95 por debajo de 12 puntos

Baseline formal para comparacion:
- Baseline definido como `baseline_naive_avg_v1`:
  - score = promedio simple de ratings visibles (sin priors/factores)
  - elegibilidad y filtros identicos al tratamiento robusto salvo factores de score
- Snapshot fijo: `analysis/datasets/ranking_synth_v1.parquet`
- Seed oficial: `20260506`
- Toda corrida debe persistir metadata: `baseline_version`, `dataset_snapshot`, `seed`, `code_commit`.

## Plan de A/B test

- Unidad: sesion de busqueda
- Variante A: ranking actual
- Variante B: score robusto
- Duracion minima: 2 semanas o hasta potencia >= 80%

KPIs primarios:
- booking conversion rate
- completion rate
- refund/claim rate (esperado menor)

KPIs secundarios:
- CTR top-5
- tiempo a primer contacto
- repeticion de proveedor a 30 dias

Metodo:
- CUPED para reducir varianza
- estratificacion por categoria y ciudad
- monitoreo secuencial con fronteras tipo Pocock para stop temprano por dano

## Parametros iniciales y calibracion

Parametros iniciales:
- `C=4.2`, `m=25`, `k=20`, `lambda=ln(2)/120`, `gamma=0.35`

Parametros calibrados (iteracion 2, dataset sintetico v1, seed 42):
- `C=4.2`, `m=20`, `k=15`, `lambda=ln(2)/120`, `gamma=0.35`

Calibracion (2 iteraciones minimas requeridas):
1. Iteracion 1: grid search coarse sobre `m,k,gamma`.
2. Iteracion 2: ajuste fino por categoria + chequeo fairness por zona.

## Entregables

- Formula final versionada
- Tabla de parametros por categoria (si aplica)
- Reporte de simulacion con edge-cases y sensibilidad
- Definicion de reglas de display low-N
- Readme de reproducibilidad (seed, scripts, snapshots)

## Criterios de aceptacion de producto para pasar QA de spec (iteracion 2)

1. Todas las formulas tienen rango demostrable y expected deterministicos de borde.
2. `F_recency` valida exactamente [0.85, 1.00] con normalizacion explicita.
3. `I_sev` implementa agregacion + decay + cap como contrato unico.
4. Low-N define frontera exacta, precision y redondeo unificado FE/BE.
5. Guardrails anti-gaming incluyen parametros iniciales versionados y policy de override.
6. Baseline de simulacion queda versionado y reproducible con seed/snapshot.
