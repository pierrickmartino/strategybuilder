"""Analytics request/response schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field

StepStatus = Annotated[str, Field(pattern=r"^(pending|in-progress|completed)$")]


class OnboardingEventIn(BaseModel):
  step_id: Annotated[str, Field(min_length=3, max_length=64)]
  status: StepStatus
  occurred_at: datetime
  properties: dict[str, str | int | float | bool | None] | None = None


class OnboardingEventRequest(BaseModel):
  events: Annotated[list[OnboardingEventIn], Field(min_length=1, max_length=50)]
