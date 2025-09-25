# Strategy Builder API

FastAPI service that powers authentication, workspace provisioning, and analytics capture for the Strategy Builder platform.

## Getting started

```bash
# Install Python dependencies
poetry install --sync --no-root --directory apps/api

# Launch the development server
# The server reads API_HOST and API_PORT from the repo .env (defaults 0.0.0.0:8000)
cd apps/api
poetry run python -m app.devserver
```

Visit http://127.0.0.1:8000/health to verify the service responds. If the
default port is in use, set `API_PORT` in `.env` (and update
`NEXT_PUBLIC_API_BASE_URL` for the frontend) before rerunning the command.
