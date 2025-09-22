# Strategy Builder API

FastAPI service that powers authentication, workspace provisioning, and analytics capture for the Strategy Builder platform.

## Getting started

```bash
# Install Python dependencies
poetry install --sync --no-root --directory apps/api

# Launch the development server
cd apps/api
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://127.0.0.1:8000/health to verify the service responds.
