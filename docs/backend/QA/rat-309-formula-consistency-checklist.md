# RAT-309 / RAT-22A - Checklist de consistencia formula publicada vs ejecutada

Fecha: 2026-05-10  
Spec canonica: `RAT-10-ranking-robusto.md` (`ranking_robust_v1.1`)

## 1) F_recency
- [x] Spec define `R_rec_norm=(R_rec-1)/4` y `F_recency=0.85+0.15*R_rec_norm`.
- [x] QA matrix RR-03 y RR-07 valida rango exacto `[0.85,1.00]` y bordes `R_rec=1|5`.
- [x] Backend emite constantes de recencia compatibles (`recencyHalfLifeDays=120`, `recencyLambda=ln(2)/120`) y factor derivado en rango `[0.85,1.00]`.

## 2) I_sev / F_incident
- [x] Spec define `I_raw=sum(sev_j*d_j)` con `d_j=exp(-ln(2)*age_j/90)`, ventana `age_j<=180`, `I_sev=min(3.0,I_raw)`.
- [x] QA matrix RR-08 valida agregacion deterministica con decay+cap.
- [x] Manifest template publica `incident_aggregation.function=sum_decay_then_cap`, `window_days=180`, `cap=3.0`, `decay_rule` explicita.

## 3) Versionado y trazabilidad
- [x] `baseline_id=baseline_naive_avg_v1` consistente entre spec y manifest.
- [x] `params_version=ranking_robust_v1.1` y hash de parametros en manifest.
- [x] Casos numericos de borde para `F_recency` e `I_sev` presentes en spec para repro tecnica.

## 4) Estado de cierre
- [x] Sin contradicciones abiertas entre documento, backend y QA para `I_sev` + `F_recency`.
- [x] Si aparece drift nuevo, abrir issue hijo con owner backend/qa y evidencia exacta de discrepancia.
