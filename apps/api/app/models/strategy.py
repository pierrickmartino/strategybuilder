"""Strategy and StrategyVersion models."""

from __future__ import annotations

import uuid
from datetime import datetime

from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.db.base import Base

if TYPE_CHECKING:
  from app.models.workspace import Workspace


class Strategy(Base):
  """High-level strategy metadata."""

  __tablename__ = "strategies"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  workspace_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("workspaces.id"))
  name: Mapped[str] = mapped_column(String(length=140), nullable=False)
  description: Mapped[str | None] = mapped_column(Text, nullable=True)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

  workspace: Mapped["Workspace"] = relationship("Workspace", back_populates="strategies")
  versions: Mapped[list["StrategyVersion"]] = relationship(
    "StrategyVersion", back_populates="strategy", cascade="all, delete-orphan"
  )


class StrategyVersion(Base):
  """Specific revision of a strategy's graph configuration."""

  __tablename__ = "strategy_versions"

  id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  strategy_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("strategies.id"))
  version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
  label: Mapped[str] = mapped_column(String(length=64), nullable=False, default="Auto Save")
  graph_json: Mapped[dict] = mapped_column(JSON, nullable=False)
  educator_callouts: Mapped[list[dict[str, str]]] = mapped_column(JSON, default=list)
  notes: Mapped[str | None] = mapped_column(Text, nullable=True)
  validation_issues: Mapped[list[dict[str, object]]] = mapped_column(JSON, default=list)
  created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
  updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

  strategy: Mapped[Strategy] = relationship("Strategy", back_populates="versions")
