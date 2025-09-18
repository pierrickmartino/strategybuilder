# Project Brief

> Owner: **Business Analyst (Mary)** • Status: **Draft v0.1** • Date: 2025-09-18

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
  - **D1 Deployment:** % of active users with ≥1 live strategy running.

## 2) Problem Statement
- **Current pain(s):** Beginners and non‑programmers can’t easily design systematic strategies; backtesting is hard to trust/replicate; deployment requires stitching multiple tools and handling exchange APIs, keys, and infra; manual trading leads to inconsistent execution.
- **Root cause (hypothesis):** Tools target advanced users; code‑heavy workflows; poor end‑to‑end integration (design→test→deploy); opaque assumptions around slippage/fees; operational load (servers, schedulers, monitoring).
- **Impact if unsolved:** Retail traders stay excluded from systematic methods, churn after failed attempts, or take risky manual bets; low trust in results and low market adoption.
- **Current pain(s):** <!-- observable symptoms and who experiences them -->
- **Root cause (hypothesis):** <!-- what’s really broken? -->
- **Impact if unsolved:** <!-- quantify where possible -->

## 3) Goals & Non‑Goals
- **Primary goals:**
  - Deliver an intuitive no‑code strategy builder with core blocks (indicators, signals, risk controls, order routing).
  - Provide fast, reproducible backtests with realistic assumptions (fees, slippage, tick size) and clear metrics.
  - Enable one‑click deployment to supported exchanges with secure key management.
  - Launch a **freemium** model: generous free tier with limits; premium unlocks unlimited usage and advanced features.
- **Secondary goals:**
  - Template library and community sharing/cloning.
  - Guided education/onboarding (recipes, tutorials).
  - Strategy performance dashboards and alerts.
- **Non‑goals / out of scope (v1):**
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
- **Primary user(s):** <!-- who benefits first -->
- **Secondary stakeholders:** <!-- buyer, admin, ops, compliance, etc. -->
- **Key jobs‑to‑be‑done:** <!-- top 3 JTBD in the user’s words -->

## 5) Key Use Cases / User Journeys
1. **Create → Backtest → Iterate:** User drags blocks (indicators, logic, risk) → sets params → runs backtest → reviews equity curve, drawdown, win rate → tweaks and re‑tests.
2. **Optimize & Validate:** Run parameter sweeps; compare variants; check overfitting guards (train/test split, walk‑forward).
3. **Deploy Live:** Connect exchange via API keys → select trading pair(s) and budget → set risk limits (max position, stop, daily loss) → schedule bot.
4. **Monitor & Alert:** Real‑time PnL, positions, orders; email/Telegram/Push alerts; pause/resume.
5. **Discover & Clone:** Browse community templates; clone, personalize, and test.

## 6) Scope
- **In scope (v1):** Web app (Next.js) with visual builder, backtesting service (FastAPI), Supabase auth/storage, TimescaleDB market data, connectors for top exchanges (e.g., Coinbase Advanced Trade, Binance, Kraken), billing (Stripe), alerts, basic template library.
- **Out of scope (v1):** Native mobile; options/futures strategies; social leaderboards; on‑chain execution; automated strategy marketplace.
- **In scope:** <!-- capabilities, platforms, locales -->
- **Out of scope:** <!-- cut lines to protect timeline -->

## 7) Functional Requirements (FRD)
- **Strategy Builder:**
  - Drag‑and‑drop nodes (Data → Indicators → Signals → Risk → Execution).
  - Versioning and save/load; parameter inputs with validation.
- **Backtesting Engine:**
  - Candles (1m+) initially; model fees, slippage, min order size; PnL, Sharpe, max DD, hit rate, exposure.
  - Parameter sweeps; train/test split; exportable reports.
- **Deployment & Connectors:**
  - Secure exchange connections; paper trading and live modes; scheduling; fail‑safe stops.
- **Monitoring & Alerts:**
  - Live metrics, orders/positions feed; email/Telegram/Web push alerts; pause/resume.
- **Templates & Onboarding:**
  - Curated starter strategies; clone/edit; guided tutorials.
- **Account & Billing:**
  - Auth, roles; freemium limits; premium subscription via Stripe.

## 8) Non‑Functional Requirements (NFR)
- **Performance:** Backtest 1 year of 1m candles for a pair in <30s on standard tier; UI TTI <2s on broadband.
- **Reliability:** Core services SLO 99.5%; graceful degradation if an exchange is degraded; job retries & idempotency.
- **Security & Privacy:** Encrypted API keys at rest and in transit; scoped secrets; least‑privilege; audit trails; regular key rotation guidance.
- **Accessibility:** WCAG 2.1 AA baseline.
- **Internationalization/Localization:** Timezone‑aware UI; EN at launch; multi‑fiat display.
- **Performance:** <!-- SLAs, latency, throughput targets -->
- **Reliability:** <!-- SLOs, error budgets, RTO/RPO if relevant -->
- **Security & Privacy:** <!-- authn/z, data classes, compliance flags -->
- **Accessibility:** <!-- WCAG targets -->
- **Internationalization/Localization:** <!-- locales, timezones -->

## 9) Integrations & Data
- **Internal systems:** Next.js (App Router), FastAPI services, Supabase (auth/storage), TimescaleDB for time‑series; background workers (Celery/Redis) for backtests & live trading jobs.
- **External vendors/APIs:** Exchange APIs (Coinbase Advanced Trade, Binance, Kraken, others later), Stripe for billing, email/SMS/Telegram for alerts, Sentry/Datadog for monitoring.
- **Data model notes:** Core entities: User, Strategy, Version, Run (backtest), Deployment, Order, Position, Metric. Sensitive: exchange API keys; retain only hashed/enc.

## 10) Constraints & Assumptions
- **Budget:** <!-- tbd -->
- **Timeline:** Target **Beta** within 12–16 weeks of project start; private alpha earlier with paper trading only.
- **Resources:** FE (Next.js/Tailwind), BE (FastAPI/Python), DevOps, Designer, PM/BA; part‑time DS/Quant helpful.
- **Technical constraints:** Stack fixed to Next.js, FastAPI, Supabase, TimescaleDB, TailwindCSS; prefer Python/Pandas/NumPy for backtests; Redis for queues.
- **Key assumptions:**
  - Users are willing to connect exchange API keys after a paper‑trade trial.
  - Freemium model drives top‑of‑funnel; premium priced monthly with trial.
  - Initial focus on spot trading; futures/options later.
- **Budget:** <!-- range or ceiling -->
- **Timeline:** <!-- key dates/milestones, e.g., Beta on YYYY‑MM‑DD -->
- **Resources:** <!-- team capacity, roles available -->
- **Technical constraints:** <!-- stack, legacy systems, envs -->
- **Key assumptions:**
  - <!-- assumption 1 -->
  - <!-- assumption 2 -->

## 11) Risks & Open Questions
- **Key risks:**
  - **R1 Regulatory:** Changing crypto rules per region may restrict features; mitigation: start with paper trading in restricted geos.
  - **R2 Data Quality:** Bad candles or missing data can invalidate results; mitigation: validation, gap‑fill policies, provenance.
  - **R3 Exchange Reliability/Rate Limits:** Downtime or throttling affects live bots; mitigation: circuit breakers, adaptive pacing, multi‑exchange failover.
  - **R4 Security:** API key compromise risk; mitigation: encryption, key scoping, secrets vault, strict permissions.
  - **R5 Overfitting/User Harm:** Users may deploy unrealistic strategies; mitigation: walk‑forward tests, warnings, education.
- **Open questions:**
  - Launch geographies and exchange list for v1?
  - Premium price point and free‑tier limits?
  - Minimum viable set of indicators/blocks at launch?
  - Paper vs live trading split at Beta?
  - How to handle fees, slippage, and liquidity modeling defaults?
  - Community template moderation policy?
- **Areas needing further research:**
  - Competitive landscape & differentiators; compliance requirements by region; support load modeling.

## 12) Appendices (optional)
- **A. Research summary:** <!-- market/comp/user insights -->
- **B. Stakeholder input:** <!-- notes from interviews/discovery -->
- **C. References/links:** <!-- URLs, docs, tickets -->
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

