"""Pytest configuration for repository-level tests."""

from __future__ import annotations

import sys
from pathlib import Path


def _ensure_api_on_path() -> None:
  """Add the FastAPI application package to ``sys.path`` when running from repo root."""
  root = Path(__file__).resolve().parent
  api_path = root / "apps" / "api"
  api_path_str = str(api_path)
  if api_path_str not in sys.path:
    sys.path.insert(0, api_path_str)


_ensure_api_on_path()
