"""Tests for workspace bootstrap service and auditing."""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

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


async def _create_session_factory():
  engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
  async with engine.begin() as connection:
    await connection.run_sync(Base.metadata.create_all)
  return async_sessionmaker(engine, expire_on_commit=False)


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
