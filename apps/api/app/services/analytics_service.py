"""Analytics persistence helpers."""

from __future__ import annotations

import logging
import uuid
from typing import Sequence

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.analytics import OnboardingEventIn
from app.auth.schemas import AuthenticatedUser
from app.models.onboarding_event import OnboardingEvent

logger = logging.getLogger("strategybuilder.analytics")


async def record_onboarding_events(
  session: AsyncSession,
  user: AuthenticatedUser,
  events: Sequence[OnboardingEventIn]
) -> list[OnboardingEvent]:
  """Persist onboarding analytics events."""

  records: list[OnboardingEvent] = []
  user_id = uuid.UUID(user.id)

  for event in events:
    record = OnboardingEvent(
      user_id=user_id,
      step_id=event.step_id,
      status=event.status,
      occurred_at=event.occurred_at,
      properties=event.properties or None
    )
    session.add(record)
    records.append(record)

    logger.info(
      "onboarding.event",
      extra={
        "user_id": user.id,
        "step_id": event.step_id,
        "status": event.status,
        "occurred_at": event.occurred_at.isoformat(),
        "properties": event.properties or {}
      }
    )

  return records
