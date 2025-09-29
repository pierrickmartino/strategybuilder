"""API routers package."""

from app.api.routers import analytics, auth, education, health, strategy_versions, templates, workspaces

__all__ = [
  "auth",
  "health",
  "workspaces",
  "strategy_versions",
  "templates",
  "education",
  "analytics"
]
