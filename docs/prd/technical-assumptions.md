# Technical Assumptions

## Repository Structure: Monorepo
Maintain a single monorepo that houses the Next.js frontend, FastAPI services, shared schema packages, Terraform/IaC, and automated workflows. This supports consistent versioning, shared type contracts, and streamlined CI/CD.

## Service Architecture
Adopt a modular microservices approach within the monorepo: a gateway/API layer for auth and CRUD, a strategy orchestration service, a simulation worker service for backtests/paper trading, and supporting services (billing, notifications, data ingestion). Services communicate via REST and asynchronous queues to isolate workloads and allow independent scaling.

## Testing Requirements
Establish a full testing pyramid: unit tests for React components, Python business logic, and data transformers; integration tests for API workflows and async jobs; end-to-end tests for critical user journeys (e.g., creating, backtesting, and scheduling a strategy). Include synthetic data fixtures and contract tests for external market data APIs.

## Additional Technical Assumptions and Requests
- Frontend built with Next.js (App Router), TypeScript, TailwindCSS, React Query, and Zustand for state management.
- Backend services use FastAPI with async execution, Celery/Redis (or equivalent) for job orchestration, and TimescaleDB for time-series results.
- Supabase Postgres manages authentication and transactional configuration data; S3-compatible storage retains backtest artifacts and reports.
- Stripe powers billing with usage metering hooks for freemium limits; LaunchDarkly (or open-source equivalent) controls feature flags.
- Sentry and Datadog provide observability, tracing, and anomaly alerting; automated data validation jobs guard against stale or missing market candles.
- Infrastructure targets Vercel for frontend deployments, AWS ECS/EKS (or DigitalOcean Kubernetes) for backend/worker clusters, with IaC modules enforcing cost guardrails and environment parity.

## Implementation & Operational Guidance
### Engineer Bootstrap Checklist
- **Prerequisites:** Install Node.js 18+ with npm, Python 3.11+, and Git. Optional but recommended: `direnv` for env management and `make` for helper scripts referenced in `docs/architecture.md`.
- **Clone & Workspace Setup:**
  - `git clone git@github.com:blockbuilders/strategybuilder.git && cd strategybuilder`
  - Until automation ships, reference this checklist as the canonical bootstrap flow; update the root `README.md` when the helper script is introduced.
- **Frontend Install:**
  - `cd frontend && npm install`
  - Copy `.env.local.example` (when present) to `.env.local`; if absent, create it using the baseline values in `docs/architecture.md` (see Environment Configuration).
  - Verify the dev server with `npm run dev`; confirm http://localhost:3000 renders the onboarding shell.
- **Backend Install:**
  - `cd backend && python -m venv .venv && source .venv/bin/activate`
  - `pip install -e .` (adds FastAPI + Uvicorn)
  - Create a `.env` file using the template below; store secrets in 1Password and inject via `direnv` during local runs.
  - Start the API with `uvicorn app.main:app --reload` and hit `http://127.0.0.1:8000/health` to confirm readiness.
- **Environment Variable Baseline:**

  | Scope | Variable | Notes |
  | --- | --- | --- |
  | Frontend | `NEXT_PUBLIC_API_BASE_URL` | Default: `http://localhost:8000/api/v1` |
  | Frontend | `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Use staging project until dedicated dev project is provisioned |
  | Backend | `DATABASE_URL` | Point to local Postgres or Supabase connection string |
  | Backend | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` | Request via DevOps; never commit |
  | Backend | `STRIPE_SECRET_KEY` | Use test mode key; rotate every 180 days |
  | Shared | `APP_ENV`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `LOG_LEVEL` | Defaults listed in `docs/architecture.md` |
- **Smoke Tests:** Run `./scripts/test.sh` from repo root to validate the backend health check; add frontend lint/test wiring before beta.
- **Documentation Hooks:** Update the root `README.md` if commands change and append new pitfalls or automation scripts to this checklist so onboarding stays current.

#### Common Pitfalls & Mitigations
- Node <18 will break Next.js 15 features (ESM, App Router). Validate with `node -v` before running installs.
- Forgetting to activate the Python virtual environment causes `uvicorn` import errors; the prompt should show `(.venv)`.
- Port collisions (3000/8000) occur if prior runs remain alive; stop existing processes or export alternate ports in `.env.local`/`.env`.
- Missing `.env` keys lead to silent Supabase/Stripe failures; stub safe defaults for local dev and document overrides in the shared secrets vault.
- Windows developers should run `npm run dev -- --hostname 0.0.0.0` to avoid network binding issues observed during early tests.
### Deployment Cadence & Environments
- Maintain discrete dev, staging, and production environments; target twice-weekly staging releases and a controlled weekly production rollout once beta begins.
- Require release pre-checks (lint, unit, integration, end-to-end smoke) to pass before promotion; document environment-specific configuration toggles in the monorepo README.

### Runbook & Rollback Expectations
- Author service runbooks (canvas, simulation workers, billing, data ingestion) covering startup commands, health checks, alert routing, and dependency diagrams prior to first production deploy.
- Define rollback procedures for frontend (Vercel instant rollback) and backend (ECS task redeploy with previous image) including trigger criteria and communication steps.

### Support & On-Call Coverage
- Establish a lightweight on-call rotation (engineering + PM) during beta with a 2-hour acknowledgement SLA for P1 incidents and 8-hour resolution target.
- Route customer issues via Intercom/Zendesk with tagging for data, billing, or UX, and ensure weekly review of incident trends with founders.

### Third-Party Account Provisioning & Credential Playbook
- **Supabase (Owner: DevOps Lead)** – Create project per environment via Terraform, capture service keys in secrets manager, and document read/write role mapping for app services; rotate keys quarterly with change tickets logged in the ops tracker.
- **AWS Core (Owner: DevOps Lead)** – Provision IAM roles, S3 buckets, and networking stacks through IaC with approval from security advisor; enable MFA for human break-glass accounts and enforce 90-day access review checkpoints.
- **Stripe (Owner: PM + Finance Partner)** – Request production keys through Stripe dashboard once compliance checklist is cleared, store secrets in Vault/Supabase config, and schedule automated webhook replay tests monthly; rotate restricted keys every 180 days.
- **Market Data Vendors (Owner: Data Engineering)** – Maintain primary (Kaiko) and secondary (Coin Metrics) credentials, detailing signup, billing approvals, IP allowlists, and monitoring hooks; validate key health weekly and archive vendor contact history.
- Centralize all provisioning runbooks in the repository `ops/playbooks/` directory with last-reviewed timestamps and escalation contacts.

### Responsibility Matrix (Human vs. Agent)
| Task | Human Owner | Agent/Automation | Notes |
| --- | --- | --- | --- |
| Compliance disclosure reviews | Compliance Advisor (quarterly) | Content linting bots flag missing disclaimers | Humans sign off before releases; bot posts checklist status in CI |
| Credential rotation & audit | DevOps Lead (Supabase/AWS); PM (Stripe) | Secrets scanner monitors repo & CI for leaks | Rotation calendar recorded in ops tracker with reminder automations |
| Backup validation & DR drills | DevOps Lead | Scheduled restoration jobs verify snapshots | Drill outcomes logged with pass/fail and remediation items |
| Customer support & incident comms | Support Lead + PM | Intercom auto-triage tags severity | Human decides escalation path; notifications mirrored in Slack |
| Knowledge base updates | PM + UX Writer | Docs pipeline ensures linting & broken link checks | Weekly audit to confirm onboarding and trust content stay current |

### Backup & Restore Execution Plan
- **Tooling:** Use managed TimescaleDB snapshots and S3 lifecycle policies; retain encrypted copies in separate AWS account for disaster recovery.
- **Cadence:** Automate nightly incremental snapshots and weekly full backups for databases; archive application artifacts after each production deploy.
- **Validation:** Schedule monthly restore drills into an isolated staging environment, verifying data integrity and application boot; log outcomes and follow-ups in the reliability register.
- **Ownership & Alerts:** DevOps Lead owns cadence adherence, with Datadog monitors triggering alerts on missed backups or failed restores; compliance advisor receives quarterly summary reports.

### Documentation & Handoff Deliverables
- Produce release notes for every production deployment highlighting user-facing changes, known issues, and mitigation steps.
- Maintain a beta operations log capturing incidents, root cause, and follow-up actions; share summaries during fortnightly stakeholder syncs.
- Ensure support and compliance teams receive updates to disclosures, onboarding copy, and FAQ/education assets at least 24 hours before release.
- Deliver Sprint 0 knowledge-transfer packet covering release workflow, rollback triggers, support escalation map, and on-call expectations; update after each beta iteration.
- Define user-facing education suite (onboarding checklist copy, trust & compliance FAQ, tutorial videos) mapped to activation KPIs, with owners assigned for creation and maintenance.

## Technical Risks & Investigation Focus
- **Market Data Vendor Validation (Owner: PM + Data Engineering, Due: Sprint 1, Status: On Track):** Compare Kaiko, Coin Metrics, and alternates for pricing, licensing, and latency to confirm coverage fits beta budget (`docs/brief.md:118-120`).
- **Simulation Realism & Execution Modeling (Owner: Backend/Quant Lead, Due: Sprint 2, Status: Planned):** Validate fill assumptions, slippage models, and sensitivity analysis to ensure users trust paper-trade outcomes.
- **Infrastructure Cost Guardrails (Owner: DevOps, Due: Ongoing, Status: Monitoring):** Model worker scaling scenarios against the $8K/month cap and define throttling strategies before public beta (`docs/brief.md:97-115`).
- **Freemium Quota Definition (Owner: PM + Growth, Due: Sprint 2, Status: Needs Kickoff):** Finalize run/day and strategy limits that balance conversion targets with platform load, then codify upgrade prompts.
- **Compliance Review Workflow (Owner: Compliance Advisor, Due: Sprint 3, Status: Pending):** Establish disclosure audit cadence, messaging approvals, and escalation paths to avoid regulatory misinterpretation.
