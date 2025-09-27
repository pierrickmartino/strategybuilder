"""Tests for strategy version services and validation."""

from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth.schemas import (
  AuthenticatedUser,
  SupabaseAppMetadata,
  SupabaseJWTClaims,
  SupabaseUserMetadata
)
from app.db.base import Base
from app.services.strategy_version_service import (
  create_version,
  list_versions,
  revert_to_version,
  validate_version_graph
)
from app.services.user_service import sync_user_from_claims
from app.services.workspace_service import get_or_create_demo_workspace

pytestmark = pytest.mark.asyncio


class AsyncSessionWrapper:
  """Wrap a synchronous SQLAlchemy session with async helpers for tests."""

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

  async def scalar(self, *args, **kwargs):
    result = await self.execute(*args, **kwargs)
    return result.scalar_one_or_none()

  async def scalars(self, *args, **kwargs):
    result = await self.execute(*args, **kwargs)
    return result.scalars()

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


def _build_user(pro: bool = False) -> AuthenticatedUser:
  roles = ["builder"]
  if pro:
    roles.append("pro")
  expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
  claims = SupabaseJWTClaims(
    sub=str(uuid.uuid4()),
    email="user@example.com",
    aud="authenticated",
    exp=int(expires_at.timestamp()),
    app_metadata=SupabaseAppMetadata(roles=roles),
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


VALID_GRAPH = {
  "nodes": [
    {
      "id": "market-data",
      "label": "Market Data",
      "type": "market-data",
      "metadata": {"parameters": {"symbol": "BTC-USD", "granularity": "5m"}}
    },
    {
      "id": "momentum",
      "label": "Momentum",
      "type": "momentum-indicator",
      "metadata": {"parameters": {"fastLength": 12, "slowLength": 26}}
    },
    {
      "id": "entry",
      "label": "Entry",
      "type": "entry-condition",
      "metadata": {"parameters": {"threshold": 0.5, "volatilityFloor": 0.2}}
    },
    {
      "id": "risk",
      "label": "Risk",
      "type": "risk-controls",
      "metadata": {"parameters": {"maxRiskPerTrade": 1, "stopMultiple": 2}}
    },
    {
      "id": "broker",
      "label": "Broker",
      "type": "paper-broker",
      "metadata": {"parameters": {"venue": "paper-trading"}}
    }
  ],
  "edges": [
    {"id": "e1", "source": "market-data", "target": "momentum"},
    {"id": "e2", "source": "momentum", "target": "entry"},
    {"id": "e3", "source": "entry", "target": "risk"},
    {"id": "e4", "source": "risk", "target": "broker"}
  ]
}


async def test_validate_detects_missing_input():
  user = _build_user()
  graph = {
    **VALID_GRAPH,
    "edges": [
      {"id": "e1", "source": "market-data", "target": "momentum"},
      {"id": "e2", "source": "momentum", "target": "entry"}
    ]
  }
  issues = await validate_version_graph(graph, user)
  assert any(issue["code"] == "missing_input" for issue in issues)


async def test_create_version_persists_history():
  session_factory = await _create_session_factory()
  async with session_factory() as session:
    user = _build_user()
    await sync_user_from_claims(session, user)
    workspace, strategy, _, _ = await get_or_create_demo_workspace(session, user)

    version = await create_version(session, strategy.id, VALID_GRAPH, user)
    assert version.version == 2
    assert version.validation_issues == []

    versions = await list_versions(session, strategy.id, user)
    assert [entry.version for entry in versions] == [2, 1]


async def test_revert_clones_target_version():
  session_factory = await _create_session_factory()
  async with session_factory() as session:
    user = _build_user()
    await sync_user_from_claims(session, user)
    _, strategy, seed_version, _ = await get_or_create_demo_workspace(session, user)

    latest = await create_version(session, strategy.id, VALID_GRAPH, user)
    restored = await revert_to_version(session, strategy.id, seed_version.id, user)

    assert restored.version == latest.version + 1
    assert restored.graph_json == seed_version.graph_json
    assert restored.notes == "Restored from prior version"


async def test_quota_issue_emitted_for_free_plan():
  user = _build_user(pro=False)
  overloaded_graph = {
    "nodes": VALID_GRAPH["nodes"] + [
      {
        "id": "broker-2",
        "label": "Broker 2",
        "type": "paper-broker",
        "metadata": {"parameters": {"venue": "paper-trading"}}
      }
    ],
    "edges": VALID_GRAPH["edges"] + [
      {"id": "e5", "source": "risk", "target": "broker-2"}
    ]
  }
  issues = await validate_version_graph(overloaded_graph, user)
  assert any(issue["code"] == "quota_exceeded" for issue in issues)
