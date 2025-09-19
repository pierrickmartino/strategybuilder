# Strategy Builder Monorepo

A starter monorepo that wires together a Next.js + Tailwind CSS frontend with a FastAPI backend. The repository is organised in two top-level folders so each application can evolve independently.

- [`frontend/`](frontend/) – Next.js 15 application configured with Tailwind CSS.
- [`backend/`](backend/) – FastAPI application with a ready-to-run health check endpoint.

## Prerequisites

- Node.js 18 or later and npm.
- Python 3.11 or later and pip.

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The development server runs on http://localhost:3000 by default.

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e .
uvicorn app.main:app --reload
```

The API will be available on http://127.0.0.1:8000 and exposes a `/health` endpoint for quick smoke testing.

## Testing

Run the project test suite with the helper script at the repository root:

```bash
./scripts/test.sh
```

The script currently exercises the FastAPI backend's health endpoint using Python's built-in `unittest` runner. Additional test
s can be added over time and wired into the same entry point to keep execution consistent.

## Next steps

- Connect the frontend to backend endpoints using `fetch` or your preferred HTTP client.
- Add shared tooling (linting, formatting, CI) at the repository root if desired.
- Containerise each service or configure deployment pipelines that suit your infrastructure.
