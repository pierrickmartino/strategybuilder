# Strategy Builder Monorepo

Strategy Builder is organised as a Turborepo monorepo that houses the Next.js experience layer, FastAPI gateway, and Celery workers under a single workspace. Shared types live inside the `packages/` directory so both runtimes can consume consistent contracts.

```
.
├── apps/
│   ├── web/        # Next.js 15 App Router frontend
│   ├── api/        # FastAPI application with Supabase-authenticated routes
│   └── workers/    # Celery workers for async workloads
├── packages/
│   └── shared/     # Cross-runtime TypeScript DTOs
├── scripts/        # Automation helpers (lint, test, CI)
├── turbo.json      # Turborepo pipeline configuration
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.11+
- Poetry 1.8+
- Redis and Postgres (for local development of auth + workers flows)

## Initial setup

```bash
# install JS deps & register workspaces
pnpm install

# install Python deps
poetry install --sync --no-root --directory apps/api
poetry install --sync --no-root --directory apps/workers

# seed environment variables for local dev
cp .env.example .env
cp .env.example apps/web/.env.local
```

## Running the stack

```bash
pnpm turbo run dev --parallel
```

This starts:
- `apps/web` on http://localhost:3000
- `apps/api` on http://localhost:8000
- `apps/workers` Celery worker connected to the configured Redis broker

## Testing & linting

```bash
./scripts/test.sh
```

The script installs workspace dependencies (JavaScript + Python) and then executes `turbo run lint` and `turbo run test`, ensuring all surfaces stay green.

## Continuous Integration

GitHub Actions runs the same `scripts/test.sh` entry point on every push and pull request, providing unified lint + test coverage for both runtimes.
