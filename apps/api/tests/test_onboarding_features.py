"""Tests for onboarding checklist support services."""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.schemas.analytics import OnboardingEventIn
from app.auth.schemas import (
  AuthenticatedUser,
  SupabaseAppMetadata,
  SupabaseJWTClaims,
  SupabaseUserMetadata
)
from app.db.base import Base
from app.models.compliance_event import ComplianceEvent
from app.models.onboarding_event import OnboardingEvent
from app.services.analytics_service import record_onboarding_events
from app.services.audit_service import record_education_delivery, record_template_visibility
from app.services.education_service import get_onboarding_education
from app.services.template_service import get_template_library
from app.services.user_service import sync_user_from_claims

pytestmark = pytest.mark.asyncio


class AsyncSessionWrapper:
  """Wrap synchronous SQLAlchemy session with async helpers for tests."""

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

  async def scalars(self, *args, **kwargs):
    result = await self.execute(*args, **kwargs)
    return result.scalars()

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


def _build_user() -> AuthenticatedUser:
  expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
  claims = SupabaseJWTClaims(
    sub=str(uuid.uuid4()),
    email="onboarding@example.com",
    aud="authenticated",
    exp=int(expires_at.timestamp()),
    app_metadata=SupabaseAppMetadata(roles=["builder"]),
    user_metadata=SupabaseUserMetadata(
      accepted_simulation_only=True,
      accepted_simulation_only_at=datetime.now(timezone.utc)
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


async def test_template_library_emits_compliance_event():
  session_factory = await _create_session_factory()
  async with session_factory() as session:
    user = _build_user()
    await sync_user_from_claims(session, user)

    templates = get_template_library()
    assert len(templates) >= 3
    await record_template_visibility(session, user, [template["id"] for template in templates])
    await session.commit()

    events = await session.scalars(select(ComplianceEvent))
    stored = events.all()
    assert stored
    event = stored[-1]
    assert event.event_type == "template.visibility"
    assert event.payload["count"] == len(templates)


async def test_education_delivery_captured_for_audit():
  session_factory = await _create_session_factory()
  async with session_factory() as session:
    user = _build_user()
    await sync_user_from_claims(session, user)

    suite = get_onboarding_education()
    panels = suite["panels"]
    assert panels, "Expected at least one education panel"

    await record_education_delivery(session, user, [panel["id"] for panel in panels])
    await session.commit()

    events = await session.scalars(select(ComplianceEvent))
    stored = events.all()
    assert stored
    event = stored[-1]
    assert event.event_type == "education.delivery"
    assert event.payload["count"] == len(panels)


async def test_record_onboarding_events_persists_payload():
  session_factory = await _create_session_factory()
  async with session_factory() as session:
    user = _build_user()
    await sync_user_from_claims(session, user)

    payload = OnboardingEventIn(
      step_id="tour-canvas",
      status="completed",
      occurred_at=datetime.now(timezone.utc),
      properties={"templateId": "3c9703d6-f7c6-4921-bac5-8487b7dd5c58"}
    )

    records = await record_onboarding_events(session, user, [payload])
    assert len(records) == 1

    await session.commit()

    events = await session.scalars(select(OnboardingEvent))
    stored = events.all()
    assert len(stored) == 1
    event = stored[0]
    assert event.step_id == "tour-canvas"
    assert event.status == "completed"
    assert event.properties["templateId"] == payload.properties["templateId"]
