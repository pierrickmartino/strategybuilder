"""Tests for workspace bootstrap service and auditing."""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta

import pytest
from fastapi import HTTPException, status
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import (
  AuthenticatedUser,
  SupabaseAppMetadata,
  SupabaseJWTClaims,
  SupabaseUserMetadata
)
from app.db.base import Base
from app.models.compliance_event import ComplianceEvent
from app.services.audit_service import record_workspace_bootstrap
from app.services.user_service import sync_user_from_claims
from app.services.workspace_service import (
  get_or_create_demo_workspace,
  workspace_response_payload
)

pytestmark = pytest.mark.asyncio


class AsyncSessionWrapper:
  """Minimal asynchronous wrapper around a synchronous SQLAlchemy session."""

  def __init__(self, sync_session):
    self._sync_session = sync_session

  async def __aenter__(self):
    return self

  async def __aexit__(self, exc_type, exc, tb):
    await self.close()

  def add(self, instance):
    self._sync_session.add(instance)

  async def execute(self, *args, **kwargs):
    return await asyncio.to_thread(self._sync_session.execute, *args, **kwargs)

  async def flush(self):
    return await asyncio.to_thread(self._sync_session.flush)

  async def commit(self):
    return await asyncio.to_thread(self._sync_session.commit)

  async def close(self):
    return await asyncio.to_thread(self._sync_session.close)


async def _create_session_factory():
  engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
  )
  Base.metadata.create_all(engine)
  sync_session_factory = sessionmaker(bind=engine)

  def factory():
    return AsyncSessionWrapper(sync_session_factory())

  return factory


def _build_authenticated_user(accepted: bool = True) -> AuthenticatedUser:
  claims = SupabaseJWTClaims(
    sub=str(uuid.uuid4()),
    email="demo@example.com",
    aud="authenticated",
    exp=int((datetime.utcnow() + timedelta(hours=1)).timestamp()),
    app_metadata=SupabaseAppMetadata(roles=["builder"]),
    user_metadata=SupabaseUserMetadata(
      accepted_simulation_only=accepted,
      accepted_simulation_only_at=datetime.utcnow()
    )
  )
  return AuthenticatedUser(
    id=claims.sub,
    email=claims.email,
    roles=claims.app_metadata.roles,
    accepted_simulation_only=claims.user_metadata.accepted_simulation_only,
    accepted_simulation_only_at=claims.user_metadata.accepted_simulation_only_at,
    raw_claims=claims
  )


async def test_bootstrap_creates_workspace_and_audit_event():
  session_factory = await _create_session_factory()

  async with session_factory() as session:
    actor = _build_authenticated_user()
    await sync_user_from_claims(session, actor)

    workspace, strategy, version, created = await get_or_create_demo_workspace(session, actor)
    assert created is True
    assert workspace.name == "Demo Workspace"
    assert strategy.name
    assert version.graph["nodes"]

    payload = workspace_response_payload(workspace, strategy, version)
    payload["created"] = created
    payload["userId"] = str(workspace.user_id)

    await record_workspace_bootstrap(session, actor, payload)
    await session.commit()

    result = await session.execute(select(ComplianceEvent))
    events = result.scalars().all()
    assert len(events) == 1
    event = events[0]
    assert event.event_type == "workspace.bootstrap"
    assert event.payload["workspaceId"] == payload["workspace"]["id"]

    # Subsequent calls should not recreate the workspace
    workspace_again, _, _, created_again = await get_or_create_demo_workspace(session, actor)
    assert created_again is False
    assert workspace_again.id == workspace.id


async def test_bootstrap_rejects_users_without_consent():
  actor = _build_authenticated_user(accepted=False)

  with pytest.raises(HTTPException) as exc:
    await require_compliance_consent(actor)

  assert exc.value.status_code == status.HTTP_403_FORBIDDEN
