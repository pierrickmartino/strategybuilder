"""Supabase authentication schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field


class SupabaseAppMetadata(BaseModel):
  """Subset of app metadata stored on Supabase users."""

  provider: str | None = None
  providers: list[str] = Field(default_factory=list)
  roles: list[str] = Field(default_factory=list)


class SupabaseUserMetadata(BaseModel):
  """User metadata fields tracked for compliance."""

  accepted_simulation_only: bool = False
  accepted_simulation_only_at: datetime | None = None
  full_name: str | None = None
  avatar_url: str | None = None


class SupabaseJWTClaims(BaseModel):
  """Decoded Supabase JWT payload."""

  sub: str
  email: EmailStr
  aud: str
  exp: int
  app_metadata: SupabaseAppMetadata = Field(default_factory=SupabaseAppMetadata)
  user_metadata: SupabaseUserMetadata = Field(default_factory=SupabaseUserMetadata)

  @classmethod
  def from_token(cls, payload: dict[str, Any]) -> "SupabaseJWTClaims":
    """Create claims from a decoded JWT payload."""
    return cls(**payload)


class AuthenticatedUser(BaseModel):
  """Representation of an authenticated Supabase user."""

  id: str
  email: EmailStr
  roles: list[str] = Field(default_factory=list)
  accepted_simulation_only: bool
  accepted_simulation_only_at: datetime | None = None
  raw_claims: SupabaseJWTClaims

  @property
  def has_compliance_consent(self) -> bool:
    """Whether the user has accepted the simulation-only consent."""
    return self.accepted_simulation_only
