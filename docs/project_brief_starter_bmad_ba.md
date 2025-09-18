# Project Brief

> Owner: **Business Analyst (Mary)** • Status: **Draft v0.2** • Date: 2025-09-18

---

## 1) Project Overview
- **Project name:** blockbuilders
- **One‑liner:** No‑code, drag‑and‑drop crypto strategy builder for retail traders to create, backtest, and deploy trading strategies.
- **Background/context:** Algorithmic trading tools are largely built for quants and coders. Retail traders face high barriers (programming knowledge, fragmented tooling, infra cost/complexity, and risk of untested live trading). blockbuilders lowers the barrier via a visual strategy canvas, integrated backtesting, and one‑click deployment.
- **Success metrics (north stars):**
  - **A1 Activation:** % of new users who run a first backtest within 24h.
  - **A2 First Value:** Median time to first successful backtest (<15 min target).
  - **P1 Conversion:** Free→Premium conversion rate (target ≥5–8% in 90 days).
  - **E1 Engagement:** Weekly Active Builders (WAB) and backtests/user/week.
  - **R1 Retention:** 8‑week retention (target ≥30% of activated users).
  - **C1 Comparison Adoption:** % of active users who compare ≥2 strategies per week.

## 2) Problem Statement
- **Current pain(s):** Beginners and non‑programmers can’t easily design systematic strategies; backtesting is hard to trust/replicate; most tools push users toward risky live deployments.
- **Root cause (hypothesis):** Tools target advanced users; code‑heavy workflows; poor end‑to‑end integration (design→test→compare); opaque assumptions around slippage/fees; lack of safe, high‑fidelity simulation environments.
- **Impact if unsolved:** Retail traders stay excluded from systematic methods or take risky manual bets; low trust in results and low market adoption; regulatory risk if products encourage live trading without sufficient guardrails.

## 3) Goals & Non‑Goals
- **Primary goals:**
  - Deliver an intuitive no‑code strategy builder with core blocks (indicators, signals, risk controls, order simulation).
  - Provide fast, reproducible backtests with realistic assumptions (fees, slippage, tick size) and clear metrics.
  - Offer **paper‑trading only** execution with high‑fidelity simulation; enable side‑by‑side and head‑to‑head strategy comparisons over identical periods.
  - Launch a **freemium** model: generous free tier with limits; premium unlocks unlimited usage and advanced analytics.
- **Secondary goals:**
  - Template library and community sharing/cloning.
  - Guided education/onboarding (recipes, tutorials).
  - Strategy performance dashboards, comparisons, and alerts on simulated runs.
- **Non‑goals / out of scope (v1):**
  - Live trading or exchange API key connections.
  - High‑frequency trading or sub‑second execution.
  - Proprietary financial advice or auto‑ML strategy generation.
  - Custody of user funds; on‑chain smart‑contract execution.
  - Native mobile apps (web‑responsive only in v1).

## 4) Target Users & Personas
- **Primary user(s):** Retail crypto traders (beginner to intermediate), non‑programmers seeking systematic strategies.
- **Secondary stakeholders:** Content creators/educators; exchange partners; compliance/legal; support/ops.
- **Key jobs‑to‑be‑done:**
  1) “Design a rules‑based strategy without writing code.”
  2) “Backtest quickly on historical data I trust, then iterate.”
  3) “Deploy live with risk controls and monitor results in one place.”

## 5) Key Use Cases / User Journeys
1. **Create → Backtest → Iterate:** User drags blocks (indicators, logic, risk) → sets params → runs backtest → reviews equity curve, drawdown, win rate → tweaks and re‑tests.
2. **Optimize & Validate:** Run parameter sweeps; compare variants; check overfitting guards (train/test split, walk‑forward).
3. **Paper‑Trade Simulation:** Schedule simulated strategies with paper portfolios; evaluate out‑of‑sample performance over time.
4. **Compare Strategies:** Select multiple strategies/runs → normalized time/window comparison; leaderboard for user’s own strategies.
5. **Discover & Clone:** Browse community templates; clone, personalize, and test.

## 6) Scope
- **In scope (v1):** Web app (Next.js) with visual builder, backtesting service (FastAPI), Supabase auth/storage, TimescaleDB market data, **paper‑trading engine** (order book & execution simulator), billing (Stripe), alerts, basic template library, comparison dashboards.
- **Out of scope (v1):** Live trading; exchange API key management; options/futures strategies; social leaderboards; on‑chain execution; automated strategy marketplace.

## 7) Functional Requirements (FRD)
- **Strategy Builder:**
  - Drag‑and‑drop nodes (Data → Indicators → Signals → Risk → Execution Simulator).
  - Versioning and save/load; parameter inputs with validation.
- **Backtesting Engine:**
  - Candles (1m+) initially; model fees, slippage, min order size; PnL, Sharpe, max DD, hit rate, exposure.
  - Parameter sweeps; train/test split; exportable reports.
- **Paper‑Trading Engine:**
  - Virtual portfolios; scheduled simulated runs; order matching against historical or synthetic order books; latency/slippage models.
  - Head‑to‑head comparisons for identical periods and assets; leaderboard and best‑run tagging within a workspace.
- **Monitoring & Alerts (Simulated):**
  - Simulated PnL, orders/positions feed; email/Telegram/Web push alerts; pause/resume simulations.
- **Templates & Onboarding:**
  - Curated starter strategies; clone/edit; guided tutorials.
- **Account & Billing:**
  - Auth, roles; freemium limits; premium subscription via Stripe.

## 8) Non‑Functional Requirements (NFR)
- **Performance:** Backtest 1 year of 1m candles for a pair in <30s on standard tier; UI TTI <2s on broadband.
- **Reliability:** Core services SLO 99.5%; graceful degradation if data provider is degraded; job retries & idempotency.
- **Security & Privacy:** No storage of exchange API keys; user data encrypted at rest and in transit; least‑privilege; audit trails.
- **Accessibility:** WCAG 2.1 AA baseline.
- **Internationalization/Localization:** Timezone‑aware UI; EN at launch; multi‑fiat display.

## 9) Integrations & Data
- **Internal systems:** Next.js (App Router), FastAPI services, Supabase (auth/storage), TimescaleDB for time‑series; background workers (Celery/Redis) for backtests & simulations.
- **External vendors/APIs:** Market data providers (e.g., WebSocket/REST crypto price feeds), Stripe for billing, email/SMS/Telegram for alerts, Sentry/Datadog for monitoring.
- **Data model notes:** Core entities: User, Strategy, Version, Run (backtest), Simulation, Order, Position, Metric, Comparison. **No exchange API keys stored.**

## 10) Constraints & Assumptions
- **Budget:** <!-- tbd -->
- **Timeline:** Target **Beta** within 12–16 weeks of project start; private alpha earlier with backtest + paper‑trading only.
- **Resources:** FE (Next.js/Tailwind), BE (FastAPI/Python), DevOps, Designer, PM/BA; part‑time DS/Quant helpful.
- **Technical constraints:** Stack fixed to Next.js, FastAPI, Supabase, TimescaleDB, TailwindCSS; prefer Python/Pandas/NumPy for engines; Redis for queues.
- **Key assumptions:**
  - Product remains **simulation‑only** (no brokerage or exchange connectivity) for v1.
  - Freemium model drives top‑of‑funnel; premium priced monthly with trial.
  - Initial focus on spot assets; futures/options later (still simulated).

## 11) Risks & Open Questions
- **Key risks:**
  - **R1 Regulatory/Perception:** Must avoid implying real trading or financial advice; mitigation: explicit disclaimers, simulation‑only messaging, gating language.
  - **R2 Data Quality:** Bad candles or missing data can invalidate results; mitigation: validation, gap‑fill policies, provenance.
  - **R3 Model Realism:** Over‑optimistic fills or liquidity assumptions mislead users; mitigation: conservative defaults, sensitivity analysis, transparency in assumptions.
  - **R4 Overfitting/User Harm:** Users may overfit to history; mitigation: walk‑forward tests, education, warnings.
- **Open questions:**
  - Which market data sources and licenses for launch?
  - Premium price point and free‑tier limits?
  - Minimum viable set of indicators/blocks at launch?
  - Comparison UX: pairwise, tournament, or dashboard‑style by default?
  - Community template moderation policy?
- **Areas needing further research:**
  - Competitive landscape & differentiators; compliance requirements for simulation products by region; support load modeling.

## 12) Appendices (optional)
- **A. Research summary:** <!-- market/comp/user insights -->
- **B. Stakeholder input:** <!-- notes from interviews/discovery -->
- **C. References/links:** <!-- URLs, docs, tickets -->

---

## 13) Next Steps
1. **Fill critical blanks** in sections 1–5, 10–11. <!-- 10–15 mins with BA guided elicitation -->
2. **BA consolidate** into a clean draft and flag gaps.
3. **PM handoff** to create the PRD section‑by‑section.

### PM Handoff Note
This Project Brief provides the full context for **{{project_name}}**. Please start in “PRD Generation Mode,” review the brief thoroughly, and collaborate to draft the PRD, asking for any necessary clarifications or suggesting improvements. <!-- leave as is for PM -->

