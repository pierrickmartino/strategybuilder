# Deployment Architecture

## Deployment Strategy
**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `pnpm --filter web build`
- **Output Directory:** `.vercel/output` (App Router)
- **CDN/Edge:** Vercel Edge Network with ISR + stale-while-revalidate

**Backend Deployment:**
- **Platform:** AWS Fargate (ECS) with Application Load Balancer
- **Build Command:** `docker build -t blockbuilders-api apps/api`
- **Deployment Method:** GitHub Actions builds to ECR, CodeDeploy blue/green rollout

## CI/CD Pipeline
```yaml
name: ci-cd
on:
  push:
    branches: [main, staging]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm turbo run lint test
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install poetry
      - run: poetry install --directory apps/api
      - run: poetry install --directory apps/workers
      - run: poetry run pytest apps/api
  deploy-frontend:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
  deploy-backend:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: us-east-1
          role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE }}
      - run: ./scripts/build-backend.sh
      - run: ./scripts/deploy-backend.sh
```

## Environments
| Environment | Frontend URL | Backend URL | Purpose |
| --- | --- | --- | --- |
| Development | http://localhost:3000 | http://localhost:8000 | Local development |
| Staging | https://staging.blockbuilders.app | https://staging-api.blockbuilders.app | Pre-production verification |
| Production | https://blockbuilders.app | https://api.blockbuilders.app | Live environment |

## Operational Playbooks & Responsibilities
### Third-Party Account Provisioning & Credential Management
- **Supabase (Owner: DevOps Lead)** – Provision projects per environment via Terraform modules under `infrastructure/terraform/supabase`, capture service keys in AWS Secrets Manager, and document read/write role mappings; rotate all non-user keys quarterly with tickets logged in the ops tracker.
- **AWS Core (Owner: DevOps Lead)** – Stand up IAM roles, networking, S3 buckets, and Batch/Fargate stacks through infrastructure code; enforce MFA on human break-glass accounts and schedule 90-day IAM access reviews.
- **Stripe (Owner: PM + Finance Partner)** – Request production keys after compliance checklist sign-off, store secrets in Vault/Supabase configuration tables, and automate webhook replay tests monthly; rotate restricted keys every 180 days.
- **Market Data Vendors (Owner: Data Engineering)** – Maintain primary (Kaiko) and secondary (Coin Metrics) credentials with onboarding steps, billing approvals, IP allowlists, and monitoring hooks; validate key health weekly and archive vendor contact history.
- Centralize detailed playbooks under `ops/playbooks/` with last-reviewed timestamps, escalation contacts, and Terraform state references so new contributors can execute without tribal knowledge.

### Responsibility Matrix (Human vs. Automation)
| Task | Human Owner | Automation Support | Notes |
| --- | --- | --- | --- |
| Compliance disclosure reviews | Compliance Advisor (quarterly) | Content linting bots flag missing disclaimers in CI | Manual approval required before production deploys; bot posts checklist status to GitHub checks. |
| Credential rotation & audit | DevOps Lead (Supabase/AWS); PM (Stripe) | Secrets scanner watches repo/CI for leaks | Rotation calendar tracked in ops tracker with Slack reminders. |
| Backup validation & DR drills | DevOps Lead | Scheduled restore jobs verify snapshots automatically | Drill reports captured in reliability register with remediation tasks logged to Jira. |
| Customer support & incident comms | Support Lead + PM | Intercom auto-triage tags severity | Humans arbitrate escalation path; alerts mirrored to Slack incident channel. |
| Knowledge base & onboarding assets | PM + UX Writer | Docs pipeline lints Markdown, checks links | Weekly audit ensures onboarding, trust, and compliance artifacts stay current. |

### Backup & Restore Execution Plan
- **Tooling:** Use Supabase managed Timescale snapshots and AWS Backup for S3 buckets; replicate encrypted copies to a separate AWS account for disaster recovery.
- **Cadence:** Run nightly incremental snapshots and weekly full database backups; archive application artifacts after every production deploy.
- **Validation:** Execute monthly restore drills into isolated staging namespaces, verifying schema migrations and application boot; log outcomes in `ops/playbooks/backup-restore.md`.
- **Monitoring:** Datadog monitors alert on missed backups, replication lag, or failed restores; compliance advisor receives quarterly summary exports.

### Knowledge Transfer & Support Handoffs
- Produce Sprint 0 knowledge-transfer packet covering release workflow, rollback triggers, support escalation map, and on-call expectations; refresh after each beta iteration.
- Maintain beta operations log (incidents, root cause, follow-ups) and distribute summaries during fortnightly stakeholder syncs.
- Ensure support and compliance teams receive updated disclosures, onboarding copy, and FAQ assets at least 24 hours before deploy; host documentation in shared Notion with repository pointers.
- Deliver user-facing education suite (onboarding checklist copy, trust/compliance FAQ, tutorial videos) mapped to activation KPIs, with clear ownership and review cadence.
