# Strategy Builder Backend

A minimal FastAPI application that exposes a health check endpoint and is ready to be extended with domain specific APIs.

## Getting started

1. Change into the backend directory and create a virtual environment (optional but recommended):
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies in editable mode so local changes are picked up automatically:
   ```bash
   pip install -e .
   ```
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

Open http://127.0.0.1:8000/health to confirm the API is responding.
