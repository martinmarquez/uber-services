import math
import random
import copy
from statistics import mean, pstdev

SEED = 42
random.seed(SEED)

C = 4.2
m = 25
k = 20
lam = math.log(2) / 120
gamma = 0.35

def bayes_score(ratings, conf):
    v = sum(conf)
    if v == 0:
        return C
    R = sum(r * a for r, a in zip(ratings, conf)) / v
    return ((v / (v + m)) * R + (m / (v + m)) * C)

def robust_score(ratings, conf, ages, fraud_risk=0.0, incident_sev=0.0, m_=m, k_=k, gamma_=gamma):
    v = sum(conf)
    if v == 0:
        return 0.0
    q_b = ((
        (v / (v + m_)) * (sum(r * a for r, a in zip(ratings, conf)) / v)
        + (m_ / (v + m_)) * C
    ) / 5.0)
    # Bounded confidence boost: avoid collapsing correlation for honest low-volume providers.
    f_volume = 0.7 + 0.3 * (1 - math.exp(-v / k_))
    wt = [math.exp(-lam * a) for a in ages]
    r_rec = sum(r * w for r, w in zip(ratings, wt)) / sum(wt)
    f_rec = 0.85 + 0.15 * (r_rec / 5.0)
    f_rel = 1 - 0.25 * fraud_risk
    f_inc = math.exp(-gamma_ * incident_sev)
    return 100 * q_b * f_volume * f_rec * f_rel * f_inc

def naive_score(ratings):
    return 100 * (mean(ratings) / 5.0) if ratings else 0.0

def gen_provider(pid):
    true_q = min(5, max(1, random.gauss(4.1, 0.4)))
    n = max(1, int(random.lognormvariate(2.2, 0.9)))
    ratings, conf, ages = [], [], []
    for _ in range(n):
        r = min(5, max(1, random.gauss(true_q, 0.6)))
        ratings.append(r)
        conf.append(max(0.4, min(1.0, random.gauss(0.9, 0.15))))
        ages.append(random.randint(0, 365))
    return {
        "id": pid,
        "true_q": true_q,
        "ratings": ratings,
        "conf": conf,
        "ages": ages,
        "fraud": 0.0,
        "incident": 0.0,
    }

def kendall_tau(xs, ys):
    n = len(xs)
    c = d = 0
    for i in range(n):
        for j in range(i + 1, n):
            sx = xs[i] - xs[j]
            sy = ys[i] - ys[j]
            prod = sx * sy
            if prod > 0:
                c += 1
            elif prod < 0:
                d += 1
    denom = n * (n - 1) / 2
    return (c - d) / denom if denom else 0.0

def rank(values):
    return sorted(range(len(values)), key=lambda i: values[i], reverse=True)

def ndcg_at_k(pred, truth, k=10):
    r = rank(pred)[:k]
    t = rank(truth)
    pos = {idx: i for i, idx in enumerate(t)}
    dcg = 0.0
    for i, idx in enumerate(r, start=1):
        rel = max(0.0, 5 - pos[idx] / len(truth) * 5)
        dcg += rel / math.log2(i + 1)
    idcg = 0.0
    for i in range(1, k + 1):
        rel = max(0.0, 5 - (i - 1) / len(truth) * 5)
        idcg += rel / math.log2(i + 1)
    return dcg / idcg if idcg else 0.0

def topk_regret(pred, truth, k=10):
    top_pred = rank(pred)[:k]
    top_true = rank(truth)[:k]
    true_set = set(top_true)
    misses = [i for i in top_pred if i not in true_set]
    return len(misses) / k

def evaluate(providers, m_=m, k_=k, gamma_=gamma):
    true = [p["true_q"] * 20 for p in providers]
    naive = [naive_score(p["ratings"]) for p in providers]
    robust = [
        robust_score(p["ratings"], p["conf"], p["ages"], p["fraud"], p["incident"], m_, k_, gamma_)
        for p in providers
    ]
    return {
        "tau_naive": kendall_tau(naive, true),
        "tau_robust": kendall_tau(robust, true),
        "ndcg10_naive": ndcg_at_k(naive, true, 10),
        "ndcg10_robust": ndcg_at_k(robust, true, 10),
        "ndcg20_naive": ndcg_at_k(naive, true, 20),
        "ndcg20_robust": ndcg_at_k(robust, true, 20),
        "regret10_naive": topk_regret(naive, true, 10),
        "regret10_robust": topk_regret(robust, true, 10),
        "naive": naive,
        "robust": robust,
    }

def small_sample_overrank(providers, m_=m, k_=k, gamma_=gamma):
    vals = []
    for p in providers:
        n = len(p["ratings"])
        if 3 <= n <= 8:
            vals.append((naive_score(p["ratings"]), robust_score(p["ratings"], p["conf"], p["ages"], 0.0, 0.0, m_, k_, gamma_)))
    if not vals:
        return 0.0
    return mean([n - r for n, r in vals])

def weekly_volatility(providers, weeks=8, m_=m, k_=k, gamma_=gamma):
    # Simulates week-over-week score movement under normal rating arrivals.
    providers = copy.deepcopy(providers)
    score_hist_naive = [[] for _ in providers]
    score_hist_robust = [[] for _ in providers]

    for _ in range(weeks):
        for idx, p in enumerate(providers):
            for j in range(len(p["ages"])):
                p["ages"][j] += 7
            r_new = min(5, max(1, random.gauss(p["true_q"], 0.6)))
            p["ratings"].append(r_new)
            p["conf"].append(max(0.4, min(1.0, random.gauss(0.9, 0.15))))
            p["ages"].append(0)

            score_hist_naive[idx].append(naive_score(p["ratings"]))
            score_hist_robust[idx].append(
                robust_score(p["ratings"], p["conf"], p["ages"], p["fraud"], p["incident"], m_, k_, gamma_)
            )

    vol_naive = mean([pstdev(s) for s in score_hist_naive])
    vol_robust = mean([pstdev(s) for s in score_hist_robust])
    return vol_naive, vol_robust

def fraud_topk_share(providers, fraud_idx, k_top=20, m_=m, k_=k, gamma_=gamma):
    naive = [naive_score(p["ratings"]) for p in providers]
    robust = [
        robust_score(p["ratings"], p["conf"], p["ages"], p["fraud"], p["incident"], m_, k_, gamma_)
        for p in providers
    ]
    top_naive = set(rank(naive)[:k_top])
    top_robust = set(rank(robust)[:k_top])
    fraud = set(fraud_idx)
    return len(top_naive & fraud) / k_top, len(top_robust & fraud) / k_top

def objective(ev, overrank_gap, fraud20_robust, vol_robust):
    # Weighted objective favoring safe top-k quality and anti-gaming.
    return (
        3.0 * ev["ndcg10_robust"]
        + 1.0 * ev["ndcg20_robust"]
        + 1.0 * (1 - ev["regret10_robust"])
        + 1.2 * min(1.0, overrank_gap / 20.0)
        + 1.2 * (1 - fraud20_robust)
        + 0.5 * max(0.0, 1.0 - vol_robust / 6.0)
        + 0.6 * max(0.0, ev["tau_robust"])
    )

def main():
    providers = [gen_provider(i) for i in range(400)]

    # Fraud burst cohort
    fraud_idx = random.sample(range(400), 30)
    for i in fraud_idx:
        p = providers[i]
        for _ in range(20):
            p["ratings"].append(5.0)
            p["conf"].append(0.2)
            p["ages"].append(random.randint(0, 2))
        p["fraud"] = 0.8

    # Incident shock cohort
    incident_idx = random.sample([i for i in range(400) if i not in fraud_idx], 20)
    for i in incident_idx:
        providers[i]["incident"] = 1.5

    # Iteration 2: coarse sweep for m/k/gamma.
    candidates = []
    for m_ in [20, 25, 30, 35]:
        for k_ in [15, 20, 25]:
            for gamma_ in [0.25, 0.35, 0.45]:
                pset = copy.deepcopy(providers)
                ev = evaluate(pset, m_, k_, gamma_)
                overrank_gap = small_sample_overrank(pset, m_, k_, gamma_)
                fraud20_naive, fraud20_robust = fraud_topk_share(pset, fraud_idx, 20, m_, k_, gamma_)
                vol_naive, vol_robust = weekly_volatility(pset, weeks=8, m_=m_, k_=k_, gamma_=gamma_)
                score = objective(ev, overrank_gap, fraud20_robust, vol_robust)
                candidates.append((score, m_, k_, gamma_, ev, overrank_gap, fraud20_naive, fraud20_robust, vol_naive, vol_robust))

    candidates.sort(key=lambda x: x[0], reverse=True)
    best = candidates[0]
    _, best_m, best_k, best_gamma, ev, overrank_gap, fraud20_naive, fraud20_robust, vol_naive, vol_robust = best

    print("seed", SEED)
    print("best_m", best_m)
    print("best_k", best_k)
    print("best_gamma", best_gamma)
    print("tau_naive", round(ev["tau_naive"], 4))
    print("tau_robust", round(ev["tau_robust"], 4))
    print("ndcg10_naive", round(ev["ndcg10_naive"], 4))
    print("ndcg10_robust", round(ev["ndcg10_robust"], 4))
    print("ndcg20_naive", round(ev["ndcg20_naive"], 4))
    print("ndcg20_robust", round(ev["ndcg20_robust"], 4))
    print("regret10_naive", round(ev["regret10_naive"], 4))
    print("regret10_robust", round(ev["regret10_robust"], 4))
    print("small_sample_gap_points", round(overrank_gap, 2))
    print("weekly_vol_naive", round(vol_naive, 4))
    print("weekly_vol_robust", round(vol_robust, 4))
    print("fraud_top20_share_naive", round(fraud20_naive, 4))
    print("fraud_top20_share_robust", round(fraud20_robust, 4))

if __name__ == "__main__":
    main()
