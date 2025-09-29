"""Template library service layer."""

from __future__ import annotations

from typing import Any

from app.data.template_library import list_templates


def get_template_library() -> list[dict[str, Any]]:
  """Return curated templates for onboarding."""
  return list_templates()
