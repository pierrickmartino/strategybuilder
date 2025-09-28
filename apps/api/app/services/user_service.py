"""User synchronisation helpers."""

from __future__ import annotations

import uuid
from collections.abc import Sequence

from sqlalchemy import select, update
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import AuthenticatedUser
from app.models.compliance_event import ComplianceEvent
from app.models.user import User
from app.models.workspace import Workspace


async def sync_user_from_claims(session: AsyncSession, actor: AuthenticatedUser) -> User:
  """Insert or update a user record derived from Supabase claims."""
  user_id = uuid.UUID(actor.id)

  try:
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one()
  except NoResultFound:
    result = await session.execute(select(User).where(User.email == actor.email))
    user = result.scalar_one_or_none()

    if user is None:
      user = User(id=user_id)
      session.add(user)
    else:
      previous_user_id = user.id
      if previous_user_id != user_id:
        await session.execute(
          update(Workspace).where(Workspace.user_id == previous_user_id).values(user_id=user_id)
        )
        await session.execute(
          update(ComplianceEvent).where(ComplianceEvent.user_id == previous_user_id).values(user_id=user_id)
        )
        user.id = user_id

  user.email = actor.email
  user.roles = actor.roles
  user.accepted_simulation_only = actor.accepted_simulation_only
  user.accepted_simulation_only_at = actor.accepted_simulation_only_at

  return user


def user_has_role(user: User, role: str) -> bool:
  """Return true if the user owns the provided role."""
  roles: Sequence[str] = user.roles or []
  return role in roles
