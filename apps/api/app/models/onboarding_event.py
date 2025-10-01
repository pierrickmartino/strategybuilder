"""Analytics events emitted during onboarding."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from app.db.base import Base


class OnboardingEvent(Base):
  """Captured onboarding analytics event."""

  __tablename__ = "onboarding_events"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
  step_id: Mapped[str] = mapped_column(String(length=64), nullable=False)
  status: Mapped[str] = mapped_column(String(length=32), nullable=False)
  occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
  received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
  properties: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
