# Blockbuilders Product Requirements Document (PRD)

## Goals and Background Context

### Goals
1. Deliver an intuitive visual strategy canvas that lets non-coders assemble crypto trading workflows within minutes.
2. Provide trustworthy backtesting and paper-trading so builders can validate ideas without risking capital.
3. Accelerate user activation through guided onboarding, starter templates, and educational guardrails.
4. Enable community leaders and educators to share, clone, and manage strategy templates with their audiences.
5. Establish a scalable freemium monetization path that encourages upgrades to premium analytics.

### Background Context
Blockbuilders addresses the steep learning curve faced by retail traders who want systematic strategies but lack programming skills. The current market forces users to juggle TradingView scripts, spreadsheets, and unreliable bots, eroding trust in results and slowing learning loops. By combining a drag-and-drop strategy canvas with institutional-grade market data, automated backtests, and continuous paper trading, Blockbuilders creates a safe, educational playground where experimentation feels approachable and credible. The product’s success hinges on making “first win” moments fast, defensible, and shareable so that curious traders and community educators embrace it as their primary lab environment.

### Change Log
| Date | Version | Description | Author |
| --- | --- | --- | --- |
| 2025-09-20 | v1.0 | Initial PRD drafted from project brief | John (PM) |

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

## User Interface Design Goals

### Overall UX Vision
Create a confident, lab-like workspace that feels approachable for non-programmers yet powerful enough for aspiring quants. The experience should guide users from exploration to execution with progressive disclosure—starter templates, wizard-like onboarding, and contextual education keep early steps simple while advanced configuration remains discoverable as users grow.

### Key Interaction Paradigms
- Drag-and-drop composition on a node-based canvas with inline validation badges.
- Guided onboarding checklist that morphs into contextual hints and tooltips as users advance.
- Modal or side-panel editors for block configuration with live preview of resulting signals.
- Comparison dashboards using tabbed layouts and saved views for quick strategy benchmarking.
- Notification center aggregating backtest, paper-trade, and compliance messages.

### Core Screens and Views
1. Authentication & Guided Welcome
2. Strategy Canvas Workspace
3. Block Configuration Side Panel
4. Backtest Results & Insights Dashboard
5. Paper Trading Scheduler & Monitoring Console
6. Strategy Comparison Gallery
7. Admin & Plan Management Console

### Accessibility: WCAG AA
Adopt WCAG 2.1 AA as baseline: maintain accessible color contrast, provide keyboard navigation for canvas interactions, offer text alternatives for visual charts, and ensure notifications are perceivable through multiple modalities.

### Branding
Anchor visuals in a modern “quant lab” aesthetic—clean dark-on-light palette with accent colors for block types, consistent iconography, and typography that conveys precision without intimidation. Include friendly microcopy and success states that celebrate milestones while reiterating simulation-only positioning.

### Target Device and Platforms: Web Responsive
Responsive layouts optimized for desktop and large tablets, with breakpoints that maintain usability of the canvas, dashboards, and forms. Mobile access can deliver read-only summaries and alerts in later phases; MVP focuses on desktop-class experiences.

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

## Checklist Results Report
- PM checklist not yet executed; awaiting confirmation to run and append results.

## Next Steps

### UX Expert Prompt
Use the Blockbuilders PRD to shape interaction flows: focus on onboarding to first backtest, canvas usability for non-coders, and trust-building visualizations for backtest/paper-trade results. Highlight accessibility (WCAG AA) and progressive disclosure cues.

### Architect Prompt
Use the Blockbuilders PRD to design architecture for a Next.js + FastAPI monorepo with modular simulation services, TimescaleDB-backed data pipelines, and scalable worker infrastructure. Emphasize data quality safeguards, cost control guardrails, and compliance logging.
