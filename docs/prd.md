# Product Requirements Document (PRD)

> Product: **blockbuilders** • Owner: **PM (Avery)** • Status: **Final Draft v1.0** • Date: 2025‑09‑18
> Scope Mode: **Simulation‑only** (no live trading, no exchange API keys)

---

## 1) Summary & Goals
**One‑liner:** No‑code, drag‑and‑drop crypto strategy builder to **design, backtest, paper‑trade**, and **compare** strategies—without writing code or connecting to exchanges.

**Primary goals**
- Enable beginners to design strategies visually and run trustworthy backtests fast.
- Provide high‑fidelity **paper‑trading** for out‑of‑sample evaluation.
- Make comparing strategies easy and insightful to drive learning and retention.
- Operate a **freemium** model that scales: free tier for exploration, paid for power users.

**Non‑goals (v1)**
- Live execution via exchange API keys.
- Financial advice, signals marketplace, or auto‑ML strategy generation.
- HFT / sub‑second backtests.

**Success metrics (North Stars & Inputs)**
- **A1 Activation:** % of new users who complete first backtest ≤24h (target: 55%).
- **A2 TTV:** Median time‑to‑first backtest < 15 min.
- **C1 Comparison Adoption:** ≥40% of weekly active users run ≥2 strategy comparisons/week.
- **R1 8‑week retention:** ≥30% of activated users.
- **P1 Conversion:** Free→Premium 5–8% by day‑90 cohort.

---

## 2) Users & Personas
- **Primary:** Retail crypto traders (beginner→intermediate), non‑programmers; goals: learn rules‑based trading, test ideas safely.
- **Secondary:** Content creators/educators (share templates), community moderators, support/ops.

**Top JTBD**
1. *“Design a rules‑based strategy without code.”*
2. *“Backtest quickly on data I trust, then iterate.”*
3. *“Paper‑trade to see realistic, out‑of‑sample results.”*
4. *“Compare strategies to pick what to keep improving.”*

---

## 3) Release Scope (v1.0)
**In**: Visual builder, backtesting engine, paper‑trading engine, comparison dashboards, templates, alerts (simulated), freemium billing, onboarding.

**Out**: Live trading, exchange connections, options/futures strategies, social leaderboards, mobile apps.

**Target timeline**: Private Alpha (weeks 6–8), Public Beta (week 14), GA (week 20). Dates move with discovery; see Rollout.

---

## 4) Functional Requirements

### 4.1 Visual Strategy Builder
**Description:** Node‑based canvas to compose **Data → Indicators → Signals/Logic → Risk → Execution Simulator**.

**Key capabilities**
- **Blocks:** Price/volume data, indicators (SMA/EMA/RSI/MACD/BB/ATR), math/logic (>, <, AND/OR, crossovers), risk (position size %, stop loss, take profit, daily loss cap), execution (market/limit, time‑in‑force), outputs.
- **Editing:** Drag‑drop, connect edges, parameter forms with validation, undo/redo, snap‑to‑grid, zoom/pan.
- **Versioning:** Save, fork, and label versions; diff view (param changes & block graph).
- **Validation:** Compile‑time checks—dangling nodes, incompatible types, missing params.

**Acceptance criteria**
- Users can create a strategy from a blank canvas to a valid graph with ≥1 indicator, ≥1 signal, ≥1 risk block, and an execution node.
- Invalid graphs surface inline errors and disable “Run Backtest.”
- Saving creates an immutable **Version** entry; forking creates a new branch preserving history.

### 4.2 Backtesting Engine
**Description:** Deterministic engine operating on **1m candles** initially; models fees, slippage, min order sizes.

**Key capabilities**
- Metrics: equity curve, PnL, CAGR, max drawdown, Sharpe/Sortino, hit rate, exposure, trade stats, avg slippage, fees paid.
- **Parameter sweeps**: grid search over selected params; outputs leaderboard table.
- **Validation tools**: train/test split, walk‑forward (rolling windows), OOS labeling on charts.
- **Reports**: export run report (CSV/JSON for trades & summary; PNG chart snapshot).

**Acceptance criteria**
- Backtests for 1 year of 1m candles on a single pair complete in **<30s** (standard tier dataset and load).
- Fee, slippage, and tick/lot constraints influence fills/trades; disabling any shows measurable changes.
- Walk‑forward produces per‑segment metrics and combined score.

### 4.3 Paper‑Trading Engine (Simulation)
**Description:** Scheduled simulations using **virtual portfolios** and realistic fills.

**Key capabilities**
- **Schedulers**: run every minute against latest market data snapshot; miss‑handling & retries.
- **Execution model**: market & limit orders; configurable latency; maker/taker fees; partial fills when liquidity assumptions limit size.
- **Portfolio**: cash/asset balances, PnL calc (realized/unrealized), risk limits (max position, daily loss cap), pause/resume.
- **Audit**: run logs, order/position lifecycle, reproducible seeds.

**Acceptance criteria**
- Users can start, pause, and stop simulations; state is persisted; resuming maintains portfolio continuity.
- Limit orders fill only when price trades through and liquidity is sufficient per model.
- Daily loss cap halts further simulated orders until window resets.

### 4.4 Strategy Comparison
**Description:** Compare **N** strategies/runs on the same time window and assets.

**Key capabilities**
- Normalize periods and starting balances; compute comparative metrics & confidence bands.
- **Views**: side‑by‑side KPIs, overlaid equity curves, drawdown waterfalls, risk/return scatter, table export.
- Tag **best run** per user and show **improvement suggestions** (e.g., high variance, stops not triggered).

**Acceptance criteria**
- Selecting ≥2 runs yields a comparison view with aligned timelines and normalized base.
- Users can export the comparison table and chart images.

### 4.5 Templates & Onboarding
- Curated starter strategies (e.g., EMA crossover, RSI mean‑reversion, breakout with ATR stop).
- Guided tutorials (builder basics; first backtest; run a simulation; compare results).

**Acceptance criteria**
- New user can complete the 4‑step tutorial and reach a first backtest in <15 min (median).

### 4.6 Alerts (Simulated)
- Email/Telegram/Web push on simulation events: start/stop, daily loss cap hit, trade executed, threshold metric crossed.

**Acceptance criteria**
- Users can subscribe/unsubscribe per simulation; alerts respect user preferences and quiet hours.

### 4.7 Accounts & Billing (Freemium)
**Free tier (proposed)**
- Up to **3** saved strategies, **100** backtests/month, **1** concurrent simulation, data depth capped at **2 years** of 1m candles, comparisons up to **3** runs.

**Premium tier (proposed: $29/mo, cancel anytime)**
- Unlimited strategies & backtests (fair use), up to **5** concurrent simulations, parameter sweeps up to **5D** grids, data depth **5+ years**, advanced comparisons, priority support.

**Acceptance criteria**
- Exceeding limits shows clear upsell modals; upgrading instantly lifts caps for the active session.

---

## 5) UX & IA
**Primary navigation**: *Builder*, *Backtests*, *Simulations*, *Compare*, *Templates*, *Account*.

**Key flows (happy path)**
1) **Create → Backtest → Iterate** (Builder → Run → Review → Edit → Re‑run).
2) **Backtest → Simulate** (Select run → “Start Simulation” → schedule/params → run).
3) **Compare** (Select runs → Compare → export/insights).

**Accessibility**: WCAG 2.1 AA: keyboard navigation for canvas, focus states, color contrast, chart alt text.

---

## 6) Data & APIs
**Core entities**: User, Strategy, Version, Run, Simulation, Order, Fill, Position, Metric, Comparison.

**Data retention**
- Backtest artifacts 90 days (free) / 365 days (premium) before archival.
- Simulation logs 30 days (free) / 180 days (premium); summaries retained.

**APIs (example contracts)**
- `POST /strategies` (create), `GET /strategies/:id`, `POST /strategies/:id/versions`.
- `POST /backtests` → `{strategyVersionId, asset, timeframe, fees, slippage, start, end}`.
- `GET /backtests/:id` → runs, metrics, trades.
- `POST /simulations` → `{strategyVersionId, asset, schedule, startingBalance, riskCaps}`.
- `PATCH /simulations/:id` → pause/resume/stop.
- `GET /comparisons?runIds=[]` → normalized metrics and charts data.

**Tech stack**: Next.js (App Router, TailwindCSS), FastAPI (Python), Supabase (auth/storage), TimescaleDB, Redis/Celery workers, S3‑compatible object storage for artifacts.

---

## 7) Non‑Functional Requirements
- **Performance**: Backtest 1y of 1m candles in <30s (standard tier). P95 page TTI <2s.
- **Reliability**: Service SLO 99.5%; worker retries; idempotent job ops; circuit breakers for data provider downtime.
- **Security & Privacy**: No exchange keys stored; TLS everywhere; row‑level security (Supabase); audit logs; role‑based access.
- **Observability**: Traces, metrics, logs (Datadog/Sentry); per‑run correlation IDs.
- **Compliance posture**: Clear **simulation‑only** disclaimers; avoid inducement to trade; regional content notices where needed.

---

## 8) Analytics & Instrumentation
- **Activation funnel**: signup → tutorial step completion → first save → first backtest.
- **Product usage**: runs/user/week, comparisons/user/week, templates cloned, time in builder.
- **Quality**: backtest duration, simulation uptime, error rates, data gaps encountered.
- **Billing**: limit hits, upgrade CTR, churn reasons.

Event schema sketch (client): `bb.view`, `bb.click`, `bb.builder.graph_valid`, `bb.run.started/completed`, `bb.sim.start/stop/pause`, `bb.compare.created`, `bb.alert.sent/opened`.

---

## 9) Rollout Plan
- **Private Alpha (Weeks 6–8)**: 20–30 users; paper‑trading engine, 3 templates, comparisons lite; success: NPS ≥ 30, ≥60% activation.
- **Public Beta (Week 14)**: Paywall on; premium features on; content/tutorials expanded.
- **GA (Week 20)**: Performance hardening; pricing confirm; launch marketing & EDU partners.

**Kill/Iterate gates**
- If activation <35% by week‑4 → add onboarding tasks and template auto‑suggest.
- If comparisons <25% of WAU → embed inline compare prompts post‑backtest.

---

## 10) Risks & Mitigations
- **Regulatory perception**: Over‑communicate simulation scope; block language implying real trading; legal review.
- **Data quality**: Multi‑source ingestion; validation, gap‑fill; display data provenance badge.
- **Model realism**: Default conservative fill model; sensitivity sliders; disclose assumptions per run.
- **Overfitting**: Walk‑forward required for “shareable” badge; warnings on extreme parameterization.
- **Performance**: Pre‑agg candles, vectorized calcs, caching; async workers; usage caps on free tier.

---

## 11) Open Questions
1. Finalize free & premium limits and price point (here proposed $29/mo).
2. Data licensing vendor(s) and geographic coverage at launch.
3. MVP indicator list—confirm the initial 10.
4. Comparison UX: default view (pairwise vs. dashboard grid).
5. Education/partner program scope for Beta.

---

## 12) Acceptance Test Plan (high level)
- **AT‑01 Builder Validity**: Create invalid graph → errors block run; fix → run succeeds.
- **AT‑02 Backtest Perf**: 1y BTC‑USDT @1m completes <30s on standard worker.
- **AT‑03 Fees/Slippage**: Toggle models changes trade outcomes predictably.
- **AT‑04 Simulation Lifecycle**: Start → pause → resume → stop; daily loss cap halts orders.
- **AT‑05 Comparison Export**: Select 3 runs; export table & charts; numbers reconcile with individual runs.
- **AT‑06 Freemium Limits**: Hit backtest cap → upsell → upgrade → cap lifted immediately.
- **AT‑07 Accessibility**: Full builder usable via keyboard navigation.

---

## 13) Appendix
- Glossary: backtest, simulation, run, strategy, version, comparison, OOS, walk‑forward.
- Future (post‑v1) ideas: futures/options simulation, marketplace for **templates** (not live signals), community leaderboards, Python block SDK.
