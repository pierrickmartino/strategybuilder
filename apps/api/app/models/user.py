"""User persistence model."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
  """Supabase-sourced user metadata."""

  __tablename__ = "users"

  id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
  email = Column(String, unique=True, nullable=False)
  full_name = Column(String, nullable=True)
  avatar_url = Column(String, nullable=True)
  roles = Column(JSON, nullable=False, default=list)
  accepted_simulation_only = Column(Boolean, nullable=False, default=False)
  accepted_simulation_only_at = Column(DateTime(timezone=True), nullable=True)
  created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
  updated_at = Column(
    DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
  )

  def to_dict(self) -> dict[str, object]:
    """Return a serialisable representation for API responses."""
    return {
      "id": str(self.id),
      "email": self.email,
      "full_name": self.full_name,
      "avatar_url": self.avatar_url,
      "roles": self.roles or [],
      "accepted_simulation_only": self.accepted_simulation_only,
      "accepted_simulation_only_at": self.accepted_simulation_only_at.isoformat()
      if isinstance(self.accepted_simulation_only_at, datetime)
      else self.accepted_simulation_only_at,
    }
