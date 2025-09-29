"""Education content service."""

from __future__ import annotations

from typing import Any

from app.data.education_suite import get_onboarding_suite


def get_onboarding_education() -> dict[str, Any]:
  """Return onboarding education content."""
  return get_onboarding_suite()
