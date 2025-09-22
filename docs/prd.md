# Blockbuilders Product Requirements Document (PRD)

## Change Log
| Date | Version | Description | Author |
| 2025-09-22 | v1.5 | Documented account provisioning playbooks, responsibility matrix, and handoff deliverables | John (PM) |
| 2025-09-21 | v1.4 | Added research synthesis scaffolding, implementation playbook, and updated checklist status | John (PM) |
| 2025-09-20 | v1.3 | Embedded problem context, stakeholder plan, UX flows, and technical risks | John (PM) |
| 2025-09-20 | v1.2 | Documented MVP scope boundaries and validation plan | John (PM) |
| 2025-09-20 | v1.1 | Added cross-functional requirements and operational guardrails | John (PM) |
| 2025-09-20 | v1.0 | Initial PRD drafted from project brief | John (PM) |

## Problem Definition & Context

### Problem Statement
Retail crypto traders without coding expertise are locked out of algorithmic trading or forced into brittle, manual workflows that stitch together spreadsheets, TradingView scripts, and unvetted bots. The resulting strategies are slow to prototype, difficult to reproduce, and risky to trust with capital. Blockbuilders exists to remove that barrier by giving beginners a safeguarded environment where they can experiment quickly, learn systematically, and avoid the costly mistakes that come from launching untested ideas.

### Target Users & Personas
- **Retail Crypto Tinkerers (Primary):** Individuals aged 22–45 actively trading on exchanges such as Coinbase, Binance, or Kraken with portfolios under $25K. They crave systematic workflows without needing to write code, want trustworthy data, and value coaching that builds discipline.
- **Crypto Educators & Community Leaders (Secondary):** Influencers, newsletter writers, and cohort facilitators who teach trading concepts and need shareable templates, reproducible results, and light-touch governance for their communities.

### Problem Impact & Differentiation
- Manual experimentation today is error-prone, time-consuming, and erodes user confidence because results cannot be replicated easily.
- Existing SaaS bots still require scripting or feel opaque, pushing beginners back to spreadsheets and trial-and-error.
- Blockbuilders differentiates by coupling a drag-and-drop strategy canvas with institutional-grade data, inline education, and compliance guardrails so newcomers can achieve a “first win” within minutes.

### User Research & Insights
- **Completed to Date:** Founder discovery notes and secondary research confirm high intent for visual alternatives to Pine Script tooling and gaps in trustworthy paper-trading workflows.
- **In Progress:** Five user interviews (3 retail traders, 2 educators) and a competitive teardown of Trality, Kryll, and Composer are scheduled during Week 1 of Sprint 1; synthesis templates are prepared in Notion to capture pains, jobs, and trust signals.
- **Upcoming Deliverables:** Produce a distilled insight brief and persona updates within two business days of the final interview, then summarize competitive positioning deltas (pricing, onboarding friction, differentiating features) for roadmap prioritization.

#### Research Synthesis Tracker
| Initiative | Owner | Status | Target Date | Next Step |
| --- | --- | --- | --- | --- |
| Retail trader interviews | PM (John) + UX (Sally) | Scheduled | 2025-09-27 | Conduct first two sessions and log recordings/notes in research hub |
| Educator interviews | PM (John) | Scheduled | 2025-09-30 | Confirm participant incentives and finalize discussion guide |
| Competitive benchmarking | BA (Mary) | In Flight | 2025-09-29 | Capture feature/pricing matrix and annotate gaps/opportunities |
| Insight synthesis & share-out | PM (John) | Pending | 2025-10-02 | Convert interviews into personas, update PRD/brief evidence sections, and circulate summary |

## Business Goals & Success Metrics

### Product Goals
1. Deliver an intuitive visual strategy canvas that lets non-coders assemble crypto trading workflows within minutes.
2. Provide trustworthy backtesting and paper-trading so builders can validate ideas without risking capital.
3. Accelerate user activation through guided onboarding, starter templates, and educational guardrails.
4. Enable community leaders and educators to share, clone, and manage strategy templates with their audiences.
5. Establish a scalable freemium monetization path that encourages upgrades to premium analytics.

### Business Objectives
- Launch a private beta within 16 weeks and onboard 250 qualified testers with at least 50% weekly activity.
- Reach 10,000 free-tier signups and 700 premium conversions within six months post-launch.
- Reduce premium churn to below 5% by month nine.

### Success Metrics & KPIs
- **Activation:** ≥65% of new accounts complete guided onboarding and run a first backtest within 15 minutes.
- **Time-to-Value:** Median time from first login to first saved strategy remains under 20 minutes.
- **Engagement:** Active builders execute ≥4 backtests per week and 60% schedule a paper-trade run within week one.
- **Monetization:** Free-to-premium conversion rate reaches 6–8% within 90 days with ARPU growth targets tracked monthly.
- **Trust:** Net Trust Score averages ≥8/10, with qualitative feedback tagged by theme for PM/UX review.

## Solution Overview
Blockbuilders combines a drag-and-drop strategy canvas, institutional-grade market data, deterministic backtesting, and continuous paper trading into an approachable experimentation lab. Guided onboarding, templated strategies, and contextual education deliver early success moments, while freemium guardrails and premium analytics provide a clear upgrade path. The platform succeeds when curious traders and community educators treat it as their primary environment for designing, validating, and sharing systematic strategies.

## Requirements

### Functional
1. FR1: The system must provide a visual drag-and-drop canvas with core block types (data source, indicator, signal logic, risk controls, execution) and inline validation.
2. FR2: Users must be able to configure block parameters, connect blocks into executable strategy graphs, and version their strategies with change history.
3. FR3: The platform must run backtests on at least one year of hourly crypto data per supported exchange, outputting performance, equity curves, and trade logs under 30 seconds for standard runs.
4. FR4: Users must schedule paper-trading runs that mirror strategy parameters, leverage realistic execution assumptions, and deliver alerting via in-app notifications and email.
5. FR5: The application must surface starter templates, guided walkthroughs, and contextual education to drive first successful backtest within 15 minutes of signup.
6. FR6: Community leaders must be able to share strategy templates with attribution, set duplication permissions, and monitor follower copies.
7. FR7: Access must enforce freemium limits (e.g., capped strategies, backtests, and scheduled runs) while enabling premium entitlements and Stripe-powered billing upgrades.
8. FR8: Users must compare multiple strategy results side-by-side, including KPIs, charts, and anomaly flags for variance explanations.
9. FR9: Admins must manage data connectors, plan settings, and compliance messaging through an operations console.

### Non Functional
1. NFR1: Backtests covering one year of hourly data must complete within 30 seconds for standard tier workloads with 95th percentile under 45 seconds.
2. NFR2: UI time-to-interactive must stay under 2 seconds on broadband for authenticated users accessing core flows.
3. NFR3: All data in transit and at rest must be encrypted, with audit logging across strategy changes, executions, and admin actions.
4. NFR4: System uptime must target 99.5% monthly availability across core services during beta.
5. NFR5: Architecture must support horizontal scaling of simulation workers without downtime and allow cost controls to remain within the $8K/month infrastructure budget during beta.
6. NFR6: Regulatory messaging must clearly state “simulation only / not financial advice” across all user touchpoints, with compliance review workflows logged.
7. NFR7: The platform must support the latest two versions of Chrome, Edge, Safari, and Firefox on macOS, Windows, and iPadOS.
8. NFR8: Observability must include centralized logging, metrics, and alerts that surface data quality or execution anomalies within 5 minutes.

### Cross-Functional Requirements

#### Data Management
- Core application schema must capture `User`, `Strategy`, `Block`, `BacktestRun`, `PaperTradeRun`, `Template`, and `Notification` entities with immutable audit fields (created/updated timestamps, actor IDs).
- Market data is stored in TimescaleDB with raw OHLCV retained for 24 months and hourly aggregates retained for 5 years to support long-horizon analysis.
- Strategic artifacts (strategy graphs, configuration payloads, simulation results) must be versioned and retained for at least 18 months to preserve reproducibility.
- Compliance and activity logs covering strategy edits, approvals, and exports must be preserved for 7 years and exportable for regulators on request.
- Nightly snapshots and weekly full backups must be automated for TimescaleDB and application databases, with restore drills executed quarterly.

#### Integrations
- Market data connectors must support a primary vendor (e.g., Kaiko) and secondary failover (e.g., Coin Metrics) with hourly reconciliation and API key rotation every 90 days.
- Stripe integration handles billing, entitlement updates, and invoices via signed webhooks; sandbox and production keys must be isolated with replay protection.
- Notification services use SendGrid for email delivery and in-app notification center as fallback; email templates must contain compliance disclosures and unsubscribe links.
- Observability data must stream into Datadog (logs, metrics, traces) with shared dashboards for product, engineering, and operations.
- Authentication delegates to the selected identity provider (see architecture) with SSO roadmap tracked; integrations must expose role-based claims for educator and admin tooling.

#### Operational Guardrails
- Environments: maintain development, staging, and production tiers with automated CI/CD; production deploys require passing automated tests and approval from product + engineering leads.
- Monitoring: define alert thresholds for backtest latency, ETL freshness, Stripe webhook failures, and notification bounce rates; alerts must page on-call within 5 minutes.
- Support: offer in-app support intake with response SLAs (business hours <8h, off-hours <24h) and maintain a public status page for incidents.
- Cost management: simulation worker autoscaling must enforce beta budget ($8K/month) with monthly cost reports shared with finance; trigger alerts at 80% budget utilization.
- Compliance: ensure “simulation only” messaging is enforced across onboarding, exports, and emails; quarterly reviews confirm disclosures and policy updates are in place.

### MVP Scope Boundaries

#### In Scope (MVP Must-Haves)
- Visual strategy canvas with block configuration, version history, and inline validation (FR1–FR2).
- Trusted backtesting on BTC-USD and ETH-USD with deterministic workers and reporting exports (FR3, Story 2.2).
- Paper-trading scheduler with alerting, dashboards, and compliance messaging (FR4, Epic 3 Stories 3.1–3.2).
- Starter templates, guided onboarding, and education hub that drive first successful backtest within 15 minutes (FR5, Story 1.2).
- Freemium plan enforcement, upgrade prompts, and Stripe-powered entitlements (FR7, Story 4.2).

#### Out of Scope (MVP)
- Educator cohort analytics beyond basic template adoption reporting (Story 3.3) — defer advanced segmentation and export tooling.
- Insight engine recommendations and anomaly explanations requiring ML heuristics (Story 2.3) — keep KPI comparisons but exclude automated insights.
- Community moderation workflows for template governance beyond manual review queues (Story 4.1) — targeted for post-MVP automation.
- Premium-only deep analytics (e.g., scenario stress testing, advanced drawdown attribution) — roadmap feature for premium tiers after validation of core usage.

#### Deferred Enhancements & Future Phases
- Phase 2: Educator dashboards with cohort tagging, automated compliance workflows, and expanded sharing governance.
- Phase 3: Insight engine, anomaly detection, and template marketplace monetization features.
- Infrastructure roadmap: multi-region data replication, SSO integrations, and real-money trading partner integrations (pending regulatory review).

### MVP Validation & Feedback Plan
- **Activation KPI (≥65% of new accounts complete guided onboarding + first backtest)** — instrument onboarding checklist events, confirm within the first session, and review dashboards weekly during beta (`docs/brief.md:30-45`).
- **Time-to-value KPI (median <20 minutes from first login to first saved strategy)** — log canvas save events and correlate with session start to monitor in Mixpanel/Datadog product analytics.
- **Engagement KPI (≥4 backtests per active builder per week)** — aggregate backtest runs per user; share weekly insights in product standup to prioritize friction fixes.
- **Paper-trade adoption KPI (60% schedule runs within week one)** — track scheduler usage; trigger automated nudges to users who complete backtest but skip scheduling.
- **Net Trust Score (≥8/10)** — launch in-app survey at first completed paper-trade week; collect qualitative feedback tagged by theme for PM/UX review.
- **Feedback Loops** — conduct bi-weekly beta interviews with a mix of new and returning builders, synthesize findings in research repository, and adjust roadmap accordingly.
- **Release Readiness** — maintain a rolling beta scorecard combining KPIs above; greenlight broader GA marketing once activation + trust targets hold steady for three consecutive weeks.

## User Experience Requirements

### Primary User Flows
1. **Guided Onboarding to First Backtest:** Welcome modal confirms compliance consent, walkthrough highlights canvas primitives, user loads a starter template, adjusts parameters, and triggers a backtest with contextual education and progress tracking.
2. **Canvas Composition & Validation:** Traders drag blocks from the library, connect nodes, and edit configurations in a side panel; inline validation badges surface missing inputs, incompatible connections, or quota breaches before execution.
3. **Backtest Review & Iteration:** Results view presents KPIs, charts, and trade logs with explainers; users duplicate strategies, compare against prior runs, and capture notes for future learning.
4. **Paper-Trading Scheduling & Monitoring:** Scheduler workflow selects cadence, exchanges, and capital allocation; confirmation modal reiterates simulation-only status, while dashboards surface ongoing performance, alerts, and acknowledgement workflows.
5. **Template Sharing & Governance (Premium/Educator):** Community leaders publish templates with metadata, manage duplication permissions, and monitor cohort activity through educator dashboards with at-a-glance status summaries.

### Edge Cases & Error Handling
- Provide explicit remediation steps when market data is stale or unavailable, including links to status updates.
- Present non-blocking warnings for performance-heavy strategies with the option to proceed or revise configuration.
- Handle failed backtests gracefully with retry guidance, surfaced logs, and suggested learning resources.
- Communicate freemium quota limits before execution, capture upgrade intent, and resume action post-purchase without losing context.
- Offer autosave/recovery for canvas edits to guard against browser refreshes or timeouts.

### Overall UX Vision
Create a confident, lab-like workspace that feels approachable for non-programmers yet powerful enough for aspiring quants. The experience should guide users from exploration to execution with progressive disclosure—starter templates, wizard-like onboarding, and contextual education keep early steps simple while advanced configuration remains discoverable as users grow.

### Interaction Paradigms
- Drag-and-drop composition on a node-based canvas with inline validation badges.
- Guided onboarding checklist that morphs into contextual hints and tooltips as users advance.
- Modal or side-panel editors for block configuration with live preview of resulting signals.
- Comparison dashboards using tabbed layouts and saved views for quick strategy benchmarking.
- Notification center aggregating backtest, paper-trade, and compliance messages.

### Screen Inventory
1. Authentication & Guided Welcome
2. Strategy Canvas Workspace
3. Block Configuration Side Panel
4. Backtest Results & Insights Dashboard
5. Paper Trading Scheduler & Monitoring Console
6. Strategy Comparison Gallery
7. Admin & Plan Management Console

### Accessibility & Device Coverage
Adopt WCAG 2.1 AA as baseline: maintain accessible color contrast, provide keyboard navigation for canvas interactions, offer text alternatives for visual charts, and ensure notifications are perceivable across modalities. Responsive layouts prioritize desktop and large tablets for full composition, while mobile web delivers read-only summaries and critical alerts during MVP.

### Branding & Tone
Anchor visuals in a modern “quant lab” aesthetic—clean dark-on-light palette with accent colors per block type, consistent iconography, and typography that conveys precision without intimidation. Microcopy should celebrate milestones, reinforce simulation-only positioning, and keep compliance statements visible without breaking flow.

## Technical Assumptions

### Repository Structure: Monorepo
Maintain a single monorepo that houses the Next.js frontend, FastAPI services, shared schema packages, Terraform/IaC, and automated workflows. This supports consistent versioning, shared type contracts, and streamlined CI/CD.

### Service Architecture
Adopt a modular microservices approach within the monorepo: a gateway/API layer for auth and CRUD, a strategy orchestration service, a simulation worker service for backtests/paper trading, and supporting services (billing, notifications, data ingestion). Services communicate via REST and asynchronous queues to isolate workloads and allow independent scaling.

### Testing Requirements
Establish a full testing pyramid: unit tests for React components, Python business logic, and data transformers; integration tests for API workflows and async jobs; end-to-end tests for critical user journeys (e.g., creating, backtesting, and scheduling a strategy). Include synthetic data fixtures and contract tests for external market data APIs.

### Additional Technical Assumptions and Requests
- Frontend built with Next.js (App Router), TypeScript, TailwindCSS, React Query, and Zustand for state management.
- Backend services use FastAPI with async execution, Celery/Redis (or equivalent) for job orchestration, and TimescaleDB for time-series results.
- Supabase Postgres manages authentication and transactional configuration data; S3-compatible storage retains backtest artifacts and reports.
- Stripe powers billing with usage metering hooks for freemium limits; LaunchDarkly (or open-source equivalent) controls feature flags.
- Sentry and Datadog provide observability, tracing, and anomaly alerting; automated data validation jobs guard against stale or missing market candles.
- Infrastructure targets Vercel for frontend deployments, AWS ECS/EKS (or DigitalOcean Kubernetes) for backend/worker clusters, with IaC modules enforcing cost guardrails and environment parity.

### Implementation & Operational Guidance
#### Deployment Cadence & Environments
- Maintain discrete dev, staging, and production environments; target twice-weekly staging releases and a controlled weekly production rollout once beta begins.
- Require release pre-checks (lint, unit, integration, end-to-end smoke) to pass before promotion; document environment-specific configuration toggles in the monorepo README.

#### Runbook & Rollback Expectations
- Author service runbooks (canvas, simulation workers, billing, data ingestion) covering startup commands, health checks, alert routing, and dependency diagrams prior to first production deploy.
- Define rollback procedures for frontend (Vercel instant rollback) and backend (ECS task redeploy with previous image) including trigger criteria and communication steps.

#### Support & On-Call Coverage
- Establish a lightweight on-call rotation (engineering + PM) during beta with a 2-hour acknowledgement SLA for P1 incidents and 8-hour resolution target.
- Route customer issues via Intercom/Zendesk with tagging for data, billing, or UX, and ensure weekly review of incident trends with founders.

#### Third-Party Account Provisioning & Credential Playbook
- **Supabase (Owner: DevOps Lead)** – Create project per environment via Terraform, capture service keys in secrets manager, and document read/write role mapping for app services; rotate keys quarterly with change tickets logged in the ops tracker.
- **AWS Core (Owner: DevOps Lead)** – Provision IAM roles, S3 buckets, and networking stacks through IaC with approval from security advisor; enable MFA for human break-glass accounts and enforce 90-day access review checkpoints.
- **Stripe (Owner: PM + Finance Partner)** – Request production keys through Stripe dashboard once compliance checklist is cleared, store secrets in Vault/Supabase config, and schedule automated webhook replay tests monthly; rotate restricted keys every 180 days.
- **Market Data Vendors (Owner: Data Engineering)** – Maintain primary (Kaiko) and secondary (Coin Metrics) credentials, detailing signup, billing approvals, IP allowlists, and monitoring hooks; validate key health weekly and archive vendor contact history.
- Centralize all provisioning runbooks in the repository `ops/playbooks/` directory with last-reviewed timestamps and escalation contacts.

#### Responsibility Matrix (Human vs. Agent)
| Task | Human Owner | Agent/Automation | Notes |
| --- | --- | --- | --- |
| Compliance disclosure reviews | Compliance Advisor (quarterly) | Content linting bots flag missing disclaimers | Humans sign off before releases; bot posts checklist status in CI |
| Credential rotation & audit | DevOps Lead (Supabase/AWS); PM (Stripe) | Secrets scanner monitors repo & CI for leaks | Rotation calendar recorded in ops tracker with reminder automations |
| Backup validation & DR drills | DevOps Lead | Scheduled restoration jobs verify snapshots | Drill outcomes logged with pass/fail and remediation items |
| Customer support & incident comms | Support Lead + PM | Intercom auto-triage tags severity | Human decides escalation path; notifications mirrored in Slack |
| Knowledge base updates | PM + UX Writer | Docs pipeline ensures linting & broken link checks | Weekly audit to confirm onboarding and trust content stay current |

#### Backup & Restore Execution Plan
- **Tooling:** Use managed TimescaleDB snapshots and S3 lifecycle policies; retain encrypted copies in separate AWS account for disaster recovery.
- **Cadence:** Automate nightly incremental snapshots and weekly full backups for databases; archive application artifacts after each production deploy.
- **Validation:** Schedule monthly restore drills into an isolated staging environment, verifying data integrity and application boot; log outcomes and follow-ups in the reliability register.
- **Ownership & Alerts:** DevOps Lead owns cadence adherence, with Datadog monitors triggering alerts on missed backups or failed restores; compliance advisor receives quarterly summary reports.

#### Documentation & Handoff Deliverables
- Produce release notes for every production deployment highlighting user-facing changes, known issues, and mitigation steps.
- Maintain a beta operations log capturing incidents, root cause, and follow-up actions; share summaries during fortnightly stakeholder syncs.
- Ensure support and compliance teams receive updates to disclosures, onboarding copy, and FAQ/education assets at least 24 hours before release.
- Deliver Sprint 0 knowledge-transfer packet covering release workflow, rollback triggers, support escalation map, and on-call expectations; update after each beta iteration.
- Define user-facing education suite (onboarding checklist copy, trust & compliance FAQ, tutorial videos) mapped to activation KPIs, with owners assigned for creation and maintenance.

### Technical Risks & Investigation Focus
- **Market Data Vendor Validation (Owner: PM + Data Engineering, Due: Sprint 1, Status: On Track):** Compare Kaiko, Coin Metrics, and alternates for pricing, licensing, and latency to confirm coverage fits beta budget (`docs/brief.md:118-120`).
- **Simulation Realism & Execution Modeling (Owner: Backend/Quant Lead, Due: Sprint 2, Status: Planned):** Validate fill assumptions, slippage models, and sensitivity analysis to ensure users trust paper-trade outcomes.
- **Infrastructure Cost Guardrails (Owner: DevOps, Due: Ongoing, Status: Monitoring):** Model worker scaling scenarios against the $8K/month cap and define throttling strategies before public beta (`docs/brief.md:97-115`).
- **Freemium Quota Definition (Owner: PM + Growth, Due: Sprint 2, Status: Needs Kickoff):** Finalize run/day and strategy limits that balance conversion targets with platform load, then codify upgrade prompts.
- **Compliance Review Workflow (Owner: Compliance Advisor, Due: Sprint 3, Status: Pending):** Establish disclosure audit cadence, messaging approvals, and escalation paths to avoid regulatory misinterpretation.

## Epic List
1. Epic 1 – Foundation & Guided Strategy Canvas: Stand up the core platform, authentication, and a guided canvas experience that delivers the first backtest win.
2. Epic 2 – Trusted Backtesting & Data Pipeline: Deliver reliable market data ingestion, simulation services, and insight-rich backtest reporting.
3. Epic 3 – Paper Trading & Performance Monitoring: Enable scheduled paper-trade execution, alerting, and dashboards that track ongoing performance.
4. Epic 4 – Community Sharing & Monetization: Launch collaboration, template sharing, freemium limits, and premium upgrade flows to drive growth.

## Epic 1 Foundation & Guided Strategy Canvas

**Epic Goal:** Establish the Blockbuilders monorepo, authentication flow, and the initial visual canvas so new users can assemble blocks, follow onboarding guidance, and achieve a successful backtest. This epic proves the “first win” promise and lays groundwork for subsequent services.

### Story 1.1 Platform Skeleton & Authentication
As a new user,
I want to sign up, authenticate, and land in a pre-configured workspace,
so that I can immediately begin exploring strategy building in a trustworthy environment.

#### Acceptance Criteria
1. 1: Monorepo initialized with Next.js frontend, FastAPI API gateway, shared schema package, and CI lint/test pipeline.
2. 2: Supabase (or equivalent) authentication integrated with email/password and OAuth, enforcing simulation-only consent checkbox.
3. 3: Post-login redirect initializes a demo strategy workspace populated with sample blocks and educational callouts.
4. 4: Audit logging captures auth events and workspace creation metadata.

### Story 1.2 Core Canvas Blocks & Validation
As a strategy tinkerer,
I want to drag blocks onto a canvas and connect them with real-time validation,
so that I can assemble a working strategy without writing code.

#### Acceptance Criteria
1. 1: Canvas supports drag-and-drop, block linking, and deletion with undo, using at least five starter block types.
2. 2: Inline validation flags missing inputs, incompatible block connections, and quota breaches.
3. 3: Block configuration side panel exposes editable parameters with hint text and default ranges.
4. 4: Strategy versions auto-save with timestamped history and ability to revert to previous version.

### Story 1.3 Guided Onboarding & Template Library
As a first-time user,
I want a guided walkthrough and starter strategies,
so that I can run my first successful backtest within minutes.

#### Acceptance Criteria
1. 1: Guided checklist highlights onboarding steps (tour canvas, load template, run backtest) with progress tracking.
2. 2: Template library offers at least three pre-built strategies with tooltips explaining each block.
3. 3: In-app education hub surfaces copy, video, or tooltip content that clarifies simulation scope and risk disclaimers.
4. 4: Analytics event stream captures onboarding progress to measure activation metrics.

## Epic 2 Trusted Backtesting & Data Pipeline

**Epic Goal:** Deliver dependable data ingestion and simulation capabilities that generate insightful reports users can trust. This epic ensures backtests are fast, explainable, and auditable.

### Story 2.1 Market Data Ingestion & Quality Guardrails
As a data steward,
I want market data ingestion with automated validation,
so that strategy results reflect accurate and complete historical information.

#### Acceptance Criteria
1. 1: TimescaleDB (or equivalent) stores normalized OHLCV data for at least BTC-USD and ETH-USD pairs from two vendors.
2. 2: ETL jobs run hourly, reconciling discrepancies and logging anomalies with automated alerting to Slack/email.
3. 3: Data catalog UI lists data coverage, freshness, and known issues for transparency.
4. 4: Cost guardrails monitor data API usage against budget thresholds with automated notifications.

### Story 2.2 Backtest Engine & Execution Service
As a strategy builder,
I want to run deterministic backtests from the canvas,
so that I can evaluate performance with confidence.

#### Acceptance Criteria
1. 1: Canvas trigger packages strategy graph into executable payload and submits to simulation service via queue.
2. 2: Backtest worker executes strategies with configurable fee/slippage models and position sizing.
3. 3: Results include equity curve, drawdown, trade ledger, and scenario metadata stored for later comparison.
4. 4: Standard tier backtests complete within 30 seconds and return status updates to the UI.

### Story 2.3 Insights & Comparison Dashboard
As an analytical user,
I want rich reporting and comparison tools,
so that I can interpret results and iterate faster.

#### Acceptance Criteria
1. 1: Backtest results view visualizes KPIs, charts, and anomaly callouts with export to CSV/PDF.
2. 2: Comparison dashboard allows selecting up to five strategies, highlighting deltas in KPIs and risk metrics.
3. 3: Insight engine surfaces recommendations (e.g., max drawdown exceeds threshold) with links to learning content.
4. 4: All reporting components meet WCAG AA contrast and interaction standards.

## Epic 3 Paper Trading & Performance Monitoring

**Epic Goal:** Enable users to continue validating strategies through scheduled paper trading, continuous monitoring, and actionable alerts, reinforcing trust and engagement.

### Story 3.1 Paper Trading Scheduler & Execution
As an engaged builder,
I want to schedule strategies for continuous paper trading,
so that I can observe live-like performance without risking capital.

#### Acceptance Criteria
1. 1: Users schedule frequency, exchanges, and capital allocation for paper runs with quota checks for freemium limits.
2. 2: Scheduler enqueues runs, executes them on market-close or interval triggers, and stores simulated fills with timestamps.
3. 3: Execution logs differentiate between simulated and historical data, including assumptions used.
4. 4: Emails and in-app notifications summarize run results and status changes.

### Story 3.2 Performance Dashboards & Alerting
As a returning user,
I want dashboards that track paper-trade performance and alert anomalies,
so that I can decide whether to iterate or graduate strategies.

#### Acceptance Criteria
1. 1: Dashboard aggregates KPIs (PnL, Sharpe, win rate, drawdown) with trend visualizations across time.
2. 2: Users configure alert thresholds (e.g., drawdown > X%, win rate < Y%) and delivery channels.
3. 3: Real-time notification center displays alert history with acknowledgment workflow.
4. 4: Observability events feed into Datadog dashboards for operations oversight.

### Story 3.3 Educator & Cohort Monitoring Tools
As a community leader,
I want to monitor my shared strategies and cohort engagement,
so that I can support learners and highlight wins.

#### Acceptance Criteria
1. 1: Educator dashboard lists shared templates, adopters, and their paper-trade performance summaries.
2. 2: Cohort tagging groups learners for aggregated metrics and messaging.
3. 3: Exportable reports share cohort progress while respecting privacy and simulation disclaimers.
4. 4: Role-based access control limits educator views to their shared assets.

## Epic 4 Community Sharing & Monetization

**Epic Goal:** Strengthen growth loops and revenue by enabling sharing, collaboration, and premium entitlements while keeping compliance and governance tight.

### Story 4.1 Template Sharing & Governance
As a strategy author,
I want to publish and manage strategy templates,
so that others can clone, learn, and credit my work safely.

#### Acceptance Criteria
1. 1: Template publishing flow captures metadata (description, tags, disclaimers) and review checklist.
2. 2: Consumers can clone templates with attribution preserved and optional educator annotations.
3. 3: Governance controls enforce moderation workflows and takedown requests.
4. 4: Activity logs track clones, edits, and compliance approvals.

### Story 4.2 Freemium Limits & Premium Entitlements
As a product owner,
I want to enforce plan limits and unlock premium features,
so that we monetize while keeping the free tier compelling.

#### Acceptance Criteria
1. 1: Plan definitions specify quotas (strategies, backtests/day, paper runs) with usage tracking per account.
2. 2: Over-limit attempts prompt upgrade CTAs and gated functionality messaging.
3. 3: Premium activation via Stripe updates entitlements in near real-time and unlocks advanced analytics.
4. 4: Billing events and receipts are auditable and exportable for finance review.

### Story 4.3 Compliance & Trust Framework
As a compliance advisor,
I want safeguards and messaging controls,
so that the platform remains clearly simulation-only and regulator-friendly.

#### Acceptance Criteria
1. 1: Compliance toolkit manages disclosure snippets and ensures they appear on onboarding, strategy views, and exports.
2. 2: Risk review workflow flags high-risk templates or anomalies for manual approval.
3. 3: Content moderation integrates with educator publishing to prevent financial advice claims.
4. 4: Trust & safety dashboard reports incidents, resolutions, and policy updates.

## Stakeholder Alignment & Communication

### Stakeholder Roster
- **Product Management (John – PM):** Owns roadmap prioritization, KPI tracking, and alignment with founders.
- **Engineering Lead (TBD):** Guides feasibility, sequencing, and delivery commitments across services.
- **Design Lead (Sally – UX):** Oversees experience quality, accessibility compliance, and research synthesis.
- **Data/Quant Lead:** Protects data integrity, simulation accuracy, and reporting transparency.
- **Compliance Advisor:** Reviews disclosures, educator governance, and risk escalation policies.
- **Founders / Executive Sponsors:** Provide strategic guardrails, budget approval, and go-to-market alignment.

### Decision Cadence
- Weekly product/engineering/design triad reviews progress, resolves scope questions, and updates the risk register.
- Fortnightly stakeholder sync reports KPI movement, research learnings, and outstanding decisions requiring alignment.
- Monthly steering review with founders validates roadmap adjustments, monetization experiments, and compliance status.

### Communication Plan
- Centralize status, open issues, and research artifacts in the shared Notion workspace with written updates every Friday.
- Use `#blockbuilders-product` Slack channel for day-to-day coordination; critical incidents escalate to the on-call bridge within 30 minutes.
- Distribute sprint demos and beta KPI snapshots after each iteration, tagging stakeholders for required follow-ups.

### Approval Workflow
- MVP scope changes require PM + Engineering Lead + Founder approval before implementation.
- Compliance-sensitive copy or template governance updates must be signed off by the Compliance Advisor within two business days.
- Production releases demand confirmation from Product, Engineering, and Support that observability alerts and rollback plans are active.

## Checklist Results Report
- 2025-09-21: PM checklist follow-up updates applied; document now reflects "Ready with follow-ups" status and supersedes prior "Needs Refinement" note.
- 2025-09-20: PM checklist executed (Needs Refinement). Full analysis captured in `docs/checklist/pm-checklist-report.md`.

## Next Steps

### UX Expert Prompt
Use the Blockbuilders PRD to shape interaction flows: focus on onboarding to first backtest, canvas usability for non-coders, and trust-building visualizations for backtest/paper-trade results. Highlight accessibility (WCAG AA) and progressive disclosure cues.

### Architect Prompt
Use the Blockbuilders PRD to design architecture for a Next.js + FastAPI monorepo with modular simulation services, TimescaleDB-backed data pipelines, and scalable worker infrastructure. Emphasize data quality safeguards, cost control guardrails, and compliance logging.
