"""Tests for workspace bootstrap service and auditing."""

from __future__ import annotations

import asyncio
import logging
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
from app.services.user_service import sync_user_from_claims
from app.services.workspace_service import (
  LATENCY_BUDGET_MS,
  bootstrap_workspace_payload,
  get_or_create_demo_workspace
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

    payload, duration_ms = await bootstrap_workspace_payload(session, actor)
    assert payload["created"] is True
    assert payload["workspace"]["name"] == "Demo Workspace"
    assert payload["strategy"]["id"]
    assert duration_ms < LATENCY_BUDGET_MS

    await session.commit()

    result = await session.execute(select(ComplianceEvent))
    events = result.scalars().all()
    assert len(events) == 1
    event = events[0]
    assert event.event_type == "workspace.bootstrap"
    assert event.payload["workspaceId"] == payload["workspace"]["id"]
    assert event.payload["workspaceCreatedAt"] == payload["workspace"]["createdAt"]

    # Subsequent calls should not recreate the workspace
    workspace_again, _, _, created_again = await get_or_create_demo_workspace(session, actor)
    assert created_again is False
    assert str(workspace_again.id) == payload["workspace"]["id"]


async def test_bootstrap_rejects_users_without_consent():
  actor = _build_authenticated_user(accepted=False)

  with pytest.raises(HTTPException) as exc:
    await require_compliance_consent(actor)

  assert exc.value.status_code == status.HTTP_403_FORBIDDEN


async def test_bootstrap_emits_latency_log(caplog):
  session_factory = await _create_session_factory()

  async with session_factory() as session:
    actor = _build_authenticated_user()
    await sync_user_from_claims(session, actor)

    caplog.set_level(logging.INFO, logger="strategybuilder.performance")

    _, duration_ms = await bootstrap_workspace_payload(session, actor)

    logs = [record for record in caplog.records if record.name == "strategybuilder.performance"]
    assert logs, "Expected latency instrumentation log for workspace bootstrap"
    record = logs[-1]
    assert record.getMessage() == "workspaces.bootstrap.latency"
    assert record.duration_ms < LATENCY_BUDGET_MS
    assert record.latency_budget_ms == LATENCY_BUDGET_MS
    assert record.workspace_created is True
    assert duration_ms < LATENCY_BUDGET_MS


async def test_bootstrap_records_audit_timestamp(caplog):
  session_factory = await _create_session_factory()

  async with session_factory() as session:
    actor = _build_authenticated_user()
    await sync_user_from_claims(session, actor)

    caplog.set_level(logging.INFO, logger="strategybuilder.audit")

    payload, _ = await bootstrap_workspace_payload(session, actor)

    audit_logs = [record for record in caplog.records if record.name == "strategybuilder.audit"]
    assert audit_logs, "Expected audit log entry for workspace bootstrap"
    record = audit_logs[-1]
    assert record.workspace_created_at == payload["workspace"]["createdAt"]
    assert record.workspace_created is True
    assert record.user_id == actor.id


async def test_sync_user_reuses_existing_identifier_when_subject_rotates():
  session_factory = await _create_session_factory()

  async with session_factory() as session:
    original_actor = _build_authenticated_user()
    await sync_user_from_claims(session, original_actor)

    workspace, _, _, created = await get_or_create_demo_workspace(session, original_actor)
    assert created is True

    rotated_actor = _build_authenticated_user()
    rotated_subject = rotated_actor.id
    await sync_user_from_claims(session, rotated_actor)

    assert rotated_subject != original_actor.id
    assert rotated_actor.id == original_actor.id

    workspace_again, _, _, created_again = await get_or_create_demo_workspace(session, rotated_actor)
    assert created_again is False
    assert str(workspace_again.id) == str(workspace.id)
