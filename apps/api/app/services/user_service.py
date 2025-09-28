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
  incoming_user_id = uuid.UUID(actor.id)

  try:
    result = await session.execute(select(User).where(User.id == incoming_user_id))
    user = result.scalar_one()
  except NoResultFound:
    result = await session.execute(select(User).where(User.email == actor.email))
    user = result.scalar_one_or_none()

    if user is None:
      user = User(id=incoming_user_id)
      session.add(user)
    else:
      previous_user_id = user.id
      if previous_user_id != incoming_user_id:
        # Supabase has issued a new subject identifier for an existing email. Instead of
        # rewriting every dependent row (which would require temporarily violating
        # foreign key constraints), we normalise the in-memory actor to the persisted
        # identifier so downstream operations continue to work with the existing
        # workspace and compliance history.
        actor.id = str(previous_user_id)
  else:
    # Ensure the caller observes the canonical identifier stored in the database. This
    # keeps the request-scoped actor consistent even if Supabase rotates subject IDs.
    actor.id = str(user.id)

  user.email = actor.email
  user.roles = actor.roles
  user.accepted_simulation_only = actor.accepted_simulation_only
  user.accepted_simulation_only_at = actor.accepted_simulation_only_at

  return user


def user_has_role(user: User, role: str) -> bool:
  """Return true if the user owns the provided role."""
  roles: Sequence[str] = user.roles or []
  return role in roles
