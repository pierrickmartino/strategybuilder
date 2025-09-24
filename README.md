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

### Environment configuration

The repository ships with a `.env.example` file that contains all of the
environment variables required to run the full stack locally. After copying it
to `.env` (for the FastAPI gateway and workers) and `apps/web/.env.local` (for
the Next.js frontend), replace the placeholder values with credentials that
match your local infrastructure:

| Variable | Purpose |
| --- | --- |
| `APP_ENV` | Sets the runtime mode used across services. Keep this as `development` for local work. |
| `API_HOST` / `API_PORT` | Control the bind address and port for the FastAPI app. |
| `DATABASE_URL` | Async SQLAlchemy connection string for Postgres. Point this at your local database, including username and password. |
| `REDIS_URL` | Redis endpoint used for caching and as the Celery broker. |
| `SUPABASE_*` | Credentials for your Supabase project. The `SERVICE_ROLE_KEY` and `JWT_SECRET` stay on the server side, while the `NEXT_PUBLIC_` values are safe for the frontend. |
| `NEXT_PUBLIC_API_BASE_URL` | External base URL that the Next.js app uses to call the API. |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY` | Stripe keys for payments. Supply test keys for development. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Optional OpenTelemetry collector endpoint for tracing. |
| `LOG_LEVEL` | Minimum log severity for server-side logging. |

If you do not need a particular integration (for example, Stripe or
OpenTelemetry) you can leave the defaults in place or remove the variables. The
applications only require that the Postgres, Redis, and Supabase values point to
reachable services when you start the dev stack.

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
