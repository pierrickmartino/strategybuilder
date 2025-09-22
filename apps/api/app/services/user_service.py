"""User synchronisation helpers."""

from __future__ import annotations

import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import AuthenticatedUser
from app.models.user import User


async def sync_user_from_claims(session: AsyncSession, actor: AuthenticatedUser) -> User:
  """Insert or update a user record derived from Supabase claims."""
  try:
    result = await session.execute(select(User).where(User.id == uuid.UUID(actor.id)))
    user = result.scalar_one()
  except (NoResultFound, ValueError):
    user = User(id=uuid.UUID(actor.id))
    session.add(user)

  user.email = actor.email
  user.roles = actor.roles
  user.accepted_simulation_only = actor.accepted_simulation_only
  user.accepted_simulation_only_at = actor.accepted_simulation_only_at

  return user


def user_has_role(user: User, role: str) -> bool:
  """Return true if the user owns the provided role."""
  roles: Sequence[str] = user.roles or []
  return role in roles
