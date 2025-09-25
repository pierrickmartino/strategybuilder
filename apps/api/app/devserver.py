"""Development server entry point for the Strategy Builder API."""

from __future__ import annotations

import logging
import sys

import uvicorn

from app.config import get_settings


LOGGER = logging.getLogger(__name__)


def main() -> None:
  """Launch uvicorn using configuration-driven host/port values."""
  settings = get_settings()
  host = settings.api_host
  port = settings.api_port

  try:
    uvicorn.run(
      "app.main:app",
      host=host,
      port=port,
      reload=True,
      reload_dirs=["app"],
    )
  except OSError as exc:  # pragma: no cover - runtime safeguard
    if exc.errno in {48, 98}:  # macOS / Linux address in use error numbers
      LOGGER.error(
        "Port %s is already in use. Update API_PORT or stop the conflicting process before retrying.",
        port,
      )
      sys.exit(1)

    raise


if __name__ == "__main__":  # pragma: no cover - script entry point
  main()
