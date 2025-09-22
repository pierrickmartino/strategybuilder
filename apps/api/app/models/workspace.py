"""Workspace persistence models."""

from __future__ import annotations

import uuid
from datetime import datetime

from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
  from app.models.strategy import Strategy


class Workspace(Base):
  """Represents the root container for a user's strategy assets."""

  __tablename__ = "workspaces"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
  name: Mapped[str] = mapped_column(String(length=120), nullable=False)
  template_id: Mapped[str | None] = mapped_column(String(length=64), nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

  strategies: Mapped[list["Strategy"]] = relationship("Strategy", back_populates="workspace", cascade="all, delete-orphan")
