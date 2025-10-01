"""Request-level tests for analytics endpoints."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.auth.dependencies import require_compliance_consent
from app.auth.schemas import (
  AuthenticatedUser,
  SupabaseAppMetadata,
  SupabaseJWTClaims,
  SupabaseUserMetadata
)
from app.db.base import Base
from app.db.schema import ensure_strategy_versions_schema
from app.db.session import get_db
from app.main import create_app
from app.models.onboarding_event import OnboardingEvent
from app.services.user_service import sync_user_from_claims


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


@pytest.mark.asyncio
async def test_ingest_onboarding_events_persists_payload() -> None:
  app = create_app()

  engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
  async with engine.begin() as connection:
    await connection.run_sync(Base.metadata.create_all)
    await ensure_strategy_versions_schema(connection)

  session_factory = async_sessionmaker(engine, expire_on_commit=False)

  user = _build_user()
  async with session_factory() as session:
    await sync_user_from_claims(session, user)
    await session.commit()

  async def override_get_db():
    async with session_factory() as session:
      try:
        yield session
      except Exception:  # pragma: no cover - propagate error after rollback
        await session.rollback()
        raise
      else:
        await session.commit()

  async def override_require_consent():
    return user

  app.dependency_overrides[get_db] = override_get_db
  app.dependency_overrides[require_compliance_consent] = override_require_consent

  async with AsyncClient(app=app, base_url="http://testserver") as client:
    occurred_at = datetime.now(timezone.utc).isoformat()
    response = await client.post(
      "/api/v1/analytics/onboarding",
      json={
        "events": [
          {
            "step_id": "tour-canvas",
            "status": "completed",
            "occurred_at": occurred_at,
            "properties": {"template_id": "example"}
          }
        ]
      },
      headers={"Authorization": "Bearer test-token"}
    )

  assert response.status_code == 202
  assert response.json() == {"received": 1}

  async with session_factory() as session:
    stored_events = (await session.execute(select(OnboardingEvent))).scalars().all()

  assert len(stored_events) == 1
  event = stored_events[0]
  assert event.step_id == "tour-canvas"
  assert event.status == "completed"
  assert event.properties["template_id"] == "example"

  app.dependency_overrides.clear()
